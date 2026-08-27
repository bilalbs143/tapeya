// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';

import { handlePrimaryTabClick, isReselectableTabPath } from '../tabReselect';

describe('isReselectableTabPath', () => {
  it('only reselects exact Home and Reels roots', () => {
    expect(isReselectableTabPath('/home', '/home')).toBe(true);
    expect(isReselectableTabPath('/reels', '/reels')).toBe(true);
    expect(isReselectableTabPath('/reels/12', '/reels')).toBe(false);
    expect(isReselectableTabPath('/reels/u/9', '/reels')).toBe(false);
    expect(isReselectableTabPath('/reels/upload', '/reels')).toBe(false);
    expect(isReselectableTabPath('/shop', '/shop')).toBe(false);
    expect(isReselectableTabPath('/home', '/reels')).toBe(false);
  });
});

describe('handlePrimaryTabClick', () => {
  it('consumes a Home re-tap and leaves other tabs alone', () => {
    const event = { preventDefault: vi.fn() };
    expect(handlePrimaryTabClick(event, '/home', '/home')).toBe(true);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);

    event.preventDefault.mockClear();
    expect(handlePrimaryTabClick(event, '/reels/12', '/reels')).toBe(false);
    expect(handlePrimaryTabClick(event, '/shop', '/shop')).toBe(false);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
