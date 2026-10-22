import { describe, expect, it } from 'vitest';

import {
  filterSellerProducts,
  sellerProductsCanEdit,
  sellerProductsIntro,
  sellerProductsNoMatchDescription,
  sellerProductThumbInitials,
} from './sellerProducts';

describe('sellerProductsCanEdit', () => {
  it('requires approved status', () => {
    expect(sellerProductsCanEdit('approved')).toBe(true);
    expect(sellerProductsCanEdit('pending')).toBe(false);
  });
});

describe('sellerProductsIntro', () => {
  it('switches read-only vs manage copy', () => {
    expect(sellerProductsIntro(false, 'Pending')).toContain('Pending');
    expect(sellerProductsIntro(true, 'Approved')).toContain('Manage your catalog');
  });
});

describe('filterSellerProducts', () => {
  const products = [
    { name: 'Bat', brandName: 'SS', categoryName: 'Gear' },
    { name: 'Ball', brandName: null, categoryName: 'Gear' },
  ];

  it('filters by name/brand/category', () => {
    expect(filterSellerProducts(products, '')).toHaveLength(2);
    expect(filterSellerProducts(products, 'ss')).toEqual([products[0]]);
    expect(filterSellerProducts(products, 'ball')).toEqual([products[1]]);
  });
});

describe('sellerProductsNoMatchDescription', () => {
  it('embeds the query', () => {
    expect(sellerProductsNoMatchDescription('xyz')).toContain('“xyz”');
  });
});

describe('sellerProductThumbInitials', () => {
  it('uppercases first two chars', () => {
    expect(sellerProductThumbInitials('bat')).toBe('BA');
  });
});
