import { matchPath, useLocation } from 'react-router-dom';

/**
 * Path patterns where the Terms gate must fully unmount so users can read legal copy.
 *
 * Kept as `matchPath` patterns (not route `handle` / `useMatches`) because the app uses
 * `BrowserRouter` + `<Routes>` — `useMatches` only works under a data router
 * (`createBrowserRouter` / `RouterProvider`) and would invariant-crash here.
 *
 * Keep in sync with `<Route path="/pages/:slug" />` in `App.jsx`.
 */
export const TERMS_GATE_EXEMPT_PATHS = ['/pages/:slug'];

/**
 * @param {string} pathname
 * @returns {boolean}
 */
export function isTermsGateExemptPath(pathname) {
  return TERMS_GATE_EXEMPT_PATHS.some((path) => matchPath({ path, end: true }, pathname) != null);
}

/** True when the current URL is a Terms-gate-exempt legal/CMS screen. */
export function useIsTermsGateExempt() {
  const { pathname } = useLocation();
  return isTermsGateExemptPath(pathname);
}
