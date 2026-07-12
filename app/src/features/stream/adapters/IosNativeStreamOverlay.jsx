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
 * iOS YouTube player — native WKWebView under Capacitor + embed proxy.
 * Portrait: sized to the placeholder. Landscape: immersive fullscreen.
 */
export function IosNativeStreamOverlay({ src, className = '', fill = false, isLandscape = false, posterUrl = null }) {
  const containerRef = useRef(null);
  const proxyUrlRef = useRef(src);
  const stackRef = useRef(null);
  const shownRef = useRef(false);
  const isLandscapeRef = useRef(isLandscape);
  const [sessionKey, setSessionKey] = useState(0);
  const { isLoading, showRetry } = useIosNativePlayback(src, sessionKey);

  isLandscapeRef.current = isLandscape;
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
    const layout = buildNativeOverlayLayout(element, { isLandscape: landscape });
    const embedUrl = withIosNativeEmbedParams(baseUrl, { landscape });
    const stack = landscape ? 'landscape' : 'portrait';
    const stackChanged = stackRef.current !== null && stackRef.current !== stack;
    const hasFrame = layout.immersiveFullscreen || hasValidPortraitFrame(layout);

    if (!hasFrame) {
      if (stackChanged && shownRef.current) {
        stackRef.current = stack;
        await updateYoutubeStreamOverlayLayout({
          ...buildNativeStackLayout(landscape),
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

    afterLayout(() => {
      void syncLayout(false);
    });
  }, [isLandscape, syncLayout]);

  const layoutClass = fill ? 'absolute inset-0' : 'relative w-full aspect-video';

  return (
    <div ref={containerRef} className={`${layoutClass} overflow-hidden bg-transparent ${className}`} aria-busy={isLoading}>
      <StreamVideoLoading visible={isLoading} posterUrl={posterUrl} />
      <StreamVideoRetry visible={showRetry} onRetry={retryPlayback} />
    </div>
  );
}
