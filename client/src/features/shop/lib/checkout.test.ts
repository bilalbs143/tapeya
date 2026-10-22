import { describe, expect, it } from 'vitest';

import { checkoutPlaceOrderLabel, omitCheckoutError, validateCheckoutAddress } from './checkout';

describe('validateCheckoutAddress', () => {
  it('requires address and city', () => {
    expect(validateCheckoutAddress('  ', '')).toEqual({
      address: 'A delivery address is required.',
      city: 'Pick a city — shipping is quoted from it.',
    });
    expect(validateCheckoutAddress('Street 1', 'Lahore')).toEqual({});
  });
});

describe('omitCheckoutError', () => {
  it('drops one field key', () => {
    expect(omitCheckoutError({ address: 'x', city: 'y' }, 'address')).toEqual({ city: 'y' });
  });
});

describe('checkoutPlaceOrderLabel', () => {
  it('includes total when city is set', () => {
    expect(checkoutPlaceOrderLabel('Lahore', 'Rs 1,200')).toBe('Place Order · Rs 1,200');
    expect(checkoutPlaceOrderLabel('', 'Rs 1,200')).toBe('Place Order');
  });
});
