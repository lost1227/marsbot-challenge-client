import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DateTime, Duration, Interval } from 'luxon';
import { BehaviorSubject, combineLatest, distinctUntilChanged, filter, finalize, interval, map, Observable, ReplaySubject, startWith, switchMap, take, tap } from 'rxjs';
import { RescueResponse, RobotPlanResponse, SolResponse } from 'src/app/models/remote.model';
import { Direction, GrabStep, MoveStep, RemoteRobotPlan, RemoteRobotPlanStep, RobotPlanStep, TurnStep } from 'src/app/models/robot-plan.model';
import { ConfigService } from 'src/app/services/config.service';
import { RemoteService } from 'src/app/services/remote.service';
import { RescueConfirmComponent } from './rescue-confirm/rescue-confirm.component';

enum PageState {
  PLANNING,
  SENDING
};

class SolTiming {
  public solBase: number;
  public solTotal: number;
  public minsPerSol: number;
  public solRtBase: DateTime;

  constructor(from: SolResponse) {
    this.solBase = from.sol;
    this.solTotal = from.total_sols;
    this.minsPerSol = from.mins_per_sol;
    this.solRtBase = DateTime.now();
  }

  public getSolNow(): number {
    const time_planning = DateTime.now().diff(this.solRtBase, 'minutes');
    return this.solBase + (time_planning.minutes / this.minsPerSol);
  }

  public getTimeRemaining(): number {
    let remaining_mins = (this.solTotal - this.solBase) * this.minsPerSol;
    // never query more than once per minute
    if(remaining_mins < 1) {
      remaining_mins = 1;
    }
    return remaining_mins * 60000;
  }
}

@Component({
  selector: 'app-planner',
  templateUrl: './planner.component.html',
  styleUrls: ['./planner.component.scss']
})
export class PlannerComponent {
  protected readonly dirs = Direction;

  protected state = new BehaviorSubject<PageState>(PageState.PLANNING);
  protected stateType = PageState;

  protected currPlan = new BehaviorSubject<Array<RobotPlanStep>>([]);

  protected moveStepsControl = new FormControl(1, Validators.min(1));
  protected turnStepsControl = new FormControl(1, Validators.min(1));
  protected turnScaleControl = new FormControl();

  protected solTime = new ReplaySubject<SolTiming>(1);
  protected solMessage: Observable<string>

  private solRefreshTimeout: number = -1;

  protected progressValue = new ReplaySubject<number>(1);

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private configService: ConfigService,
    private remoteService: RemoteService
  ) {
    this.state.pipe(
      startWith(PageState.PLANNING),
      filter(it => it == PageState.PLANNING),
      switchMap(_state => remoteService.getSol())
    ).subscribe(sol => this.solTime.next(new SolTiming(sol)));

    this.solMessage = combineLatest({
      _interval: interval(1000).pipe(startWith(0)),
      timing: this.solTime
    }).pipe(
      map(({_interval, timing}) =>
        `Sol ${timing.getSolNow().toFixed(1)} of ${timing.solTotal.toFixed(0)}`
      )
    );

    this.solTime.subscribe(time => {
      clearTimeout(this.solRefreshTimeout);
      this.solRefreshTimeout = window.setTimeout(
        () => {
          console.log("Timeout: Query for game over");
          remoteService.getSol().subscribe(sol => this.solTime.next(new SolTiming(sol)));
        },
        time.getTimeRemaining()
      );
    })

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
