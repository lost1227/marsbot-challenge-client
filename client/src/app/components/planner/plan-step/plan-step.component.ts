import { Component, Input } from '@angular/core';
import { Direction, GrabStep, MoveStep, RobotPlanStep, RobotPlanStepType, TurnStep } from 'src/app/models/robot-plan.model';

@Component({
  selector: 'app-plan-step',
  templateUrl: './plan-step.component.html',
  styleUrls: ['./plan-step.component.scss']
})
export class PlanStepComponent {
  @Input() planStep!: RobotPlanStep
  @Input() turnScale!: number

  protected readonly stepTypes = RobotPlanStepType;
  protected readonly dirDisplayMap = {
    [Direction.UP]: 'arrow_upward',
    [Direction.DOWN]: 'arrow_downward',
    [Direction.LEFT]: 'arrow_back',
    [Direction.RIGHT]: 'arrow_forward'
  };

  protected getDisplayDirection(): string {
    let step = this.planStep as MoveStep|TurnStep;
    return this.dirDisplayMap[step.direction];
  }

  protected getSteps(): string {
    let step = this.planStep as MoveStep;
    return step.steps.toFixed(1);
  }

  protected getScaledSteps(): string {
    let step = this.planStep as TurnStep;
    return (step.steps * this.turnScale).toFixed(1);
  }

  protected getGrabAction(): string {
    let step = this.planStep as GrabStep;
    return step.action;
  }
}
