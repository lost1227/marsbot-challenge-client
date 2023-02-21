import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RescueResponse, RobotAssignmentResponse, RobotId, RobotPlanResponse, SolResponse } from '../models/remote.model';
import { RemoteRobotPlan } from '../models/robot-plan.model';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {

  constructor(private httpClient: HttpClient) {}

  public getRobotAssignment(userName: string): Observable<RobotAssignmentResponse> {
    let params = new HttpParams().set('name', userName);
    return this.httpClient.get<RobotAssignmentResponse>(environment.serverAddress + "robot_assignment", {params});
  }

  public getSol(): Observable<SolResponse> {
    return this.httpClient.get<SolResponse>(environment.serverAddress + "sol").pipe(
      map(response => ({
        status: response.status,
        sol: Number(response.sol),
        total_sols: Number(response.total_sols),
        mins_per_sol: Number(response.mins_per_sol)
      }))
    );
  }

  public sendPlan(robot: RobotId, plan: RemoteRobotPlan): Observable<RobotPlanResponse> {
    let body = {
      robot,
      plan
    };
    return this.httpClient.post<RobotPlanResponse>(environment.serverAddress + "plan", body);
  }

  public sendRescue(robot: RobotId): Observable<RescueResponse> {
    let body = {
      robot
    };
    return this.httpClient.post<RescueResponse>(environment.serverAddress + "plan", body);
  }
}
