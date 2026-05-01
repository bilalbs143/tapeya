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
    path: 'teams',
    loadComponent: () => import('./teams/teams.component').then((m) => m.TeamsComponent),
    data: {
      title: 'Teams',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Tournaments Management' }, { title: 'Teams' }],
    },
  },
  {
    path: 'tournaments/:tournamentId',
    loadComponent: () =>
      import('./tournament-detail/tournament-detail-shell.component').then((m) => m.TournamentDetailShellComponent),
    data: {
      title: 'Tournament',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Tournaments Management' },
        { title: 'Tournaments', url: '/tournaments-management/tournaments' },
        { title: 'Detail' },
      ],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./tournament-detail/tournament-overview-tab.component').then((m) => m.TournamentOverviewTabComponent),
        data: { title: 'Overview' },
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('./tournament-detail/tournament-teams-tab.component').then((m) => m.TournamentTeamsTabComponent),
        data: { title: 'Teams' },
      },
      {
        path: 'squads',
        loadComponent: () =>
          import('./tournament-detail/tournament-squads-tab.component').then((m) => m.TournamentSquadsTabComponent),
        data: { title: 'Team Squads' },
      },
      {
        path: 'matches',
        loadComponent: () =>
          import('./tournament-matches/tournament-matches.component').then((m) => m.TournamentMatchesComponent),
        data: {
          title: 'Matches',
          urls: [
            { title: 'Dashboard', url: '/dashboard' },
            { title: 'Tournaments Management' },
            { title: 'Tournaments', url: '/tournaments-management/tournaments' },
            { title: 'Matches' },
          ],
        },
      },
    ],
  },
  {
    path: 'match-controller/:matchId',
    loadComponent: () =>
      import('./match-controller/match-controller-dashboard.component').then(
        (m) => m.MatchControllerDashboardComponent
      ),
    data: {
      title: 'Match Controller',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Tournaments Management', url: '/tournaments-management/tournaments' },
        { title: 'Match Controller' },
      ],
    },
  },
];
