/**
 * Creator profile share helpers (path under /reels/u/:userId).
 */

import { buildDeepLinkPath } from '@/lib/deepLinks/deepLinkRegistry';
import { buildAppSchemeDeepLink, buildHttpsDeepLink } from '@/lib/deepLinks/deepLinkUtils';

export function buildCreatorProfilePath(userId) {
  return buildDeepLinkPath('reelCreator', { userId });
}

export function buildCreatorProfileShareUrl(userId, origin) {
  return buildHttpsDeepLink(buildCreatorProfilePath(userId), origin);
}

export function buildCreatorProfileAppSchemeUrl(userId) {
  return buildAppSchemeDeepLink(buildCreatorProfilePath(userId));
}
