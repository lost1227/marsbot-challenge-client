import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, retry } from 'rxjs';
import { Status } from '../models/remote.model';
import { AppState, AppStateService } from './app-state.service';

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
    return function <T>(source: Observable<T>): Observable<T> {
      const intercepted = source.pipe(
        map(value => {
          let anyv = value as any;
          if(anyv instanceof Object && anyv["status"] && anyv["status"] == Status.FAIL) {
            console.error(anyv["status"]);
            throw new Error(anyv['message'] ?? ErrorService.unknownErrorMsg);
          }
          return value;
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
