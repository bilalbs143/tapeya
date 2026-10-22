import { describe, expect, it } from 'vitest';

import { parseSellerShippingAmount, SELLER_APPLY_INTRO, validateSellerStoreName } from './sellerApply';

describe('sellerApply re-exports', () => {
  it('keeps store-name and shipping helpers', () => {
    expect(validateSellerStoreName('')).toEqual({ storeName: 'Store name is required.' });
    expect(parseSellerShippingAmount('x')).toBe(0);
  });

  it('exposes apply intro copy', () => {
    expect(SELLER_APPLY_INTRO).toContain('two working days');
  });
});
