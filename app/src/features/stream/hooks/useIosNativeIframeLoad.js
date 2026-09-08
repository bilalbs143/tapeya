import { useEffect, useState } from 'react';

import { onYoutubeStreamPlayerError, onYoutubeStreamPlayerReady } from '@/native/youtubeStreamOverlay';

/** Generic iframe embeds — reveal when native WKWebView finishes loading. */
const LOAD_TIMEOUT_MS = 20000;

/**
 * iOS native overlay for non-YouTube iframe embeds — clears on playerReady / timeout, not PLAYING.
 *
 * @param {string|null|undefined} src
 * @param {number} sessionKey
 */
export function useIosNativeIframeLoad(src, sessionKey = 0) {
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

    const markReady = () => {
      if (cancelled) {
        return;
      }
      window.clearTimeout(loadTimeoutId);
      setIsLoading(false);
      setShowRetry(false);
    };

    const markFailed = () => {
      if (cancelled) {
        return;
      }
      window.clearTimeout(loadTimeoutId);
      setIsLoading(false);
      setShowRetry(true);
    };

    const loadTimeoutId = window.setTimeout(() => markReady(), LOAD_TIMEOUT_MS);

    const readyListener = onYoutubeStreamPlayerReady(() => markReady());
    const errorListener = onYoutubeStreamPlayerError(() => markFailed());

    return () => {
      cancelled = true;
      window.clearTimeout(loadTimeoutId);
      readyListener.remove();
      errorListener.remove();
    };
  }, [src, sessionKey]);

  return { isLoading, showRetry };
}
