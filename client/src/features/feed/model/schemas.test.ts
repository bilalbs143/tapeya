import { describe, expect, it } from 'vitest';

import { formatDurationMs, formatRelativeAge, type PostWire, toDomain } from '../model/schemas';

describe('toDomain', () => {
  it('maps image wire type to photos kind and flattens media urls', () => {
    const wire: PostWire = {
      id: 9,
      type: 'image',
      body: 'Six!',
      caption: 'Six!',
      background_id: null,
      visibility: 'public',
      media: [
        { id: 1, kind: 'image', url: 'https://cdn.example/a.jpg' },
        { id: 2, kind: 'image', url: null },
      ],
      counts: { likes: 3, comments: 1, shares: 0, reposts: 0 },
      viewer: { liked: true, saved: false, following_creator: true },
      creator: {
        id: 4,
        name: 'Bilal',
        nickname: 'bilal',
        avatar_url: null,
      },
      published_at: '2026-09-01T12:00:00+00:00',
    };

    const post = toDomain(wire);
    expect(post.kind).toBe('photos');
    expect(post.photos).toEqual([{ url: 'https://cdn.example/a.jpg', width: null, height: null }]);
    expect(post.liked).toBe(true);
    expect(post.author).toMatchObject({
      id: 4,
      name: 'Bilal',
      handle: 'bilal',
      following: true,
    });
    expect(post.background).toBeNull();
  });

  it('maps pitch background_id to turf and image type alias', () => {
    const wire: PostWire = {
      id: 1,
      type: 'text',
      body: 'Hello',
      background_id: 'pitch',
      counts: { likes: 0, comments: 0, shares: 0, reposts: 0 },
      viewer: { liked: false, saved: false },
      creator: { id: 1, name: 'A', nickname: 'a', avatar_url: null },
    };
    expect(toDomain(wire).background).toBe('turf');
    expect(toDomain(wire).kind).toBe('text');
  });

  it('unwraps nested repost_of into original + reposter', () => {
    const wire: PostWire = {
      id: 20,
      type: 'repost',
      body: null,
      counts: { likes: 0, comments: 0, shares: 0, reposts: 1 },
      viewer: { liked: false, saved: false },
      creator: { id: 2, name: 'Reposter', nickname: 'rep', avatar_url: null },
      repost_of: {
        id: 5,
        type: 'text',
        body: 'Original thought',
        counts: { likes: 1, comments: 0, shares: 0, reposts: 0 },
        viewer: { liked: false, saved: false },
        creator: { id: 9, name: 'Original', nickname: 'orig', avatar_url: null },
        published_at: '2026-08-01T00:00:00+00:00',
      },
    };

    const post = toDomain(wire);
    expect(post.kind).toBe('repost');
    expect(post.reposter).toEqual({ name: 'Reposter' });
    expect(post.original).toMatchObject({
      id: 5,
      body: 'Original thought',
      author: { handle: 'orig', name: 'Original' },
    });
  });
});

describe('formatters', () => {
  it('formats duration ms as m:ss', () => {
    expect(formatDurationMs(65000)).toBe('1:05');
    expect(formatDurationMs(null)).toBeNull();
  });

  it('formats relative ages without throwing on bad input', () => {
    expect(formatRelativeAge(null)).toBe('');
    expect(formatRelativeAge('not-a-date')).toBe('');
  });
});
