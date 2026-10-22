import { describe, expect, it } from 'vitest';

import {
  compactCount,
  filterByTitle,
  formatHighlightDuration,
  parseHighlight,
  parseHighlightList,
  relatedHighlights,
  sortByRecent,
  sortByViews,
  toDomain,
} from './schemas';

describe('toDomain / parse', () => {
  it('maps wire fields and duration labels', () => {
    const h = toDomain({
      id: 1,
      title: '  Clip ',
      duration: '20',
      video_source: 'upload',
      views_count: 10,
      likes_count: 2,
      created_at: '2026-10-01T00:00:00Z',
    });
    expect(h.title).toBe('Clip');
    expect(h.duration).toBe('20 min');
    expect(h.videoSource).toBe('upload');
    expect(formatHighlightDuration('4 min')).toBe('4 min');
  });

  it('unwraps list and single envelopes', () => {
    expect(
      parseHighlightList({
        data: [{ id: 1, title: 'A' }],
        type: 'SUCCESS',
      })
    ).toHaveLength(1);
    expect(
      parseHighlight({
        data: { id: 2, title: 'B', video_source: 'youtube' },
        type: 'SUCCESS',
      }).id
    ).toBe(2);
  });
});

describe('sort / filter / related', () => {
  const items = [
    toDomain({ id: 1, title: 'Alpha hat-trick', views_count: 5, created_at: '2026-01-01T00:00:00Z' }),
    toDomain({ id: 2, title: 'Beta finish', views_count: 50, created_at: '2026-06-01T00:00:00Z' }),
    toDomain({ id: 3, title: 'Gamma', views_count: 20, created_at: '2026-03-01T00:00:00Z' }),
  ];

  it('sorts by recent and views', () => {
    expect(sortByRecent(items).map((h) => h.id)).toEqual([2, 3, 1]);
    expect(sortByViews(items).map((h) => h.id)).toEqual([2, 3, 1]);
  });

  it('filters by title and related', () => {
    expect(filterByTitle(items, 'hat').map((h) => h.id)).toEqual([1]);
    expect(relatedHighlights(items, 2, 2).map((h) => h.id)).toEqual([1, 3]);
  });

  it('compacts counts', () => {
    expect(compactCount(999)).toBe('999');
    expect(compactCount(1500)).toBe('1.5k');
    expect(compactCount(12_000)).toBe('12k');
  });
});
