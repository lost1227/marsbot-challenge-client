import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, catchError, combineLatest, filter, map, mergeMap, min, Observable, of, ReplaySubject, Subject, switchMap, take, timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RobotId, SolResponse } from '../models/remote.model';
import { User, UserWithRobot } from '../models/user.model';
import { ErrorService } from './error.service';
import { RemoteService } from './remote.service';
import { ClientService } from './client.service';
import { state } from '@angular/animations';

export enum GameStateType {
  RUNNING,
  NOT_RUNNING
};

export interface GameState {
  type: GameStateType,
  gameId: string
}

export class NotRunningState implements GameState {
  public readonly type = GameStateType.NOT_RUNNING;
  constructor(
    public readonly gameId: string
  ) {}
}

export class RunningState implements GameState {
  public readonly type = GameStateType.RUNNING;

  public solBase: number;
  public solTotal: number;
  public minsPerSol: number;
  public solRtBase: DateTime;

  constructor(
    public readonly gameId: string,
    from: SolResponse,
    when: DateTime
  ) {
    this.solBase = from.sol;
    this.solTotal = from.total_sols;
    this.minsPerSol = from.mins_per_sol;
    this.solRtBase = when;
  }

  public getCurrSol(): number {
    const time_planning = DateTime.now().diff(this.solRtBase, 'minutes');
    return this.solBase + (time_planning.minutes / this.minsPerSol);
  }

  public solsLeftInGame(): number {
    const curr_sol = this.getCurrSol();
    const remaining_sols = this.solTotal - curr_sol;
    // If remaining sols is negative, the game is over and there are no sols left in the game
    return Math.max(remaining_sols, 0);
  }

  public minsLeftInGame(): number {
    return this.solsLeftInGame() * this.minsPerSol;
  }
}

@Injectable({
  providedIn: 'root'
})
export class GameStateService {
  private gameState = new ReplaySubject<GameState>(1);
  private robot = new BehaviorSubject<RobotId|null>(null);
  private user = new ReplaySubject<User|null>(1);

  private userRobot = new ReplaySubject<UserWithRobot|null>(1);

  constructor(
    remoteService: RemoteService,
    errorService: ErrorService,
    private clientService: ClientService
  ) {
    // Keep the gameState up to date by polling every pollInterval
    timer(0, environment.pollInterval).pipe(
      mergeMap(_it => remoteService.getGameState(clientService.getClientId())),
      switchMap(state => {
        if(state.game_running) {
          return remoteService.getSol().pipe(
            map(sol => new RunningState(state.game_id, sol, DateTime.now())),
            catchError((error: Error) => {
              if(error.message == "Game not running") {
                return of(new NotRunningState(state.game_id));
              } else {
                errorService.handleError(error);
                return of();
              }
            })
            )
        } else {
          return of(new NotRunningState(state.game_id));
        }
      })
    ).subscribe(this.gameState);

    // Clear the user whenever we start a new game
    combineLatest({
      gameState: this.gameState,
      user: this.user
    }).subscribe(({gameState, user}) => {
      if(!user) {
        return;
      }
      if(gameState.gameId != user?.gameId) {
        this.clearUser();
      }
    });

    combineLatest({
      user: this.user,
      robotId: this.robot
    }).subscribe(({user, robotId}) => {
      if(!user || !robotId) {
        this.userRobot.next(null);
        return;
      }

      this.userRobot.next({user, robotId});
    });

    // Use the persisted user if available
    this.gameState.pipe(take(1)).subscribe(state => {
      let cachedUser = clientService.getPersistedUser();
      if(cachedUser?.gameId != state.gameId) {
        this.clearUser();
      } else {
        this.user.next(cachedUser);
      }
    })
  }

  public saveRobotId(robotId: RobotId) {
    this.robot.next(robotId);
  }

  public clearRobotId() {
    this.robot.next(null);
  }

  public saveUser(user: User) {
    this.user.next(user);
    this.clientService.persistUserForGame(user.gameId, user.name);
  }

  public clearUser() {
    this.user.next(null);
    this.clientService.clearStorage();
  }

  public getRobotId(): Observable<RobotId|null> {
    return this.robot;
  }

  public getUser(): Observable<User|null> {
    return this.user;
  }

  public getUserRobot(): Observable<UserWithRobot|null> {
    return this.userRobot;
  }

  public getGameState(): Observable<GameState> {
    return this.gameState;
  }

  public waitForGameStart(): Observable<GameState> {
    return this.gameState.pipe(
      filter(state => state.type == GameStateType.RUNNING),
      take(1)
    );
  }

}
