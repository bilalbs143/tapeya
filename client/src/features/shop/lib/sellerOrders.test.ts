import { describe, expect, it } from 'vitest';

import {
  sellerOrderCardTitle,
  sellerOrderItemsMeta,
  sellerOrdersCanEdit,
  sellerOrdersReadOnlyNote,
  sellerOrderThumbInitials,
  sellerOrderTrackingLine,
} from './sellerOrders';

describe('sellerOrdersCanEdit', () => {
  it('only approved stores can edit', () => {
    expect(sellerOrdersCanEdit('approved')).toBe(true);
    expect(sellerOrdersCanEdit('pending')).toBe(false);
  });
});

describe('sellerOrdersReadOnlyNote', () => {
  it('includes status label', () => {
    expect(sellerOrdersReadOnlyNote('Pending')).toContain('Pending');
  });
});

describe('sellerOrderItemsMeta', () => {
  it('pluralizes and appends placed label', () => {
    expect(sellerOrderItemsMeta(1, null)).toBe('1 item');
    expect(sellerOrderItemsMeta(2, 'Yesterday')).toBe('2 items · Yesterday');
  });
});

describe('sellerOrderTrackingLine', () => {
  it('joins carrier and tracking', () => {
    expect(sellerOrderTrackingLine('TCS', 'AB12')).toBe('TCS · AB12');
    expect(sellerOrderTrackingLine(null, null)).toBeNull();
  });
});

describe('sellerOrderCardTitle', () => {
  it('prefers customer then first item', () => {
    expect(sellerOrderCardTitle({ customerName: 'Ali', firstItemName: 'Bat' })).toBe('Ali');
    expect(sellerOrderCardTitle({ customerName: null, firstItemName: 'Bat' })).toBe('Bat');
    expect(sellerOrderCardTitle({ customerName: null, firstItemName: null })).toBe('Order');
  });
});

describe('sellerOrderThumbInitials', () => {
  it('uses first two chars uppercased', () => {
    expect(sellerOrderThumbInitials('bat', 'VO-1')).toBe('BA');
    expect(sellerOrderThumbInitials(null, 'vo-9')).toBe('VO');
  });
});
