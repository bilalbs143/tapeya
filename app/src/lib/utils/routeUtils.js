const TOURNAMENT_DETAILS_PATH = /^\/upcoming-tournaments\/[^/]+$/;
const HIGHLIGHT_DETAILS_PATH = /^\/highlights\/[^/]+$/;
const LIVE_BROADCAST_PATH = /^\/live\/broadcast\/[^/]+$/;

export function isLiveBroadcastPath(pathname) {
  return LIVE_BROADCAST_PATH.test(pathname);
}

export function isHighlightDetailsPath(pathname) {
  return HIGHLIGHT_DETAILS_PATH.test(pathname);
}

/** Pages whose main content starts at the viewport top (hero sits behind the fixed navbar). */
export function isNavbarOverlayPath(pathname, isDesktop = false) {
  if (isLiveBroadcastPath(pathname) && isDesktop) return false;
  if (isHighlightDetailsPath(pathname) && isDesktop) return false;
  return (
    pathname === '/profile' ||
    TOURNAMENT_DETAILS_PATH.test(pathname) ||
    HIGHLIGHT_DETAILS_PATH.test(pathname) ||
    LIVE_BROADCAST_PATH.test(pathname)
  );
}

/** Pages where the navbar may start transparent over a hero image (mobile live broadcast only). */
export function isHeroNavbarPath(pathname, isDesktop = false) {
  if (isLiveBroadcastPath(pathname) && isDesktop) return false;
  if (isHighlightDetailsPath(pathname) && isDesktop) return false;
  return (
    pathname === '/home' ||
    pathname === '/profile' ||
    TOURNAMENT_DETAILS_PATH.test(pathname) ||
    HIGHLIGHT_DETAILS_PATH.test(pathname) ||
    LIVE_BROADCAST_PATH.test(pathname)
  );
}

/**
 * Returns the post-login destination, avoiding redirect loops back to /login.
 * @param {object} state - React Router location state (or any object with state.from.pathname)
 */
export function getRedirectPath(state) {
  const from = state?.from?.pathname;
  return from && from !== '/login' ? from : '/home';
}
