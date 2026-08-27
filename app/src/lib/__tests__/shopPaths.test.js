import { describe, expect, it } from 'vitest';

import { buildShopBrandPath, buildShopProductPath, buildShopVendorPath } from '../shopPaths';

describe('buildShopVendorPath', () => {
  it('uses a short store URL', () => {
    expect(buildShopVendorPath('tapeya-house')).toBe('/shop/tapeya-house');
  });
});

describe('buildShopBrandPath', () => {
  it('uses /shop/brands so a vendor with the same slug does not win', () => {
    expect(buildShopBrandPath('tm-sports')).toBe('/shop/brands/tm-sports');
  });
});

describe('buildShopProductPath', () => {
  it('uses vendor/product slugs with no extra prefixes', () => {
    expect(
      buildShopProductPath({
        slug: 'big-sixer',
        vendor: { slug: 'oneeb-sports' },
      }),
    ).toBe('/shop/oneeb-sports/big-sixer');
  });

  it('reads vendorSlug on the product', () => {
    expect(buildShopProductPath({ slug: 'big-sixer', vendorSlug: 'tapeya-house' })).toBe('/shop/tapeya-house/big-sixer');
  });

  it('returns null without vendor or product slug', () => {
    expect(buildShopProductPath({ slug: 'big-sixer' })).toBeNull();
    expect(buildShopProductPath({ vendor: { slug: 'sg' } })).toBeNull();
  });
});
