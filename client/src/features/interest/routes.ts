import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

export const interestRoutes = {
  form: (slug: string) => `${APP_PATHS.interest}/${slug}`,
};

const InterestPage = lazy(() => import('./pages/InterestPage'));

export const interestRouteObjects: RouteObject[] = [{ path: `${APP_PATHS.interest}/:slug`, Component: InterestPage }];
