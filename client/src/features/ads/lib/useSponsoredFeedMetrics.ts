import { useEffect, useRef } from 'react';

import { getShellScrollRoot } from '@/shared/layout/shellScroll';

import type { AdSurface, PostSponsorship } from '../model/schemas';
import { enqueueAdEvent } from './adEventQueue';
import { hasTrackedAdMetric, markAdMetric } from './adMetricsSession';
import { buildAdEvent } from './buildAdEvent';

const IMPRESSION_MS = 1000;
const VIEW_MS = 2000;
const VISIBLE_RATIO = 0.5;

type Options = {
  sponsorship: PostSponsorship | null | undefined;
  surface: AdSurface;
  /**
   * Dwell view (≥50% visible ≥2s). Disable for feed video posters —
   * real video views are measured on the reels player.
   */
  trackView?: boolean | undefined;
};

/**
 * Home-feed impression (≥50% visible ≥1s) + optional dwell view (≥50% ≥2s).
 * Observer root is the shell scrollport when present.
 */
export function useSponsoredFeedMetrics(
  elementRef: { current: HTMLElement | null },
  { sponsorship, surface, trackView = true }: Options
): void {
  const visibleSinceRef = useRef<number | null>(null);
  const impressionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const viewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !sponsorship) return undefined;

    const creativeId = sponsorship.creativeId;

    function clearTimers() {
      if (impressionTimer.current != null) {
        clearTimeout(impressionTimer.current);
        impressionTimer.current = null;
      }
      if (viewTimer.current != null) {
        clearTimeout(viewTimer.current);
        viewTimer.current = null;
      }
    }

    function onVisible() {
      if (visibleSinceRef.current != null) return;
      visibleSinceRef.current = Date.now();

      const current = sponsorship;
      if (!current) return;

      if (!hasTrackedAdMetric(surface, creativeId, 'impression')) {
        impressionTimer.current = setTimeout(() => {
          if (hasTrackedAdMetric(surface, creativeId, 'impression')) return;
          markAdMetric(surface, creativeId, 'impression');
          enqueueAdEvent(buildAdEvent(current, surface, 'impression'));
        }, IMPRESSION_MS);
      }

      if (trackView && !hasTrackedAdMetric(surface, creativeId, 'view')) {
        viewTimer.current = setTimeout(() => {
          if (hasTrackedAdMetric(surface, creativeId, 'view')) return;
          markAdMetric(surface, creativeId, 'view');
          enqueueAdEvent(buildAdEvent(current, surface, 'view'));
        }, VIEW_MS);
      }
    }

    function onHidden() {
      visibleSinceRef.current = null;
      clearTimers();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO) onVisible();
        else onHidden();
      },
      {
        root: getShellScrollRoot(),
        threshold: [0, VISIBLE_RATIO, 1],
      }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      onHidden();
    };
  }, [elementRef, sponsorship, surface, trackView]);
}
