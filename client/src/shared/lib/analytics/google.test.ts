/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const isNativePlatform = vi.fn(() => false);

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => isNativePlatform() },
}));

describe('google analytics', () => {
  beforeEach(() => {
    isNativePlatform.mockReturnValue(false);
    window.history.pushState({}, '', '/home');
    delete window.__tapeyaGaInitialized;
    delete window.gtag;
    delete window.dataLayer;
    document.querySelectorAll('script[data-tapeya-ga]').forEach((el) => el.remove());
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('loads gtag script and configures measurement id', async () => {
    const { initGoogleAnalytics } = await import('./google');
    const readyPromise = initGoogleAnalytics('G-MR83CQDG6Z');

    const script = document.querySelector('script[data-tapeya-ga]');
    expect(script).toBeTruthy();
    expect(script?.getAttribute('src')).toContain('id=G-MR83CQDG6Z');

    script?.dispatchEvent(new Event('load'));
    await expect(readyPromise).resolves.toBe(true);
    expect(window.__tapeyaGaInitialized).toBe(true);
  });

  it('does not load on native platforms', async () => {
    isNativePlatform.mockReturnValue(true);
    const appendChild = vi.spyOn(document.head, 'appendChild');
    const { initGoogleAnalytics } = await import('./google');

    const ready = await initGoogleAnalytics('G-MR83CQDG6Z');

    expect(ready).toBe(false);
    expect(appendChild).not.toHaveBeenCalled();
  });

  it('sends page_view after init', async () => {
    const { logPageView } = await import('./google');
    const gtag = vi.fn();
    window.gtag = gtag;
    window.__tapeyaGaInitialized = true;

    await logPageView('/quick-match');
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({ page_path: '/quick-match' }));
  });
});
