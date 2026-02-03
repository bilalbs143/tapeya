import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthService } from '../auth/auth.service';
import { Messages } from '../constants/constants';
import { processValidationErrorMessages, response } from '../functions/core.function';
import { MessageService } from '../services/message.service';
import { TranslationLoaderService } from '../services/translation-loader.service';

@Injectable()
export class MiddlewareInterceptor implements HttpInterceptor {
  private readonly messageService = inject(MessageService);
  private authService = inject(AuthService);
  private translationLoaderService = inject(TranslationLoaderService);

  private isConnected: boolean = navigator.onLine;

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isConnected) {
      return throwError(response(Messages.internetConnectionDescription, 400));
    }
    const headers: Record<string, string> = {};
    const locale = this.translationLoaderService.getLanguage();
    if (locale) {
      headers['X-Locale'] = locale;
    }
    if (this.authService.isAuthenticated()) {
      headers['Authorization'] = 'Bearer ' + this.authService.getToken();
    }
    if (Object.keys(headers).length > 0) {
      req = req.clone({ headers: new HttpHeaders(headers) });
    }

    return next.handle(req).pipe(
      catchError((error) => {
        if (error.status === 401) {
          this.authService.logout();
        }
        if (error.status === 403) {
          this.messageService.snackBar("You're not allowed to perform this action");
        }
        if (error.status === 404) {
          this.messageService.snackBar("The resource you're looking for could not be found");
        }
        if (error.status === 422) {
          if (error && error.error && error.error.errors && error.error.errors.length > 0) {
            this.messageService.snackBar(processValidationErrorMessages(error.error.errors), 10000);
          } else {
            this.messageService.snackBar(error.error.message, 10000);
          }
        }
        return throwError(error);
      })
    );
  }
}
