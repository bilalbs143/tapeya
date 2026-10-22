import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

export const shellRouteObjects: RouteObject[] = [
  {
    path: APP_PATHS.stats,
    Component: lazy(() => import('@/features/stats').then((m) => ({ default: m.StatsPage }))),
  },
  {
    path: APP_PATHS.support,
    Component: lazy(() => import('@/features/support').then((m) => ({ default: m.SupportPage }))),
  },
];
