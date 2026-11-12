import { useLayoutEffect, useState } from 'react';

import {
  getYoutubeStreamPlayerReadyState,
  onYoutubeStreamPlayerError,
  onYoutubeStreamPlayerPlaying,
  onYoutubeStreamPlayerReady,
} from '@/shared/native/youtubeStreamOverlay';

/** Keep the connecting overlay through typical YouTube glass-to-glass delay. */
const LOAD_TIMEOUT_MS = 45_000;

type ListenerHandle = { remove: () => void | Promise<void> };

/**
 * Cap loader for the iOS native overlay.
 * Resets on `layoutKey` (portrait ↔ Full) so a fast embed reload cannot leave the banner stuck.
 * Clears on ready or playing; polls ready after attach to catch events that already fired.
 */
export function useIosYoutubePlayback(
  src: string | null | undefined,
  { sessionKey = 0, layoutKey = 'portrait' }: { sessionKey?: number; layoutKey?: string } = {}
): { isLoading: boolean; showRetry: boolean } {
  const resetKey = `${src ?? ''}::${sessionKey}::${layoutKey}`;
  const [seenKey, setSeenKey] = useState(resetKey);
  const [isLoading, setIsLoading] = useState(() => Boolean(src));
  const [showRetry, setShowRetry] = useState(false);

  if (seenKey !== resetKey) {
    setSeenKey(resetKey);
    setIsLoading(Boolean(src));
    setShowRetry(false);
  }

  useLayoutEffect(() => {
    if (!src) return undefined;

    let cancelled = false;
    const handles: ListenerHandle[] = [];

    const clearLoader = () => {
      if (cancelled) return;
      window.clearTimeout(timeoutId);
      setIsLoading(false);
      setShowRetry(false);
    };

    const fail = () => {
      if (cancelled) return;
      window.clearTimeout(timeoutId);
      setIsLoading(false);
      setShowRetry(true);
    };

    const timeoutId = window.setTimeout(fail, LOAD_TIMEOUT_MS);

    void (async () => {
      handles.push(await onYoutubeStreamPlayerReady(clearLoader));
      handles.push(await onYoutubeStreamPlayerPlaying(clearLoader));
      handles.push(await onYoutubeStreamPlayerError(fail));
      if (cancelled) return;
      if ((await getYoutubeStreamPlayerReadyState()).ready) clearLoader();
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      for (const handle of handles) void handle.remove();
    };
  }, [src, sessionKey, layoutKey]);

  return { isLoading, showRetry };
}
