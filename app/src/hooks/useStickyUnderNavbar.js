/**
 * Sentinel-based sticky detection flush under the fixed app navbar.
 *
 * CSS `position: sticky` with {@link NAVBAR_OFFSET_CSS} does the pinning.
 * This hook only reports when the region has scrolled past the navbar edge
 * (for borders/shadows), using a measured navbar height so IntersectionObserver
 * stays aligned with notches / safe-area (observers cannot use `env()`).
 *
 * @returns {{ sentinelRef: import('react').RefObject<HTMLElement|null>, isStuck: boolean }}
 */

import { useEffect, useRef, useState } from 'react';

import { getNavbarOffsetPx } from '@/lib/constants/layout';

export function useStickyUnderNavbar() {
  const sentinelRef = useRef(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || typeof IntersectionObserver === 'undefined') return undefined;

    /** @type {IntersectionObserver | null} */
    let observer = null;

    const connect = () => {
      observer?.disconnect();
      const offsetPx = getNavbarOffsetPx();
      observer = new IntersectionObserver(
        ([entry]) => {
          setIsStuck(!entry.isIntersecting);
        },
        {
          root: null,
          threshold: 0,
          rootMargin: `-${offsetPx}px 0px 0px 0px`,
        },
      );
      observer.observe(sentinel);
    };

    connect();

    window.addEventListener('resize', connect);
    window.visualViewport?.addEventListener('resize', connect);

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', connect);
      window.visualViewport?.removeEventListener('resize', connect);
    };
  }, []);

  return { sentinelRef, isStuck };
}
