import { describe, expect, it } from 'vitest';

import { mapAppParamsToPixel } from '../facebookPixel.js';

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
