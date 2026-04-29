import { Routes } from '@angular/router';

import { broadcastStaffDashboardCanMatch } from 'src/app/guards/broadcast-staff-dashboard.match';

/** `/dashboard`: broadcast staff get a dedicated ops home; everyone else gets the eCommerce dashboard. */
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
    loadComponent: () =>
      import('../ecommerce/ecommerce-dashboard/ecommerce-dashboard.component').then(
        (m) => m.EcommerceDashboardComponent
      ),
    data: {
      title: 'eCommerce Dashboard',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'eCommerce Dashboard' }],
    },
  },
];
