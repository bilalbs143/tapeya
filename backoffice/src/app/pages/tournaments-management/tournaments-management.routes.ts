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
  {
    path: 'tournaments/:tournamentId/matches',
    loadComponent: () =>
      import('./tournament-matches/tournament-matches.component').then((m) => m.TournamentMatchesComponent),
    data: {
      title: 'Tournament matches',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Tournaments Management' },
        { title: 'Tournaments', url: '/tournaments-management/tournaments' },
        { title: 'Matches' },
      ],
    },
  },
  {
    path: 'match-controller/:matchId',
    loadComponent: () =>
      import('./match-controller/match-controller-dashboard.component').then(
        (m) => m.MatchControllerDashboardComponent
      ),
    data: {
      title: 'Match controller',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Tournaments Management', url: '/tournaments-management/tournaments' },
        { title: 'Match controller' },
      ],
    },
  },
];
