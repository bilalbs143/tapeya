import { describe, expect, it } from 'vitest';

import {
  orderBuyerVendorBrief,
  orderCancelConfirmTitle,
  orderItemsHeading,
  orderNonCancelNote,
  parseOrderIdParam,
} from './orderDetail';

describe('parseOrderIdParam', () => {
  it('accepts positive ids only', () => {
    expect(parseOrderIdParam('12')).toBe(12);
    expect(parseOrderIdParam('0')).toBeNull();
    expect(parseOrderIdParam('abc')).toBeNull();
    expect(parseOrderIdParam(undefined)).toBeNull();
  });
});

describe('orderItemsHeading', () => {
  it('pluralizes', () => {
    expect(orderItemsHeading(1)).toBe('1 item');
    expect(orderItemsHeading(3)).toBe('3 items');
  });
});

describe('orderBuyerVendorBrief', () => {
  it('returns null without name or phone', () => {
    expect(orderBuyerVendorBrief(null, null)).toBeNull();
  });

  it('builds a brief when either field is set', () => {
    expect(orderBuyerVendorBrief('Acme', null)?.storeName).toBe('Acme');
    expect(orderBuyerVendorBrief(null, '+92')?.phone).toBe('+92');
    expect(orderBuyerVendorBrief(null, '+92')?.storeName).toBe('Seller');
  });
});

describe('orderCancelConfirmTitle', () => {
  it('includes the order number', () => {
    expect(orderCancelConfirmTitle('TP-1')).toBe('Cancel TP-1?');
  });
});

describe('orderNonCancelNote', () => {
  it('differs for paid vs unpaid', () => {
    expect(orderNonCancelNote(true)).toContain("Paid orders can't be cancelled");
    expect(orderNonCancelNote(false)).toContain('Already being packed');
  });
});
