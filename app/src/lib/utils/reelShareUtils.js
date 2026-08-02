/**
 * Reel-specific convenience wrappers around the generic deep-link helpers.
 */

import { buildDeepLinkPath } from '@/lib/deepLinks/deepLinkRegistry';
import { buildAppSchemeDeepLink, buildHttpsDeepLink } from '@/lib/deepLinks/deepLinkUtils';

export function buildReelSharePath(reelId) {
  return buildDeepLinkPath('reel', { reelId });
}

export function buildReelShareUrl(reelId, origin) {
  return buildHttpsDeepLink(buildReelSharePath(reelId), origin);
}

export function buildReelAppSchemeUrl(reelId) {
  return buildAppSchemeDeepLink(buildReelSharePath(reelId));
}
