import { describe, expect, it } from 'vitest';

import { normalizeShopSlug, resolveShopSlugBrand } from './shopSlug';

describe('normalizeShopSlug', () => {
  it('trims and defaults empty', () => {
    expect(normalizeShopSlug('  bats  ')).toBe('bats');
    expect(normalizeShopSlug(undefined)).toBe('');
  });
});

describe('resolveShopSlugBrand', () => {
  const brands = [
    { id: 1, slug: 'ss' },
    { id: 2, slug: 'gm' },
  ];

  it('matches slug or id and skips when vendor present', () => {
    expect(resolveShopSlugBrand(brands, 'ss', false)?.id).toBe(1);
    expect(resolveShopSlugBrand(brands, '2', false)?.id).toBe(2);
    expect(resolveShopSlugBrand(brands, 'ss', true)).toBeNull();
    expect(resolveShopSlugBrand(brands, '', false)).toBeNull();
    expect(resolveShopSlugBrand(brands, 'nope', false)).toBeNull();
  });
});
