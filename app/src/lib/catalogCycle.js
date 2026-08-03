/** Soft cap on repeated catalog rows after cursor exhaustion. */
export const CATALOG_CYCLE_MAX_ROWS = 200;

/** Hard ceiling on display cycles regardless of catalog size. */
export const CATALOG_CYCLE_MAX_CYCLES = 20;

/** How often to peek page 1 for new items while client-cycling. */
export const CATALOG_FRESHNESS_EVERY_CYCLES = 3;

/**
 * How many display cycles are allowed for a loaded catalog size.
 * Always at least 1 (the initial pass). Empty catalogs cannot loop.
 *
 * @param {number} itemCount
 * @returns {number}
 */
export function maxCyclesForCatalogSize(itemCount) {
  const count = Number(itemCount);
  if (!Number.isFinite(count) || count <= 0) return 1;
  return Math.max(1, Math.min(CATALOG_CYCLE_MAX_CYCLES, Math.floor(CATALOG_CYCLE_MAX_ROWS / count)));
}

/**
 * @param {Array<{ id?: unknown }>} knownItems
 * @param {Array<{ id?: unknown }>|null|undefined} incoming
 * @returns {Array<{ id?: unknown }>}
 */
export function pickNewItems(knownItems, incoming) {
  const seen = new Set((knownItems ?? []).map((item) => String(item.id)));
  return (incoming ?? []).filter((item) => item != null && !seen.has(String(item.id)));
}

/**
 * Drop soft-fresh items that already exist in the loaded RTK catalog.
 * Returns the same array reference when nothing changes.
 *
 * @param {Array<object>} freshItems
 * @param {Array<object>} baseItems
 * @returns {Array<object>}
 */
export function pruneFreshItems(freshItems, baseItems) {
  if (!freshItems?.length) return freshItems ?? [];
  const seen = new Set((baseItems ?? []).map((item) => String(item.id)));
  let removed = false;
  const next = [];
  for (const item of freshItems) {
    if (seen.has(String(item.id))) {
      removed = true;
      continue;
    }
    next.push(item);
  }
  return removed ? next : freshItems;
}

/**
 * Soft-fresh items are prepended only from `freshFromCycle` onward so older
 * cycles (already on screen above) do not shift.
 *
 * @param {Array<object>} baseItems
 * @param {Array<object>} freshItems
 * @param {number|null|undefined} freshFromCycle
 * @param {number} cycle
 * @returns {Array<object>}
 */
export function itemsForCycle(baseItems, freshItems, freshFromCycle, cycle) {
  const base = Array.isArray(baseItems) ? baseItems : [];
  if (!freshItems?.length || freshFromCycle == null || cycle < freshFromCycle) {
    return base;
  }
  const seen = new Set(freshItems.map((item) => String(item.id)));
  return [...freshItems, ...base.filter((item) => !seen.has(String(item.id)))];
}
