import { matchPath, useLocation } from 'react-router-dom';

import { APP_PATHS } from '@/shared/config/paths';

/** Legal/CMS paths where Terms gate unmounts — `matchPath` only (`useMatches` needs a data router). Sync with `features/cms/routes.ts`. */
export const TERMS_GATE_EXEMPT_PATHS = [`${APP_PATHS.pages}/:slug`, `${APP_PATHS.legal}/:key`] as const;

export function isTermsGateExemptPath(pathname: string): boolean {
  return TERMS_GATE_EXEMPT_PATHS.some((path) => matchPath({ path, end: true }, pathname) != null);
}

export function useIsTermsGateExempt(): boolean {
  const { pathname } = useLocation();
  return isTermsGateExemptPath(pathname);
}
