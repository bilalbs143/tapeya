import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

import type { RankingStatType } from './lib/constants';

export const rankingRoutes = {
  list: () => APP_PATHS.ranking,
  stats: (statType: RankingStatType) => `${APP_PATHS.ranking}/stats/${statType}`,
};

const RankingPage = lazy(() => import('./pages/RankingPage'));
const RankingStatsPage = lazy(() => import('./pages/RankingStatsPage'));

export const rankingRouteObjects: RouteObject[] = [
  { path: APP_PATHS.ranking, Component: RankingPage },
  { path: `${APP_PATHS.ranking}/stats/:statType`, Component: RankingStatsPage },
];
