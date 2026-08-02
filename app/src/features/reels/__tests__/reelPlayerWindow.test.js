import { describe, expect, it } from 'vitest';

import { isInPlayerWindow } from '@/features/reels/reelPlayerWindow';

describe('isInPlayerWindow', () => {
  it('includes only prev, current, and next', () => {
    const active = 3;
    const mounted = [0, 1, 2, 3, 4, 5, 6].filter((i) => isInPlayerWindow(i, active));
    expect(mounted).toEqual([2, 3, 4]);
  });

  it('clamps at list edges', () => {
    expect([0, 1, 2].filter((i) => isInPlayerWindow(i, 0))).toEqual([0, 1]);
    expect([3, 4, 5].filter((i) => isInPlayerWindow(i, 5))).toEqual([4, 5]);
  });
});
