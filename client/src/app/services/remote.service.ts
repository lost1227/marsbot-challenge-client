import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorResponse, RescueResponse, RobotAssignmentResponse, RobotId, RobotPlanResponse, SolResponse } from '../models/remote.model';
import { RemoteRobotPlan } from '../models/robot-plan.model';
import { ErrorService } from './error.service';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {

  constructor(
    private httpClient: HttpClient,
    private errorService: ErrorService
  ) {}

  public getRobotAssignment(userName: string): Observable<RobotAssignmentResponse> {
    let params = new HttpParams().set('name', userName);
    return this.httpClient
      .get<RobotAssignmentResponse>(environment.serverAddress + "robot_assignment", {params})
      .pipe(this.errorService.interceptErrors());
  }

  public getSol(): Observable<SolResponse|ErrorResponse> {
    // Note: getSol() does not automatically intercept errors as some errors are used by the
    // GameStateService to determine whether or not the game is currently running
    return this.httpClient.get<SolResponse>(environment.serverAddress + "sol").pipe(
      map(response => {
        if(response.status == "ok")
          return {
            status: response.status,
            sol: Number(response.sol),
            total_sols: Number(response.total_sols),
            mins_per_sol: Number(response.mins_per_sol)
          }
        else
          return response;
      })
    );
  }

  public sendPlan(robot: RobotId, plan: RemoteRobotPlan): Observable<RobotPlanResponse> {
    let body = {
      robot,
      plan
    };
    return this.httpClient.post<RobotPlanResponse>(environment.serverAddress + "plan", body)
      .pipe(this.errorService.interceptErrors());
  }

  public sendRescue(robot: RobotId): Observable<RescueResponse> {
    let body = {
      robot
    };
    return this.httpClient.post<RescueResponse>(environment.serverAddress + "plan", body)
      .pipe(this.errorService.interceptErrors());
  }
}
