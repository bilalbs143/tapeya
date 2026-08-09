/**
 * Back that never lands on splash.
 * Share / cold-start stacks are often idx 0 — `navigate(-1)` no-ops or remounts splash.
 */

import { isAuthPath, isSplashPath } from '@/lib/utils/routeUtils';

export const APP_BACK_FALLBACK = '/home';

export function getHistoryIdx(historyState = typeof window !== 'undefined' ? window.history.state : null) {
  const idx = historyState?.idx;
  return Number.isFinite(idx) ? idx : 0;
}

/**
 * In-app back button.
 * @returns {{ type: 'pop' } | { type: 'replace', to: string }}
 */
export function resolveAppBackAction({ historyIdx = 0, fallback = APP_BACK_FALLBACK } = {}) {
  if (historyIdx > 0) return { type: 'pop' };
  return { type: 'replace', to: fallback || APP_BACK_FALLBACK };
}

/**
 * Android hardware back (Capacitor `backButton`). iOS has no hardware back.
 * @returns {{ type: 'close-dialog' } | { type: 'pop' } | { type: 'replace', to: string } | { type: 'exit' }}
 */
export function resolveNativeHardwareBackAction({
  pathname,
  historyIdx = 0,
  hasDialog = false,
  fallback = APP_BACK_FALLBACK,
} = {}) {
  if (hasDialog) return { type: 'close-dialog' };
  if (isSplashPath(pathname)) return { type: 'exit' };
  if (historyIdx > 0) return { type: 'pop' };
  if (isAuthPath(pathname) || pathname === fallback) return { type: 'exit' };
  if (pathname && pathname !== fallback) return { type: 'replace', to: fallback || APP_BACK_FALLBACK };
  return { type: 'exit' };
}
