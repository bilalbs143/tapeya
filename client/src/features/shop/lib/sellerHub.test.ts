import { describe, expect, it } from 'vitest';

import { needsVendorApply, sellerHubMetricItems, sellerHubNavItems, sellerHubStorePublicUrl } from './sellerHub';

describe('needsVendorApply', () => {
  it('treats 404 as apply', () => {
    expect(needsVendorApply({ status: 404, data: undefined })).toBe(true);
  });

  it('treats VENDOR_PROFILE_REQUIRED 403 as apply', () => {
    expect(needsVendorApply({ status: 403, data: { type: 'VENDOR_PROFILE_REQUIRED' } })).toBe(true);
  });

  it('rejects other errors', () => {
    expect(needsVendorApply({ status: 403, data: { type: 'FORBIDDEN' } })).toBe(false);
    expect(needsVendorApply({ status: 500, data: undefined })).toBe(false);
    expect(needsVendorApply(null)).toBe(false);
  });
});

describe('sellerHubStorePublicUrl', () => {
  it('builds the public shop URL', () => {
    expect(sellerHubStorePublicUrl('acme-gear')).toBe('https://tapeya.com/shop/acme-gear');
  });
});

describe('sellerHubMetricItems', () => {
  it('returns two cards while pending', () => {
    expect(sellerHubMetricItems(true, null)).toHaveLength(2);
  });

  it('marks out-of-stock as danger when > 0', () => {
    const items = sellerHubMetricItems(false, {
      openOrders: 1,
      activeProducts: 2,
      outOfStock: 3,
      earnings30d: 100,
      totalProducts: 5,
    });
    expect(items.find((m) => m.label === 'Out of Stock')?.tone).toBe('danger');
  });
});

describe('sellerHubNavItems', () => {
  it('omits brands/categories while pending', () => {
    const labels = sellerHubNavItems(true, true, null).map((n) => n.label);
    expect(labels).toEqual(['Orders', 'Products', 'Store Settings']);
  });

  it('includes brands and categories when approved', () => {
    const labels = sellerHubNavItems(false, false, null).map((n) => n.label);
    expect(labels).toContain('Brands');
    expect(labels).toContain('Categories');
  });
});
