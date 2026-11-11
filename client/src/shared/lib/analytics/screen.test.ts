/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';

const setCurrentScreen = vi.fn(async () => undefined);
const logPageView = vi.fn(async () => undefined);
const isNativePlatform = vi.fn(() => false);

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform() },
}));

vi.mock('./google', () => ({
  logPageView,
}));

vi.mock('@capacitor-firebase/analytics', () => ({
  FirebaseAnalytics: { setCurrentScreen },
}));

describe('logScreenView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isNativePlatform.mockReturnValue(false);
    vi.resetModules();
  });

  it('uses gtag page_view on web', async () => {
    const { logScreenView } = await import('./screen');
    await logScreenView('/feed');
    expect(logPageView).toHaveBeenCalledWith('/feed', undefined);
    expect(setCurrentScreen).not.toHaveBeenCalled();
  });

  it('uses Firebase screen_view on native', async () => {
    isNativePlatform.mockReturnValue(true);
    const { logScreenView } = await import('./screen');
    await logScreenView('/reels', 'Reels');
    expect(setCurrentScreen).toHaveBeenCalledWith({
      screenName: '/reels',
      screenClassOverride: 'Reels',
    });
    expect(logPageView).not.toHaveBeenCalled();
  });

  it('omits screenClassOverride when title is absent', async () => {
    isNativePlatform.mockReturnValue(true);
    const { logScreenView } = await import('./screen');
    await logScreenView('/shop');
    expect(setCurrentScreen).toHaveBeenCalledWith({ screenName: '/shop' });
  });
});
