import { describe, expect, it } from 'vitest';

import {
  resolveShopVendorProducts,
  shopVendorCatalogFiltered,
  shopVendorChipCategories,
  shopVendorGridStatus,
} from './shopVendor';

describe('shopVendorCatalogFiltered', () => {
  it('is filtered when search or category is set', () => {
    expect(shopVendorCatalogFiltered('', null)).toBe(false);
    expect(shopVendorCatalogFiltered('bat', null)).toBe(true);
    expect(shopVendorCatalogFiltered('', 3)).toBe(true);
  });
});

describe('resolveShopVendorProducts', () => {
  it('prefers query results when filtered or non-empty', () => {
    expect(resolveShopVendorProducts({ filtered: true, fromQuery: [{ id: 1 }], embedded: [{ id: 9 }] })).toEqual([
      { id: 1 },
    ]);
    expect(resolveShopVendorProducts({ filtered: false, fromQuery: [], embedded: [{ id: 9 }] })).toEqual([{ id: 9 }]);
  });
});

describe('shopVendorChipCategories', () => {
  it('keeps categories present on products, else all', () => {
    const cats = [
      { id: 1, name: 'A' },
      { id: 2, name: 'B' },
    ];
    expect(shopVendorChipCategories(cats, [{ categoryId: 2 }])).toEqual([{ id: 2, name: 'B' }]);
    expect(shopVendorChipCategories(cats, [{ categoryId: null }])).toEqual(cats);
  });
});

describe('shopVendorGridStatus', () => {
  it('maps loading/error only when empty', () => {
    expect(shopVendorGridStatus(true, false, false)).toBe('loading');
    expect(shopVendorGridStatus(false, true, false)).toBe('error');
    expect(shopVendorGridStatus(true, true, true)).toBe('ready');
  });
});
