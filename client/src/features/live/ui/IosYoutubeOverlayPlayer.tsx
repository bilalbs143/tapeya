import { useCallback, useEffect, useRef, useState } from 'react';

import { cn } from '@/shared/lib/cn';
import { useKeepAwake } from '@/shared/native/useKeepAwake';
import {
  hideYoutubeStreamOverlay,
  showYoutubeStreamOverlay,
  updateYoutubeStreamOverlayLayout,
} from '@/shared/native/youtubeStreamOverlay';

import {
  buildNativeOverlayLayout,
  hasValidOverlayFrame,
  withIosNativeEmbedParams,
} from '../lib/iosYoutubeOverlayLayout';
import { useIosYoutubePlayback } from '../lib/useIosYoutubePlayback';
import { useIosYoutubeUnderlay } from '../lib/useIosYoutubeUnderlay';
import { StreamVideoLoading } from './StreamVideoLoading';
import { StreamVideoRetry } from './StreamVideoRetry';

type IosYoutubeOverlayPlayerProps = {
  src: string;
  posterUrl?: string | null | undefined;
  /** VOD only. Live/watch stays underlay so badges/chat/Exit stay tappable. */
  interactive?: boolean | undefined;
  /** Full — immersiveFullscreen + embed rotate/cover. */
  landscape?: boolean | undefined;
};

function afterLayout(callback: () => void) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

/** iOS native WKWebView YouTube — syncs placeholder → overlay. */
export function IosYoutubeOverlayPlayer({
  src,
  posterUrl = null,
  interactive = false,
  landscape = false,
}: IosYoutubeOverlayPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shownRef = useRef(false);
  const [sessionKey, setSessionKey] = useState(0);
  const { isLoading, showRetry } = useIosYoutubePlayback(src, {
    sessionKey,
    layoutKey: landscape ? 'landscape' : 'portrait',
  });

  useKeepAwake(true);
  useIosYoutubeUnderlay(!interactive);

  const syncLayout = useCallback(
    async (reload: boolean) => {
      const element = containerRef.current;
      if (!element || !src) return;

      const layout = buildNativeOverlayLayout(element, { isLandscape: landscape, interactive });
      if (!hasValidOverlayFrame(layout)) return;

      const url = withIosNativeEmbedParams(src, { landscape, showControls: interactive });
      const payload = { ...layout, url, updateFrame: true as const };

      if (!shownRef.current || reload) {
        shownRef.current = true;
        const result = await showYoutubeStreamOverlay({ ...payload, reload: true });
        if (!result.shown) shownRef.current = false;
        return;
      }

      await updateYoutubeStreamOverlayLayout(payload);
    },
    [src, landscape, interactive]
  );

  useEffect(() => {
    let cancelled = false;
    shownRef.current = false;

    // Interactive overlay sits above Cap — hide it so Try Again receives taps.
    if (!src || showRetry) {
      void hideYoutubeStreamOverlay();
      return () => {
        cancelled = true;
      };
    }

    const element = containerRef.current;
    if (!element) return undefined;

    afterLayout(() => {
      if (!cancelled) void syncLayout(true);
    });

    const retryId = window.setTimeout(() => {
      if (!cancelled && !shownRef.current) void syncLayout(true);
    }, 400);

    const onViewportChange = () => {
      afterLayout(() => {
        if (!cancelled) void syncLayout(false);
      });
    };

    const resizeObserver = new ResizeObserver(onViewportChange);
    resizeObserver.observe(element);
    window.addEventListener('resize', onViewportChange);
    window.visualViewport?.addEventListener('resize', onViewportChange);

    return () => {
      cancelled = true;
      window.clearTimeout(retryId);
      shownRef.current = false;
      resizeObserver.disconnect();
      window.removeEventListener('resize', onViewportChange);
      window.visualViewport?.removeEventListener('resize', onViewportChange);
      void hideYoutubeStreamOverlay();
    };
  }, [src, sessionKey, landscape, interactive, syncLayout, showRetry]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'absolute inset-0 overflow-hidden bg-transparent',
        interactive && !showRetry && 'pointer-events-none'
      )}
      aria-busy={isLoading}
    >
      <StreamVideoLoading visible={isLoading && !showRetry} posterUrl={posterUrl} />
      <StreamVideoRetry visible={showRetry} onRetry={() => setSessionKey((key) => key + 1)} />
    </div>
  );
}
