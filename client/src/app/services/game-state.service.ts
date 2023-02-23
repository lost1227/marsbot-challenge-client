import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';
import { filter, map, min, Observable, ReplaySubject, switchMap, take, timer } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorResponse, SolResponse, Status } from '../models/remote.model';
import { ErrorService } from './error.service';
import { RemoteService } from './remote.service';

export enum GameStateType {
  RUNNING,
  NOT_RUNNING
};

export interface GameState {
  type: GameStateType
}

export class NotRunningState implements GameState {
  public readonly type = GameStateType.NOT_RUNNING;
}

export class RunningState implements GameState {
  public readonly type = GameStateType.RUNNING;

  public solBase: number;
  public solTotal: number;
  public minsPerSol: number;
  public solRtBase: DateTime;

  constructor(from: SolResponse, when: DateTime) {
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

  constructor(
    private remoteService: RemoteService,
    private errorService: ErrorService
  ) {
    // Keep the gameState up to date by polling. If the game is currently running, estimate
    // how much time is left in the game and poll again after that interval. If the game is not
    // running, poll every gameStartPollInterval.
    this.gameState.pipe(
      map(state => {
        if(state.type == GameStateType.RUNNING) {
          return ((state as RunningState).minsLeftInGame() * 60_000) + 1_000;
        } else {
          return environment.gameStartPollInterval;
        }
      }),
      switchMap(nextPollMs => timer(nextPollMs))
    ).subscribe( _value => {
      // When the timeout completes, poll the server for updated game info and publish it
      // to solTiming
      this.queryGameState().subscribe(state => this.gameState.next(state));
    });

    this.queryGameState().subscribe(state => this.gameState.next(state));
  }

  private queryGameState(): Observable<GameState> {
    return this.remoteService.getSol().pipe(
      map(response => {
        if(response.status == Status.OK) {
          return new RunningState(response as SolResponse, DateTime.now())
        } else if(response.status == Status.FAIL) {
          let error = response as ErrorResponse;
          if(error.message == "Game not running") {
            return new NotRunningState();
          } else {
            throw new Error(error.message);
          }
        } else {
          throw new Error("Bad response");
        }
      }),
      this.errorService.interceptErrors()
    );
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
