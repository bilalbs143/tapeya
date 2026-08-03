import { describe, expect, it } from 'vitest';

import { buildCycledReelRows } from '../buildCycledReelRows';

describe('buildCycledReelRows', () => {
  const reels = [{ id: 1 }, { id: 2 }];

  it('returns empty for an empty catalog', () => {
    expect(buildCycledReelRows({ reels: [] })).toEqual([]);
  });

  it('uses single-pass keys by default', () => {
    expect(buildCycledReelRows({ reels })).toEqual([
      { key: 'reel-1-c0', reel: reels[0] },
      { key: 'reel-2-c0', reel: reels[1] },
    ]);
  });

  it('repeats reels across cycles with distinct keys', () => {
    const rows = buildCycledReelRows({ reels, cycles: 2 });
    expect(rows.map((row) => row.key)).toEqual(['reel-1-c0', 'reel-2-c0', 'reel-1-c1', 'reel-2-c1']);
  });

  it('applies soft-fresh only from freshFromCycle onward', () => {
    const fresh = [{ id: 9 }];
    const rows = buildCycledReelRows({
      reels,
      cycles: 2,
      freshItems: fresh,
      freshFromCycle: 1,
    });
    expect(rows.map((row) => row.key)).toEqual(['reel-1-c0', 'reel-2-c0', 'reel-9-c1', 'reel-1-c1', 'reel-2-c1']);
  });
});
