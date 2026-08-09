import { describe, expect, it } from 'vitest';

import {
  dampPull,
  hasOpenModalOverlay,
  isAtScrollTop,
  isVerticalPullGesture,
  PTR_MAX_PULL,
  PTR_THRESHOLD,
  ptrContentOffset,
  shouldTriggerRefresh,
} from '../pullToRefresh';

describe('pull-to-refresh math', () => {
  it('treats the top of a scroller loosely (iOS bounce)', () => {
    expect(isAtScrollTop(0)).toBe(true);
    expect(isAtScrollTop(0.4)).toBe(true);
    expect(isAtScrollTop(24)).toBe(false);
    expect(isAtScrollTop(Number.NaN)).toBe(true);
  });

  it('damps finger travel and triggers at the threshold', () => {
    expect(dampPull(-10)).toBe(0);
    expect(dampPull(100)).toBeGreaterThan(0);
    expect(shouldTriggerRefresh(PTR_THRESHOLD - 1)).toBe(false);
    expect(shouldTriggerRefresh(PTR_THRESHOLD)).toBe(true);
    expect(PTR_MAX_PULL).toBeGreaterThan(PTR_THRESHOLD);
  });

  it('holds the screen down while refreshing, then follows the finger', () => {
    expect(ptrContentOffset(20, false)).toBe(20);
    expect(ptrContentOffset(20, true)).toBe(PTR_THRESHOLD);
    expect(ptrContentOffset(0, false)).toBe(0);
  });

  it('locks out horizontal swipes at the top of the page', () => {
    expect(isVerticalPullGesture(40, 10)).toBe(false);
    expect(isVerticalPullGesture(4, 24)).toBe(true);
  });
});

describe('hasOpenModalOverlay', () => {
  it('is false without a document root', () => {
    expect(hasOpenModalOverlay(null)).toBe(false);
  });

  it('detects an open Radix dialog', () => {
    const root = {
      querySelector: (selector) => (selector.includes('[role="dialog"]') ? {} : null),
    };
    expect(hasOpenModalOverlay(root)).toBe(true);
  });
});
