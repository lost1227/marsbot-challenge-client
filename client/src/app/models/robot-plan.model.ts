export type RemoteRobotPlan = Array<RemoteRobotPlanStep>
export type RemoteRobotPlanStep = Array<string|number>

export enum RobotPlanStepType {
    MOVE,
    TURN,
    GRAB
};

export enum Direction {
    UP = '\u2191',
    DOWN = '\u2193',
    LEFT = '\u2190',
    RIGHT = '\u2192'
  };

export interface RobotPlanStep {
    type: RobotPlanStepType

    toRemotePlanStep(turnScale: number): RemoteRobotPlanStep;
};

export class MoveStep implements RobotPlanStep {
    type = RobotPlanStepType.MOVE;

    constructor(
        public steps: number,
        public direction: Direction
    ) {}

    public toRemotePlanStep(_turnScale: number): RemoteRobotPlanStep {
        return [this.direction, this.steps];
    }
}

export class TurnStep implements RobotPlanStep {
    type = RobotPlanStepType.TURN;

    constructor(
        public steps: number,
        public direction: Direction
    ) {}

    public toRemotePlanStep(turnScale: number): RemoteRobotPlanStep {
        return [this.direction, this.steps, turnScale];
    }
}

export class GrabStep implements RobotPlanStep {
    type = RobotPlanStepType.GRAB;

    constructor(
        public action: string
    ) {}

    public toRemotePlanStep(_turnScale: number): RemoteRobotPlanStep {
        return [this.action];
    }
}
