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

function buildOverlayPayload(element, { isLandscape, allowInteraction }) {
  return {
    ...readLayoutRect(element),
    rotation: isLandscape ? -90 : 0,
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

    const resizeObserver = new ResizeObserver(() => {
      scheduleLayoutSync(() => {
        if (!cancelled) {
          void syncLayout(false);
        }
      });
    });
    resizeObserver.observe(element);

    const onViewportChange = () => {
      scheduleLayoutSync(() => {
        if (!cancelled) {
          void syncLayout(false);
        }
      });
    };

    window.addEventListener('orientationchange', onViewportChange);
    window.addEventListener('resize', onViewportChange);

    return () => {
      cancelled = true;
      shownRef.current = false;
      resizeObserver.disconnect();
      window.removeEventListener('orientationchange', onViewportChange);
      window.removeEventListener('resize', onViewportChange);
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
    <div ref={containerRef} className={`${boxClass} ${className}`} aria-busy={isLoading}>
      {isLoading && <StreamVideoLoading />}
    </div>
  );
}
