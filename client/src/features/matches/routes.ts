import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

export const matchRoutes = {
  list: () => APP_PATHS.matches,
  start: () => APP_PATHS.startMatch,
  quick: () => APP_PATHS.quickMatch,
  scorecard: () => APP_PATHS.scorecard,
  score: (id: number) => `/matches/${id}/score`,
  toss: (id: number) => `/matches/${id}/toss`,
  settings: (id: number) => `/matches/${id}/settings`,
  graphics: (id: number) => `/matches/${id}/graphics`,
  card: (id: number) => `${APP_PATHS.matchCard}/${id}`,
};

const MatchesListPage = lazy(() => import('./pages/MatchesListPage'));
const StartMatchPage = lazy(() => import('./pages/StartMatchPage'));
const QuickMatchPage = lazy(() => import('./pages/QuickMatchPage'));
const ScorecardHubPage = lazy(() => import('./pages/ScorecardHubPage'));
const MatchScorePage = lazy(() => import('./pages/MatchScorePage'));
const MatchTossPage = lazy(() => import('./pages/MatchTossPage'));
const MatchSettingsPage = lazy(() => import('./pages/MatchSettingsPage'));
const MatchBroadcastGraphicsPage = lazy(() => import('./pages/MatchBroadcastGraphicsPage'));
const MatchCardPage = lazy(() => import('./pages/MatchCardPage'));

export const matchRouteObjects: RouteObject[] = [
  { path: APP_PATHS.matches, Component: MatchesListPage },
  { path: APP_PATHS.startMatch, Component: StartMatchPage },
  { path: APP_PATHS.quickMatch, Component: QuickMatchPage },
  { path: APP_PATHS.scorecard, Component: ScorecardHubPage },
  { path: '/matches/:id/settings', Component: MatchSettingsPage },
  { path: '/matches/:id/graphics', Component: MatchBroadcastGraphicsPage },
  { path: `${APP_PATHS.matchCard}/:id`, Component: MatchCardPage },
];

/** Full-bleed scorer — mounted under AppShell bare, not the scroll column. */

export const scoringRouteObjects: RouteObject[] = [
  { path: '/matches/:id/score', Component: MatchScorePage },
  { path: '/matches/:id/toss', Component: MatchTossPage },
];
