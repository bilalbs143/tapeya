import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Broadcast Operator accounts (app user + admin Broadcaster role) may only reach
 * dashboard, tournament ops (including match controller), global teams, and player registry.
 */
export const backofficeScopeGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  const narrow = user && user.is_broadcast_staff === true && user.is_admin !== true;
  if (!narrow) {
    return true;
  }

  const path = state.url.split('?')[0];
  const allowed = path === '/dashboard' || path.startsWith('/tournaments-management/') || path.startsWith('/players-management/');

  if (allowed) {
    return true;
  }

  return router.parseUrl('/tournaments-management/tournaments');
};
