import { useEffect, useRef } from 'react';

import type { PostSponsorship } from '../model/schemas';
import { enqueueAdEvent } from './adEventQueue';
import { hasTrackedAdMetric, markAdMetric } from './adMetricsSession';
import { buildAdEvent } from './buildAdEvent';

const SURFACE = 'reels_feed' as const;
const IMPRESSION_MS = 1000;
/** Defaults aligned with organic reel view settings. */
const VIEW_MIN_WATCHED_MS = 3000;
const VIEW_MIN_COMPLETION = 0.25;

type Options = {
  active: boolean;
  sponsorship: PostSponsorship | null | undefined;
  videoRef: { current: HTMLVideoElement | null };
  /** Bumps when the player attaches / remounts so view listeners rebind. */
  mediaEpoch?: string | number | undefined;
};

/** Active-slide impression (≥1s) + video view thresholds for sponsored reels. */
export function useSponsoredReelMetrics({ active, sponsorship, videoRef, mediaEpoch }: Options): void {
  const impressionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active || !sponsorship) {
      if (impressionTimer.current != null) {
        clearTimeout(impressionTimer.current);
        impressionTimer.current = null;
      }
      return undefined;
    }

    const creativeId = sponsorship.creativeId;
    if (!hasTrackedAdMetric(SURFACE, creativeId, 'impression')) {
      impressionTimer.current = setTimeout(() => {
        if (hasTrackedAdMetric(SURFACE, creativeId, 'impression')) return;
        markAdMetric(SURFACE, creativeId, 'impression');
        enqueueAdEvent(buildAdEvent(sponsorship, SURFACE, 'impression'));
      }, IMPRESSION_MS);
    }

    return () => {
      if (impressionTimer.current != null) {
        clearTimeout(impressionTimer.current);
        impressionTimer.current = null;
      }
    };
  }, [active, sponsorship]);

  useEffect(() => {
    if (!active || !sponsorship) return undefined;
    const creativeId = sponsorship.creativeId;
    if (hasTrackedAdMetric(SURFACE, creativeId, 'view')) return undefined;

    const el = videoRef.current;
    if (!el) return undefined;

    const current = sponsorship;

    function maybeView() {
      if (hasTrackedAdMetric(SURFACE, creativeId, 'view')) return;
      const video = videoRef.current;
      if (!video || !current) return;
      const watchedMs = (video.currentTime || 0) * 1000;
      const duration = video.duration;
      const completion =
        Number.isFinite(duration) && duration > 0 ? Math.min(1, (video.currentTime || 0) / duration) : 0;

      if (watchedMs < VIEW_MIN_WATCHED_MS && completion < VIEW_MIN_COMPLETION) return;

      markAdMetric(SURFACE, creativeId, 'view');
      enqueueAdEvent(
        buildAdEvent(current, SURFACE, 'view', {
          watchedMs,
          completionRate: completion,
        })
      );
    }

    el.addEventListener('timeupdate', maybeView);
    return () => el.removeEventListener('timeupdate', maybeView);
  }, [active, sponsorship, videoRef, mediaEpoch]);
}
