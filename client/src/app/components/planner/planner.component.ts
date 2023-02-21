import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { Direction, GrabStep, MoveStep, RemoteRobotPlan, RemoteRobotPlanStep, RobotPlanStep, TurnStep } from 'src/app/models/robot-plan.model';

enum PageState {
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

  protected state = new BehaviorSubject<PageState>(PageState.PLANNING);
  protected stateType = PageState;

  protected currPlan = new BehaviorSubject<Array<RobotPlanStep>>([]);

  protected moveStepsControl = new FormControl(1, Validators.min(1));
  protected turnStepsControl = new FormControl(1, Validators.min(1));
  protected turnScaleControl = new FormControl(false);

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

  protected getTurnScale() {
    let value = this.turnScaleControl.value;
    if(value) {
      return 90;
    } else {
      return 1;
    }
  }

  protected sendPlan(){}
  protected requestRescue(){}
}
