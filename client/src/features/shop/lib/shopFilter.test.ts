import { describe, expect, it } from 'vitest';

import { resolveShopFilterKind, shopFilterGridStatus, shopFilterShowsFeatured, shopFilterTitle } from './shopFilter';

describe('resolveShopFilterKind', () => {
  it('accepts known kinds only', () => {
    expect(resolveShopFilterKind('popular')).toBe('popular');
    expect(resolveShopFilterKind('featured')).toBe('featured');
    expect(resolveShopFilterKind('nope')).toBeNull();
    expect(resolveShopFilterKind(undefined)).toBeNull();
  });
});

describe('shopFilterTitle', () => {
  it('maps kind to collection title', () => {
    expect(shopFilterTitle('special-offer')).toBe('Special Offer');
    expect(shopFilterTitle('popular')).toBe('Most Popular');
  });
});

describe('shopFilterShowsFeatured', () => {
  it('is true only for featured', () => {
    expect(shopFilterShowsFeatured('featured')).toBe(true);
    expect(shopFilterShowsFeatured('popular')).toBe(false);
  });
});

describe('shopFilterGridStatus', () => {
  it('prefers loading then error', () => {
    expect(shopFilterGridStatus(true, true)).toBe('loading');
    expect(shopFilterGridStatus(false, true)).toBe('error');
    expect(shopFilterGridStatus(false, false)).toBe('ready');
  });
});
