import { useEffect, useRef } from 'react';

type Options = {
  /** When false, the sentinel is inert (e.g. no next page / already fetching). */
  enabled: boolean;
  onIntersect: () => void;
  /** Prefetch margin — matches app FeedRegion (`240px 0px`). */
  rootMargin?: string | undefined;
  root?: Element | null | undefined;
};

/** Cursor pagination sentinel — stable observer, latest `onIntersect` via ref. */
export function useCursorSentinel({ enabled, onIntersect, rootMargin = '240px 0px', root = null }: Options) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!enabled || !el || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onIntersectRef.current();
      },
      { root, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, root, rootMargin]);

  return sentinelRef;
}
