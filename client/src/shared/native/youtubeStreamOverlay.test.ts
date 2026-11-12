import { beforeEach, describe, expect, it, vi } from 'vitest';

const getPlatform = vi.fn((): 'web' | 'ios' | 'android' => 'web');
const isNativePlatform = vi.fn(() => false);

vi.mock('@/shared/platform/platform', () => ({
  getPlatform: () => getPlatform(),
  isNativePlatform: () => isNativePlatform(),
}));

vi.mock('@capacitor/core', () => ({
  registerPlugin: () => ({
    show: vi.fn(async () => ({ shown: true })),
    updateLayout: vi.fn(async () => ({ updated: true })),
    hide: vi.fn(async () => ({ hidden: true })),
    getReadyState: vi.fn(async () => ({ ready: false })),
    addListener: vi.fn(async () => ({ remove: () => {} })),
  }),
}));

describe('usesIosNativeYoutubePlayer', () => {
  beforeEach(() => {
    getPlatform.mockReturnValue('web');
    isNativePlatform.mockReturnValue(false);
    vi.resetModules();
  });

  it('is false on web and android', async () => {
    const { usesIosNativeYoutubePlayer, isIosNativeYoutubeLandscape } = await import('./youtubeStreamOverlay');
    expect(usesIosNativeYoutubePlayer()).toBe(false);
    expect(isIosNativeYoutubeLandscape(true)).toBe(false);

    isNativePlatform.mockReturnValue(true);
    getPlatform.mockReturnValue('android');
    expect(usesIosNativeYoutubePlayer()).toBe(false);
    expect(isIosNativeYoutubeLandscape(true)).toBe(false);
  });

  it('is true only on native iOS', async () => {
    isNativePlatform.mockReturnValue(true);
    getPlatform.mockReturnValue('ios');
    const { usesIosNativeYoutubePlayer, isIosNativeYoutubeLandscape } = await import('./youtubeStreamOverlay');
    expect(usesIosNativeYoutubePlayer()).toBe(true);
    expect(isIosNativeYoutubeLandscape(true)).toBe(true);
    expect(isIosNativeYoutubeLandscape(false)).toBe(false);
  });
});

describe('overlay no-ops off iOS', () => {
  beforeEach(() => {
    getPlatform.mockReturnValue('web');
    isNativePlatform.mockReturnValue(false);
    vi.resetModules();
  });

  it('show/hide resolve without calling native', async () => {
    const mod = await import('./youtubeStreamOverlay');
    await expect(mod.showYoutubeStreamOverlay({ url: 'https://example.com/embed/youtube' })).resolves.toEqual({
      shown: false,
    });
    await expect(mod.hideYoutubeStreamOverlay()).resolves.toEqual({ hidden: false });
  });
});
