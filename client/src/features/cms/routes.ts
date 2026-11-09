import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

const StaticPage = lazy(() => import('./pages/StaticPage'));

/** CMS/legal static pages (`/pages/:slug`, `/legal/:key`). */
export const cmsRouteObjects: RouteObject[] = [
  { path: `${APP_PATHS.pages}/:slug`, Component: StaticPage },
  { path: `${APP_PATHS.legal}/:key`, Component: StaticPage },
];
