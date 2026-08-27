import { useCallback, useEffect, useRef, useState } from 'react';

import { withIosNativeEmbedParams } from '@/lib/utils/liveStreamUtils';
import { streamDebugLog } from '@/lib/utils/streamDebugLog';
import {
  hideYoutubeStreamOverlay,
  showYoutubeStreamOverlay,
  updateYoutubeStreamOverlayLayout,
} from '@/native/youtubeStreamOverlay';

import { useIosNativeIframeLoad } from '../hooks/useIosNativeIframeLoad';
import { useIosNativePlayback } from '../hooks/useIosNativePlayback';
import { buildNativeOverlayLayout, buildNativeStackLayout } from '../ios/iosNativeStreamLayout';
import { shouldShowStreamDebugOverlay, STREAM_DEBUG_PANEL_PX } from '../StreamDebugOverlay';
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

function applyDebugTopInset(layout, skipInset = false) {
  if (skipInset || !shouldShowStreamDebugOverlay() || layout.immersiveFullscreen) {
    return layout;
  }
  const inset = STREAM_DEBUG_PANEL_PX;
  if (layout.height <= inset + 80) {
    return layout;
  }
  return {
    ...layout,
    y: layout.y + inset,
    height: layout.height - inset,
  };
}

/**
 * iOS YouTube player — native WKWebView + embed proxy.
 * Portrait: sized to the placeholder. Landscape: immersive fullscreen.
 *
 * @param {boolean} [showControls] — Embed URL chrome (`controls=1`). Only useful when interactive.
 * @param {boolean} [interactive] — When true, native sits above Capacitor and receives touches
 *   (covers React chrome). Live + highlights keep false (underlay) so rotate/badges stay tappable.
 * @param {boolean} [waitForPlaying] — YouTube proxy waits for PLAYING; generic iframes reveal on load.
 */
export function IosNativeStreamOverlay({
  src,
  className = '',
  fill = false,
  isLandscape = false,
  posterUrl = null,
  showControls = false,
  interactive = showControls,
  waitForPlaying = true,
}) {
  const containerRef = useRef(null);
  const proxyUrlRef = useRef(src);
  const stackRef = useRef(null);
  const shownRef = useRef(false);
  const isLandscapeRef = useRef(isLandscape);
  const interactiveRef = useRef(interactive);
  const showControlsRef = useRef(showControls);
  const waitForPlayingRef = useRef(waitForPlaying);
  const [sessionKey, setSessionKey] = useState(0);
  const youtubePlayback = useIosNativePlayback(waitForPlaying ? src : null, sessionKey);
  const iframeLoad = useIosNativeIframeLoad(waitForPlaying ? null : src, sessionKey);
  const { isLoading, showRetry } = waitForPlaying ? youtubePlayback : iframeLoad;

  isLandscapeRef.current = isLandscape;
  interactiveRef.current = interactive;
  showControlsRef.current = showControls;
  waitForPlayingRef.current = waitForPlaying;
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
    const layout = applyDebugTopInset(
      buildNativeOverlayLayout(element, { isLandscape: landscape, interactive: canInteract }),
      !canInteract,
    );
    const embedUrl = waitForPlayingRef.current
      ? withIosNativeEmbedParams(baseUrl, {
          landscape,
          showControls: showControlsRef.current,
        })
      : baseUrl;
    const stack = landscape ? 'landscape' : 'portrait';
    const stackChanged = stackRef.current !== null && stackRef.current !== stack;
    const hasFrame = layout.immersiveFullscreen || hasValidPortraitFrame(layout);

    if (!hasFrame) {
      streamDebugLog('IosNativeOverlay.skipFrame', { layout, stack, stackChanged, shown: shownRef.current });
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
    streamDebugLog('IosNativeOverlay.syncLayout', {
      embedUrl,
      payload,
      needsShow,
      reload,
      stackChanged,
      waitForPlaying: waitForPlayingRef.current,
    });
    if (needsShow) {
      shownRef.current = true;
      const result = await showYoutubeStreamOverlay({ ...payload, reload: true });
      streamDebugLog('IosNativeOverlay.show', result);
      return;
    }

    const updateResult = await updateYoutubeStreamOverlayLayout(payload);
    streamDebugLog('IosNativeOverlay.update', updateResult);
  }, []);

  useEffect(() => {
    streamDebugLog('IosNativeOverlay.mount', { src, interactive, waitForPlaying, isLandscape, fill });

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

    // Retry only when the first show never got a valid frame — avoid reload cancelling embed load.
    const retryId = window.setTimeout(() => {
      if (!cancelled && !shownRef.current) {
        streamDebugLog('IosNativeOverlay.layoutRetry', { src });
        void syncLayout(true);
      }
    }, 400);

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
      window.clearTimeout(retryId);
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
