import { describe, expect, it } from 'vitest';

import {
  highlightHasVideo,
  highlightIsUpload,
  highlightShareActionLabel,
  highlightYoutubeSrc,
} from './highlightDetail';

describe('highlightHasVideo', () => {
  it('requires a video URL', () => {
    expect(highlightHasVideo({ videoUrl: 'https://x' })).toBe(true);
    expect(highlightHasVideo({ videoUrl: null })).toBe(false);
  });
});

describe('highlightIsUpload', () => {
  it('is true for upload sources with a URL', () => {
    expect(highlightIsUpload({ videoSource: 'upload', videoUrl: 'https://cdn/v.mp4' })).toBe(true);
    expect(highlightIsUpload({ videoSource: 'youtube', videoUrl: 'https://youtu.be/a' })).toBe(false);
  });
});

describe('highlightYoutubeSrc', () => {
  it('returns null for non-youtube sources', () => {
    expect(highlightYoutubeSrc({ videoSource: 'upload', videoUrl: 'https://cdn/v.mp4' })).toBeNull();
  });
});

describe('highlightShareActionLabel', () => {
  it('includes a compact count when shares > 0', () => {
    expect(highlightShareActionLabel(0)).toBe('Share');
    expect(highlightShareActionLabel(12)).toContain('Share');
  });
});
