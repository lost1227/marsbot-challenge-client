import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { RescueResponse, RobotAssignmentResponse, RobotNumber, RobotPlanResponse, SolResponse } from '../models/remote.model';
import { RobotPlan } from '../models/robot-plan.model';

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
    return this.httpClient.get<SolResponse>(environment.serverAddress + "sol");
  }

  public sendPlan(robot: RobotNumber, plan: RobotPlan): Observable<RobotPlanResponse> {
    let body = {
      robot,
      plan
    };
    return this.httpClient.post<RobotPlanResponse>(environment.serverAddress + "plan", body);
  }

  public sendRescue(robot: RobotNumber): Observable<RescueResponse> {
    let body = {
      robot
    };
    return this.httpClient.post<RescueResponse>(environment.serverAddress + "plan", body);
  }
}
