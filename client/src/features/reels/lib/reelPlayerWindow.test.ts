import { describe, expect, it } from 'vitest';

import {
  getReelPlayerAhead,
  getReelPlayerBehind,
  getReelPlayerWindowRadius,
  isInPlayerWindow,
  isNextPlayerSlide,
} from './reelPlayerWindow';

describe('isInPlayerWindow', () => {
  it('keeps one behind and four ahead of the active slide', () => {
    expect(getReelPlayerBehind()).toBe(1);
    expect(getReelPlayerAhead()).toBe(4);
    expect(getReelPlayerWindowRadius()).toBe(4);
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => isInPlayerWindow(i, 3))).toEqual([2, 3, 4, 5, 6, 7]);
  });

  it('clamps at list edges', () => {
    expect([0, 1, 2, 3, 4, 5].filter((i) => isInPlayerWindow(i, 0))).toEqual([0, 1, 2, 3, 4]);
    expect([4, 5, 6, 7].filter((i) => isInPlayerWindow(i, 7))).toEqual([6, 7]);
  });
});

describe('isNextPlayerSlide', () => {
  it('marks only the immediate next index', () => {
    expect(isNextPlayerSlide(4, 3)).toBe(true);
    expect(isNextPlayerSlide(3, 3)).toBe(false);
    expect(isNextPlayerSlide(5, 3)).toBe(false);
  });
});
