import { useCallback, useEffect, useRef } from 'react';

import {
  hideYoutubeStreamOverlay,
  showYoutubeStreamOverlay,
  updateYoutubeStreamOverlayLayout,
} from '@/native/youtubeStreamOverlay';

import { StreamVideoLoading } from '../StreamVideoLoading';

function readViewportMetrics() {
  const viewport = window.visualViewport;

  return {
    width: viewport?.width ?? window.innerWidth,
    height: viewport?.height ?? window.innerHeight,
    offsetLeft: viewport?.offsetLeft ?? 0,
    offsetTop: viewport?.offsetTop ?? 0,
  };
}

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
 * Match LandscapeRotatedStage: a (vh × vw) box centered on the viewport, rotated 90°
 * clockwise in CSS. Native WKWebView uses swapped bounds + UIKit rotation (sign differs
 * from CSS degrees because Y-axis points down).
 */
function buildRotatedLandscapeLayout(viewport = readViewportMetrics()) {
  const { width, height, offsetLeft, offsetTop } = viewport;
  const layoutWidth = height;
  const layoutHeight = width;

  return {
    x: offsetLeft + (width - layoutWidth) / 2,
    y: offsetTop + (height - layoutHeight) / 2,
    width: layoutWidth,
    height: layoutHeight,
    rotation: 90,
  };
}

function buildOverlayPayload(element, { isLandscape, allowInteraction }) {
  const layout = isLandscape ? buildRotatedLandscapeLayout() : readLayoutRect(element);

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
 */
export function IosNativeStreamOverlay({
  src,
  className = '',
  fill = false,
  isLandscape = false,
  allowInteraction = true,
  isLoading = false,
}) {
  const boxClass = fill ? 'relative h-full w-full bg-black' : 'relative w-full aspect-video bg-black';
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
      className={`${isLandscape && fill ? 'absolute inset-0' : boxClass} overflow-hidden ${className} bg-black`}
      aria-busy={isLoading}
    >
      <StreamVideoLoading visible={isLoading} />
    </div>
  );
}
