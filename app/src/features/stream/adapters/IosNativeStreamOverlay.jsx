import { useCallback, useEffect, useRef } from 'react';

import {
  hideYoutubeStreamOverlay,
  showYoutubeStreamOverlay,
  updateYoutubeStreamOverlayLayout,
} from '@/native/youtubeStreamOverlay';

import { StreamVideoLoading } from '../StreamVideoLoading';

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
 * Match LandscapeRotatedStage CSS rotate(90deg): swap pre-rotation bounds and center
 * on the same screen-space box as the measured placeholder (inside the rotated stage).
 */
function buildRotatedLandscapeLayout(element) {
  const rect = element.getBoundingClientRect();

  return {
    x: rect.left + (rect.width - rect.height) / 2,
    y: rect.top + (rect.height - rect.width) / 2,
    width: rect.height,
    height: rect.width,
    rotation: 90,
  };
}

function buildOverlayPayload(element, { isLandscape, allowInteraction }) {
  const layout = isLandscape ? buildRotatedLandscapeLayout(element) : readLayoutRect(element);

  return {
    ...layout,
    userInteractionEnabled: allowInteraction,
  };
}

function scheduleLayoutSync(callback) {
  requestAnimationFrame(() => {
    requestAnimationFrame(callback);
  });
}

/**
 * iOS-only: native WKWebView overlay loads the proxy URL as a top-level document
 * (same as Mobile Safari), avoiding nested iframe playback restrictions.
 *
 * The native view sits *below* the Capacitor web layer so HTML overlays (LIVE badge,
 * viewer count, landscape toggle) remain visible on top.
 */
export function IosNativeStreamOverlay({
  src,
  className = '',
  fill = false,
  isLandscape = false,
  allowInteraction = true,
  isLoading = false,
}) {
  const boxClass = fill ? 'relative h-full w-full bg-transparent' : 'relative w-full aspect-video bg-transparent';
  const containerRef = useRef(null);
  const srcRef = useRef(null);
  const shownRef = useRef(false);
  const layoutOptionsRef = useRef({ isLandscape, allowInteraction });

  layoutOptionsRef.current = { isLandscape, allowInteraction };

  const syncLayout = useCallback(async (reload = false) => {
    const element = containerRef.current;
    if (!element || !srcRef.current) {
      return;
    }

    const payload = buildOverlayPayload(element, layoutOptionsRef.current);
    if (payload.width <= 0 || payload.height <= 0) {
      return;
    }

    if (!shownRef.current || reload) {
      shownRef.current = true;
      await showYoutubeStreamOverlay({ url: srcRef.current, ...payload, reload });
      return;
    }

    await updateYoutubeStreamOverlayLayout(payload);
  }, []);

  useEffect(() => {
    let cancelled = false;
    srcRef.current = src;
    shownRef.current = false;
    const element = containerRef.current;
    if (!element || !src) {
      return undefined;
    }

    void syncLayout(true);

    const onLayoutChange = () => {
      scheduleLayoutSync(() => {
        if (!cancelled) {
          void syncLayout(false);
        }
      });
    };

    const resizeObserver = new ResizeObserver(onLayoutChange);
    resizeObserver.observe(element);

    window.addEventListener('orientationchange', onLayoutChange);
    window.addEventListener('resize', onLayoutChange);
    window.visualViewport?.addEventListener('resize', onLayoutChange);
    window.visualViewport?.addEventListener('scroll', onLayoutChange);

    return () => {
      cancelled = true;
      shownRef.current = false;
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', onLayoutChange);
      window.removeEventListener('resize', onLayoutChange);
      window.visualViewport?.removeEventListener('resize', onLayoutChange);
      window.visualViewport?.removeEventListener('scroll', onLayoutChange);
      void hideYoutubeStreamOverlay();
    };
  }, [src, syncLayout]);

  useEffect(() => {
    if (!shownRef.current) {
      return;
    }

    scheduleLayoutSync(() => {
      void syncLayout(false);
    });
  }, [isLandscape, allowInteraction, syncLayout]);

  return (
    <div
      ref={containerRef}
      className={`${isLandscape && fill ? 'absolute inset-0' : boxClass} overflow-hidden ${isLoading ? 'bg-black' : 'bg-transparent'} ${className}`}
      aria-busy={isLoading}
    >
      <StreamVideoLoading visible={isLoading} />
    </div>
  );
}
