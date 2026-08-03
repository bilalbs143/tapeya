import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  buildCreatorProfileShareUrl,
  buildPostDetailPath,
  buildPostShareUrl,
  buildReelSharePath,
  buildReelShareUrl,
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
});
