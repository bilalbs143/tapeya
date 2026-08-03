/**
 * Share links + native/web share sheet.
 * Paths live next to URL builders so call sites stay thin.
 */

import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';

import { buildDeepLinkPath } from '@/lib/deepLinks/deepLinkRegistry';
import { buildHttpsDeepLink } from '@/lib/deepLinks/deepLinkUtils';

function isShareCancellation(error) {
  if (!error || typeof error !== 'object') return false;
  if ('name' in error && error.name === 'AbortError') return true;
  const message = 'message' in error ? String(error.message).toLowerCase() : '';
  return message.includes('cancel') || message.includes('abort') || message.includes('dismiss');
}

/**
 * Open the system share sheet (native Capacitor / Web Share) or copy the URL.
 * @returns {Promise<'system_share'|'copy_link'|null>} null when cancelled / unavailable
 */
export async function shareLink({ url, title, text } = {}) {
  if (!url) return null;

  try {
    if (Capacitor.isNativePlatform()) {
      await Share.share({
        url,
        dialogTitle: 'Share',
        ...(title ? { title } : {}),
        ...(text ? { text } : {}),
      });
      return 'system_share';
    }

    if (typeof navigator?.share === 'function') {
      await navigator.share({
        url,
        ...(title ? { title } : {}),
        ...(text ? { text } : {}),
      });
      return 'system_share';
    }

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return 'copy_link';
    }
  } catch (error) {
    if (isShareCancellation(error)) return null;
  }

  return null;
}

/** @param {{ id?: string|number, type?: string }|null|undefined} post */
export function buildPostDetailPath(post) {
  if (!post?.id) return '/';
  if (post.type === 'video') return `/reels/${post.id}`;
  return `/feed/${post.id}`;
}

/** @param {{ id?: string|number, type?: string }|null|undefined} post */
export function buildPostShareUrl(post) {
  return buildHttpsDeepLink(buildPostDetailPath(post));
}

export function buildReelSharePath(reelId) {
  return buildDeepLinkPath('reel', { reelId });
}

export function buildReelShareUrl(reelId) {
  return buildHttpsDeepLink(buildReelSharePath(reelId));
}

export function buildCreatorProfilePath(userId) {
  return buildDeepLinkPath('reelCreator', { userId });
}

export function buildCreatorProfileShareUrl(userId) {
  return buildHttpsDeepLink(buildCreatorProfilePath(userId));
}

export function buildHighlightShareUrl(highlightId) {
  return buildHttpsDeepLink(`/highlights/${highlightId}`);
}

export function buildTournamentShareUrl(tournamentId) {
  return buildHttpsDeepLink(`/upcoming-tournaments/${tournamentId}`);
}
