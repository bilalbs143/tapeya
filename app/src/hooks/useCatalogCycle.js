import { useCallback, useEffect, useRef, useState } from 'react';

import { CATALOG_FRESHNESS_EVERY_CYCLES, maxCyclesForCatalogSize, pickNewItems, pruneFreshItems } from '@/lib/catalogCycle';

const EMPTY_LIST = Object.freeze([]);

/**
 * Client cycle after cursor exhaustion + soft page-1 freshness.
 * Does not touch the scrolled RTK list cache — callers supply an isolated peek.
 *
 * @param {{
 *   enabled: boolean,
 *   items: Array<object>,
 *   hasMore: boolean,
 *   peekPage: () => Promise<{ items?: object[] }>,
 * }} args
 */
export function useCatalogCycle({ enabled, items, hasMore, peekPage }) {
  const [cycles, setCycles] = useState(1);
  const [freshItems, setFreshItems] = useState(EMPTY_LIST);
  const [freshFromCycle, setFreshFromCycle] = useState(/** @type {number|null} */ (null));

  const pendingRef = useRef(/** @type {object[]} */ ([]));
  const itemsRef = useRef(items);
  const freshRef = useRef(freshItems);
  const peekPageRef = useRef(peekPage);
  itemsRef.current = items;
  freshRef.current = freshItems;
  peekPageRef.current = peekPage;

  // Reset when leaving the cycling surface, or when cursor pagination is active again.
  useEffect(() => {
    setCycles(1);
    setFreshItems(EMPTY_LIST);
    setFreshFromCycle(null);
    pendingRef.current = [];
  }, [enabled, hasMore]);

  // If the RTK catalog gains ids (invalidate/refetch), drop duplicates from soft-fresh.
  useEffect(() => {
    setFreshItems((prev) => {
      const next = pruneFreshItems(prev, items);
      if (next === prev) return prev;
      return next.length ? next : EMPTY_LIST;
    });
  }, [items]);

  const peek = useCallback(() => {
    void peekPageRef
      .current()
      .then((page) => {
        const known = [...itemsRef.current, ...freshRef.current, ...pendingRef.current];
        const found = pickNewItems(known, page?.items);
        if (found.length) {
          pendingRef.current = [...found, ...pendingRef.current];
        }
      })
      .catch(() => {
        // Best-effort; keep cycling the loaded catalog.
      });
  }, []);

  const catalogSize = items.length + freshItems.length;
  const maxCycles = maxCyclesForCatalogSize(catalogSize);
  const displayCycles = enabled && !hasMore ? Math.min(cycles, maxCycles) : 1;

  const advance = useCallback(() => {
    if (!enabled || !itemsRef.current.length || hasMore) return false;

    const max = maxCyclesForCatalogSize(itemsRef.current.length + freshRef.current.length);
    if (cycles >= max) return false;

    const next = cycles + 1;
    const pending = pendingRef.current;
    if (pending.length) {
      pendingRef.current = [];
      setFreshItems((prev) => {
        const added = pickNewItems([...itemsRef.current, ...prev], pending);
        return added.length ? [...added, ...prev] : prev;
      });
      setFreshFromCycle((from) => (from == null ? cycles : from));
    }

    setCycles(next);
    if (next % CATALOG_FRESHNESS_EVERY_CYCLES === 0) {
      peek();
    }
    return true;
  }, [enabled, hasMore, cycles, peek]);

  return {
    displayCycles,
    freshItems: enabled ? freshItems : EMPTY_LIST,
    freshFromCycle: enabled ? freshFromCycle : null,
    advance,
  };
}
