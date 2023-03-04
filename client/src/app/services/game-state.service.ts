import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { BehaviorSubject, catchError, filter, map, mergeMap, min, Observable, of, ReplaySubject, switchMap, take, timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RobotId, SolResponse } from '../models/remote.model';
import { User, UserWithRobot } from '../models/user.model';
import { ErrorService } from './error.service';
import { RemoteService } from './remote.service';

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
  private robot = new BehaviorSubject<UserWithRobot|null>(null);

  constructor(
    remoteService: RemoteService,
    errorService: ErrorService
  ) {
    // Keep the gameState up to date by polling every pollInterval
    timer(0, environment.pollInterval).pipe(
      mergeMap(_it => remoteService.getGameState()),
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

    this.gameState.subscribe(state => {
      if(state.gameId != this.robot.getValue()?.user.gameId) {
        this.robot.next(null);
      }
    });
  }

  public saveRobotId(user: User, robotId: RobotId) {
    this.gameState.pipe(take(1)).subscribe(state => {
      this.robot.next({
        user,
        robotId
      });
    })
  }

  public clearUserRobot() {
    this.robot.next(null);
  }

  public getUserRobot(): UserWithRobot|null {
    return this.robot.getValue();
  }

  public watchUserRobot(): Observable<UserWithRobot|null> {
    return this.robot;
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
