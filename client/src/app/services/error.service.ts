import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, retry } from 'rxjs';
import { Status } from '../models/remote.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {
  public static readonly unknownErrorMsg = "An unknown error occurred";

  constructor(
    private router: Router
  ) { }

  public handleError(error: Error) {
    this.router.navigateByUrl('/error', { state: {
      message: error.message ?? ErrorService.unknownErrorMsg
    } });
  }

  public interceptErrors() {
    const errService = this;
    return function <T>(source: Observable<T>): Observable<T> {
      return source.pipe(
        retry(1),
        map(value => {
          let anyv = value as any;
          if(anyv instanceof Object && anyv["status"] && anyv["status"] == Status.FAIL) {
            console.error(anyv["status"]);
            throw new Error(anyv['message'] ?? ErrorService.unknownErrorMsg);
          }
          return value;
        }),
        catchError(error => {
          errService.handleError(error);
          return of();
        })
      );
    }
  }
}
