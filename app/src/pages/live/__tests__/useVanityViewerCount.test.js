import { describe, expect, it } from 'vitest';

import { computeVanityBase, resolveVanityViewerRange } from '@/pages/live/useVanityViewerCount';

describe('resolveVanityViewerRange', () => {
  it('disables when both are 0', () => {
    expect(resolveVanityViewerRange(0, 0)).toBeNull();
  });

  it('normalizes swapped and string inputs', () => {
    expect(resolveVanityViewerRange(2500, 2000)).toEqual({ min: 2000, max: 2500 });
    expect(resolveVanityViewerRange('2000', '2500')).toEqual({ min: 2000, max: 2500 });
  });
});

describe('computeVanityBase', () => {
  const range = { min: 2000, max: 2500 };
  const started = Date.UTC(2026, 0, 1, 12, 0, 0);

  it('stays in range and matches across clients', () => {
    const now = started + 5 * 60_000;
    expect(computeVanityBase(99, started, range, now)).toBe(computeVanityBase(99, started, range, now));
    for (let i = 0; i < 30; i += 1) {
      const n = computeVanityBase(42, started, range, started + 120_000 + i * 20_000);
      expect(n).toBeGreaterThanOrEqual(2000);
      expect(n).toBeLessThanOrEqual(2500);
    }
  });

  it('drifts instead of freezing at max', () => {
    const samples = Array.from({ length: 60 }, (_, i) => computeVanityBase(7, started, range, started + 180_000 + i * 25_000));
    expect(new Set(samples).size).toBeGreaterThan(4);
    expect(samples.some((n) => n < 2450)).toBe(true);
    expect(samples.some((n) => n > 2050)).toBe(true);
  });

  it('ramps up from near the floor', () => {
    const early = computeVanityBase(3, started, range, started + 5_000);
    const late = computeVanityBase(3, started, range, started + 90_000);
    expect(early).toBeLessThan(2200);
    expect(early).toBeLessThanOrEqual(late);
  });
});
