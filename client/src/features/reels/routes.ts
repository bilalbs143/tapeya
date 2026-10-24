import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';
import { buildHttpsDeepLink } from '@/shared/lib/deepLinks';

export const reelRoutes = {
  list: () => APP_PATHS.reels,
  detail: (id: number) => `${APP_PATHS.reels}/${id}`,
  create: () => APP_PATHS.createReel,
};

/** Public HTTPS Universal Link for a reel (never `capacitor://localhost`). */
export function buildReelShareUrl(reelId: number): string {
  return buildHttpsDeepLink(reelRoutes.detail(reelId));
}

const ReelsPage = lazy(() => import('./pages/ReelsPage'));
const CreateReelPage = lazy(() => import('./pages/CreateReelPage'));

/** Reels feed — bare shell (immersive player). */
export const reelRouteObjects: RouteObject[] = [
  { path: APP_PATHS.reels, Component: ReelsPage },
  { path: `${APP_PATHS.reels}/:id`, Component: ReelsPage },
];

/** Reel upload/select — normal shell (TopNav + ScreenBar); BottomNav hidden via AppShell. */
export const reelShellRouteObjects: RouteObject[] = [{ path: APP_PATHS.createReel, Component: CreateReelPage }];
