import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  DEEP_LINK_DEDUP_MS,
  dispatchDeepLinkNavigation,
  planDeepLinkNavigation,
  resetDeepLinkMemory,
} from '../deepLinkNavigation';

describe('planDeepLinkNavigation', () => {
  it('ignores empty targets and the current path', () => {
    expect(planDeepLinkNavigation({ targetPath: null, currentPath: '/' })).toEqual({ action: 'ignore' });
    expect(planDeepLinkNavigation({ targetPath: '/reels/12', currentPath: '/reels/12' })).toEqual({ action: 'ignore' });
  });

  it('replaces splash and pushes once the app is past splash', () => {
    expect(planDeepLinkNavigation({ targetPath: '/reels/12', currentPath: '/' })).toEqual({
      action: 'navigate',
      path: '/reels/12',
      replace: true,
    });
    expect(planDeepLinkNavigation({ targetPath: '/reels/12', currentPath: '/home' })).toEqual({
      action: 'navigate',
      path: '/reels/12',
      replace: false,
    });
  });

  it('dedupes getLaunchUrl + appUrlOpen for the same path', () => {
    const last = { path: '/reels/12', at: 1_000 };
    expect(
      planDeepLinkNavigation({
        targetPath: '/reels/12',
        currentPath: '/home',
        now: 1_000 + DEEP_LINK_DEDUP_MS - 1,
        last,
      }),
    ).toEqual({ action: 'ignore' });
    expect(
      planDeepLinkNavigation({
        targetPath: '/reels/12',
        currentPath: '/home',
        now: 1_000 + DEEP_LINK_DEDUP_MS + 1,
        last,
      }),
    ).toEqual({ action: 'navigate', path: '/reels/12', replace: false });
  });
});

describe('dispatchDeepLinkNavigation', () => {
  afterEach(() => {
    resetDeepLinkMemory();
  });

  it('replaces splash then ignores the duplicate appUrlOpen', () => {
    const navigate = vi.fn();
    expect(dispatchDeepLinkNavigation(navigate, '/reels/12', { currentPath: '/', now: 50 })).toBe(true);
    expect(navigate).toHaveBeenCalledWith('/reels/12', { replace: true });

    navigate.mockClear();
    expect(dispatchDeepLinkNavigation(navigate, '/reels/12', { currentPath: '/reels/12', now: 80 })).toBe(false);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not extend dedupe memory when the plan is ignore', () => {
    const navigate = vi.fn();
    expect(dispatchDeepLinkNavigation(navigate, '/reels/12', { currentPath: '/reels/12', now: 10 })).toBe(false);
    expect(dispatchDeepLinkNavigation(navigate, '/reels/12', { currentPath: '/home', now: 20 })).toBe(true);
    expect(navigate).toHaveBeenCalledWith('/reels/12', { replace: false });
  });
});
