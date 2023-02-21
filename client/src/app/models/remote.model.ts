export type RobotId = string;

export enum Status {
    OK = 'ok',
    FAIL = 'fail'
}

export interface Response {
    status: Status
}

export interface RobotAssignmentResponse extends Response {
    robot_number: RobotId
}

export interface SolResponse extends Response {
    sol: number,
    total_sols: number,
    mins_per_sol: number
}

export interface RobotPlanResponse extends Response {
    delay: number
}

export interface RescueResponse extends Response {
    delay: number
}
