import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

const READY_MESSAGE_TYPE = 'tapeya-youtube-ready';
const PLAYING_MESSAGE_TYPE = 'tapeya-youtube-playing';
const ERROR_MESSAGE_TYPE = 'tapeya-youtube-error';
/** Keep the connecting overlay through typical YouTube glass-to-glass delay. */
const LIVE_LOAD_TIMEOUT_MS = 45_000;

type UseStreamVideoLoadingOptions = {
  /** Proxy embeds: stay until `tapeya-youtube-playing` (or timeout → onError). */
  waitForPlaying?: boolean | undefined;
  sessionKey?: number | undefined;
  onError?: (() => void) | undefined;
};

/** Tracks whether a stream player is still connecting. Returns `[isLoading, markReady]`. */
export function useStreamVideoLoading(
  src: string | null | undefined,
  { waitForPlaying = false, sessionKey = 0, onError }: UseStreamVideoLoadingOptions = {}
): [boolean, () => void] {
  const resetKey = `${src ?? ''}::${sessionKey}::${waitForPlaying ? 1 : 0}`;
  const [seenKey, setSeenKey] = useState(resetKey);
  const [isLoading, setIsLoading] = useState(() => Boolean(src));

  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setIsLoading(Boolean(src));
  }

  const markReadyRef = useRef(() => {});
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useLayoutEffect(() => {
    if (!src) return undefined;

    let cancelled = false;

    const clearLoader = () => {
      if (cancelled) return;
      window.clearTimeout(timeoutId);
      setIsLoading(false);
    };

    const timeoutId = window.setTimeout(() => {
      if (cancelled) return;
      setIsLoading(false);
      if (waitForPlaying) onErrorRef.current?.();
    }, LIVE_LOAD_TIMEOUT_MS);

    const markReady = () => {
      if (cancelled || waitForPlaying) return;
      clearLoader();
    };
    markReadyRef.current = markReady;

    function onMessage(event: MessageEvent) {
      const type = (event.data as { type?: string } | null)?.type;
      if (type === PLAYING_MESSAGE_TYPE) {
        clearLoader();
        return;
      }
      if (type === ERROR_MESSAGE_TYPE) {
        clearLoader();
        onErrorRef.current?.();
        return;
      }
      if (type === READY_MESSAGE_TYPE) markReady();
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
