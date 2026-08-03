import { useCallback, useEffect, useRef, useState } from 'react';

import {
  EXPLORE_FRESHNESS_EVERY_CYCLES,
  maxExploreCyclesForPostCount,
  pickNewPosts,
  pruneFreshPosts,
} from '@/lib/feed/exploreFeedLoop';
import { FEED_LIST_ARG } from '@/store/api/feedApi';

const EMPTY_LIST = Object.freeze([]);

/**
 * Explore-only client cycle after cursor exhaustion + soft page-1 freshness.
 * Does not touch the scrolled getHomeFeed RTK cache.
 *
 * @param {{
 *   enabled: boolean,
 *   items: Array<object>,
 *   hasMore: boolean,
 *   peekHomeFeed: (arg?: object) => { unwrap: () => Promise<{ items?: object[] }> },
 * }} args
 */
export function useExploreFeedCycle({ enabled, items, hasMore, peekHomeFeed }) {
  const [cycles, setCycles] = useState(1);
  const [freshPosts, setFreshPosts] = useState(EMPTY_LIST);
  const [freshFromCycle, setFreshFromCycle] = useState(/** @type {number|null} */ (null));

  const pendingRef = useRef(/** @type {object[]} */ ([]));
  const itemsRef = useRef(items);
  const freshRef = useRef(freshPosts);
  itemsRef.current = items;
  freshRef.current = freshPosts;

  // Reset when leaving Explore, or when cursor pagination is active again.
  useEffect(() => {
    setCycles(1);
    setFreshPosts(EMPTY_LIST);
    setFreshFromCycle(null);
    pendingRef.current = [];
  }, [enabled, hasMore]);

  // If the RTK catalog gains ids (invalidate/refetch), drop duplicates from soft-fresh.
  useEffect(() => {
    setFreshPosts((prev) => {
      const next = pruneFreshPosts(prev, items);
      if (next === prev) return prev;
      return next.length ? next : EMPTY_LIST;
    });
  }, [items]);

  const peek = useCallback(() => {
    // preferCacheValue=false so each soft-fresh peek hits the network.
    void peekHomeFeed(FEED_LIST_ARG, false)
      .unwrap()
      .then((page) => {
        const known = [...itemsRef.current, ...freshRef.current, ...pendingRef.current];
        const found = pickNewPosts(known, page?.items);
        if (found.length) {
          pendingRef.current = [...found, ...pendingRef.current];
        }
      })
      .catch(() => {
        // Best-effort; keep cycling the loaded catalog.
      });
  }, [peekHomeFeed]);

  const catalogSize = items.length + freshPosts.length;
  const maxCycles = maxExploreCyclesForPostCount(catalogSize);
  const displayCycles = enabled && !hasMore ? Math.min(cycles, maxCycles) : 1;

  const advance = useCallback(() => {
    if (!enabled || !itemsRef.current.length || hasMore) return false;

    const max = maxExploreCyclesForPostCount(itemsRef.current.length + freshRef.current.length);
    if (cycles >= max) return false;

    const next = cycles + 1;
    const pending = pendingRef.current;
    if (pending.length) {
      pendingRef.current = [];
      setFreshPosts((prev) => {
        const added = pickNewPosts([...itemsRef.current, ...prev], pending);
        return added.length ? [...added, ...prev] : prev;
      });
      setFreshFromCycle((from) => (from == null ? cycles : from));
    }

    setCycles(next);
    if (next % EXPLORE_FRESHNESS_EVERY_CYCLES === 0) {
      peek();
    }
    return true;
  }, [enabled, hasMore, cycles, peek]);

  return {
    displayCycles,
    freshPosts: enabled ? freshPosts : EMPTY_LIST,
    freshFromCycle: enabled ? freshFromCycle : null,
    advance,
  };
}
