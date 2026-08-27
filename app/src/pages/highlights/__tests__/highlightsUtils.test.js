import { describe, expect, it } from 'vitest';

import { formatHighlightDuration, getHighlightTitle, getMoreHighlights, isValidHighlightId } from '../highlightsUtils';

describe('isValidHighlightId', () => {
  it('accepts positive integers only', () => {
    expect(isValidHighlightId(1)).toBe(true);
    expect(isValidHighlightId('12')).toBe(true);
    expect(isValidHighlightId(0)).toBe(false);
    expect(isValidHighlightId('-1')).toBe(false);
    expect(isValidHighlightId('abc')).toBe(false);
    expect(isValidHighlightId(null)).toBe(false);
  });
});

describe('getMoreHighlights', () => {
  it('excludes the current id and respects limit', () => {
    const list = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
    expect(getMoreHighlights(list, 2, 2)).toEqual([{ id: 1 }, { id: 3 }]);
  });
});

describe('formatHighlightDuration', () => {
  it('appends min for bare numbers and passes through labeled strings', () => {
    expect(formatHighlightDuration(20)).toBe('20 min');
    expect(formatHighlightDuration('5')).toBe('5 min');
    expect(formatHighlightDuration('3 min')).toBe('3 min');
    expect(formatHighlightDuration(null)).toBe('');
  });
});

describe('getHighlightTitle', () => {
  it('prefers detailTitle then title', () => {
    expect(getHighlightTitle({ detailTitle: 'A', title: 'B' })).toBe('A');
    expect(getHighlightTitle({ title: 'B' })).toBe('B');
    expect(getHighlightTitle(null)).toBe('Highlight');
  });
});
