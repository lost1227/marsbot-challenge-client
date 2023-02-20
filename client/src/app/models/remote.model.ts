import { RobotPlan } from "./robot-plan.model";

export type RobotNumber = number;

export enum Status {
    OK = 'ok',
    FAIL = 'fail'
}

export interface Response {
    status: Status
}

export interface RobotAssignmentResponse extends Response {
    robot_number: RobotNumber
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
