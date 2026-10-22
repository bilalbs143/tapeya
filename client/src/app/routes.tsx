import { Navigate, type RouteObject } from 'react-router-dom';

import { authRouteObjects } from '@/features/auth';
import { cmsRouteObjects } from '@/features/cms';
import { entertainmentRedirectObjects, entertainmentRouteObjects } from '@/features/entertainment';
import { exploreRouteObjects } from '@/features/explore';
import { feedRouteObjects } from '@/features/feed';
import { highlightRouteObjects } from '@/features/highlights';
import { interestRouteObjects } from '@/features/interest';
import {
  liveGoLiveFormRouteObjects,
  liveImmersiveRouteObjects,
  liveShellRouteObjects,
} from '@/features/live';
import { matchRouteObjects, scoringRouteObjects } from '@/features/matches';
import { notificationRouteObjects } from '@/features/notifications';
import { profileRouteObjects } from '@/features/profile';
import { rankingRouteObjects } from '@/features/ranking';
import { reelRouteObjects, reelShellRouteObjects } from '@/features/reels';
import { shopRouteObjects } from '@/features/shop';
import { tournamentRouteObjects } from '@/features/tournaments';

import { APP_PATHS } from '@/shared/config/paths';

import { AppShell } from './AppShell';
import { RequireAuth } from './RequireAuth';
import { RequireBroadcastAccess } from './RequireBroadcastAccess';
import { RequireGuest } from './RequireGuest';
import { shellRouteObjects } from './shellRoutes';

/** Aggregates every feature route table (same deliberate exception as dialog registry). */

export const routes: RouteObject[] = [
  {
    element: <RequireGuest />,
    children: authRouteObjects,
  },
  /** Public CMS/legal inside AppShell but outside RequireAuth (guests can open Terms). */
  {
    element: <AppShell />,
    children: cmsRouteObjects,
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <RequireBroadcastAccess />,
        children: [
          {
            element: <AppShell bare />,
            children: liveImmersiveRouteObjects,
          },
          {
            element: <AppShell />,
            children: liveGoLiveFormRouteObjects,
          },
        ],
      },
      {
        element: <AppShell bare />,
        children: [...reelRouteObjects, ...scoringRouteObjects],
      },
      {
        element: <AppShell />,
        children: [
          ...feedRouteObjects,
          ...reelShellRouteObjects,
          ...exploreRouteObjects,
          ...tournamentRouteObjects,
          ...matchRouteObjects,
          ...liveShellRouteObjects,
          ...profileRouteObjects,
          ...rankingRouteObjects,
          ...notificationRouteObjects,
          ...interestRouteObjects,
          ...highlightRouteObjects,
          ...shopRouteObjects,
          ...entertainmentRouteObjects,
          ...entertainmentRedirectObjects,
          ...shellRouteObjects,
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to={APP_PATHS.home} replace /> },
];
