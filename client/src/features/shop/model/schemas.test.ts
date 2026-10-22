import { describe, expect, it } from 'vitest';

import { discountPct, formatPkr } from '../lib/money';
import {
  cartTotals,
  groupCartByVendor,
  parseCart,
  parseOrder,
  parseProduct,
  parseProductList,
  splitOrders,
  toProduct,
} from './schemas';

const productWire = {
  id: 1,
  name: '  Pro Bat  ',
  slug: 'pro-bat',
  price: 10000,
  sale_price: 8000,
  stock_quantity: 3,
  low_stock_threshold: 5,
  is_featured: true,
  is_popular: true,
  is_special_offer: false,
  brand: { id: 1, name: 'SS', slug: 'ss' },
  category: { id: 2, name: 'Bats', slug: 'bats' },
  vendor: { id: 9, store_name: 'Willow Co', slug: 'willow', phone: '+92000' },
  images: [{ path: 'https://cdn.example/bat.jpg' }],
};

describe('formatPkr / discountPct', () => {
  it('formats PKR without decimals', () => {
    expect(formatPkr(21050)).toBe('PKR 21,050');
    expect(formatPkr('1200')).toMatch(/^PKR /);
  });

  it('computes discount percent', () => {
    expect(discountPct(10000, 8000)).toBe(20);
    expect(discountPct(10000, null)).toBeNull();
    expect(discountPct(10000, 10000)).toBeNull();
  });
});

describe('toProduct / parse', () => {
  it('maps wire to domain with sale price', () => {
    const p = toProduct(productWire);
    expect(p.name).toBe('Pro Bat');
    expect(p.unitPrice).toBe(8000);
    expect(p.discountPercent).toBe(20);
    expect(p.lowStock).toBe(true);
    expect(p.vendor?.storeName).toBe('Willow Co');
    expect(p.imageUrls).toEqual(['https://cdn.example/bat.jpg']);
  });

  it('unwraps list and single envelopes', () => {
    expect(
      parseProductList({
        data: [productWire],
        meta: { current_page: 1, last_page: 1, per_page: 15, total: 1 },
        type: 'SUCCESS',
      })
    ).toHaveLength(1);
    expect(parseProduct({ data: productWire, type: 'SUCCESS' }).id).toBe(1);
  });
});

describe('cart totals / grouping', () => {
  it('parses cart and groups by vendor', () => {
    const cart = parseCart({
      data: {
        id: 1,
        items: [
          {
            id: 10,
            product_id: 1,
            vendor_id: 9,
            vendor: { id: 9, store_name: 'Willow Co', slug: 'willow' },
            product: productWire,
            quantity: 2,
            price_snapshot: 8000,
            subtotal: 16000,
          },
        ],
        items_count: 2,
        subtotal: 16000,
        vendor_groups: [
          {
            vendor: { id: 9, store_name: 'Willow Co', slug: 'willow' },
            items: [
              {
                id: 10,
                product_id: 1,
                vendor_id: 9,
                quantity: 2,
                price_snapshot: 8000,
                subtotal: 16000,
                product: productWire,
              },
            ],
            subtotal: 16000,
          },
        ],
      },
      type: 'SUCCESS',
    });

    expect(cart.subtotal).toBe(16000);
    expect(cart.vendorGroups).toHaveLength(1);
    expect(cart.vendorGroups[0]?.subtotal).toBe(16000);

    const totals = cartTotals(cart.subtotal, 250, 0);
    expect(totals.total).toBe(16250);

    const grouped = groupCartByVendor(cart.items);
    expect(grouped).toHaveLength(1);
  });
});

describe('orders', () => {
  it('maps cancelability and current/previous split', () => {
    const pending = parseOrder({
      data: {
        id: 5,
        order_number: 'ORD-5',
        status: 'pending',
        payment_status: 'unpaid',
        subtotal: 100,
        shipping_amount: 20,
        discount_amount: 0,
        total: 120,
        items: [],
        created_at: '2026-10-01T00:00:00Z',
      },
      type: 'SUCCESS',
    });
    expect(pending.canCancel).toBe(true);
    expect(pending.isCurrent).toBe(true);

    const delivered = parseOrder({
      data: {
        id: 6,
        order_number: 'ORD-6',
        status: 'delivered',
        payment_status: 'paid',
        subtotal: 100,
        shipping_amount: 0,
        total: 100,
        items: [],
        created_at: '2026-09-01T00:00:00Z',
      },
      type: 'SUCCESS',
    });
    expect(delivered.canCancel).toBe(false);
    expect(delivered.paid).toBe(true);

    const split = splitOrders([pending, delivered]);
    expect(split.current.map((o) => o.id)).toEqual([5]);
    expect(split.previous.map((o) => o.id)).toEqual([6]);
  });
});
