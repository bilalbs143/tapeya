import { describe, expect, it } from 'vitest';

import { getReelPlayerWindowRadius, isInPlayerWindow } from '@/features/reels/reelPlayerWindow';

describe('isInPlayerWindow', () => {
  it('includes ±2 around the active slide', () => {
    expect(getReelPlayerWindowRadius()).toBe(2);
    expect([0, 1, 2, 3, 4, 5, 6].filter((i) => isInPlayerWindow(i, 3))).toEqual([1, 2, 3, 4, 5]);
  });

  it('clamps at list edges', () => {
    expect([0, 1, 2, 3].filter((i) => isInPlayerWindow(i, 0))).toEqual([0, 1, 2]);
    expect([3, 4, 5].filter((i) => isInPlayerWindow(i, 5))).toEqual([3, 4, 5]);
  });
});
