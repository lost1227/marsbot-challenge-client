export type RobotId = string;

export enum Status {
    OK = 'ok',
    FAIL = 'fail'
}

export interface Response {
    status: Status
}

export interface ErrorResponse {
    status: Status,
    message: string
}

export interface RobotAssignmentResponse extends Response {
    robot_number: RobotId
}

export interface GameStateResponse extends Response {
    game_running: boolean,
    game_id: string
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
