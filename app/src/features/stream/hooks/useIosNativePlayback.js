import { useEffect, useState } from 'react';

import { onYoutubeStreamPlayerError, onYoutubeStreamPlayerPlaying } from '@/native/youtubeStreamOverlay';

/** YouTube glass-to-glass window — keep connecting overlay until PLAYING or this timeout. */
const LOAD_TIMEOUT_MS = 45000;

/**
 * iOS native stream — loader stays until real PLAYING (not merely player ready).
 *
 * @param {string|null|undefined} src
 * @param {number} sessionKey — bump to force a full reload (Try again).
 */
export function useIosNativePlayback(src, sessionKey = 0) {
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      setShowRetry(false);
      return undefined;
    }

    setIsLoading(true);
    setShowRetry(false);

    let cancelled = false;

    const markFailed = () => {
      if (cancelled) {
        return;
      }
      setIsLoading(false);
      setShowRetry(true);
    };

    const markPlaying = () => {
      if (cancelled) {
        return;
      }
      window.clearTimeout(loadTimeoutId);
      setIsLoading(false);
      setShowRetry(false);
    };

    const loadTimeoutId = window.setTimeout(markFailed, LOAD_TIMEOUT_MS);

    const playingListener = onYoutubeStreamPlayerPlaying(markPlaying);
    const errorListener = onYoutubeStreamPlayerError(markFailed);

    return () => {
      cancelled = true;
      window.clearTimeout(loadTimeoutId);
      playingListener.remove();
      errorListener.remove();
    };
  }, [src, sessionKey]);

  return { isLoading, showRetry };
}
