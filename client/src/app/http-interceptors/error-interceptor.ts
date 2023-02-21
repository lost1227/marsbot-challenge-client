import { HttpEvent, HttpEventType, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, retry } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            map(event => {
                if(event.type != HttpEventType.Response) {
                    return event;
                }

                let body = event.body;
                if(body instanceof Object && body['status'] && body['status'] != 'ok') {
                    throw new Error(body['message'] ?? 'Unknown error');
                }
                return event;
            }),
            catchError(error => {
                this.router.navigateByUrl('/error', { state: {error} });
                return of();
            }),
            retry(0));
    }
}
