import { useCallback, useLayoutEffect, useRef, useState } from 'react';

const READY_MESSAGE_TYPE = 'tapeya-youtube-ready';
const PLAYING_MESSAGE_TYPE = 'tapeya-youtube-playing';
const ERROR_MESSAGE_TYPE = 'tapeya-youtube-error';
/** YouTube glass-to-glass is often ~15–30s — keep the connecting overlay through that window. */
const LIVE_LOAD_TIMEOUT_MS = 45000;

/**
 * Tracks whether a stream player is still connecting.
 *
 * Proxy embeds (`waitForPlaying`): overlay stays until `tapeya-youtube-playing`.
 * On error or 45s timeout → `onError` (Try again). Direct iframe / HLS: clear on
 * `markReady` (onLoad / canPlay) or soft-clear on timeout.
 *
 * @param {string|null|undefined} src — pass null to disable (e.g. iOS native overlay owns its own loader)
 * @param {{ waitForPlaying?: boolean, sessionKey?: number, onError?: () => void }} [options]
 * @returns {[boolean, () => void]} `[isLoading, markReady]`
 */
export function useStreamVideoLoading(src, { waitForPlaying = false, sessionKey = 0, onError } = {}) {
  const [isLoading, setIsLoading] = useState(Boolean(src));
  const markReadyRef = useRef(() => {});
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // useLayoutEffect so the message listener is attached before the iframe paints/runs —
  // mid-broadcast reopen can fire PLAYING very quickly after load.
  useLayoutEffect(() => {
    if (!src) {
      setIsLoading(false);
      return undefined;
    }

    setIsLoading(true);
    let cancelled = false;

    const clearLoader = () => {
      if (cancelled) {
        return;
      }
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    };

    // Proxy path: timeout → Try again (same as iOS). Direct iframe/HLS: soft-clear only.
    const timeoutId = window.setTimeout(() => {
      if (cancelled) {
        return;
      }
      setIsLoading(false);
      if (waitForPlaying) {
        onErrorRef.current?.();
      }
    }, LIVE_LOAD_TIMEOUT_MS);

    const markReady = () => {
      if (cancelled || waitForPlaying) {
        return;
      }
      clearLoader();
    };
    markReadyRef.current = markReady;

    function onMessage(event) {
      const type = event.data?.type;
      if (type === PLAYING_MESSAGE_TYPE) {
        clearLoader();
        return;
      }
      if (type === ERROR_MESSAGE_TYPE) {
        clearLoader();
        onErrorRef.current?.();
        return;
      }
      if (type === READY_MESSAGE_TYPE) {
        markReady();
      }
    }

    window.addEventListener('message', onMessage);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.removeEventListener('message', onMessage);
    };
  }, [src, waitForPlaying, sessionKey]);

  const markReady = useCallback(() => markReadyRef.current(), []);

  return [isLoading, markReady];
}
