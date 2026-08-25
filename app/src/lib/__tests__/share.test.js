// @vitest-environment jsdom
import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildCreatorProfileShareUrl,
  buildPostDetailPath,
  buildPostShareUrl,
  buildQuickMatchScorecardPath,
  buildQuickMatchScorecardShareUrl,
  buildReelSharePath,
  buildReelShareUrl,
  resolveCreatorProfilePath,
  resolveOwnProfilePath,
  shareLink,
} from '../share';

vi.mock('@capacitor/core', () => ({
  Capacitor: {
    isNativePlatform: vi.fn(() => false),
  },
}));

vi.mock('@capacitor/share', () => ({
  Share: {
    share: vi.fn(),
  },
}));

describe('shareLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Capacitor.isNativePlatform.mockReturnValue(false);
    delete navigator.share;
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
  });

  it('uses Capacitor Share on native', async () => {
    Capacitor.isNativePlatform.mockReturnValue(true);
    Share.share.mockResolvedValue(undefined);

    await expect(shareLink({ url: 'https://tapeya.com/reels/1' })).resolves.toBe('system_share');
    expect(Share.share).toHaveBeenCalledWith({
      url: 'https://tapeya.com/reels/1',
      dialogTitle: 'Share',
    });
  });

  it('uses navigator.share on web when available', async () => {
    const webShare = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: webShare,
    });

    await expect(shareLink({ url: 'https://tapeya.com/feed/2' })).resolves.toBe('system_share');
    expect(webShare).toHaveBeenCalledWith({ url: 'https://tapeya.com/feed/2' });
  });

  it('falls back to clipboard copy', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await expect(shareLink({ url: 'https://tapeya.com/reels/3' })).resolves.toBe('copy_link');
    expect(writeText).toHaveBeenCalledWith('https://tapeya.com/reels/3');
  });

  it('returns null when user cancels', async () => {
    Capacitor.isNativePlatform.mockReturnValue(true);
    Share.share.mockRejectedValue(Object.assign(new Error('Share canceled'), { name: 'AbortError' }));

    await expect(shareLink({ url: 'https://tapeya.com/feed/1' })).resolves.toBeNull();
  });
});

describe('share URL builders', () => {
  it('builds post paths and urls', () => {
    expect(buildPostDetailPath({ id: 9, type: 'video' })).toBe('/reels/9');
    expect(buildPostDetailPath({ id: 3, type: 'text' })).toBe('/feed/3');
    expect(buildPostShareUrl({ id: 3, type: 'text' })).toMatch(/\/feed\/3$/);
  });

  it('builds reel and creator urls', () => {
    expect(buildReelSharePath(42)).toBe('/reels/42');
    expect(buildReelShareUrl(42)).toMatch(/\/reels\/42$/);
    expect(buildCreatorProfileShareUrl(9)).toMatch(/\/reels\/u\/9$/);
  });

  it('resolves creator profile paths safely for UI links', () => {
    expect(resolveCreatorProfilePath(9)).toBe('/reels/u/9');
    expect(resolveCreatorProfilePath('12')).toBe('/reels/u/12');
    expect(resolveCreatorProfilePath(null)).toBeNull();
    expect(resolveCreatorProfilePath('')).toBeNull();
    expect(resolveCreatorProfilePath(0)).toBeNull();
    expect(resolveCreatorProfilePath(-1)).toBeNull();
    expect(resolveCreatorProfilePath('abc')).toBeNull();
  });

  it('resolves own profile path for nav (main profile is /reels/u/:id)', () => {
    expect(resolveOwnProfilePath(71)).toBe('/reels/u/71');
    expect(resolveOwnProfilePath(null)).toBe('/profile');
    expect(resolveOwnProfilePath('')).toBe('/profile');
  });

  it('builds quick match scorecard share urls', () => {
    expect(buildQuickMatchScorecardPath(901)).toBe('/scorecard/match/901');
    expect(buildQuickMatchScorecardShareUrl(901)).toMatch(/\/scorecard\/match\/901$/);
  });
});
