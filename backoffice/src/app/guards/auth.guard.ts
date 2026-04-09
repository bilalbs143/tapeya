import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';
import { safeReturnUrl } from '../utils/return-url.util';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  void router.navigate(['/authentication/login'], {
    queryParams: { returnUrl: safeReturnUrl(state.url) },
  });

  return false;
};
