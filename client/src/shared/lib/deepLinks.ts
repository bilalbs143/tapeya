/** Deep-link normalize, legacy rewrite, and allowlist for push/inbox/appUrlOpen. */

import { env } from '@/shared/config/env';

export const APP_URL_SCHEME = 'tapeya';

/** Keep in sync with `APP_PATHS.entertainment` — avoid a paths import cycle here. */
const ENTERTAINMENT_HUB = '/entertainment';

/** Strip trailing slashes (except root) and ensure a leading slash. */
export function normalizeAppPath(path: string): string {
  if (!path) return '/';
  const withSlash = path.startsWith('/') ? path : `/${path}`;
  if (withSlash === '/') return '/';
  return withSlash.replace(/\/+$/, '');
}

/**
 * Public website origin for shareable HTTPS links.
 * Prefer `VITE_APP_URL` — on Capacitor, `window.location.origin` is `capacitor://localhost`.
 */
export function getPublicAppOrigin(): string {
  const fromEnv = env.VITE_APP_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  if (typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null') {
    const { origin } = window.location;
    if (!origin.startsWith('capacitor://')) return origin;
  }

  return '';
}

/** HTTPS share / Universal Link for an in-app path (e.g. `/live/broadcast/12`). */
export function buildHttpsDeepLink(path: string, origin: string = getPublicAppOrigin()): string {
  return `${origin.replace(/\/$/, '')}${normalizeAppPath(path)}`;
}

/** Legacy share URLs → current routes before allowlist checks. */
export function rewriteLegacyAppPath(path: string): string {
  let next = normalizeAppPath(path);

  if (next === '/serials' || next.startsWith('/serials/')) {
    next = next.replace(/^\/serials(?=\/|$)/, '/entertainment');
  }

  if (next === '/live/streaming' || next.startsWith('/live/streaming/')) {
    next = ENTERTAINMENT_HUB;
  }

  const scorecardMatch = next.match(/^\/scorecard\/match\/(\d+)$/);
  if (scorecardMatch?.[1]) {
    next = `/match/${scorecardMatch[1]}`;
  }

  const reelCreator = next.match(/^\/reels\/u\/([^/]+)$/);
  if (reelCreator?.[1]) {
    next = `/users/${reelCreator[1]}`;
  }

  if (next === '/notification-center') {
    next = '/notifications';
  }

  if (next === '/home') {
    next = '/';
  }

  return next;
}

const SHAREABLE_PATHS: RegExp[] = [
  /^\/feed\/\d+$/,
  /^\/reels\/\d+$/,
  /^\/live\/go-live\/[^/]+$/,
  /^\/live\/broadcast\/[^/]+$/,
  /^\/match\/\d+$/,
  /^\/entertainment$/,
  /^\/entertainment\/\d+$/,
  /^\/entertainment\/\d+\/e\/\d+$/,
  /^\/users\/[^/]+$/,
];

const NOTIFICATION_EXTRA_PATHS: RegExp[] = [/^\/shop\/orders\/\d+$/, /^\/seller\/orders\/\d+$/];

export function isShareableDeepLinkPath(path: string): boolean {
  const normalized = rewriteLegacyAppPath(path);
  return SHAREABLE_PATHS.some((pattern) => pattern.test(normalized));
}

/** Paths safe to open from push / notification taps (shareable + a few authenticated screens). */
export function isSafeNotificationNavigatePath(path: string): boolean {
  const normalized = rewriteLegacyAppPath(path);
  if (isShareableDeepLinkPath(normalized)) return true;
  if (normalized === '/notifications' || normalized === '/') return true;
  return NOTIFICATION_EXTRA_PATHS.some((pattern) => pattern.test(normalized));
}

/** Notification inbox href — allowlisted only; excludes self-link to `/notifications`. */
export function resolveNotificationHref(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const path = rewriteLegacyAppPath(raw);
  if (path === '/notifications') return null;
  if (isShareableDeepLinkPath(path) || NOTIFICATION_EXTRA_PATHS.some((pattern) => pattern.test(path))) {
    return path;
  }
  return null;
}

/** Parse https or `tapeya://` into an allowlisted path, or null. */
export function pathFromDeepLinkUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;

  try {
    const parsed = new URL(url);
    const scheme = parsed.protocol.replace(/:$/, '').toLowerCase();
    let path: string | null = null;

    if (scheme === 'http' || scheme === 'https') {
      path = rewriteLegacyAppPath(parsed.pathname);
    } else if (scheme === APP_URL_SCHEME) {
      path = rewriteLegacyAppPath(`/${parsed.hostname}${parsed.pathname}`);
    } else {
      return null;
    }

    return isShareableDeepLinkPath(path) || isSafeNotificationNavigatePath(path) ? path : null;
  } catch {
    return null;
  }
}

export function dispatchDeepLinkNavigation(
  navigate: (to: string, opts?: { replace?: boolean }) => void,
  path: string | null,
  { currentPath }: { currentPath: string }
): void {
  if (!path) return;
  const next = rewriteLegacyAppPath(path);
  if (!isSafeNotificationNavigatePath(next)) return;
  if (normalizeAppPath(currentPath) === next) return;
  navigate(next, { replace: true });
}
