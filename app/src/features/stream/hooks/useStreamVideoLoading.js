import { useEffect, useState } from 'react';

import { Capacitor } from '@capacitor/core';

import { getYoutubeStreamPlayerReadyState, onYoutubeStreamPlayerReady } from '@/native/youtubeStreamOverlay';

const READY_MESSAGE_TYPE = 'tapeya-youtube-ready';
const LOAD_TIMEOUT_MS = 15000;

/**
 * Tracks whether the embed proxy / YouTube player is still initialising.
 *
 * @param {string|null|undefined} src
 * @param {{ usesNativeOverlay?: boolean }} [options]
 */
export function useStreamVideoLoading(src, { usesNativeOverlay = false } = {}) {
  const [isLoading, setIsLoading] = useState(Boolean(src));

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    let cancelled = false;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    }, LOAD_TIMEOUT_MS);

    const markReady = () => {
      if (!cancelled) {
        setIsLoading(false);
      }
    };

    if (usesNativeOverlay && Capacitor.getPlatform() === 'ios') {
      const listener = onYoutubeStreamPlayerReady(markReady);
      void getYoutubeStreamPlayerReadyState().then(({ ready }) => {
        if (ready) {
          markReady();
        }
      });

      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
        listener.remove();
      };
    }

    function onMessage(event) {
      if (event.data?.type === READY_MESSAGE_TYPE) {
        markReady();
      }
    }

    window.addEventListener('message', onMessage);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener('message', onMessage);
    };
  }, [src, usesNativeOverlay]);

  return isLoading;
}
