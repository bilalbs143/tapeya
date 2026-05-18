const TOURNAMENT_DETAILS_PATH = /^\/upcoming-tournaments\/[^/]+$/;
const SCORING_MATCH_PATH = /^\/organizer\/scoring\/match\/[^/]+$/;

/** Pages whose main content starts at the viewport top (hero sits behind the fixed navbar). */
export function isNavbarOverlayPath(pathname) {
  return pathname === '/profile' || TOURNAMENT_DETAILS_PATH.test(pathname) || SCORING_MATCH_PATH.test(pathname);
}

/** Pages where the navbar may start transparent over a hero image. */
export function isHeroNavbarPath(pathname) {
  return (
    pathname === '/home' ||
    pathname === '/profile' ||
    TOURNAMENT_DETAILS_PATH.test(pathname) ||
    SCORING_MATCH_PATH.test(pathname)
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
