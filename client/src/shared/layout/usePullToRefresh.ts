import { type RefObject, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  canUsePullToRefresh,
  isPullArmed,
  PTR_MAX_PULL,
  PTR_REFRESH_OFFSET,
  PTR_THRESHOLD,
  resistPull,
  shouldIgnorePullTarget,
} from './pullToRefresh';
import { useSoftContentRefresh } from './softRefreshContent';

type UsePullToRefreshOptions = {
  scrollerRef: RefObject<HTMLElement | null>;
  contentRef: RefObject<HTMLElement | null>;
  enabled: boolean;
};

type PullToRefreshState = {
  pull: number;
  refreshing: boolean;
};

const DOMINANT_AXIS_PX = 8;

function clearContentTransform(content: HTMLElement | null): void {
  if (!content) return;
  content.style.transform = '';
  content.style.transition = '';
}

function disarm(armed: { current: boolean }, tracking: { current: boolean }): void {
  armed.current = false;
  tracking.current = false;
}

/**
 * Touch-only pull-to-refresh on a scroll root.
 * At top, pull past threshold → soft content refresh (invalidate + remount Outlet).
 */
export function usePullToRefresh({
  scrollerRef,
  contentRef,
  enabled,
}: UsePullToRefreshOptions): PullToRefreshState {
  const onRefresh = useSoftContentRefresh();
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const trackingRef = useRef(false);
  const armedRef = useRef(false);
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const onRefreshRef = useRef(onRefresh);
  const mountedRef = useRef(true);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Disable mid-gesture: reset during render when `enabled` flips off.
  if (!enabled && (pull !== 0 || refreshing)) {
    setPull(0);
    setRefreshing(false);
  }

  useLayoutEffect(() => {
    if (enabled) return;
    pullRef.current = 0;
    refreshingRef.current = false;
    disarm(armedRef, trackingRef);
    clearContentTransform(contentRef.current);
  }, [contentRef, enabled]);

  const applyPull = useCallback(
    (next: number, withEase: boolean) => {
      pullRef.current = next;
      setPull(next);
      const content = contentRef.current;
      if (!content) return;
      if (next <= 0 && !withEase) {
        clearContentTransform(content);
        return;
      }
      content.style.transition = withEase ? 'transform 180ms ease-out' : 'none';
      content.style.transform = next > 0 ? `translate3d(0, ${next}px, 0)` : '';
    },
    [contentRef]
  );

  const finishRefresh = useCallback(() => {
    refreshingRef.current = false;
    // Soft refresh remounts `<Outlet>` — this instance may already be gone.
    if (!mountedRef.current) return;
    setRefreshing(false);
    applyPull(0, true);
  }, [applyPull]);

  const commitRefresh = useCallback(() => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    applyPull(PTR_REFRESH_OFFSET, true);

    void (async () => {
      try {
        await onRefreshRef.current();
      } finally {
        finishRefresh();
      }
    })();
  }, [applyPull, finishRefresh]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !enabled || !canUsePullToRefresh()) return;

    const onTouchStart = (event: TouchEvent) => {
      if (refreshingRef.current || event.touches.length !== 1) return;
      if (scroller.scrollTop > 0 || shouldIgnorePullTarget(event.target, scroller)) {
        disarm(armedRef, trackingRef);
        return;
      }

      const touch = event.touches[0];
      if (!touch) return;
      startYRef.current = touch.clientY;
      startXRef.current = touch.clientX;
      armedRef.current = true;
      trackingRef.current = false;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!armedRef.current || refreshingRef.current || event.touches.length !== 1) return;
      const touch = event.touches[0];
      if (!touch) return;

      const dy = touch.clientY - startYRef.current;
      const dx = touch.clientX - startXRef.current;

      if (!trackingRef.current) {
        if (Math.abs(dx) > DOMINANT_AXIS_PX && Math.abs(dx) > Math.abs(dy)) {
          disarm(armedRef, trackingRef);
          return;
        }
        if (dy <= DOMINANT_AXIS_PX) return;
        if (scroller.scrollTop > 0) {
          disarm(armedRef, trackingRef);
          return;
        }
        trackingRef.current = true;
      }

      if (dy <= 0) {
        if (pullRef.current > 0) applyPull(0, false);
        return;
      }

      if (event.cancelable) event.preventDefault();
      applyPull(resistPull(dy, PTR_MAX_PULL), false);
    };

    const onTouchEnd = () => {
      if (!armedRef.current && !trackingRef.current) return;
      const wasTracking = trackingRef.current;
      disarm(armedRef, trackingRef);
      if (!wasTracking) return;

      if (isPullArmed(pullRef.current, PTR_THRESHOLD)) {
        commitRefresh();
        return;
      }
      applyPull(0, true);
    };

    const onTouchCancel = () => {
      disarm(armedRef, trackingRef);
      if (refreshingRef.current) return;
      applyPull(0, true);
    };

    scroller.addEventListener('touchstart', onTouchStart, { passive: true });
    scroller.addEventListener('touchmove', onTouchMove, { passive: false });
    scroller.addEventListener('touchend', onTouchEnd, { passive: true });
    scroller.addEventListener('touchcancel', onTouchCancel, { passive: true });

    return () => {
      scroller.removeEventListener('touchstart', onTouchStart);
      scroller.removeEventListener('touchmove', onTouchMove);
      scroller.removeEventListener('touchend', onTouchEnd);
      scroller.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [applyPull, commitRefresh, enabled, scrollerRef]);

  return {
    pull: enabled ? pull : 0,
    refreshing: enabled ? refreshing : false,
  };
}
