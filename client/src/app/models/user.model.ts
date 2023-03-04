import { RobotId } from "./remote.model";

export interface User {
    gameId: string,
    clientId: string,
    name: string
}

export interface UserWithRobot {
    user: User,
    robotId: RobotId
}
