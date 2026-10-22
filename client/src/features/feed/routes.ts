import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

export const feedRoutes = {
  home: () => '/',
  post: (id: number) => `/feed/${id}`,
  create: () => APP_PATHS.create,
  createReel: () => APP_PATHS.createReel,
  /** Video posts open the reels player. */
  reel: (id: number) => `/reels/${id}`,
};

const FeedPage = lazy(() => import('./pages/FeedPage'));
const PostDetailPage = lazy(() => import('./pages/PostDetailPage'));
const CreatePostPage = lazy(() => import('./pages/CreatePostPage'));

export const feedRouteObjects: RouteObject[] = [
  { path: '/', Component: FeedPage },
  { path: '/feed/:id', Component: PostDetailPage },
  { path: APP_PATHS.create, Component: CreatePostPage },
];
