const TOURNAMENT_DETAILS_PATH = /^\/upcoming-tournaments\/[^/]+$/;
const HIGHLIGHT_DETAILS_PATH = /^\/highlights\/[^/]+$/;
const LIVE_BROADCAST_PATH = /^\/live\/broadcast\/[^/]+$/;
const GO_LIVE_BROADCAST_PATH = /^\/live\/go-live\/[^/]+$/;
const ORGANIZER_SCORING_MATCH_PATH = /^\/organizer\/scoring\/match\/[^/]+$/;

export function isLiveBroadcastPath(pathname) {
  return LIVE_BROADCAST_PATH.test(pathname);
}

export function isGoLiveBroadcastPath(pathname) {
  return GO_LIVE_BROADCAST_PATH.test(pathname);
}

/** Mobile broadcaster + watch-live — full-bleed video, no bottom nav. */
export function isLiveStreamImmersivePath(pathname) {
  return isLiveBroadcastPath(pathname) || isGoLiveBroadcastPath(pathname);
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
    isLiveStreamImmersivePath(pathname)
  );
}

const AUTH_PATHS = new Set(['/login', '/register', '/otp']);

export function isAuthPath(pathname) {
  return AUTH_PATHS.has(pathname);
}

export function isSplashPath(pathname) {
  return pathname === '/';
}

/** Auth and splash — routes where app update and similar entry dialogs must not appear. */
export function isDialogReminderBlockedPath(pathname) {
  return isAuthPath(pathname) || isSplashPath(pathname);
}

/**
 * Shared routes where auto-popup entry dialogs should not interrupt the user
 * (auth/splash, OBS overlay, live broadcast, live scoring).
 */
export function isGlobalEntryDialogBlockedPath(pathname) {
  return (
    isDialogReminderBlockedPath(pathname) ||
    pathname.startsWith('/overlay/') ||
    isLiveStreamImmersivePath(pathname) ||
    ORGANIZER_SCORING_MATCH_PATH.test(pathname)
  );
}

/** Web-only download prompt — also skip OBS overlay routes. */
export function isWebDownloadAppBlockedPath(pathname) {
  return isGlobalEntryDialogBlockedPath(pathname);
}

/** Routes where the incomplete-profile reminder dialog must not appear. */
export function isProfileStrengthReminderBlockedPath(pathname) {
  return isGlobalEntryDialogBlockedPath(pathname) || pathname === '/profile';
}

const INTEREST_FORM_PATH = /^\/interest\/[^/]+$/;

export function isInterestFormPath(pathname) {
  return INTEREST_FORM_PATH.test(pathname);
}

/** Routes where the interest campaign dialog must not auto-open. */
export function isInterestCampaignDialogBlockedPath(pathname) {
  return isGlobalEntryDialogBlockedPath(pathname) || isInterestFormPath(pathname);
}

/** Pages where the navbar may start transparent over a hero image. */
export function isHeroNavbarPath(pathname, isDesktop = false) {
  if (isHighlightDetailsPath(pathname) && isDesktop) return false;
  if (isGoLiveBroadcastPath(pathname)) return false;
  return (
    pathname === '/home' ||
    pathname === '/profile' ||
    TOURNAMENT_DETAILS_PATH.test(pathname) ||
    HIGHLIGHT_DETAILS_PATH.test(pathname) ||
    isLiveBroadcastPath(pathname)
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
