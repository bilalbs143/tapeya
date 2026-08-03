import { describe, expect, it } from 'vitest';

import {
  CATALOG_CYCLE_MAX_CYCLES,
  CATALOG_CYCLE_MAX_ROWS,
  itemsForCycle,
  maxCyclesForCatalogSize,
  pickNewItems,
  pruneFreshItems,
} from '@/lib/catalogCycle';

describe('pickNewItems', () => {
  it('returns only ids not already known', () => {
    expect(pickNewItems([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }, { id: 4 }])).toEqual([{ id: 3 }, { id: 4 }]);
  });

  it('handles empty incoming', () => {
    expect(pickNewItems([{ id: 1 }], [])).toEqual([]);
    expect(pickNewItems([{ id: 1 }], null)).toEqual([]);
  });
});

describe('pruneFreshItems', () => {
  it('removes ids already in the base catalog and keeps the same reference when unchanged', () => {
    const fresh = [{ id: 9 }, { id: 2 }];
    const base = [{ id: 1 }, { id: 2 }];
    expect(pruneFreshItems(fresh, base)).toEqual([{ id: 9 }]);

    const stable = [{ id: 9 }];
    expect(pruneFreshItems(stable, base)).toBe(stable);
  });
});

describe('itemsForCycle', () => {
  const base = [{ id: 1 }, { id: 2 }];
  const fresh = [{ id: 9 }, { id: 1 }];

  it('keeps the base list before freshFromCycle', () => {
    expect(itemsForCycle(base, fresh, 2, 0)).toEqual(base);
    expect(itemsForCycle(base, fresh, 2, 1)).toEqual(base);
  });

  it('prepends unique fresh items from freshFromCycle onward', () => {
    expect(itemsForCycle(base, fresh, 2, 2)).toEqual([{ id: 9 }, { id: 1 }, { id: 2 }]);
  });

  it('ignores fresh when unset', () => {
    expect(itemsForCycle(base, fresh, null, 4)).toEqual(base);
    expect(itemsForCycle(base, [], 0, 0)).toEqual(base);
  });
});

describe('catalog cycle caps', () => {
  it('allows only one cycle for an empty catalog', () => {
    expect(maxCyclesForCatalogSize(0)).toBe(1);
  });

  it('caps cycles by max rows and hard ceiling', () => {
    expect(maxCyclesForCatalogSize(1)).toBe(Math.min(CATALOG_CYCLE_MAX_CYCLES, CATALOG_CYCLE_MAX_ROWS));
    expect(maxCyclesForCatalogSize(50)).toBe(Math.min(CATALOG_CYCLE_MAX_CYCLES, Math.floor(CATALOG_CYCLE_MAX_ROWS / 50)));
    expect(maxCyclesForCatalogSize(CATALOG_CYCLE_MAX_ROWS)).toBe(1);
  });
});
