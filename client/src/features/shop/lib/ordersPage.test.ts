import { describe, expect, it } from 'vitest';

import { buyerOrderCardTitle, buyerOrderExtraItemsLabel } from './ordersPage';

describe('buyerOrderCardTitle', () => {
  it('falls back to Order', () => {
    expect(buyerOrderCardTitle('Bat')).toBe('Bat');
    expect(buyerOrderCardTitle(null)).toBe('Order');
  });
});

describe('buyerOrderExtraItemsLabel', () => {
  it('null when none extra; pluralizes otherwise', () => {
    expect(buyerOrderExtraItemsLabel(0)).toBeNull();
    expect(buyerOrderExtraItemsLabel(1)).toBe('+1 more item');
    expect(buyerOrderExtraItemsLabel(3)).toBe('+3 more items');
  });
});
