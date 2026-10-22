import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

export const liveRoutes = {
  list: () => APP_PATHS.live,
  broadcast: (id: number) => `${APP_PATHS.liveBroadcast}/${id}`,
  goLive: () => APP_PATHS.goLive,
  goLiveSession: (id: number) => `${APP_PATHS.goLive}/${id}`,
};

const LiveHubPage = lazy(() => import('./pages/LiveHubPage'));
const WatchPage = lazy(() => import('./pages/WatchPage'));
const GoLivePage = lazy(() => import('./pages/GoLivePage'));
const GoLiveOnAirPage = lazy(() => import('./pages/GoLiveOnAirPage'));

/** Hub + watch — normal AppShell (same chrome as Highlights / Entertainment). */
export const liveShellRouteObjects: RouteObject[] = [
  { path: APP_PATHS.live, Component: LiveHubPage },
  { path: `${APP_PATHS.liveBroadcast}/:streamId`, Component: WatchPage },
];

/** Go-live form — gated by RequireBroadcastAccess; keeps bottom nav. */
export const liveGoLiveFormRouteObjects: RouteObject[] = [{ path: APP_PATHS.goLive, Component: GoLivePage }];

/** On-air go-live — gated by RequireBroadcastAccess; bare shell (camera underlay). */
export const liveImmersiveRouteObjects: RouteObject[] = [
  { path: `${APP_PATHS.goLive}/:streamId`, Component: GoLiveOnAirPage },
];
