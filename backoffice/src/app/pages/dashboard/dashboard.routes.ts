import { Routes } from '@angular/router';

import { broadcastStaffDashboardCanMatch } from 'src/app/guards/broadcast-staff-dashboard.match';

/**
 * `/dashboard`:
 *   - Broadcast staff (non-admin) → broadcaster ops dashboard (lazy, own chunk)
 *   - Everyone else (admin) → full cricket operations dashboard (lazy, own chunk)
 *
 * eCommerce home stays at `/ecommerce`.
 */
export const dashboardRoutes: Routes = [
  {
    path: '',
    canMatch: [broadcastStaffDashboardCanMatch],
    loadComponent: () =>
      import('./broadcaster-dashboard/broadcaster-dashboard.component').then((m) => m.BroadcasterDashboardComponent),
    data: {
      title: 'Dashboard',
      urls: [{ title: 'Dashboard', url: '/dashboard' }],
    },
  },
  {
    path: '',
    loadComponent: () => import('./cricket-dashboard/cricket-dashboard.component').then((m) => m.CricketDashboardComponent),
    data: {
      title: 'Cricket Dashboard',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Cricket Dashboard' }],
    },
  },
];
