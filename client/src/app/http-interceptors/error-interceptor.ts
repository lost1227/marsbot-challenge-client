import { HttpContextToken, HttpEvent, HttpHandler, HttpInterceptor, HttpParams, HttpParamsOptions, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ErrorService } from '../services/error.service';

export const CATCH_ERRORS = new HttpContextToken(() => true);

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private errorService: ErrorService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const catchErrors = req.context.get(CATCH_ERRORS);
        return next.handle(req).pipe(this.errorService.interceptErrors(catchErrors));
    }
}
