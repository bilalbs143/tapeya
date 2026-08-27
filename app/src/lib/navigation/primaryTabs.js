/**
 * Primary tab paths (bottom nav / desktop nav) and active-state rules.
 * Main profile is `/reels/u/:userId`; `/profile` is the edit/account screen.
 */

import { resolveOwnProfilePath } from '@/lib/share';
import { isReelsFeedPath } from '@/lib/utils/routeUtils';

/**
 * @param {string} pathname
 * @param {string} tabPath
 * @param {string|number|null|undefined} [userId] — signed-in user (for profile tab)
 */
export function isPrimaryTabActive(pathname, tabPath, userId) {
  if (tabPath === '/reels') {
    return isReelsFeedPath(pathname);
  }

  const ownProfilePath = resolveOwnProfilePath(userId);
  if (tabPath === ownProfilePath || tabPath === '/profile') {
    return pathname === '/profile' || pathname === ownProfilePath;
  }

  return pathname === tabPath || pathname.startsWith(`${tabPath}/`);
}
