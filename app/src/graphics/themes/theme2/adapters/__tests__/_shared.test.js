import { describe, expect, it } from 'vitest';

import {
  coalescePlayerImageUrl,
  coalescePlayerImageUrlGated,
  resolvePlayerImageUrl,
  resolvePlayerImageUrlGated,
} from '../_shared';

describe('resolvePlayerImageUrl', () => {
  it('maps common API field shapes to a single avatar URL', () => {
    expect(resolvePlayerImageUrl({ playerImageUrl: 'https://cdn/player.jpg' })).toBe('https://cdn/player.jpg');
    expect(resolvePlayerImageUrl({ avatarUrl: 'https://cdn/avatar.jpg' })).toBe('https://cdn/avatar.jpg');
    expect(resolvePlayerImageUrl({ image_url: 'https://cdn/image.jpg' })).toBe('https://cdn/image.jpg');
    expect(resolvePlayerImageUrl({ imageUrl: 'https://cdn/image-camel.jpg' })).toBe('https://cdn/image-camel.jpg');
    expect(resolvePlayerImageUrl({ avatar_url: 'https://cdn/avatar-snake.jpg' })).toBe('https://cdn/avatar-snake.jpg');
  });

  it('prefers playerImageUrl over other fields', () => {
    expect(
      resolvePlayerImageUrl({
        playerImageUrl: 'https://cdn/player.jpg',
        avatarUrl: 'https://cdn/avatar.jpg',
        image_url: 'https://cdn/image.jpg',
      }),
    ).toBe('https://cdn/player.jpg');
  });

  it('returns null when no portrait field is present', () => {
    expect(resolvePlayerImageUrl({})).toBeNull();
    expect(resolvePlayerImageUrl(null)).toBeNull();
  });
});

describe('coalescePlayerImageUrl', () => {
  it('returns the first non-null portrait URL across rows', () => {
    expect(coalescePlayerImageUrl({}, { image_url: 'https://cdn/first.jpg' }, { avatarUrl: 'https://cdn/second.jpg' })).toBe(
      'https://cdn/first.jpg',
    );
    expect(coalescePlayerImageUrl(null, undefined, { avatarUrl: 'https://cdn/fallback.jpg' })).toBe('https://cdn/fallback.jpg');
    expect(coalescePlayerImageUrl({}, null)).toBeNull();
  });
});

describe('resolvePlayerImageUrlGated', () => {
  const row = { avatarUrl: 'https://cdn/player.jpg' };

  it('returns the URL when enableImages is true', () => {
    expect(resolvePlayerImageUrlGated(row, { enableImages: true })).toBe('https://cdn/player.jpg');
  });

  it('returns null when enableImages is false', () => {
    expect(resolvePlayerImageUrlGated(row, { enableImages: false })).toBeNull();
  });

  it('returns the URL when tokens is null or undefined', () => {
    expect(resolvePlayerImageUrlGated(row, null)).toBe('https://cdn/player.jpg');
    expect(resolvePlayerImageUrlGated(row, undefined)).toBe('https://cdn/player.jpg');
  });

  it('returns null when the row has no portrait field regardless of tokens', () => {
    expect(resolvePlayerImageUrlGated({}, { enableImages: true })).toBeNull();
  });
});

describe('coalescePlayerImageUrlGated', () => {
  const rowA = { avatarUrl: 'https://cdn/a.jpg' };
  const rowB = { avatarUrl: 'https://cdn/b.jpg' };

  it('returns the first URL when enableImages is true', () => {
    expect(coalescePlayerImageUrlGated({ enableImages: true }, {}, rowA, rowB)).toBe('https://cdn/a.jpg');
  });

  it('returns null for all rows when enableImages is false', () => {
    expect(coalescePlayerImageUrlGated({ enableImages: false }, rowA, rowB)).toBeNull();
  });

  it('returns the URL when tokens is null or undefined', () => {
    expect(coalescePlayerImageUrlGated(null, rowA)).toBe('https://cdn/a.jpg');
    expect(coalescePlayerImageUrlGated(undefined, rowA)).toBe('https://cdn/a.jpg');
  });
});
