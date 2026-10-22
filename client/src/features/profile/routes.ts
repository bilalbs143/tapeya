import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

import { profilePathSegment } from './lib/resolveHandle';

export const profileRoutes = {
  you: () => APP_PATHS.you,
  edit: () => APP_PATHS.profile,
  /** Prefer nickname when present so share links use `/users/:nickname`. */
  user: (user: number | { id: number; nickname?: string | null }) => {
    const segment = typeof user === 'number' ? String(user) : profilePathSegment(user);
    return `${APP_PATHS.user}/${encodeURIComponent(segment)}`;
  },
};

const YouPage = lazy(() => import('./pages/YouPage'));
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'));
const PublicProfilePage = lazy(() => import('./pages/PublicProfilePage'));

export const profileRouteObjects: RouteObject[] = [
  { path: APP_PATHS.you, Component: YouPage },
  { path: APP_PATHS.profile, Component: EditProfilePage },
  { path: `${APP_PATHS.user}/:handle`, Component: PublicProfilePage },
];
