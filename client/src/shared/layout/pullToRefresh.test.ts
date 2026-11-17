import { describe, expect, it } from 'vitest';

import { APP_PATHS } from '@/shared/config/paths';

import {
  isPullArmed,
  isPullToRefreshPath,
  PTR_MAX_PULL,
  PTR_THRESHOLD,
  pullProgress,
  resistPull,
} from './pullToRefresh';

describe('resistPull', () => {
  it('returns 0 for non-positive dy', () => {
    expect(resistPull(0)).toBe(0);
    expect(resistPull(-20)).toBe(0);
  });

  it('applies diminishing returns under the max ceiling', () => {
    const small = resistPull(20);
    const large = resistPull(200);
    expect(small).toBeGreaterThan(0);
    expect(small).toBeLessThan(20);
    expect(large).toBeGreaterThan(small);
    expect(large).toBeLessThan(PTR_MAX_PULL);
    expect(resistPull(10_000)).toBeLessThan(PTR_MAX_PULL);
  });
});

describe('isPullArmed / pullProgress', () => {
  it('arms at the threshold', () => {
    expect(isPullArmed(PTR_THRESHOLD - 1)).toBe(false);
    expect(isPullArmed(PTR_THRESHOLD)).toBe(true);
    expect(isPullArmed(PTR_THRESHOLD + 10)).toBe(true);
  });

  it('maps pull to 0..1 progress', () => {
    expect(pullProgress(0)).toBe(0);
    expect(pullProgress(PTR_THRESHOLD / 2)).toBeCloseTo(0.5);
    expect(pullProgress(PTR_THRESHOLD)).toBe(1);
    expect(pullProgress(PTR_THRESHOLD * 2)).toBe(1);
  });
});

describe('isPullToRefreshPath', () => {
  it('allows normal shell routes', () => {
    expect(isPullToRefreshPath(APP_PATHS.home)).toBe(true);
    expect(isPullToRefreshPath(APP_PATHS.matches)).toBe(true);
    expect(isPullToRefreshPath('/shop')).toBe(true);
    expect(isPullToRefreshPath('/live')).toBe(true);
  });

  it('excludes immersive reels, scoring, and live on-air', () => {
    expect(isPullToRefreshPath(APP_PATHS.reels)).toBe(false);
    expect(isPullToRefreshPath(`${APP_PATHS.reels}/12`)).toBe(false);
    expect(isPullToRefreshPath('/matches/9/score')).toBe(false);
    expect(isPullToRefreshPath('/matches/9/toss')).toBe(false);
    expect(isPullToRefreshPath('/live/broadcast/3')).toBe(false);
    expect(isPullToRefreshPath('/live/go-live/3')).toBe(false);
  });
});
