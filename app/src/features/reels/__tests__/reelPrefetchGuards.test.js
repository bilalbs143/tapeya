import { describe, expect, it } from 'vitest';

import { pickPrefetchTarget, prefersReducedData } from '@/features/reels/useReelPrefetch';

describe('prefersReducedData', () => {
  it('skips on save-data', () => {
    const original = navigator.connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '4g' },
    });
    expect(prefersReducedData()).toBe(true);
    Object.defineProperty(navigator, 'connection', { configurable: true, value: original });
  });

  it('skips on 2g', () => {
    const original = navigator.connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, effectiveType: '2g' },
    });
    expect(prefersReducedData()).toBe(true);
    Object.defineProperty(navigator, 'connection', { configurable: true, value: original });
  });

  it('allows warm on 4g without save-data', () => {
    const original = navigator.connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, effectiveType: '4g' },
    });
    expect(prefersReducedData()).toBe(false);
    Object.defineProperty(navigator, 'connection', { configurable: true, value: original });
  });
});

describe('pickPrefetchTarget', () => {
  const hls = {
    playback: { type: 'hls', hlsUrl: 'https://cdn.test/master.m3u8' },
    posterUrl: 'https://cdn.test/b.jpg',
  };
  const posterOnly = {
    playback: { type: 'hls', url: null, hlsUrl: null },
    posterUrl: 'https://cdn.test/a.jpg',
  };

  it('prefers hls playlist when present', () => {
    expect(pickPrefetchTarget(hls)).toBe('https://cdn.test/master.m3u8');
  });

  it('falls back to poster when HLS is missing', () => {
    expect(pickPrefetchTarget(posterOnly)).toBe('https://cdn.test/a.jpg');
  });

  it('ignores non-HLS video urls', () => {
    expect(
      pickPrefetchTarget({
        playback: { type: 'hls', url: 'https://cdn.test/a.mp4', hlsUrl: null },
        videoUrl: 'https://cdn.test/a.mp4',
        posterUrl: 'https://cdn.test/a.jpg',
      }),
    ).toBe('https://cdn.test/a.jpg');
  });
});
