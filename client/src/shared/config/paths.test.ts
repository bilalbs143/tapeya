import { describe, expect, it } from 'vitest';

import { isFixedHeightShellPath, isHighlightDetailPath, isLiveWatchPath, isPostDetailPath } from './paths';

describe('fixed-height shell paths', () => {
  it('matches live watch, highlight detail, and post detail', () => {
    expect(isLiveWatchPath('/live/broadcast/12')).toBe(true);
    expect(isHighlightDetailPath('/highlights/9')).toBe(true);
    expect(isPostDetailPath('/feed/3')).toBe(true);
    expect(isFixedHeightShellPath('/live/broadcast/12')).toBe(true);
    expect(isFixedHeightShellPath('/highlights/9')).toBe(true);
    expect(isFixedHeightShellPath('/feed/3')).toBe(true);
  });

  it('rejects hubs and unrelated routes', () => {
    expect(isFixedHeightShellPath('/live')).toBe(false);
    expect(isFixedHeightShellPath('/live/go-live/1')).toBe(false);
    expect(isFixedHeightShellPath('/highlights')).toBe(false);
    expect(isFixedHeightShellPath('/highlights/abc')).toBe(false);
    expect(isFixedHeightShellPath('/feed')).toBe(false);
    expect(isPostDetailPath('/feed/abc')).toBe(false);
    expect(isFixedHeightShellPath('/')).toBe(false);
  });
});
