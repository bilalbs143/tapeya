import { Routes } from '@angular/router';

/** Lazy-loaded routes for Support (user support/contact messages). */
export const SupportRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./support-messages-list.component').then((m) => m.SupportMessagesListComponent),
    data: {
      title: 'Support Messages',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Support Messages' }],
    },
  },
];
