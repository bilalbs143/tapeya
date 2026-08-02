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

/** Reels vertical feed — full-bleed video under transparent navbar. */
export function isReelsFeedPath(pathname) {
  return pathname === '/reels' || /^\/reels\/\d+$/.test(pathname);
}

/** Reel compose screens (upload flow). */
export function isReelsUploadPath(pathname) {
  return pathname === '/reels/upload' || pathname.startsWith('/reels/upload/');
}

/** Public creator profile opened from the reels action rail. */
export function isReelsCreatorProfilePath(pathname) {
  return /^\/reels\/u\/\d+$/.test(pathname);
}

/** Fixed-shell reels feed — no main bottom padding (full-bleed video). */
export function isReelsImmersivePath(pathname) {
  return isReelsFeedPath(pathname);
}

/** Mobile go-live camera, or watch-live when opted into immersive (self-serve). */
export function isLiveStreamImmersivePath(pathname) {
  return isLiveBroadcastPath(pathname) || isGoLiveBroadcastPath(pathname);
}

export function isHighlightDetailsPath(pathname) {
  return HIGHLIGHT_DETAILS_PATH.test(pathname);
}

/** Pages whose main content starts at the viewport top (hero sits behind the fixed navbar). */
export function isNavbarOverlayPath(pathname, isDesktop = false) {
  if (isHighlightDetailsPath(pathname) && isDesktop) return false;
  // Go-live camera is always overlay; watch-live padding is decided in useMainLayoutChrome
  // (self-serve immersive vs match classic) — do not force overlay for all /live/broadcast.
  return (
    pathname === '/profile' ||
    TOURNAMENT_DETAILS_PATH.test(pathname) ||
    HIGHLIGHT_DETAILS_PATH.test(pathname) ||
    isGoLiveBroadcastPath(pathname) ||
    isReelsFeedPath(pathname)
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

/**
 * Pages where the navbar may start transparent over a hero image.
 * @param {string} pathname
 * @param {boolean} [isDesktop]
 * @param {boolean} [isLiveHero] - Self-serve watch-live in hero mode (status === 'live').
 */
export function isHeroNavbarPath(pathname, isDesktop = false, isLiveHero = false) {
  if (isHighlightDetailsPath(pathname) && isDesktop) return false;
  // Go-live owns its own header — never hero-transparent.
  if (isGoLiveBroadcastPath(pathname)) return false;
  // Watch-live: solid for match streams and before/after self-serve playback; transparent
  // only while a self-serve stream is actually live (hero mode).
  if (isLiveBroadcastPath(pathname)) return isLiveHero;
  return (
    pathname === '/home' ||
    pathname === '/profile' ||
    TOURNAMENT_DETAILS_PATH.test(pathname) ||
    HIGHLIGHT_DETAILS_PATH.test(pathname) ||
    isReelsFeedPath(pathname)
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
