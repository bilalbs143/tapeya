import { describe, expect, it } from 'vitest';

import {
  parseSellerShippingAmount,
  sellerStoreCanEdit,
  sellerStoreIntro,
  sellerStoreSlugLine,
  validateSellerStoreName,
} from './sellerStore';

describe('sellerStoreCanEdit', () => {
  it('only approved stores are editable', () => {
    expect(sellerStoreCanEdit('approved')).toBe(true);
    expect(sellerStoreCanEdit('pending')).toBe(false);
  });
});

describe('sellerStoreIntro', () => {
  it('switches read-only vs edit copy', () => {
    expect(sellerStoreIntro(false, 'Pending')).toContain('read-only');
    expect(sellerStoreIntro(false, 'Pending')).toContain('Pending');
    expect(sellerStoreIntro(true, 'Approved')).toContain('flat shipping');
  });
});

describe('sellerStoreSlugLine', () => {
  it('formats or returns null', () => {
    expect(sellerStoreSlugLine('acme')).toBe('tapeya.com/shop/acme');
    expect(sellerStoreSlugLine(null)).toBeNull();
  });
});

describe('validateSellerStoreName', () => {
  it('requires a non-empty name', () => {
    expect(validateSellerStoreName('  ')).toEqual({ storeName: 'Store name is required.' });
    expect(validateSellerStoreName('Acme')).toEqual({});
  });
});

describe('parseSellerShippingAmount', () => {
  it('falls back to 0 for non-numeric', () => {
    expect(parseSellerShippingAmount('250')).toBe(250);
    expect(parseSellerShippingAmount('x')).toBe(0);
  });
});
