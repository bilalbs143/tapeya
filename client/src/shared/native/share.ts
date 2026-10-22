/** Share façade — Capacitor Share on native, Web Share / clipboard on web. Matches legacy `app/src/lib/share.js`. */

import { Share } from '@capacitor/share';

import { buildHttpsDeepLink, normalizeAppPath } from '@/shared/lib/deepLinks';
import { isNativePlatform } from '@/shared/platform/platform';

function isShareCancellation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  if ('name' in error && (error as { name?: string }).name === 'AbortError') return true;
  const message = 'message' in error ? String((error as { message?: unknown }).message).toLowerCase() : '';
  return message.includes('cancel') || message.includes('abort') || message.includes('dismiss');
}

export async function shareLink(input: {
  title?: string | undefined;
  text?: string | undefined;
  url: string;
}): Promise<'shared' | 'copied' | 'cancelled'> {
  if (!input.url) return 'cancelled';

  try {
    if (isNativePlatform()) {
      await Share.share({
        url: input.url,
        dialogTitle: 'Share',
        ...(input.title ? { title: input.title } : {}),
        ...(input.text ? { text: input.text } : {}),
      });
      return 'shared';
    }

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      const data: ShareData = { url: input.url };
      if (input.title !== undefined) data.title = input.title;
      if (input.text !== undefined) data.text = input.text;

      const canShare =
        typeof navigator.canShare !== 'function' ||
        (() => {
          try {
            return navigator.canShare(data);
          } catch {
            return false;
          }
        })();

      if (canShare) {
        await navigator.share(data);
        return 'shared';
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(input.url);
      return 'copied';
    }
  } catch (error) {
    if (isShareCancellation(error)) return 'cancelled';
  }

  // Native/web share failed for a non-cancel reason — last-resort copy.
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(input.url);
      return 'copied';
    }
  } catch {
    /* clipboard may be blocked */
  }

  return 'cancelled';
}

/** Live watch share path — keep in sync with deep-link allowlist `/live/broadcast/:id`. */
export function buildLiveBroadcastPath(streamId: number | string): string {
  return normalizeAppPath(`/live/broadcast/${streamId}`);
}

/** Public HTTPS Universal Link for a live broadcast (never `capacitor://localhost`). */
export function buildLiveBroadcastShareUrl(streamId: number | string): string {
  return buildHttpsDeepLink(buildLiveBroadcastPath(streamId));
}
