import { useCallback, useEffect, useRef } from 'react';

import { liveStreamDebugLog } from '@/features/stream/debug/liveStreamDebug';
import {
  hideYoutubeStreamOverlay,
  showYoutubeStreamOverlay,
  updateYoutubeStreamOverlayLayout,
} from '@/native/youtubeStreamOverlay';

function readLayoutRect(element) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * iOS-only: native WKWebView overlay loads the proxy URL as a top-level document
 * (same as Mobile Safari), avoiding nested iframe playback restrictions.
 */
export function IosNativeStreamOverlay({ src, className = '', fill = false }) {
  const boxClass = fill ? 'relative h-full w-full bg-black' : 'relative w-full aspect-video bg-black';
  const containerRef = useRef(null);
  const srcRef = useRef(null);

  const shownRef = useRef(false);

  const syncLayout = useCallback(async () => {
    const element = containerRef.current;
    if (!element || !srcRef.current) {
      return;
    }

    const layout = readLayoutRect(element);
    if (layout.width <= 0 || layout.height <= 0) {
      liveStreamDebugLog('native-overlay-layout-skip', { layout, reason: 'zero-size' });
      return;
    }

    try {
      if (!shownRef.current) {
        // First valid layout — call show (not just updateLayout) so the native
        // WebView is created with proper dimensions if mount-time rect was zero.
        shownRef.current = true;
        await showYoutubeStreamOverlay({ url: srcRef.current, ...layout, reload: false });
        liveStreamDebugLog('native-overlay-show-from-resize', { src: srcRef.current, layout });
      } else {
        await updateYoutubeStreamOverlayLayout(layout);
        liveStreamDebugLog('native-overlay-layout', { src: srcRef.current, layout });
      }
    } catch (error) {
      liveStreamDebugLog('native-overlay-layout-error', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  useEffect(() => {
    srcRef.current = src;
    shownRef.current = false;
    const element = containerRef.current;
    if (!element || !src) {
      return undefined;
    }

    const layout = readLayoutRect(element);

    void (async () => {
      try {
        const hasSize = layout.width > 0 && layout.height > 0;
        if (hasSize) {
          shownRef.current = true;
          await showYoutubeStreamOverlay({ url: src, ...layout, reload: true });
          liveStreamDebugLog('native-overlay-show', {
            src,
            layout,
            note: 'Top-level native WKWebView — same as Safari, not nested iframe.',
          });
        } else {
          // Zero-size at mount — ResizeObserver will call show once layout is stable.
          liveStreamDebugLog('native-overlay-show-deferred', { layout, reason: 'zero-size-at-mount' });
        }
      } catch (error) {
        liveStreamDebugLog('native-overlay-show-error', {
          src,
          message: error instanceof Error ? error.message : String(error),
        });
      }
    })();

    const resizeObserver = new ResizeObserver(() => {
      void syncLayout();
    });
    resizeObserver.observe(element);

    window.addEventListener('orientationchange', syncLayout);
    window.addEventListener('resize', syncLayout);

    return () => {
      shownRef.current = false;
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', syncLayout);
      window.removeEventListener('resize', syncLayout);
      void hideYoutubeStreamOverlay().then(() => {
        liveStreamDebugLog('native-overlay-hide', { src });
      });
    };
  }, [src, syncLayout]);

  return <div ref={containerRef} className={`${boxClass} ${className}`} aria-hidden="true" />;
}
