import { Routes } from '@angular/router';

export const LiveStreamsManagementRoutes: Routes = [
  {
    path: 'live-streams',
    loadComponent: () => import('./live-streams/live-streams-list.component').then((m) => m.LiveStreamsListComponent),
    data: {
      title: 'Live Streams',
      icon: 'solar:videocamera-record-line-duotone',
      hideBreadcrumb: true,
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Live Streams' }],
    },
  },
  {
    path: 'live-streams/:streamId',
    loadComponent: () =>
      import('./live-stream-detail/live-stream-detail-shell.component').then((m) => m.LiveStreamDetailShellComponent),
    data: {
      title: 'Live Stream',
      icon: 'solar:videocamera-record-line-duotone',
      hideBreadcrumb: true,
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Live Streams', url: '/live-streams-management/live-streams' },
        { title: 'Detail' },
      ],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./live-stream-detail/live-stream-overview-tab.component').then((m) => m.LiveStreamOverviewTabComponent),
        data: { title: 'Overview' },
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./live-stream-detail/live-stream-settings-tab.component').then((m) => m.LiveStreamSettingsTabComponent),
        data: { title: 'Settings' },
      },
    ],
  },
];
