import { Routes } from '@angular/router';

/** Lazy-loaded routes for Tournaments Management. */
export const TournamentsManagementRoutes: Routes = [
  {
    path: 'tournaments',
    loadComponent: () => import('./tournaments/tournaments.component').then((m) => m.TournamentsComponent),
    data: {
      title: 'Tournaments',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Tournaments Management' }, { title: 'Tournaments' }],
    },
  },
  {
    path: 'tournament-requests',
    loadComponent: () =>
      import('./tournament-requests/tournament-requests-list.component').then((m) => m.TournamentRequestsListComponent),
    data: {
      title: 'Tournament Requests',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Tournaments Management' },
        { title: 'Tournament Requests' },
      ],
    },
  },
];
