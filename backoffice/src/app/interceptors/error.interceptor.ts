import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

import { AuthService } from '../services/auth.service';
import { MessageService } from '../services/message.service';
import { isAuthenticationPath, safeReturnUrl } from '../utils/return-url.util';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const messages = inject(MessageService);

  return next(req).pipe(
    tap({
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            auth.logout();
            messages.error('Your session has expired. Please sign in again.');
            if (isAuthenticationPath(router.url)) {
              void router.navigate(['/authentication/login'], { replaceUrl: true });
              return;
            }
            void router.navigate(['/authentication/login'], {
              queryParams: { returnUrl: safeReturnUrl(router.url) },
            });
            return;
          }

          // For other HTTP errors, show a generic toast unless the caller handles it explicitly
          messages.httpError(error);
        }
      },
    })
  );
};
