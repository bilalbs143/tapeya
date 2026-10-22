import { describe, expect, it } from 'vitest';

import { isHlsUrl, resolveReelPlaybackSource } from './useReelHls';

describe('resolveReelPlaybackSource', () => {
  it('prefers HLS when master is present', () => {
    expect(
      resolveReelPlaybackSource({
        type: 'hls',
        url: 'https://cdn.test/master.m3u8',
        hlsUrl: 'https://cdn.test/master.m3u8',
      })
    ).toEqual({ url: 'https://cdn.test/master.m3u8', mode: 'hls' });
  });

  it('uses temporary original while encoding', () => {
    expect(
      resolveReelPlaybackSource({
        type: 'original',
        url: 'https://cdn.test/original/clip.mp4',
        hlsUrl: null,
      })
    ).toEqual({ url: 'https://cdn.test/original/clip.mp4', mode: 'progressive' });
  });

  it('returns empty when neither source exists', () => {
    expect(resolveReelPlaybackSource({ type: 'hls', url: null, hlsUrl: null })).toEqual({
      url: null,
      mode: null,
    });
  });
});

describe('isHlsUrl', () => {
  it('detects m3u8 and /hls/ paths', () => {
    expect(isHlsUrl('https://cdn.test/master.m3u8')).toBe(true);
    expect(isHlsUrl('https://cdn.test/hls/720/index.m3u8?x=1')).toBe(true);
    expect(isHlsUrl('https://cdn.test/clip.mp4')).toBe(false);
  });
});
