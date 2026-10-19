/**
 * Registry of in-app paths that may be opened via HTTPS Universal/App Links
 * or the `tapeya://` custom scheme.
 *
 * Add a row here when shipping a new shareable / deep-linkable screen.
 */

export const APP_URL_SCHEME = 'tapeya';

/**
 * @typedef {{
 *   id: string,
 *   pattern: RegExp,
 *   build: (params: Record<string, string | number>) => string,
 * }} DeepLinkRoute
 */

/** @type {DeepLinkRoute[]} */
export const DEEP_LINK_ROUTES = [
  {
    id: 'post',
    pattern: /^\/feed\/\d+$/,
    build: ({ postId }) => `/feed/${postId}`,
  },
  {
    id: 'reel',
    pattern: /^\/reels\/\d+$/,
    build: ({ reelId }) => `/reels/${reelId}`,
  },
  {
    id: 'reelCreator',
    pattern: /^\/reels\/u\/\d+$/,
    build: ({ userId }) => `/reels/u/${userId}`,
  },
  {
    id: 'liveGoLive',
    pattern: /^\/live\/go-live\/[^/]+$/,
    build: ({ streamId }) => `/live/go-live/${streamId}`,
  },
  {
    id: 'liveBroadcast',
    pattern: /^\/live\/broadcast\/[^/]+$/,
    build: ({ streamId }) => `/live/broadcast/${streamId}`,
  },
  {
    id: 'quickMatchScorecard',
    pattern: /^\/scorecard\/match\/\d+$/,
    build: ({ matchId }) => `/scorecard/match/${matchId}`,
  },
  {
    id: 'entertainment',
    pattern: /^\/entertainment\/\d+$/,
    build: ({ entertainmentId }) => `/entertainment/${entertainmentId}`,
  },
  {
    id: 'entertainmentEpisode',
    pattern: /^\/entertainment\/\d+\/e\/\d+$/,
    build: ({ entertainmentId, episodeId }) => `/entertainment/${entertainmentId}/e/${episodeId}`,
  },
];

/**
 * Map retired `/serials` share URLs onto `/entertainment` before allowlist checks.
 * @param {string} path
 */
export function rewriteLegacyDeepLinkPath(path) {
  const normalized = normalizeAppPath(path);
  if (normalized === '/serials' || normalized.startsWith('/serials/')) {
    return normalized.replace(/^\/serials(?=\/|$)/, '/entertainment');
  }
  return normalized;
}

/**
 * @param {string} path
 */
export function isAllowedDeepLinkPath(path) {
  if (!path || typeof path !== 'string') return false;
  const normalized = rewriteLegacyDeepLinkPath(path);
  return DEEP_LINK_ROUTES.some((route) => route.pattern.test(normalized));
}

/**
 * Paths safe to open from in-app / push notification taps.
 * Includes shareable deep links plus a few authenticated app screens.
 *
 * @param {string} path
 */
export function isSafeNotificationNavigatePath(path) {
  if (!path || typeof path !== 'string') return false;
  const normalized = rewriteLegacyDeepLinkPath(path);
  if (isAllowedDeepLinkPath(normalized)) return true;
  if (normalized === '/notification-center' || normalized === '/home') return true;
  if (/^\/shop\/orders\/\d+$/.test(normalized)) return true;
  if (/^\/seller\/orders\/\d+$/.test(normalized)) return true;
  return false;
}

/**
 * @param {string} routeId
 * @param {Record<string, string | number>} params
 */
export function buildDeepLinkPath(routeId, params = {}) {
  const route = DEEP_LINK_ROUTES.find((entry) => entry.id === routeId);
  if (!route) {
    throw new Error(`Unknown deep link route: ${routeId}`);
  }
  const path = normalizeAppPath(route.build(params));
  if (!route.pattern.test(path)) {
    throw new Error(`Deep link route "${routeId}" built an invalid path: ${path}`);
  }
  return path;
}

/**
 * Strip trailing slashes (except root) and ensure a leading slash.
 * @param {string} path
 */
export function normalizeAppPath(path) {
  if (!path || typeof path !== 'string') return '/';
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  if (withSlash === '/') return '/';
  return withSlash.replace(/\/+$/, '');
}
