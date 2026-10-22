import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

import { TeamsToWorkspaceRedirect, UpcomingDetailRedirect } from './TournamentRedirects';

const tournamentsListPage = lazy(() => import('./pages/TournamentsListPage'));
const createTournamentPage = lazy(() => import('./pages/CreateTournamentPage'));
const tournamentDetailPage = lazy(() => import('./pages/TournamentDetailPage'));
const squadEditorPage = lazy(() => import('./pages/SquadEditorPage'));
const publicTournamentPage = lazy(() => import('./pages/PublicTournamentPage'));
const upcomingTournamentsPage = lazy(() => import('./pages/UpcomingTournamentsPage'));

export const tournamentRouteObjects: RouteObject[] = [
  { path: APP_PATHS.tournaments, Component: tournamentsListPage },
  { path: APP_PATHS.tournamentCreate, Component: createTournamentPage },
  { path: `${APP_PATHS.tournaments}/:id/teams`, Component: TeamsToWorkspaceRedirect },
  { path: `${APP_PATHS.tournaments}/:id/squad`, Component: squadEditorPage },
  { path: `${APP_PATHS.tournaments}/:id/workspace`, Component: tournamentDetailPage },
  { path: `${APP_PATHS.tournaments}/:id`, Component: publicTournamentPage },
  { path: APP_PATHS.upcomingTournaments, Component: upcomingTournamentsPage },
  { path: `${APP_PATHS.upcomingTournaments}/:id`, Component: UpcomingDetailRedirect },
];
