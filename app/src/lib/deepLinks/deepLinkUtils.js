/**
 * Generic deep-link URL builders + parsers for the Tapeya consumer app.
 */

import { APP_URL_SCHEME, isAllowedDeepLinkPath, normalizeAppPath } from '@/lib/deepLinks/deepLinkRegistry';

/**
 * Public website origin for shareable HTTPS links.
 * Prefer `VITE_APP_URL` — on Capacitor, `window.location.origin` is `capacitor://localhost`.
 */
export function getPublicAppOrigin() {
  const fromEnv = import.meta.env.VITE_APP_URL?.replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }

  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    const { origin } = window.location;
    if (!origin.startsWith('capacitor://')) {
      return origin;
    }
  }

  return '';
}

/**
 * HTTPS share / Universal Link for an in-app path.
 * @param {string} path e.g. `/reels/12`
 * @param {string} [origin]
 */
export function buildHttpsDeepLink(path, origin = getPublicAppOrigin()) {
  const normalized = normalizeAppPath(path);
  return `${String(origin).replace(/\/$/, '')}${normalized}`;
}

/**
 * Custom-scheme URL used when App Links / Universal Links are not verified yet.
 * `/reels/12` → `tapeya://reels/12`
 * `/live/go-live/31` → `tapeya://live/go-live/31`
 * @param {string} path
 */
export function buildAppSchemeDeepLink(path) {
  const normalized = normalizeAppPath(path).replace(/^\//, '');
  return `${APP_URL_SCHEME}://${normalized}`;
}

/**
 * Normalize Capacitor / OS deep-link URLs into an allowed in-app path, or null.
 * Supports https(s) and the `tapeya://` scheme for any registered route.
 *
 * @param {string} url
 * @returns {string | null}
 */
export function pathFromDeepLinkUrl(url) {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(/:$/, '').toLowerCase();
    let path = null;

    if (scheme === 'http' || scheme === 'https') {
      path = normalizeAppPath(parsed.pathname);
    } else if (scheme === APP_URL_SCHEME) {
      // tapeya://reels/123 → host=reels, pathname=/123
      // tapeya://live/go-live/31 → host=live, pathname=/go-live/31
      path = normalizeAppPath(`/${parsed.hostname}${parsed.pathname}`);
    } else {
      return null;
    }

    return isAllowedDeepLinkPath(path) ? path : null;
  } catch {
    return null;
  }
}
