import { useEffect, useRef } from 'react';

import { getShellScrollRoot } from '@/shared/layout/shellScroll';

type Options = {
  enabled: boolean;
  onIntersect: () => void;
  rootMargin?: string | undefined;
  /** Explicit IO root. Ignored when `shellRoot` is true. */
  root?: Element | null | undefined;
  /** Resolve AppShell scrollport when observing (home feed). */
  shellRoot?: boolean | undefined;
  /** Remount observer when this changes (e.g. after a fetch settles). */
  recheckKey?: string | number | undefined;
};

/** Cursor pagination sentinel — latest `onIntersect` via ref. */
export function useCursorSentinel({
  enabled,
  onIntersect,
  rootMargin = '240px 0px',
  root = null,
  shellRoot = false,
  recheckKey,
}: Options) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);

  useEffect(() => {
    onIntersectRef.current = onIntersect;
  }, [onIntersect]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!enabled || !el || typeof IntersectionObserver === 'undefined') return undefined;

    const observeRoot = shellRoot ? getShellScrollRoot() : root;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) onIntersectRef.current();
      },
      { root: observeRoot, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [enabled, root, shellRoot, rootMargin, recheckKey]);

  return sentinelRef;
}
