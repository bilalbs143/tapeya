import { inject } from '@angular/core';
import { CanMatchFn } from '@angular/router';

import { AuthService } from '../services/auth.service';

/**
 * Narrow Broadcast Operator shell: limited menu + tournament ops only.
 * Used so `/dashboard` can lazy-load a lightweight home instead of the eCommerce dashboard.
 */
export const broadcastStaffDashboardCanMatch: CanMatchFn = () => {
  const user = inject(AuthService).currentUser();

  return user != null && user.is_broadcast_staff === true && user.is_admin !== true;
};
