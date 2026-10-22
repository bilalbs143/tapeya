import { describe, expect, it } from 'vitest';

import { productAddToCartLabel, productMaxQty, productStockLabel, productStockToneClass } from './productDetail';

describe('productMaxQty', () => {
  it('clamps between 1 and 10', () => {
    expect(productMaxQty(0)).toBe(1);
    expect(productMaxQty(3)).toBe(3);
    expect(productMaxQty(50)).toBe(10);
  });
});

describe('productStockLabel', () => {
  it('covers oos, low, and in-stock', () => {
    expect(productStockLabel(true, false, 0)).toBe('Out of Stock');
    expect(productStockLabel(false, true, 2)).toBe('Only 2 Left');
    expect(productStockLabel(false, false, 20)).toBe('In Stock');
  });
});

describe('productStockToneClass', () => {
  it('maps tone tokens', () => {
    expect(productStockToneClass(true, false)).toBe('text-danger-soft');
    expect(productStockToneClass(false, true)).toBe('text-brand-text');
    expect(productStockToneClass(false, false)).toBe('text-positive-2');
  });
});

describe('productAddToCartLabel', () => {
  it('switches on stock', () => {
    expect(productAddToCartLabel(true, 'PKR 100')).toBe('Out of Stock');
    expect(productAddToCartLabel(false, 'PKR 100')).toBe('Add to Cart · PKR 100');
  });
});
