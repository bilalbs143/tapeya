import { describe, expect, it } from 'vitest';

import { resolveReelPlaybackSource } from '@/features/reels/useReelHls';

describe('resolveReelPlaybackSource', () => {
  it('prefers HLS when master is present', () => {
    expect(
      resolveReelPlaybackSource({
        type: 'hls',
        url: 'https://cdn.test/master.m3u8',
        hlsUrl: 'https://cdn.test/master.m3u8',
      }),
    ).toEqual({ url: 'https://cdn.test/master.m3u8', mode: 'hls' });
  });

  it('uses temporary original while encoding', () => {
    expect(
      resolveReelPlaybackSource({
        type: 'original',
        url: 'https://cdn.test/original/clip.mp4',
        hlsUrl: null,
      }),
    ).toEqual({ url: 'https://cdn.test/original/clip.mp4', mode: 'progressive' });
  });

  it('returns empty when neither source exists', () => {
    expect(resolveReelPlaybackSource({ type: 'hls', url: null, hlsUrl: null })).toEqual({
      url: null,
      mode: null,
    });
  });
});
