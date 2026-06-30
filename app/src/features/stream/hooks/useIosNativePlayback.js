import { useEffect, useState } from 'react';

import {
  getYoutubeStreamPlayerReadyState,
  onYoutubeStreamPlayerError,
  onYoutubeStreamPlayerPlaying,
  onYoutubeStreamPlayerReady,
} from '@/native/youtubeStreamOverlay';

const LOAD_TIMEOUT_MS = 15000;
const LOADER_RELEASE_MS = 200;
const PLAYBACK_CONFIRM_MS = 6000;
const READY_STATE_DEFER_MS = 150;

/**
 * iOS native stream — loader, playback confirmation, and retry.
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
    let releaseTimeoutId = null;
    let confirmTimeoutId = null;

    const clearConfirmTimer = () => {
      if (confirmTimeoutId !== null) {
        window.clearTimeout(confirmTimeoutId);
        confirmTimeoutId = null;
      }
    };

    const markFailed = () => {
      if (cancelled) {
        return;
      }
      clearConfirmTimer();
      setIsLoading(false);
      setShowRetry(true);
    };

    const markPlaying = () => {
      if (cancelled) {
        return;
      }
      clearConfirmTimer();
      setIsLoading(false);
      setShowRetry(false);
    };

    const markReady = () => {
      if (cancelled) {
        return;
      }
      window.clearTimeout(loadTimeoutId);
      if (releaseTimeoutId !== null) {
        window.clearTimeout(releaseTimeoutId);
      }
      releaseTimeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        setIsLoading(false);
        clearConfirmTimer();
        confirmTimeoutId = window.setTimeout(markFailed, PLAYBACK_CONFIRM_MS);
      }, LOADER_RELEASE_MS);
    };

    const loadTimeoutId = window.setTimeout(markFailed, LOAD_TIMEOUT_MS);

    const readyListener = onYoutubeStreamPlayerReady(markReady);
    const playingListener = onYoutubeStreamPlayerPlaying(markPlaying);
    const errorListener = onYoutubeStreamPlayerError(markFailed);

    const readyCheckId = window.setTimeout(() => {
      void getYoutubeStreamPlayerReadyState().then(({ ready }) => {
        if (ready) {
          markReady();
        }
      });
    }, READY_STATE_DEFER_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(loadTimeoutId);
      if (releaseTimeoutId !== null) {
        window.clearTimeout(releaseTimeoutId);
      }
      clearConfirmTimer();
      window.clearTimeout(readyCheckId);
      readyListener.remove();
      playingListener.remove();
      errorListener.remove();
    };
  }, [src, sessionKey]);

  return { isLoading, showRetry };
}
