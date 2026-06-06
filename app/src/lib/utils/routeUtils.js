const TOURNAMENT_DETAILS_PATH = /^\/upcoming-tournaments\/[^/]+$/;
const HIGHLIGHT_DETAILS_PATH = /^\/highlights\/[^/]+$/;
const SCORING_MATCH_PATH = /^\/organizer\/scoring\/match\/[^/]+$/;
const LIVE_BROADCAST_PATH = /^\/live\/broadcast\/[^/]+$/;

export function isLiveBroadcastPath(pathname) {
  return LIVE_BROADCAST_PATH.test(pathname);
}

export function isHighlightDetailsPath(pathname) {
  return HIGHLIGHT_DETAILS_PATH.test(pathname);
}

/** Pages whose main content starts at the viewport top (hero sits behind the fixed navbar). */
export function isNavbarOverlayPath(pathname, isDesktop = false) {
  if (isHighlightDetailsPath(pathname) && isDesktop) return false;
  return (
    pathname === '/profile' ||
    TOURNAMENT_DETAILS_PATH.test(pathname) ||
    HIGHLIGHT_DETAILS_PATH.test(pathname) ||
    SCORING_MATCH_PATH.test(pathname) ||
    LIVE_BROADCAST_PATH.test(pathname)
  );
}

/** Routes where the incomplete-profile reminder dialog must not appear. */
export function isProfileStrengthReminderBlockedPath(pathname) {
  return pathname === '/profile' || pathname.startsWith('/overlay/') || isLiveBroadcastPath(pathname);
}

/** Pages where the navbar may start transparent over a hero image. */
export function isHeroNavbarPath(pathname, isDesktop = false) {
  if (isHighlightDetailsPath(pathname) && isDesktop) return false;
  return (
    pathname === '/home' ||
    pathname === '/profile' ||
    TOURNAMENT_DETAILS_PATH.test(pathname) ||
    HIGHLIGHT_DETAILS_PATH.test(pathname) ||
    SCORING_MATCH_PATH.test(pathname) ||
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
