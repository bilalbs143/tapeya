import { Capacitor } from '@capacitor/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getReelPlayerWindowRadius, isInPlayerWindow } from '@/features/reels/reelPlayerWindow';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
    getPlatform: vi.fn(() => 'web'),
  },
}));

describe('isInPlayerWindow', () => {
  beforeEach(() => {
    Capacitor.isNativePlatform.mockReturnValue(false);
    Capacitor.getPlatform.mockReturnValue('web');
  });

  it('includes only prev, current, and next on web', () => {
    const active = 3;
    const mounted = [0, 1, 2, 3, 4, 5, 6].filter((i) => isInPlayerWindow(i, active));
    expect(mounted).toEqual([2, 3, 4]);
    expect(getReelPlayerWindowRadius()).toBe(1);
  });

  it('clamps at list edges', () => {
    expect([0, 1, 2].filter((i) => isInPlayerWindow(i, 0))).toEqual([0, 1]);
    expect([3, 4, 5].filter((i) => isInPlayerWindow(i, 5))).toEqual([4, 5]);
  });

  it('widens to ±2 on native iOS', () => {
    Capacitor.isNativePlatform.mockReturnValue(true);
    Capacitor.getPlatform.mockReturnValue('ios');
    expect(getReelPlayerWindowRadius()).toBe(2);
    expect([0, 1, 2, 3, 4, 5, 6].filter((i) => isInPlayerWindow(i, 3))).toEqual([1, 2, 3, 4, 5]);
  });
});
