/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { initFacebookPixel, mapAppParamsToPixel } from './facebookPixel';

describe('mapAppParamsToPixel', () => {
  it('maps content, currency, registration method, and value', () => {
    expect(
      mapAppParamsToPixel(
        {
          fb_content_id: '42',
          fb_content_type: 'product',
          fb_currency: 'PKR',
          fb_registration_method: 'phone',
        },
        1499
      )
    ).toEqual({
      content_ids: ['42'],
      content_type: 'product',
      currency: 'PKR',
      registration_method: 'phone',
      value: 1499,
    });
  });

  it('returns empty object when no params', () => {
    expect(mapAppParamsToPixel()).toEqual({});
  });
});

describe('initFacebookPixel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    delete window.__facebookPixelInitialized;
    delete window.fbq;
    document.querySelectorAll('script[data-tapeya-fb-pixel]').forEach((el) => el.remove());
  });

  it('loads fbevents and marks initialized', async () => {
    const readyPromise = initFacebookPixel('123456789');
    const script = document.querySelector('script[data-tapeya-fb-pixel]');
    expect(script).toBeTruthy();
    script?.dispatchEvent(new Event('load'));
    await expect(readyPromise).resolves.toBe(true);
    expect(window.__facebookPixelInitialized).toBe(true);
  });
});
