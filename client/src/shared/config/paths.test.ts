import { describe, expect, it } from 'vitest';

import {
  isEntertainmentEpisodePath,
  isFixedHeightShellPath,
  isHighlightDetailPath,
  isLiveWatchPath,
  isMediaPlayerBottomNavHiddenPath,
  isPostDetailPath,
} from './paths';

describe('media detail path helpers', () => {
  it('matches live watch, highlight detail, episode, and post detail', () => {
    expect(isLiveWatchPath('/live/broadcast/12')).toBe(true);
    expect(isHighlightDetailPath('/highlights/9')).toBe(true);
    expect(isEntertainmentEpisodePath('/entertainment/2/e/1')).toBe(true);
    expect(isPostDetailPath('/feed/3')).toBe(true);
  });

  it('rejects hubs and unrelated routes', () => {
    expect(isLiveWatchPath('/live')).toBe(false);
    expect(isHighlightDetailPath('/highlights')).toBe(false);
    expect(isHighlightDetailPath('/highlights/abc')).toBe(false);
    expect(isEntertainmentEpisodePath('/entertainment')).toBe(false);
    expect(isEntertainmentEpisodePath('/entertainment/2')).toBe(false);
    expect(isPostDetailPath('/feed')).toBe(false);
    expect(isPostDetailPath('/feed/abc')).toBe(false);
  });
});

describe('isMediaPlayerBottomNavHiddenPath', () => {
  it('hides nav for watch, go-live on-air, highlight detail, and episode', () => {
    expect(isMediaPlayerBottomNavHiddenPath('/live/broadcast/12')).toBe(true);
    expect(isMediaPlayerBottomNavHiddenPath('/live/go-live/44')).toBe(true);
    expect(isMediaPlayerBottomNavHiddenPath('/highlights/9')).toBe(true);
    expect(isMediaPlayerBottomNavHiddenPath('/entertainment/2/e/1')).toBe(true);
  });

  it('keeps nav on hubs and lists', () => {
    expect(isMediaPlayerBottomNavHiddenPath('/live')).toBe(false);
    expect(isMediaPlayerBottomNavHiddenPath('/live/go-live')).toBe(false);
    expect(isMediaPlayerBottomNavHiddenPath('/highlights')).toBe(false);
    expect(isMediaPlayerBottomNavHiddenPath('/entertainment')).toBe(false);
    expect(isMediaPlayerBottomNavHiddenPath('/entertainment/2')).toBe(false);
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
