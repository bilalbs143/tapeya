import { createElement, lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

import { entertainmentPaths } from './lib/entertainmentPaths';

export { entertainmentPaths };

const EntertainmentPage = lazy(() => import('./pages/EntertainmentPage'));
const EntertainmentDetailPage = lazy(() => import('./pages/EntertainmentDetailPage'));
const EntertainmentEpisodePage = lazy(() => import('./pages/EntertainmentEpisodePage'));

/** Entertainment hub + detail + episode player. */

export const entertainmentRouteObjects: RouteObject[] = [
  { path: APP_PATHS.entertainment, Component: EntertainmentPage },
  { path: `${APP_PATHS.entertainment}/:id`, Component: EntertainmentDetailPage },
  {
    path: `${APP_PATHS.entertainment}/:serialId/e/:episodeId`,
    Component: EntertainmentEpisodePage,
  },
];

/** Dead `/live/streaming*` consumer manager → Entertainment. */

export const entertainmentRedirectObjects: RouteObject[] = [
  {
    path: APP_PATHS.liveStreaming,
    element: createElement(Navigate, { to: APP_PATHS.entertainment, replace: true }),
  },
  {
    path: `${APP_PATHS.liveStreaming}/*`,
    element: createElement(Navigate, { to: APP_PATHS.entertainment, replace: true }),
  },
];
