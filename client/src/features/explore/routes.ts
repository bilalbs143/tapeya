import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

export const exploreRoutes = {
  discover: () => APP_PATHS.discover,
};

const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));

export const exploreRouteObjects: RouteObject[] = [{ path: APP_PATHS.discover, Component: DiscoverPage }];
