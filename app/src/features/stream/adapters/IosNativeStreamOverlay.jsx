import { useCallback, useEffect, useRef, useState } from 'react';

import { withIosNativeEmbedParams } from '@/lib/utils/liveStreamUtils';
import {
  hideYoutubeStreamOverlay,
  showYoutubeStreamOverlay,
  updateYoutubeStreamOverlayLayout,
} from '@/native/youtubeStreamOverlay';

import { useIosNativePlayback } from '../hooks/useIosNativePlayback';
import { buildNativeOverlayLayout, buildNativeStackLayout } from '../ios/iosNativeStreamLayout';
import { StreamVideoLoading } from '../StreamVideoLoading';
import { StreamVideoRetry } from '../StreamVideoRetry';

function afterLayout(callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

function hasValidPortraitFrame(layout) {
  return layout.width > 0 && layout.height > 0;
}

/**
 * iOS YouTube player — native WKWebView + embed proxy.
 * Portrait: sized to the placeholder. Landscape: immersive fullscreen.
 *
 * @param {boolean} [showControls] — Embed URL chrome (`controls=1`). Only useful when interactive.
 * @param {boolean} [interactive] — When true, native sits above Capacitor and receives touches
 *   (covers React chrome). Live + highlights keep false (underlay) so rotate/badges stay tappable.
 */
export function IosNativeStreamOverlay({
  src,
  className = '',
  fill = false,
  isLandscape = false,
  posterUrl = null,
  showControls = false,
  interactive = showControls,
}) {
  const containerRef = useRef(null);
  const proxyUrlRef = useRef(src);
  const stackRef = useRef(null);
  const shownRef = useRef(false);
  const isLandscapeRef = useRef(isLandscape);
  const interactiveRef = useRef(interactive);
  const showControlsRef = useRef(showControls);
  const [sessionKey, setSessionKey] = useState(0);
  const { isLoading, showRetry } = useIosNativePlayback(src, sessionKey);

  isLandscapeRef.current = isLandscape;
  interactiveRef.current = interactive;
  showControlsRef.current = showControls;
  proxyUrlRef.current = src;

  const retryPlayback = useCallback(() => {
    setSessionKey((key) => key + 1);
  }, []);

  const syncLayout = useCallback(async (reload = false) => {
    const element = containerRef.current;
    const baseUrl = proxyUrlRef.current;
    if (!element || !baseUrl) {
      return;
    }

    const landscape = isLandscapeRef.current;
    const canInteract = interactiveRef.current;
    const layout = buildNativeOverlayLayout(element, { isLandscape: landscape, interactive: canInteract });
    const embedUrl = withIosNativeEmbedParams(baseUrl, {
      landscape,
      showControls: showControlsRef.current,
    });
    const stack = landscape ? 'landscape' : 'portrait';
    const stackChanged = stackRef.current !== null && stackRef.current !== stack;
    const hasFrame = layout.immersiveFullscreen || hasValidPortraitFrame(layout);

    if (!hasFrame) {
      if (stackChanged && shownRef.current) {
        stackRef.current = stack;
        await updateYoutubeStreamOverlayLayout({
          ...buildNativeStackLayout(landscape, { interactive: canInteract }),
          url: embedUrl,
          updateFrame: false,
        });
      }
      return;
    }

    stackRef.current = stack;

    const payload = {
      ...layout,
      url: embedUrl,
      updateFrame: true,
    };

    const needsShow = !shownRef.current || reload || stackChanged;
    if (needsShow) {
      shownRef.current = true;
      await showYoutubeStreamOverlay({ ...payload, reload: true });
      return;
    }

    await updateYoutubeStreamOverlayLayout(payload);
  }, []);

  useEffect(() => {
    let cancelled = false;
    shownRef.current = false;
    stackRef.current = null;

    const element = containerRef.current;
    if (!element || !src) {
      return undefined;
    }

    afterLayout(() => {
      if (!cancelled) {
        void syncLayout(true);
      }
    });

    const onViewportChange = () => {
      afterLayout(() => {
        if (!cancelled) {
          void syncLayout(false);
        }
      });
    };

    const resizeObserver = new ResizeObserver(onViewportChange);
    resizeObserver.observe(element);
    window.addEventListener('resize', onViewportChange);
    window.visualViewport?.addEventListener('resize', onViewportChange);

    return () => {
      cancelled = true;
      shownRef.current = false;
      stackRef.current = null;
      resizeObserver.disconnect();
      window.removeEventListener('resize', onViewportChange);
      window.visualViewport?.removeEventListener('resize', onViewportChange);
      void hideYoutubeStreamOverlay();
    };
  }, [src, sessionKey, syncLayout]);

  useEffect(() => {
    if (!shownRef.current) {
      return undefined;
    }

    // Interactive flips z-order (under/over Capacitor) — full show reload is more reliable than updateLayout.
    afterLayout(() => {
      void syncLayout(true);
    });
  }, [isLandscape, interactive, showControls, syncLayout]);

  const layoutClass = fill ? 'absolute inset-0' : 'relative w-full aspect-video';

  return (
    <div
      ref={containerRef}
      className={`${layoutClass} overflow-hidden bg-transparent ${interactive ? 'pointer-events-none' : ''} ${className}`}
      aria-busy={isLoading}
    >
      <StreamVideoLoading visible={isLoading} posterUrl={posterUrl} />
      <StreamVideoRetry visible={showRetry} onRetry={retryPlayback} />
    </div>
  );
}
