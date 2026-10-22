import { describe, expect, it } from 'vitest';

import {
  sellerCategoriesCanEdit,
  sellerCategoriesIntro,
  sellerCategoryNameById,
  sellerCategoryRowMeta,
  sellerCategoryThumbInitials,
} from './sellerCategories';

describe('sellerCategoriesCanEdit', () => {
  it('requires approved status', () => {
    expect(sellerCategoriesCanEdit('approved')).toBe(true);
    expect(sellerCategoriesCanEdit('pending')).toBe(false);
  });
});

describe('sellerCategoriesIntro', () => {
  it('switches read-only vs tip copy', () => {
    expect(sellerCategoriesIntro(false, 'Pending')).toContain('Pending');
    expect(sellerCategoriesIntro(true, 'Approved')).toContain('Keep them broad');
  });
});

describe('sellerCategoryNameById', () => {
  it('maps id to name', () => {
    const map = sellerCategoryNameById([
      { id: 1, name: 'Bats' },
      { id: 2, name: 'Balls' },
    ]);
    expect(map.get(1)).toBe('Bats');
    expect(map.get(2)).toBe('Balls');
  });
});

describe('sellerCategoryRowMeta', () => {
  it('prefers parent, then slug, then top level', () => {
    expect(sellerCategoryRowMeta('Gear', 'bats')).toBe('Under Gear');
    expect(sellerCategoryRowMeta(null, 'bats')).toBe('/bats');
    expect(sellerCategoryRowMeta(null, null)).toBe('Top Level');
  });
});

describe('sellerCategoryThumbInitials', () => {
  it('uppercases first two chars', () => {
    expect(sellerCategoryThumbInitials('bats')).toBe('BA');
  });
});
