import { lazy } from 'react';
import type { RouteObject } from 'react-router-dom';

import { TERMS_GATE_EXEMPT_PATHS } from '@/shared/routing/termsGateExempt';

const StaticPage = lazy(() => import('./pages/StaticPage'));

/** CMS/legal routes — exempt from blocking terms gate. */
export const cmsRouteObjects: RouteObject[] = TERMS_GATE_EXEMPT_PATHS.map((path) => ({
  path,
  Component: StaticPage,
}));
