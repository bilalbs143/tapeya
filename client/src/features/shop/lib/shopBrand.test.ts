import { describe, expect, it } from 'vitest';

import { resolveShopBrand, shopBrandGridStatus } from './shopBrand';

describe('resolveShopBrand', () => {
  const brands = [
    { id: 7, slug: 'acme' },
    { id: 9, slug: null },
  ];

  it('matches slug or numeric id string', () => {
    expect(resolveShopBrand(brands, 'acme')?.id).toBe(7);
    expect(resolveShopBrand(brands, '9')?.id).toBe(9);
    expect(resolveShopBrand(brands, 'missing')).toBeNull();
  });
});

describe('shopBrandGridStatus', () => {
  it('prioritizes loading then error', () => {
    expect(shopBrandGridStatus(true, true)).toBe('loading');
    expect(shopBrandGridStatus(false, true)).toBe('error');
    expect(shopBrandGridStatus(false, false)).toBe('ready');
  });
});
