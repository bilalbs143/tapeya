/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import { initFacebookPixel, mapAppParamsToPixel } from '../facebookPixel.js';

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
        1499,
      ),
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
    vi.unstubAllGlobals();
    delete window.__facebookPixelInitialized;
    document.querySelectorAll('script[data-tapeya-fb-pixel]').forEach((el) => el.remove());
  });

  it('does not load fbevents on overlay routes', async () => {
    window.history.pushState({}, '', '/overlay/123');
    const appendChild = vi.spyOn(document.head, 'appendChild');

    const ready = await initFacebookPixel('123456789');

    expect(ready).toBe(false);
    expect(appendChild).not.toHaveBeenCalled();
    expect(document.querySelector('script[data-tapeya-fb-pixel]')).toBeNull();
  });
});
