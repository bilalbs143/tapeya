import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  buildDirectYoutubeEmbedUrl,
  isYoutubeEmbedProxyUrl,
  resolveStreamIframeSrc,
  resolveYoutubeEmbed,
} from './playback';

vi.mock('@/shared/platform/platform', () => ({
  isNativePlatform: vi.fn(() => false),
}));

import { isNativePlatform } from '@/shared/platform/platform';

const mockedIsNative = vi.mocked(isNativePlatform);

afterEach(() => {
  mockedIsNative.mockReturnValue(false);
});

describe('playback youtube embeds', () => {
  it('builds a direct youtube embed with controls off by default', () => {
    const url = buildDirectYoutubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ', null);
    expect(url).toContain('https://www.youtube.com/embed/dQw4w9WgXcQ?');
    expect(url).toContain('controls=0');
    expect(url).toContain('autoplay=1');
  });

  it('uses public-site /embed/youtube proxy on native', () => {
    mockedIsNative.mockReturnValue(true);
    const iframeSrc = resolveYoutubeEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ', null, {
      showControls: true,
    });
    expect(iframeSrc).toContain('/embed/youtube?');
    expect(iframeSrc).toContain('controls=1');
    expect(iframeSrc).toContain(encodeURIComponent('https://www.youtube.com/embed/dQw4w9WgXcQ'));
    expect(iframeSrc).not.toContain('origin%3D');
    expect(iframeSrc).toBeTruthy();
    if (iframeSrc) expect(isYoutubeEmbedProxyUrl(iframeSrc)).toBe(true);
  });

  it('keeps direct youtube embeds on web', () => {
    mockedIsNative.mockReturnValue(false);
    const iframeSrc = resolveYoutubeEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ', null);
    expect(iframeSrc).toMatch(/^https:\/\/www\.youtube\.com\/embed\//);
    expect(iframeSrc).toBeTruthy();
    if (iframeSrc) expect(isYoutubeEmbedProxyUrl(iframeSrc)).toBe(false);
  });

  it('resolveStreamIframeSrc uses proxy on native (live, no controls)', () => {
    mockedIsNative.mockReturnValue(true);
    const src = resolveStreamIframeSrc(
      {
        mode: 'iframe',
        embedUrl: 'https://www.youtube.com/watch?v=abc123XYZ01',
        embedId: null,
        url: null,
      },
      { showControls: false }
    );
    expect(src).toContain('/embed/youtube');
    expect(src).not.toContain('controls=1');
  });
});
