import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, finalize, interval, map, Observable, ReplaySubject, Subscription, take, tap, timer } from 'rxjs';
import { RescueResponse, RobotPlanResponse } from 'src/app/models/remote.model';
import { Direction, GrabStep, MoveStep, RemoteRobotPlan, RobotPlanStep, TurnStep } from 'src/app/models/robot-plan.model';
import { UserService } from 'src/app/services/user.service';
import { GameState, GameStateService, GameStateType, RunningState } from 'src/app/services/game-state.service';
import { RemoteService } from 'src/app/services/remote.service';
import { RescueConfirmComponent } from './rescue-confirm/rescue-confirm.component';
import { AppState, AppStateService } from 'src/app/services/app-state.service';

enum PageState {
  PLANNING,
  SENDING
};


@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent implements OnInit, OnDestroy {
  protected readonly dirs = Direction;

  protected state = new BehaviorSubject<PageState>(PageState.PLANNING);
  protected stateType = PageState;

  protected currPlan = new BehaviorSubject<Array<RobotPlanStep>>([]);

  protected moveStepsControl = new FormControl(1, Validators.min(1));
  protected turnStepsControl = new FormControl(1, Validators.min(1));
  protected turnScaleControl = new FormControl();

  protected gameState: Observable<GameState>
  protected solMessage: Observable<string>

  protected progressValue = new ReplaySubject<number>(1);

  protected endOfGameSubscription!: Subscription

  constructor(
    private appStateService: AppStateService,
    private dialog: MatDialog,
    private gameStateService: GameStateService,
    private remoteService: RemoteService
  ) {
    this.gameState = gameStateService.getGameState();

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

  ngOnInit() {
    this.endOfGameSubscription = this.gameState.subscribe(state => {
      if(state.type == GameStateType.NOT_RUNNING) {
        this.appStateService.nextState(AppState.END_OF_GAME);
      }
    });
  }

  ngOnDestroy(): void {
    this.endOfGameSubscription.unsubscribe();
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
    const steps = 15;
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

    const user = this.gameStateService.getUserRobot();
    if(!user) {
      return;
    }

    this.remoteService.sendPlan(user.robotId, plan).subscribe(this.uploadPlanResponse.bind(this));
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

      const user = this.gameStateService.getUserRobot();
      if(!user) {
        return;
      }

      this.remoteService.sendRescue(user.robotId).subscribe(this.uploadPlanResponse.bind(this));
    })
  }
}
