import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DateTime, Duration, Interval } from 'luxon';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, finalize, interval, map, Observable, ReplaySubject, startWith, Subject, switchMap, take, tap, timer } from 'rxjs';
import { RescueResponse, RobotPlanResponse, SolResponse } from 'src/app/models/remote.model';
import { Direction, GrabStep, MoveStep, RemoteRobotPlan, RemoteRobotPlanStep, RobotPlanStep, TurnStep } from 'src/app/models/robot-plan.model';
import { ConfigService } from 'src/app/services/config.service';
import { GameState, GameStateService, GameStateType, RunningState } from 'src/app/services/game-state.service';
import { RemoteService } from 'src/app/services/remote.service';
import { RescueConfirmComponent } from './rescue-confirm/rescue-confirm.component';

enum PageState {
  GAME_NOT_RUNNING,
  PLANNING,
  SENDING
};


@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent {
  protected readonly dirs = Direction;

  protected state = new BehaviorSubject<PageState>(PageState.GAME_NOT_RUNNING);
  protected stateType = PageState;

  protected currPlan = new BehaviorSubject<Array<RobotPlanStep>>([]);

  protected moveStepsControl = new FormControl(1, Validators.min(1));
  protected turnStepsControl = new FormControl(1, Validators.min(1));
  protected turnScaleControl = new FormControl();

  protected gameState: Observable<GameState>
  protected solMessage: Observable<string>

  protected progressValue = new ReplaySubject<number>(1);

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private configService: ConfigService,
    private gameStateService: GameStateService,
    private remoteService: RemoteService
  ) {
    this.gameState = gameStateService.getGameState();
    this.gameState.pipe(
      map(gameState => {
        const pageState = this.state.getValue();
        if(gameState.type == GameStateType.NOT_RUNNING) {
          return PageState.GAME_NOT_RUNNING;
        } else if(pageState == PageState.GAME_NOT_RUNNING) {
          return PageState.PLANNING;
        } else {
          return pageState;
        }
      })
    ).subscribe(this.state);

    this.solMessage = combineLatest({
      _interval: timer(0, 1000),
      state: this.gameState.pipe(
        filter(state => state.type == GameStateType.RUNNING)) as Observable<RunningState>
    }).pipe(
      map(({_interval, state}) =>
        `Sol ${state.getCurrSol().toFixed(1)} of ${state.solTotal.toFixed(0)}`
      )
    );

    this.turnScaleControl.valueChanges.pipe(
      distinctUntilChanged(),
      map(value => {
      if(value) {
        return 90;
      } else {
        return 1/90;
      }
    })).subscribe(scale => {
      this.turnStepsControl.setValue(Number(this.turnStepsControl.value) * scale);
    });
  }

  protected addMove(dirstr: string) {
    let value = Number(this.moveStepsControl.value);
    let dir = dirstr as Direction;
    if(this.moveStepsControl.invalid || !value)
      return;

    this.currPlan.next(this.currPlan.getValue().concat(new MoveStep(value, dir)));
  }
  protected addTurn(dirstr: string) {
    let value = Number(this.turnStepsControl.value);
    let dir = dirstr as Direction;
    if(this.moveStepsControl.invalid || !value)
      return;

    value = value / this.getTurnScale();

    this.currPlan.next(this.currPlan.getValue().concat(new TurnStep(value, dir)));
  }
  protected addGrab(type: string) {
    this.currPlan.next(this.currPlan.getValue().concat(new GrabStep(type)));
  }
  protected popPlanStep() {
    let currPlan = this.currPlan.getValue();
    if(currPlan.length == 0)
      return;

    this.currPlan.next(currPlan.slice(0, -1));
  }

  protected shouldShowDegrees() {
    return !!this.turnScaleControl.value;
  }

  protected getTurnScale() {
    return this.turnScaleControl.value ? 90 : 1;
  }

  private uploadPlanResponse(response: RobotPlanResponse|RescueResponse) {
    const steps = 30;
    const delayTimeSeconds = response.delay;
    const stepTime = (delayTimeSeconds * 1000) / steps;

    interval(stepTime).pipe(
      take(steps),
      map(value => value * (100 / (steps - 2))),
      tap(console.log),
      finalize(() => this.state.next(PageState.PLANNING))
    ).subscribe(progress => this.progressValue.next(progress));
  }

  protected sendCurrPlan(){
    this.progressValue.next(0);
    this.state.next(PageState.SENDING);

    const turnScale = 1;
    const plan: RemoteRobotPlan = this.currPlan.getValue().map(step => step.toRemotePlanStep(turnScale));

    this.currPlan.next([]);

    const config = this.configService.getConfig();
    if(!config) {
      this.router.navigate(['/config']);
      return;
    }

    this.remoteService.sendPlan(config.robotId, plan).subscribe(this.uploadPlanResponse.bind(this));
  }

  protected requestRescue() {
    const dialogRef = this.dialog.open(RescueConfirmComponent, {
      width: '320px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if(!confirmed)
        return;

      this.progressValue.next(0);
      this.state.next(PageState.SENDING);

      this.currPlan.next([]);

      const config = this.configService.getConfig();
      if(!config) {
        this.router.navigate(['/config']);
        return;
      }

      this.remoteService.sendRescue(config.robotId).subscribe(this.uploadPlanResponse.bind(this));
    })
  }
}
