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
    sol: string,
    total_sols: string,
    mins_per_sol: string
}

export interface RobotPlanResponse extends Response {
    delay: number
}

export interface RescueResponse extends Response {
    delay: number
}
