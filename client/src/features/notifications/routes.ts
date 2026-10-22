import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

export const notificationRoutes = {
  list: () => APP_PATHS.notifications,
};

const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

export const notificationRouteObjects: RouteObject[] = [
  { path: APP_PATHS.notifications, Component: NotificationsPage },
];
