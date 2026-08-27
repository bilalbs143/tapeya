import { describe, expect, it } from 'vitest';

import {
  buildDirectYoutubeEmbedUrl,
  getStreamOrientation,
  isInteractiveIframePlayback,
  isInteractiveStreamUrl,
  isSelfServeLiveBroadcast,
  resolveStreamIframeSrc,
  resolveYoutubeEmbed,
  withIosNativeEmbedParams,
} from '../liveStreamUtils';

describe('getStreamOrientation', () => {
  it('returns the API orientation value when present', () => {
    expect(getStreamOrientation({ orientation: 'landscape' })).toBe('landscape');
    expect(getStreamOrientation({ orientation: 'portrait' })).toBe('portrait');
  });

  it('defaults missing values to portrait (API column default)', () => {
    expect(getStreamOrientation(null)).toBe('portrait');
    expect(getStreamOrientation(undefined)).toBe('portrait');
    expect(getStreamOrientation({})).toBe('portrait');
    expect(getStreamOrientation({ orientation: null })).toBe('portrait');
    expect(getStreamOrientation({ orientation: '' })).toBe('portrait');
  });
});

describe('isSelfServeLiveBroadcast', () => {
  it('prefers is_self_serve from the API', () => {
    expect(isSelfServeLiveBroadcast({ is_self_serve: true })).toBe(true);
    expect(isSelfServeLiveBroadcast({ is_self_serve: false, broadcaster: { id: 1 } })).toBe(false);
  });
});

describe('isInteractiveStreamUrl', () => {
  it('detects non-YouTube HTTPS watch URLs before playback resolves', () => {
    expect(isInteractiveStreamUrl('https://example.com/embed/live')).toBe(true);
    expect(isInteractiveStreamUrl('https://www.youtube.com/watch?v=abc')).toBe(false);
    expect(isInteractiveStreamUrl('https://cdn.example.com/live/stream.m3u8')).toBe(false);
  });
});

describe('isInteractiveIframePlayback', () => {
  it('treats non-YouTube iframe playback as interactive', () => {
    expect(
      isInteractiveIframePlayback({
        mode: 'iframe',
        embed_url: 'https://example.com/player/live',
      }),
    ).toBe(true);
  });

  it('excludes YouTube iframe playback', () => {
    expect(isInteractiveIframePlayback({ mode: 'iframe', embed_id: 'abc' })).toBe(false);
    expect(
      isInteractiveIframePlayback({
        mode: 'iframe',
        embed_url: 'https://www.youtube.com/embed/abc',
      }),
    ).toBe(false);
  });

  it('excludes HLS playback', () => {
    expect(isInteractiveIframePlayback({ mode: 'hls', url: 'https://cdn.example.com/live.m3u8' })).toBe(false);
  });
});

describe('resolveStreamIframeSrc', () => {
  it('resolves generic HTTPS embeds without a proxy', () => {
    const result = resolveStreamIframeSrc({
      embed_url: 'https://example.com/player/live',
    });
    expect(result.iframeSrc).toBe('https://example.com/player/live');
    expect(result.usesProxy).toBe(false);
  });

  it('returns null when there is no usable embed', () => {
    expect(resolveStreamIframeSrc(null).iframeSrc).toBeNull();
    expect(resolveStreamIframeSrc({ embed_url: 'not-a-url' }).iframeSrc).toBeNull();
  });
});

describe('resolveYoutubeEmbed showControls', () => {
  it('defaults to controls=0 for live-style embeds', () => {
    const direct = buildDirectYoutubeEmbedUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE');
    expect(direct).toContain('controls=0');
    expect(direct).toContain('fs=0');
  });

  it('enables controls for VOD / web highlights', () => {
    const direct = buildDirectYoutubeEmbedUrl('https://www.youtube.com/watch?v=M7lc1UVf-VE', null, {
      showControls: true,
    });
    expect(direct).toContain('controls=1');
    expect(direct).toContain('fs=1');

    const resolved = resolveYoutubeEmbed('https://www.youtube.com/watch?v=M7lc1UVf-VE', null, {
      showControls: true,
    });
    expect(resolved.iframeSrc).toBeTruthy();
  });

  it('withIosNativeEmbedParams sets landscape and controls flags', () => {
    const base = 'https://example.com/embed/youtube?url=https%3A%2F%2Fwww.youtube.com%2Fembed%2Fabc';
    const landscape = withIosNativeEmbedParams(base, { landscape: true, showControls: true });
    expect(landscape).toContain('cover=1');
    expect(landscape).toContain('rotate=1');
    expect(landscape).toContain('controls=1');

    const portrait = withIosNativeEmbedParams(landscape, { landscape: false, showControls: false });
    expect(portrait).not.toContain('cover=1');
    expect(portrait).not.toContain('rotate=1');
  });
});
