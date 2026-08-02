import { describe, expect, it } from 'vitest';

import { mergeCursorPages, normalizeCursorPage, normalizePost } from '@/store/api/feedApi';

describe('normalizePost', () => {
  it('returns null for non-objects', () => {
    expect(normalizePost(null)).toBeNull();
    expect(normalizePost(undefined)).toBeNull();
    expect(normalizePost('x')).toBeNull();
  });

  it('maps API fields including background_id and viewer', () => {
    const post = normalizePost({
      id: 7,
      type: 'text',
      body: 'Hello',
      background_id: 'bats',
      counts: { likes: 3, comments: 1, shares: 0, reposts: 0, views: 9 },
      viewer: { liked: true, saved: false, following_creator: true },
      creator: { id: 2, name: 'Ali', nickname: 'ali', avatar_url: null, is_official: true },
      published_at: '2026-07-27T10:00:00Z',
    });

    expect(post).toMatchObject({
      id: 7,
      type: 'text',
      body: 'Hello',
      backgroundId: 'bats',
      likesCount: 3,
      liked: true,
      followingCreator: true,
      authorName: 'Ali',
      authorIsOfficial: true,
      handle: '@ali',
    });
  });

  it('defaults authorIsOfficial to false when missing', () => {
    const post = normalizePost({
      id: 1,
      type: 'text',
      body: 'Hi',
      counts: {},
      viewer: {},
      creator: { id: 2, name: 'Ali' },
    });
    expect(post.authorIsOfficial).toBe(false);
  });

  it('does not invent a title for caption-less video posts', () => {
    const post = normalizePost({
      id: 9,
      type: 'video',
      body: null,
      caption: null,
      counts: {},
      viewer: {},
      creator: { id: 2, name: 'Ali' },
      playback: { poster_url: 'https://cdn.example/p.webp' },
    });
    expect(post.title).toBe('');
    expect(post.description).toBe('');
    expect(post.body).toBe('');
  });

  it('maps the latest comment preview and its author', () => {
    const post = normalizePost({
      id: 8,
      type: 'text',
      body: 'Post',
      counts: { comments: 1 },
      viewer: {},
      creator: { id: 2, name: 'Ali' },
      latest_comment: {
        id: 12,
        body: 'Great innings',
        created_at: '2026-07-30T01:00:00Z',
        user: {
          id: 4,
          name: 'Younas Khan',
          nickname: 'younas',
          avatar_url: 'https://example.test/avatar.jpg',
          is_official: true,
        },
      },
    });

    expect(post.latestComment).toEqual({
      id: 12,
      text: 'Great innings',
      createdAt: '2026-07-30T01:00:00Z',
      commenterId: 4,
      commenterName: 'Younas Khan',
      commenterAvatarUrl: 'https://example.test/avatar.jpg',
      commenterIsOfficial: true,
    });
  });
});

describe('normalizeCursorPage', () => {
  it('normalizes items and cursor flags', () => {
    const page = normalizeCursorPage({
      items: [{ id: 1, type: 'text', body: 'A', creator: {}, counts: {}, viewer: {} }],
      next_cursor: 'abc',
      has_more: true,
      per_page: 10,
    });
    expect(page.items).toHaveLength(1);
    expect(page.nextCursor).toBe('abc');
    expect(page.hasMore).toBe(true);
  });
});

describe('mergeCursorPages', () => {
  const page1 = {
    items: [{ id: 1 }, { id: 2 }],
    nextCursor: 'c2',
    hasMore: true,
    perPage: 10,
  };
  const page2 = {
    items: [{ id: 2 }, { id: 3 }],
    nextCursor: 'c3',
    hasMore: false,
    perPage: 10,
  };

  it('replaces cache when there is no cursor (first page / invalidate)', () => {
    expect(mergeCursorPages(page1, page2, {})).toEqual(page2);
    expect(mergeCursorPages(page1, page2, { perPage: 10 })).toEqual(page2);
  });

  it('appends unique items when loading next cursor', () => {
    const merged = mergeCursorPages(page1, page2, { cursor: 'c2', perPage: 10 });
    expect(merged.items.map((p) => p.id)).toEqual([1, 2, 3]);
    expect(merged.nextCursor).toBe('c3');
    expect(merged.hasMore).toBe(false);
  });

  it('replaces when current cache is empty even with cursor', () => {
    expect(mergeCursorPages({ items: [] }, page2, { cursor: 'c2' })).toEqual(page2);
  });
});
