import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormControlState, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, map, Observable, ReplaySubject, Subscription, take, timer } from 'rxjs';
import { RescueResponse, RobotPlanResponse } from 'src/app/models/remote.model';
import { Direction, GrabStep, MoveStep, RemoteRobotPlan, RobotPlanStep, TurnStep } from 'src/app/models/robot-plan.model';
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
  private readonly VALID_VALUE_RANGES = {
    move_steps: {min: 0, max: 15},
    turn_steps: {min: 0, max: 4}
  };

  protected readonly dirs = Direction;

  protected state = new BehaviorSubject<PageState>(PageState.PLANNING);
  protected stateType = PageState;

  protected uploadAnimationTime = new ReplaySubject<number>(1);
  protected sendingRescue = false;

  protected currPlan = new BehaviorSubject<Array<RobotPlanStep>>([]);

  protected moveStepsControl = new FormControl(1, [Validators.pattern('\\d+'), Validators.min(this.VALID_VALUE_RANGES.move_steps.min), Validators.max(this.VALID_VALUE_RANGES.move_steps.max)]);
  protected turnStepsControl = new FormControl(1, [Validators.pattern('\\d+'), Validators.min(this.VALID_VALUE_RANGES.turn_steps.min), this.validateTurnStepsMax.bind(this)]);
  protected turnScaleControl = new FormControl();

  protected gameState: Observable<GameState>
  protected solMessage: Observable<string>

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

  private validateTurnStepsMax(stepsControl: AbstractControl) {
    let max = this.VALID_VALUE_RANGES.turn_steps.max;
    if(this.turnScaleControl?.value) {
      max *= 90;
    }

    if(stepsControl.value > max) {
      return {max: {value: stepsControl.value, max: max}};
    }
    return null;
  }

  protected getMoveErrorMessage() {
    const errors = this.moveStepsControl.errors;
    if(errors) {
      console.log(errors);
      if(errors['min']) {
        return "Value must be positive";
      }
      if(errors['max']) {
        return `Value may be at most ${this.VALID_VALUE_RANGES.move_steps.max}`
      }
    }

    return "Invalid input"
  }

  protected getTurnErrorMessage() {
    const errors = this.turnStepsControl.errors;
    if(errors) {
      if(errors['min']) {
        return "Value must be positive";
      }
      if(errors['max']) {
        return `Value may be at most ${errors['max']['max']}`
      }
    }

    return "Invalid input"
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
    if(this.turnStepsControl.invalid || !value)
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
    return !!this.turnScaleControl?.value;
  }

  protected getTurnScale() {
    return this.turnScaleControl.value ? 90 : 1;
  }

  protected uploadAnimationDone() {
    this.state.next(PageState.PLANNING);
  }

  private uploadPlanResponse(response: RobotPlanResponse|RescueResponse) {
    this.uploadAnimationTime.next(response.delay);
  }

  protected sendCurrPlan(){
    this.sendingRescue = false;
    this.state.next(PageState.SENDING);

    const turnScale = 1;
    const plan: RemoteRobotPlan = this.currPlan.getValue().map(step => step.toRemotePlanStep(turnScale));

    this.currPlan.next([]);

    this.gameStateService.getUserRobot().pipe(take(1)).subscribe((user) => {
      if(!user) {
        console.error("No user configured!");
        return;
      }

      this.remoteService.sendPlan(user.robotId, plan).subscribe(response => this.uploadPlanResponse(response));
    });
  }

  protected requestRescue() {
    const dialogRef = this.dialog.open(RescueConfirmComponent, {
      width: '320px'
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if(!confirmed)
        return;

      this.sendingRescue = true;
      this.state.next(PageState.SENDING);

      this.currPlan.next([]);

      this.gameStateService.getUserRobot().pipe(take(1)).subscribe(user => {
        if(!user) {
          console.error("No user configured!");
          return;
        }

        this.remoteService.sendRescue(user.robotId).subscribe(response => this.uploadPlanResponse(response));
      });
    })
  }
}
