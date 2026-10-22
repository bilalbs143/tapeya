import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

export const highlightRoutes = {
  list: () => APP_PATHS.highlights,
  detail: (id: number) => `${APP_PATHS.highlights}/${id}`,
};

const HighlightsPage = lazy(() => import('./pages/HighlightsPage'));
const HighlightDetailPage = lazy(() => import('./pages/HighlightDetailPage'));

export const highlightRouteObjects: RouteObject[] = [
  { path: APP_PATHS.highlights, Component: HighlightsPage },
  { path: `${APP_PATHS.highlights}/:id`, Component: HighlightDetailPage },
];
