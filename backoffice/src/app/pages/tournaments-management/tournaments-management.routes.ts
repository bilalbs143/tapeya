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
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Tournaments Management' }, { title: 'Tournament Requests' }],
    },
  },
  {
    path: 'interest-campaigns',
    loadComponent: () =>
      import('./interest-campaigns/interest-campaigns-list.component').then((m) => m.InterestCampaignsListComponent),
    data: {
      title: 'Interest Campaigns',
      urls: [{ title: 'Dashboard', url: '/dashboard' }, { title: 'Tournaments Management' }, { title: 'Interest Campaigns' }],
    },
  },
  {
    path: 'interest-campaigns/:campaignId',
    loadComponent: () =>
      import('./interest-campaigns/campaign-detail/campaign-detail-shell.component').then((m) => m.CampaignDetailShellComponent),
    data: {
      title: 'Interest Campaign',
      urls: [
        { title: 'Dashboard', url: '/dashboard' },
        { title: 'Tournaments Management' },
        { title: 'Interest Campaigns', url: '/tournaments-management/interest-campaigns' },
        { title: 'Detail' },
      ],
    },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'overview' },
      {
        path: 'overview',
        loadComponent: () =>
          import('./interest-campaigns/campaign-detail/campaign-overview-tab.component').then(
            (m) => m.CampaignOverviewTabComponent
          ),
        data: { title: 'Overview' },
      },
      {
        path: 'submissions',
        loadComponent: () =>
          import('./interest-campaigns/campaign-submissions/campaign-submissions.component').then(
            (m) => m.CampaignSubmissionsComponent
          ),
        data: { title: 'Submissions' },
      },
    ],
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
        path: 'teams/:teamId/squad',
        loadComponent: () =>
          import('./tournament-detail/tournament-team-squad-page.component').then((m) => m.TournamentTeamSquadPageComponent),
        data: { title: 'Team Squad' },
      },
      {
        path: 'teams',
        loadComponent: () =>
          import('./tournament-detail/tournament-teams-tab.component').then((m) => m.TournamentTeamsTabComponent),
        data: { title: 'Teams' },
      },
      {
        path: 'squads',
        redirectTo: 'teams',
        pathMatch: 'full',
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
      {
        path: 'interest-campaigns',
        loadComponent: () =>
          import('./tournament-detail/tournament-interest-campaigns-tab.component').then(
            (m) => m.TournamentInterestCampaignsTabComponent
          ),
        data: { title: 'Interest Campaigns' },
      },
    ],
  },
  {
    path: 'match-controller/:matchId',
    loadComponent: () =>
      import('./match-controller/match-controller-dashboard.component').then((m) => m.MatchControllerDashboardComponent),
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
