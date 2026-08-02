/**
 * Fires a single counted view after minimum watch time / completion.
 */

import { useEffect, useRef } from 'react';

import { useRecordReelViewMutation } from '@/store/api/reelsApi';

const DEFAULT_MIN_WATCHED_MS = 3000;
const DEFAULT_MIN_COMPLETION = 0.25;

/**
 * @param {object} opts
 * @param {number|string|null} opts.reelId
 * @param {boolean} opts.isActive
 * @param {boolean} opts.isPlaying
 * @param {() => number} opts.getCurrentTimeMs
 * @param {() => number} opts.getDurationMs
 * @param {number} [opts.minWatchedMs]
 * @param {number} [opts.minCompletion]
 */
export function useViewTracker({
  reelId,
  isActive,
  isPlaying,
  getCurrentTimeMs,
  getDurationMs,
  minWatchedMs = DEFAULT_MIN_WATCHED_MS,
  minCompletion = DEFAULT_MIN_COMPLETION,
}) {
  const [recordView] = useRecordReelViewMutation();
  const sentRef = useRef(false);
  const activeReelRef = useRef(null);

  useEffect(() => {
    if (activeReelRef.current !== reelId) {
      activeReelRef.current = reelId;
      sentRef.current = false;
    }
  }, [reelId]);

  useEffect(() => {
    if (!reelId || !isActive || !isPlaying || sentRef.current) {
      return undefined;
    }

    const tick = () => {
      if (sentRef.current) return;
      const watchedMs = Math.round(getCurrentTimeMs() || 0);
      const durationMs = Math.round(getDurationMs() || 0);
      const completionRate = durationMs > 0 ? watchedMs / durationMs : 0;

      if (watchedMs < minWatchedMs && completionRate < minCompletion) {
        return;
      }

      sentRef.current = true;
      recordView({
        id: reelId,
        watched_ms: watchedMs,
        completion_rate: Math.min(1, completionRate),
      })
        .unwrap()
        .catch(() => {
          sentRef.current = false;
        });
    };

    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [reelId, isActive, isPlaying, getCurrentTimeMs, getDurationMs, minWatchedMs, minCompletion, recordView]);
}
