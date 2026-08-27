import { useEffect, useRef, useState } from 'react';

import {
  dampPull,
  hasOpenModalOverlay,
  isAtScrollTop,
  isVerticalPullGesture,
  PTR_AXIS_LOCK_PX,
  PTR_MAX_PULL,
  PTR_THRESHOLD,
  ptrContentOffset,
  readScrollTop,
  shouldTriggerRefresh,
} from '@/lib/pullToRefresh';

/**
 * iOS + Android WebView pull-to-refresh. Touch only; desktop scroll is unchanged.
 *
 * @param {{
 *   enabled?: boolean,
 *   scrollRef?: { current: HTMLElement|null },
 *   onRefresh?: () => unknown,
 * }} options
 */
export function usePullToRefresh({ enabled = true, scrollRef, onRefresh } = {}) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const maybePullRef = useRef(false);
  const pullingRef = useRef(false);
  const pullRef = useRef(0);
  const refreshingRef = useRef(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;
  refreshingRef.current = refreshing;

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    let cancelled = false;
    const setDistance = (value) => {
      pullRef.current = value;
      setPull(value);
    };

    const startPull = (clientX, clientY) => {
      if (refreshingRef.current || hasOpenModalOverlay()) return;
      if (!isAtScrollTop(readScrollTop(scrollRef?.current))) return;
      maybePullRef.current = true;
      pullingRef.current = false;
      startXRef.current = clientX;
      startYRef.current = clientY;
    };

    const movePull = (event, clientX, clientY) => {
      if (!maybePullRef.current || refreshingRef.current) return;
      const dx = clientX - startXRef.current;
      const dy = clientY - startYRef.current;
      if (!pullingRef.current) {
        if (Math.abs(dx) < PTR_AXIS_LOCK_PX && dy < PTR_AXIS_LOCK_PX) return;
        if (!isVerticalPullGesture(dx, dy)) {
          maybePullRef.current = false;
          return;
        }
        if (!isAtScrollTop(readScrollTop(scrollRef?.current))) {
          maybePullRef.current = false;
          return;
        }
        pullingRef.current = true;
      }
      if (!isAtScrollTop(readScrollTop(scrollRef?.current))) {
        pullingRef.current = false;
        maybePullRef.current = false;
        if (pullRef.current) setDistance(0);
        return;
      }
      const next = Math.min(Math.round(dampPull(dy)), PTR_MAX_PULL);
      if (next <= 0) {
        if (pullRef.current) setDistance(0);
        return;
      }
      if (event.cancelable) event.preventDefault();
      if (next === pullRef.current) return;
      setDistance(next);
    };

    const endPull = () => {
      maybePullRef.current = false;
      if (!pullingRef.current) return;
      pullingRef.current = false;
      if (!shouldTriggerRefresh(pullRef.current)) {
        setDistance(0);
        return;
      }
      setDistance(PTR_THRESHOLD);
      setRefreshing(true);
      refreshingRef.current = true;
      Promise.resolve(onRefreshRef.current?.())
        .catch(() => {})
        .finally(() => {
          if (cancelled) return;
          refreshingRef.current = false;
          setRefreshing(false);
          setDistance(0);
        });
    };

    const onTouchStart = (event) => {
      const touch = event.touches?.[0];
      if (touch) startPull(touch.clientX, touch.clientY);
    };
    const onTouchMove = (event) => {
      const touch = event.touches?.[0];
      if (touch) movePull(event, touch.clientX, touch.clientY);
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', endPull, { passive: true });
    document.addEventListener('touchcancel', endPull, { passive: true });

    return () => {
      cancelled = true;
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', endPull);
      document.removeEventListener('touchcancel', endPull);
    };
  }, [enabled, scrollRef]);

  const offset = ptrContentOffset(pull, refreshing);
  return { offset, refreshing, settling: offset === 0 && !refreshing };
}
