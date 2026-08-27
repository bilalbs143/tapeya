import { Routes } from '@angular/router';

/** Lazy-loaded routes for Notifications. */
export const NotificationsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./notifications-list.component').then((m) => m.NotificationsListComponent),
    data: {
      title: 'Notifications',
      icon: 'solar:bell-ring-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Notifications' }],
    },
  },
];
