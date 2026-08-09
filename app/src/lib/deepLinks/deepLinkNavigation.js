/**
 * Capacitor deep-link policy (iOS Universal Links + Android App Links).
 *
 * Cold start fires `getLaunchUrl` and `appUrlOpen` with the same URL. A plain
 * `navigate(path)` would stack splash + duplicates — back looks frozen.
 */

import { isSplashPath } from '@/lib/utils/routeUtils';

export const DEEP_LINK_DEDUP_MS = 1500;

/** @type {{ path: string|null, at: number }} */
let lastDeepLink = { path: null, at: 0 };

export function resetDeepLinkMemory() {
  lastDeepLink = { path: null, at: 0 };
}

/**
 * @param {object} args
 * @param {string|null|undefined} args.targetPath
 * @param {string} [args.currentPath]
 * @param {number} [args.now]
 * @param {{ path: string|null, at: number }} [args.last]
 * @returns {{ action: 'ignore' } | { action: 'navigate', path: string, replace: boolean }}
 */
export function planDeepLinkNavigation({ targetPath, currentPath = '/', now = Date.now(), last = lastDeepLink } = {}) {
  if (!targetPath || typeof targetPath !== 'string') {
    return { action: 'ignore' };
  }
  if (currentPath === targetPath) {
    return { action: 'ignore' };
  }
  if (last.path === targetPath && now - last.at < DEEP_LINK_DEDUP_MS) {
    return { action: 'ignore' };
  }

  return {
    action: 'navigate',
    path: targetPath,
    replace: isSplashPath(currentPath || '/'),
  };
}

/**
 * @param {(to: string, opts?: { replace?: boolean }) => void} navigate
 * @param {string|null|undefined} targetPath
 * @param {{ currentPath?: string, now?: number }} [options]
 * @returns {boolean}
 */
export function dispatchDeepLinkNavigation(navigate, targetPath, options = {}) {
  const plan = planDeepLinkNavigation({
    targetPath,
    currentPath: options.currentPath ?? '/',
    now: options.now,
  });
  if (plan.action !== 'navigate') return false;
  lastDeepLink = { path: plan.path, at: options.now ?? Date.now() };
  navigate(plan.path, { replace: plan.replace });
  return true;
}
