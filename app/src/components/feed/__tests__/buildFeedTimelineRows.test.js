import { describe, expect, it } from 'vitest';

import { buildFeedTimelineRows } from '@/components/feed/buildFeedTimelineRows';

describe('buildFeedTimelineRows', () => {
  it('emits only posts outside Explore', () => {
    const rows = buildFeedTimelineRows({
      posts: [{ id: 1 }, { id: 2 }],
      tab: 'following',
      shopCollections: [{ id: 'popular', title: 'Popular', products: [{ id: 'p1' }] }],
      brands: [],
      suggestedUsers: [{ id: 'u1' }],
      highlights: [{ id: 'h1' }],
    });

    expect(rows.map((row) => row.type)).toEqual(['post', 'post']);
  });

  it('injects explore widgets after the configured post indexes', () => {
    const posts = Array.from({ length: 7 }, (_, index) => ({ id: index + 1 }));
    const rows = buildFeedTimelineRows({
      posts,
      tab: 'explore',
      shopCollections: [{ id: 'popular', title: 'Popular', products: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }] }],
      brands: [{ id: 1 }],
      suggestedUsers: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }],
      highlights: [{ id: 'h1' }, { id: 'h2' }],
    });

    expect(rows.find((row) => row.type === 'shop')?.key).toBe('shop-3-popular-0');
    expect(rows.find((row) => row.type === 'suggested')?.key).toBe('suggested-5-0');
    expect(rows.find((row) => row.type === 'highlight')?.key).toBe('highlight-7-0');
  });
});
