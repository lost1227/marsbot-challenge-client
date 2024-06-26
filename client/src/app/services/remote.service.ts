import { HttpClient, HttpContext, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ErrorResponse, GameStateResponse, RescueResponse, RobotAssignmentResponse, RobotId, RobotPlanResponse, SolResponse } from '../models/remote.model';
import { RemoteRobotPlan } from '../models/robot-plan.model';
import { ErrorService } from './error.service';
import { CATCH_ERRORS } from '../http-interceptors/error-interceptor';

@Injectable({
  providedIn: 'root'
})
export class RemoteService {

  constructor(
    private httpClient: HttpClient
  ) {}

  public getRobotAssignment(clientId: string, catchErrors: boolean = true): Observable<RobotAssignmentResponse> {
    let params = new HttpParams().set('clientId', clientId);
    return this.httpClient
      .get<RobotAssignmentResponse>(environment.serverAddress + "robot_assignment", {
        params,
        context: new HttpContext().set(CATCH_ERRORS, false)
      });
  }

  public getGameState(clientId: string): Observable<GameStateResponse> {
    let params = new HttpParams().set('clientId', clientId);
    return this.httpClient
      .get<GameStateResponse>(environment.serverAddress + "game_state", {params});
  }

  public getSol(): Observable<SolResponse> {
    return this.httpClient.get<SolResponse>(environment.serverAddress + "sol");
  }

  public sendPlan(robot: RobotId, plan: RemoteRobotPlan): Observable<RobotPlanResponse> {
    const body = new URLSearchParams();
    body.set('robot', robot);
    body.set('plan', JSON.stringify(plan));
    return this.httpClient.post<RobotPlanResponse>(environment.serverAddress + "plan", body.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    });
  }

  public sendRescue(robot: RobotId): Observable<RescueResponse> {
    const body = new URLSearchParams();
    body.set('robot', robot);
    return this.httpClient.post<RescueResponse>(environment.serverAddress + "plan", body.toString(), {
      headers: new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded')
    });
  }
}
