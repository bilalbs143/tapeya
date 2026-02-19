import { Routes } from '@angular/router';

/** Lazy-loaded routes for Events Management. */
export const EventsManagementRoutes: Routes = [
  {
    path: 'events',
    loadComponent: () => import('./events/events.component').then((m) => m.EventsComponent),
    data: {
      title: 'Events',
      urls: [{ title: 'Dashboard', url: '/starter' }, { title: 'Events Management' }, { title: 'Events' }],
    },
  },
  {
    path: 'event-requests',
    loadComponent: () =>
      import('./event-requests/event-requests-list.component').then((m) => m.EventRequestsListComponent),
    data: {
      title: 'Event Requests',
      urls: [{ title: 'Dashboard', url: '/starter' }, { title: 'Events Management' }, { title: 'Event Requests' }],
    },
  },
];
