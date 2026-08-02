import { describe, expect, it } from 'vitest';

import { buildPostDetailPath, buildPostShareUrl } from '../postShareUtils';

describe('buildPostDetailPath', () => {
  it('routes video posts to reels', () => {
    expect(buildPostDetailPath({ id: 9, type: 'video' })).toBe('/reels/9');
  });

  it('routes text/image/repost to feed detail', () => {
    expect(buildPostDetailPath({ id: 3, type: 'text' })).toBe('/feed/3');
    expect(buildPostDetailPath({ id: 4, type: 'image' })).toBe('/feed/4');
    expect(buildPostDetailPath({ id: 5, type: 'repost' })).toBe('/feed/5');
  });

  it('falls back when id missing', () => {
    expect(buildPostDetailPath(null)).toBe('/');
  });
});

describe('buildPostShareUrl', () => {
  it('builds absolute https url', () => {
    expect(buildPostShareUrl({ id: 3, type: 'text' }, 'https://tapeya.com')).toBe('https://tapeya.com/feed/3');
    expect(buildPostShareUrl({ id: 9, type: 'video' }, 'https://tapeya.com')).toBe('https://tapeya.com/reels/9');
  });
});
