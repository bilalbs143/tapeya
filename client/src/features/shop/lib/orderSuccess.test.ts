import { describe, expect, it } from 'vitest';

import { ORDER_SUCCESS_STATUS_NO_TOTAL, parseOrderSuccessTotal } from './orderSuccess';

describe('parseOrderSuccessTotal', () => {
  it('reads a finite total from location state', () => {
    expect(parseOrderSuccessTotal({ total: 1500 })).toBe(1500);
    expect(parseOrderSuccessTotal({ total: Number.NaN })).toBeNull();
    expect(parseOrderSuccessTotal({})).toBeNull();
    expect(parseOrderSuccessTotal(null)).toBeNull();
  });
});

describe('ORDER_SUCCESS_STATUS_NO_TOTAL', () => {
  it('mentions My Orders', () => {
    expect(ORDER_SUCCESS_STATUS_NO_TOTAL).toContain('My Orders');
  });
});
