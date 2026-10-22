import { describe, expect, it } from 'vitest';

import { sellerBrandsCanEdit, sellerBrandsIntro, sellerBrandSlugLine, sellerBrandThumbInitials } from './sellerBrands';

describe('sellerBrandsCanEdit', () => {
  it('requires approved status', () => {
    expect(sellerBrandsCanEdit('approved')).toBe(true);
    expect(sellerBrandsCanEdit('pending')).toBe(false);
  });
});

describe('sellerBrandsIntro', () => {
  it('switches read-only vs tip copy', () => {
    expect(sellerBrandsIntro(false, 'Pending')).toContain('Pending');
    expect(sellerBrandsIntro(true, 'Approved')).toContain('Add missing brands');
  });
});

describe('sellerBrandSlugLine', () => {
  it('prefixes slug or returns null', () => {
    expect(sellerBrandSlugLine('ss')).toBe('/ss');
    expect(sellerBrandSlugLine(null)).toBeNull();
  });
});

describe('sellerBrandThumbInitials', () => {
  it('uppercases first two chars', () => {
    expect(sellerBrandThumbInitials('ss')).toBe('SS');
  });
});
