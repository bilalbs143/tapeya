import { describe, expect, it } from 'vitest';

import {
  buildDirectYoutubeEmbedUrl,
  buildFacebookEmbedUrl,
  facebookPermalink,
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

describe('facebookPermalink / buildFacebookEmbedUrl', () => {
  it('normalizes watch/live URLs to watch/?v= and plugin embed', () => {
    const input =
      'https://www.facebook.com/watch/live/?mibextid=wwXIfr&ref=watch_permalink&v=1578076810638752&rdid=s84e56Yp5UqVq2N3';
    expect(facebookPermalink(input)).toBe('https://www.facebook.com/watch/?v=1578076810638752');
    const embed = buildFacebookEmbedUrl(input);
    expect(embed).toContain('https://www.facebook.com/plugins/video.php?');
    expect(embed).toContain(encodeURIComponent('https://www.facebook.com/watch/?v=1578076810638752'));
  });

  it('normalizes share/v short links', () => {
    const input = 'https://www.facebook.com/share/v/1EthobuGMr/?mibextid=wwXIfr';
    expect(facebookPermalink(input)).toBe('https://www.facebook.com/share/v/1EthobuGMr');
    expect(buildFacebookEmbedUrl(input)).toContain(encodeURIComponent('https://www.facebook.com/share/v/1EthobuGMr'));
  });

  it('keeps canonical page /videos/{id} permalinks', () => {
    const input = 'https://www.facebook.com/RaiMudasirAlii/videos/1638854447583237';
    expect(facebookPermalink(input)).toBe('https://www.facebook.com/RaiMudasirAlii/videos/1638854447583237');
    expect(buildFacebookEmbedUrl(input)).toContain(
      encodeURIComponent('https://www.facebook.com/RaiMudasirAlii/videos/1638854447583237'),
    );
  });

  it('rebuilds stale Facebook plugin embeds with height and fullscreen params', () => {
    const stale =
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D1578076810638752&show_text=false&autoplay=true';
    const rebuilt = buildFacebookEmbedUrl(stale);
    expect(rebuilt).toContain('height=720');
    expect(rebuilt).toContain('allowfullscreen=true');
    expect(rebuilt).toContain(encodeURIComponent('https://www.facebook.com/watch/?v=1578076810638752'));
  });
});

describe('isInteractiveStreamUrl', () => {
  it('detects non-YouTube HTTPS watch URLs before playback resolves', () => {
    expect(isInteractiveStreamUrl('https://www.facebook.com/RaiMudasirAlii/videos/1638854447583237')).toBe(true);
    expect(isInteractiveStreamUrl('https://example.com/embed/live')).toBe(true);
    expect(isInteractiveStreamUrl('https://www.youtube.com/watch?v=abc')).toBe(false);
    expect(isInteractiveStreamUrl('https://cdn.example.com/live/stream.m3u8')).toBe(false);
  });
});

describe('isInteractiveIframePlayback', () => {
  it('treats non-YouTube iframe playback as interactive', () => {
    expect(isInteractiveIframePlayback({ mode: 'iframe', provider: 'facebook' })).toBe(true);
    expect(
      isInteractiveIframePlayback({
        mode: 'iframe',
        embed_url: 'https://www.facebook.com/plugins/video.php?href=foo',
      }),
    ).toBe(true);
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
  it('builds a Facebook plugin URL from a raw watch/live link', () => {
    const result = resolveStreamIframeSrc({
      embed_url:
        'https://www.facebook.com/watch/live/?mibextid=wwXIfr&ref=watch_permalink&v=1578076810638752&rdid=s84e56Yp5UqVq2N3',
    });
    expect(result.iframeSrc).toContain('plugins/video.php');
    expect(result.usesProxy).toBe(false);
  });

  it('normalizes stale plugin embed URLs from the API', () => {
    const embed =
      'https://www.facebook.com/plugins/video.php?href=https%3A%2F%2Fwww.facebook.com%2Fwatch%2F%3Fv%3D1578076810638752&show_text=false&autoplay=true';
    const result = resolveStreamIframeSrc({ embed_url: embed, provider: 'facebook' });
    expect(result.iframeSrc).toContain('height=720');
    expect(result.iframeSrc).toContain('allowfullscreen=true');
    expect(result.usesProxy).toBe(false);
  });

  it('returns null when there is no usable embed', () => {
    expect(resolveStreamIframeSrc(null).iframeSrc).toBeNull();
    expect(resolveStreamIframeSrc({ embed_url: 'not-a-url' }).iframeSrc).toBeNull();
  });
});

describe('isFacebookHost / facebookPermalink lookalikes', () => {
  it('does not treat substring lookalikes as Facebook', () => {
    expect(facebookPermalink('https://evil-facebook.com/watch/?v=123')).toBeNull();
    expect(buildFacebookEmbedUrl('https://evil-facebook.com/watch/?v=123')).toBeNull();
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
