import { describe, expect, it } from 'vitest';

import { isFixedHeightShellPath, isHighlightDetailPath, isLiveWatchPath, isPostDetailPath } from './paths';

describe('media detail path helpers', () => {
  it('matches live watch, highlight detail, and post detail', () => {
    expect(isLiveWatchPath('/live/broadcast/12')).toBe(true);
    expect(isHighlightDetailPath('/highlights/9')).toBe(true);
    expect(isPostDetailPath('/feed/3')).toBe(true);
  });

  it('rejects hubs and unrelated routes', () => {
    expect(isLiveWatchPath('/live')).toBe(false);
    expect(isHighlightDetailPath('/highlights')).toBe(false);
    expect(isHighlightDetailPath('/highlights/abc')).toBe(false);
    expect(isPostDetailPath('/feed')).toBe(false);
    expect(isPostDetailPath('/feed/abc')).toBe(false);
  });
});

describe('fixed-height shell paths', () => {
  it('is empty — media detail uses PageDock instead of the path registry', () => {
    expect(isFixedHeightShellPath('/live/broadcast/12')).toBe(false);
    expect(isFixedHeightShellPath('/highlights/9')).toBe(false);
    expect(isFixedHeightShellPath('/feed/3')).toBe(false);
    expect(isFixedHeightShellPath('/entertainment/1/e/2')).toBe(false);
    expect(isFixedHeightShellPath('/')).toBe(false);
    expect(isFixedHeightShellPath('/create')).toBe(false);
    expect(isFixedHeightShellPath('/create/reel')).toBe(false);
    expect(isFixedHeightShellPath('/quick-match')).toBe(false);
  });
});
