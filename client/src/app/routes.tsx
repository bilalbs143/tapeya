import { Navigate, type RouteObject } from 'react-router-dom';

import { authRouteObjects } from '@/features/auth';
import { cmsRouteObjects } from '@/features/cms';
import { entertainmentRedirectObjects, entertainmentRouteObjects } from '@/features/entertainment';
import { exploreRouteObjects } from '@/features/explore';
import { feedRouteObjects } from '@/features/feed';
import { highlightRouteObjects } from '@/features/highlights';
import { interestRouteObjects } from '@/features/interest';
import { liveGoLiveFormRouteObjects, liveImmersiveRouteObjects, liveShellRouteObjects } from '@/features/live';
import { matchRouteObjects, scoringRouteObjects } from '@/features/matches';
import { notificationRouteObjects } from '@/features/notifications';
import { profileRouteObjects } from '@/features/profile';
import { rankingRouteObjects } from '@/features/ranking';
import { reelRouteObjects, reelShellRouteObjects } from '@/features/reels';
import { sellerVendorRouteObjects, shopRouteObjects } from '@/features/shop';
import { tournamentRouteObjects } from '@/features/tournaments';

import { APP_PATHS } from '@/shared/config/paths';

import { AppShell } from './AppShell';
import { RequireAuth } from './RequireAuth';
import { RequireBroadcastAccess } from './RequireBroadcastAccess';
import { RequireGuest } from './RequireGuest';
import { RequireVendorAccess } from './RequireVendorAccess';
import { shellRouteObjects } from './shellRoutes';

/** Aggregates every feature route table (same deliberate exception as dialog registry). */

/**
 * Auth model (no guest product shell):
 * - `/login` `/register` `/otp` — guests only (`RequireGuest`)
 * - `/pages/*` `/legal/*` — public Terms/Privacy for the terms gate (shell without TopBar/nav)
 * - everything else — `RequireAuth` (hydrate → login/register, then `/me` before Outlet)
 */
export const routes: RouteObject[] = [
  {
    element: <RequireGuest />,
    children: authRouteObjects,
  },
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
        element: <RequireVendorAccess />,
        children: [
          {
            element: <AppShell />,
            children: sellerVendorRouteObjects,
          },
        ],
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
