import { Routes } from '@angular/router';

export const LiveStreamsManagementRoutes: Routes = [
  {
    path: 'live-streams',
    loadComponent: () => import('./live-streams/live-streams-list.component').then((m) => m.LiveStreamsListComponent),
    data: {
      title: 'Live Streams',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Live Streams' }],
    },
  },
];
