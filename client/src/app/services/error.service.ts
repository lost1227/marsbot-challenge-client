import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, retry } from 'rxjs';
import { Status } from '../models/remote.model';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor(
    private router: Router
  ) { }

  public handleError(error: Error) {
    this.router.navigateByUrl('/error', { state: {error} });
  }

  public interceptErrors() {
    const errService = this;
    return function <T>(source: Observable<T>): Observable<T> {
      return source.pipe(
        map(value => {
          let anyv = value as any;
          if(anyv instanceof Object && anyv["status"] && anyv["status"] == Status.FAIL) {
            console.error(anyv["status"]);
            throw new Error(anyv['message'] ?? "An unknown error occurred");
          }
          return value;
        }),
        catchError(error => {
          errService.handleError(error);
          return of();
        }),
        retry(0)
      );
    }
  }
}
