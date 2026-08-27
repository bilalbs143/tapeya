/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initGoogleAnalytics, logPageView } from '../google.js';

vi.mock('@capacitor/core', () => ({
  Capacitor: { isNativePlatform: () => false },
}));

describe('google analytics', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/home');
    delete window.__tapeyaGaInitialized;
    delete window.gtag;
    delete window.dataLayer;
    document.querySelectorAll('script[data-tapeya-ga]').forEach((el) => el.remove());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads gtag script and configures measurement id', async () => {
    const readyPromise = initGoogleAnalytics('G-MR83CQDG6Z');

    const script = document.querySelector('script[data-tapeya-ga]');
    expect(script).toBeTruthy();
    expect(script.getAttribute('src')).toContain('id=G-MR83CQDG6Z');

    script.dispatchEvent(new Event('load'));
    await expect(readyPromise).resolves.toBe(true);
    expect(window.__tapeyaGaInitialized).toBe(true);
  });

  it('does not load on overlay routes', async () => {
    window.history.pushState({}, '', '/overlay/score');
    const appendChild = vi.spyOn(document.head, 'appendChild');

    const ready = await initGoogleAnalytics('G-MR83CQDG6Z');

    expect(ready).toBe(false);
    expect(appendChild).not.toHaveBeenCalled();
  });

  it('sends page_view after init', async () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    window.__tapeyaGaInitialized = true;

    await logPageView('/quick-match');
    expect(gtag).toHaveBeenCalledWith('event', 'page_view', expect.objectContaining({ page_path: '/quick-match' }));
  });
});
