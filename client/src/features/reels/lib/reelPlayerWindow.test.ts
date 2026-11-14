import { describe, expect, it } from 'vitest';

import { isInPlayerWindow, isNextPlayerSlide, REEL_PLAYER_AHEAD } from './reelPlayerWindow';

describe('isInPlayerWindow', () => {
  it('keeps only active and the next slide', () => {
    expect(REEL_PLAYER_AHEAD).toBe(1);
    expect([0, 1, 2, 3, 4, 5].filter((i) => isInPlayerWindow(i, 3))).toEqual([3, 4]);
  });

  it('clamps at list edges', () => {
    expect([0, 1, 2].filter((i) => isInPlayerWindow(i, 0))).toEqual([0, 1]);
    expect([5, 6, 7].filter((i) => isInPlayerWindow(i, 7))).toEqual([7]);
  });
});

describe('isNextPlayerSlide', () => {
  it('is only activeIndex + 1', () => {
    expect(isNextPlayerSlide(4, 3)).toBe(true);
    expect(isNextPlayerSlide(3, 3)).toBe(false);
    expect(isNextPlayerSlide(5, 3)).toBe(false);
  });
});
