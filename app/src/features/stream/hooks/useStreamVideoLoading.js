import { useCallback, useEffect, useRef, useState } from 'react';

import { Capacitor } from '@capacitor/core';

import { getYoutubeStreamPlayerReadyState, onYoutubeStreamPlayerReady } from '@/native/youtubeStreamOverlay';

const READY_MESSAGE_TYPE = 'tapeya-youtube-ready';
const LOAD_TIMEOUT_MS = 15000;
/** Brief hold after native playerReady so WKWebView paints before the loader fades. */
const IOS_LOADER_RELEASE_MS = 120;
const IOS_READY_STATE_DEFER_MS = 150;

/**
 * Tracks whether the YouTube player is still initialising.
 *
 * Native iOS overlay: a real "playerReady" signal comes from the embed proxy via the
 * native bridge (see YoutubeStreamOverlayPlugin), so it clears as soon as YouTube is
 * actually rendering.
 *
 * Plain iframe (web/Android): direct YouTube embeds never call back into this origin,
 * so there is no genuine "ready" event — `markReady` (wired to the iframe's `onLoad`) is
 * the closest available signal. The 15s timer is a safety net either way.
 *
 * @param {string|null|undefined} src
 * @param {{ usesNativeOverlay?: boolean }} [options]
 * @returns {[boolean, () => void]} `[isLoading, markReady]`
 */
export function useStreamVideoLoading(src, { usesNativeOverlay = false } = {}) {
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const markReadyRef = useRef(() => {});

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    let cancelled = false;
    let releaseTimeoutId = null;
    const timeoutId = window.setTimeout(() => {
      if (!cancelled) {
        setIsLoading(false);
      }
    }, LOAD_TIMEOUT_MS);

    const markReady = () => {
      if (cancelled) {
        return;
      }
      window.clearTimeout(timeoutId);

      const releaseLoader = () => {
        if (!cancelled) {
          setIsLoading(false);
        }
      };

      if (usesNativeOverlay && Capacitor.getPlatform() === 'ios') {
        if (releaseTimeoutId !== null) {
          window.clearTimeout(releaseTimeoutId);
        }
        releaseTimeoutId = window.setTimeout(releaseLoader, IOS_LOADER_RELEASE_MS);
        return;
      }

      releaseLoader();
    };
    markReadyRef.current = markReady;

    if (usesNativeOverlay && Capacitor.getPlatform() === 'ios') {
      const listener = onYoutubeStreamPlayerReady(markReady);
      const readyCheckId = window.setTimeout(() => {
        void getYoutubeStreamPlayerReadyState().then(({ ready }) => {
          if (ready) {
            markReady();
          }
        });
      }, IOS_READY_STATE_DEFER_MS);

      return () => {
        cancelled = true;
        window.clearTimeout(timeoutId);
        window.clearTimeout(readyCheckId);
        if (releaseTimeoutId !== null) {
          window.clearTimeout(releaseTimeoutId);
        }
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

  const markReady = useCallback(() => markReadyRef.current(), []);

  return [isLoading, markReady];
}
