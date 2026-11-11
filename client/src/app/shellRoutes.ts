import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { loadStatsPage } from '@/features/stats';

import { APP_PATHS } from '@/shared/config/paths';

export const shellRouteObjects: RouteObject[] = [
  {
    path: APP_PATHS.stats,
    Component: lazy(() => loadStatsPage()),
  },
  {
    path: APP_PATHS.support,
    Component: lazy(() => import('@/features/support').then((m) => ({ default: m.SupportPage }))),
  },
];
