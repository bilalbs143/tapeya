import { describe, expect, it } from 'vitest';

import { cartCheckoutLabel, cartVendorGroupKey } from './cartPage';

describe('cartVendorGroupKey', () => {
  it('prefers id, then slug, then fallback', () => {
    expect(cartVendorGroupKey({ id: 7, slug: 'acme' })).toBe('7');
    expect(cartVendorGroupKey({ id: null, slug: 'acme' })).toBe('acme');
    expect(cartVendorGroupKey(null)).toBe('vendor');
  });
});

describe('cartCheckoutLabel', () => {
  it('prefixes the formatted total', () => {
    expect(cartCheckoutLabel('PKR 1,200')).toBe('Checkout · PKR 1,200');
  });
});
