import { describe, expect, it } from 'vitest';

import { shopHomeRailsBare, shopSearchResultsHeading } from './shopHome';

describe('shopSearchResultsHeading', () => {
  it('pluralizes results', () => {
    expect(shopSearchResultsHeading(0)).toBe('0 results');
    expect(shopSearchResultsHeading(1)).toBe('1 result');
    expect(shopSearchResultsHeading(4)).toBe('4 results');
  });
});

describe('shopHomeRailsBare', () => {
  it('is bare only when both rails are empty', () => {
    expect(shopHomeRailsBare(0, 0)).toBe(true);
    expect(shopHomeRailsBare(1, 0)).toBe(false);
    expect(shopHomeRailsBare(0, 2)).toBe(false);
  });
});
