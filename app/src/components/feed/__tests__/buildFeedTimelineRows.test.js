import { describe, expect, it } from 'vitest';

import { buildFeedTimelineRows } from '@/components/feed/buildFeedTimelineRows';

describe('buildFeedTimelineRows', () => {
  it('emits only posts outside Explore', () => {
    const rows = buildFeedTimelineRows({
      posts: [{ id: 1 }, { id: 2 }],
      tab: 'following',
      shopCollections: [{ id: 'popular', title: 'Popular', products: [{ id: 'p1' }] }],
      suggestedUsers: [{ id: 'u1' }],
      highlights: [{ id: 'h1' }],
      liveStreams: [{ streamId: 99, title: 'Match A' }],
    });

    expect(rows.map((row) => row.type)).toEqual(['post', 'post']);
    expect(rows.map((row) => row.key)).toEqual(['post-1', 'post-2']);
  });

  it('injects explore widgets after the configured post indexes', () => {
    const posts = Array.from({ length: 7 }, (_, index) => ({ id: index + 1 }));
    const rows = buildFeedTimelineRows({
      posts,
      tab: 'explore',
      shopCollections: [{ id: 'popular', title: 'Popular', products: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }] }],
      suggestedUsers: [{ id: 'u1' }, { id: 'u2' }, { id: 'u3' }],
      highlights: [{ id: 'h1' }, { id: 'h2' }],
      liveStreams: [{ streamId: 1, title: 'Stream One' }],
    });

    expect(rows.find((row) => row.type === 'shop')?.key).toBe('shop-3-popular-0');
    expect(rows.find((row) => row.type === 'live')?.key).toBe('live-4-0');
    expect(rows.find((row) => row.type === 'suggested')?.key).toBe('suggested-5-0');
    expect(rows.find((row) => row.type === 'highlight')?.key).toBe('highlight-7-0');
    expect(rows.filter((row) => row.type === 'post').map((row) => row.key)).toEqual([
      'post-1-c0',
      'post-2-c0',
      'post-3-c0',
      'post-4-c0',
      'post-5-c0',
      'post-6-c0',
      'post-7-c0',
    ]);
  });

  it('skips live widgets when there are no active streams', () => {
    const posts = Array.from({ length: 4 }, (_, index) => ({ id: index + 1 }));
    const rows = buildFeedTimelineRows({
      posts,
      tab: 'explore',
      shopCollections: [],
      suggestedUsers: [],
      highlights: [],
      liveStreams: [],
    });

    expect(rows.filter((row) => row.type === 'live')).toHaveLength(0);
    expect(rows.map((row) => row.type)).toEqual(['post', 'post', 'post', 'post']);
  });

  it('rotates one live stream per slot down the Explore timeline', () => {
    const posts = Array.from({ length: 12 }, (_, index) => ({ id: index + 1 }));
    const liveStreams = [
      { streamId: 10, title: 'First Live' },
      { streamId: 11, title: 'Second Live' },
    ];
    const rows = buildFeedTimelineRows({
      posts,
      tab: 'explore',
      shopCollections: [],
      suggestedUsers: [],
      highlights: [],
      liveStreams,
    });

    const liveRows = rows.filter((row) => row.type === 'live');
    expect(liveRows.map((row) => row.key)).toEqual(['live-4-0', 'live-12-1']);
    expect(liveRows.map((row) => row.stream.streamId)).toEqual([10, 11]);
  });

  it('repeats Explore posts with cycle-aware keys and widgets only on cycle 0', () => {
    const posts = Array.from({ length: 4 }, (_, index) => ({ id: index + 10 }));
    const rows = buildFeedTimelineRows({
      posts,
      tab: 'explore',
      cycles: 2,
      shopCollections: [{ id: 'popular', title: 'Popular', products: [{ id: 'p1' }] }],
      suggestedUsers: [],
      highlights: [],
      liveStreams: [{ streamId: 7, title: 'Live Match' }],
    });

    const postKeys = rows.filter((row) => row.type === 'post').map((row) => row.key);
    expect(postKeys).toEqual([
      'post-10-c0',
      'post-11-c0',
      'post-12-c0',
      'post-13-c0',
      'post-10-c1',
      'post-11-c1',
      'post-12-c1',
      'post-13-c1',
    ]);
    expect(rows.filter((row) => row.type === 'shop')).toHaveLength(1);
    expect(rows.find((row) => row.type === 'shop')?.key).toBe('shop-12-popular-0');
    expect(rows.filter((row) => row.type === 'live')).toHaveLength(1);
    expect(rows.find((row) => row.type === 'live')?.key).toBe('live-13-0');
  });

  it('ignores cycles outside Explore so Following never duplicates', () => {
    const rows = buildFeedTimelineRows({
      posts: [{ id: 1 }],
      tab: 'following',
      cycles: 5,
      shopCollections: [],
      suggestedUsers: [],
      highlights: [],
    });

    expect(rows.map((row) => row.key)).toEqual(['post-1']);
  });

  it('injects soft-fresh posts only from freshFromCycle onward', () => {
    const rows = buildFeedTimelineRows({
      posts: [{ id: 1 }],
      tab: 'explore',
      cycles: 2,
      freshItems: [{ id: 9 }],
      freshFromCycle: 1,
      shopCollections: [],
      suggestedUsers: [],
      highlights: [],
    });

    expect(rows.filter((row) => row.type === 'post').map((row) => row.key)).toEqual(['post-1-c0', 'post-9-c1', 'post-1-c1']);
  });
});
