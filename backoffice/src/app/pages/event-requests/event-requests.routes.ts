import { Routes } from '@angular/router';

/** Lazy-loaded routes for Event Requests. */
export const EventRequestsRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./event-requests-list.component').then((m) => m.EventRequestsListComponent),
    data: {
      title: 'Event Requests',
      urls: [{ title: 'Dashboard', url: '/starter' }, { title: 'Event Requests' }],
    },
  },
];
