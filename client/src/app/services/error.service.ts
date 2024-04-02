import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, retry } from 'rxjs';
import { Status } from '../models/remote.model';
import { AppState, AppStateService } from './app-state.service';
import { HttpEvent, HttpEventType } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  public static readonly unknownErrorMsg = "An unknown error occurred";
  private lastError: Error|null = null;

  constructor(
    private appStateService: AppStateService
  ) { }

  public handleError(error: Error) {
    this.appStateService.nextState(AppState.ERROR);
    this.lastError = error;
  }

  public getLastError(): Error|null {
    return this.lastError;
  }

  public interceptErrors(catchErrors: boolean = true) {
    const errService = this;
    return function (source: Observable<HttpEvent<any>>): Observable<HttpEvent<any>> {
      const intercepted = source.pipe(
        map(response => {
          if(response.type == HttpEventType.Response) {
            let body = response.body;
            if(body instanceof Object && body["status"] && body["status"] == Status.FAIL) {
              throw new Error(body['message'] ?? ErrorService.unknownErrorMsg);
            }
          }
          return response;
        }),
        retry(0)
      );
      if(catchErrors) {
        return intercepted.pipe(
          catchError(error => {
            errService.handleError(error);
            return of();
          }));
      } else {
        return intercepted;
      }
    }
  }
}
