import { CATALOG_CYCLE_MAX_CYCLES, itemsForCycle } from '@/lib/catalogCycle';

const EMPTY_FRESH = Object.freeze([]);

/**
 * Expand an Explore reels catalog across client cycles with stable React keys.
 * Soft-fresh items apply from `freshFromCycle` onward (no shift of earlier cycles).
 *
 * @param {{
 *   reels: Array<object>,
 *   cycles?: number,
 *   freshItems?: Array<object>,
 *   freshFromCycle?: number|null,
 * }} args
 * @returns {Array<{ key: string, reel: object }>}
 */
export function buildCycledReelRows({ reels, cycles = 1, freshItems = EMPTY_FRESH, freshFromCycle = null }) {
  const base = Array.isArray(reels) ? reels : [];
  if (!base.length) return [];

  const cycleCount = Math.max(1, Math.min(CATALOG_CYCLE_MAX_CYCLES, Number(cycles) || 1));
  const withFresh =
    freshItems.length > 0 && freshFromCycle != null ? itemsForCycle(base, freshItems, freshFromCycle, freshFromCycle) : base;

  /** @type {Array<{ key: string, reel: object }>} */
  const rows = [];
  for (let cycle = 0; cycle < cycleCount; cycle++) {
    const list = freshFromCycle != null && cycle >= freshFromCycle ? withFresh : base;
    for (const reel of list) {
      rows.push({
        key: `reel-${reel.id}-c${cycle}`,
        reel,
      });
    }
  }
  return rows;
}
