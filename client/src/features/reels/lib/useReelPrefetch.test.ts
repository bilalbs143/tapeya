// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';

import {
  firstM3u8Uri,
  getReelPrefetchDepth,
  isHlsPrefetchUrl,
  pickPrefetchTarget,
  prefersReducedData,
  runPrefetchPool,
  warmReelMedia,
} from './useReelPrefetch';

describe('prefersReducedData', () => {
  it('skips on save-data', () => {
    const original = (navigator as Navigator & { connection?: unknown }).connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '4g' },
    });
    expect(prefersReducedData()).toBe(true);
    Object.defineProperty(navigator, 'connection', { configurable: true, value: original });
  });

  it('skips on 2g', () => {
    const original = (navigator as Navigator & { connection?: unknown }).connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, effectiveType: '2g' },
    });
    expect(prefersReducedData()).toBe(true);
    Object.defineProperty(navigator, 'connection', { configurable: true, value: original });
  });

  it('allows warm on 4g without save-data', () => {
    const original = (navigator as Navigator & { connection?: unknown }).connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, effectiveType: '4g' },
    });
    expect(prefersReducedData()).toBe(false);
    Object.defineProperty(navigator, 'connection', { configurable: true, value: original });
  });
});

describe('getReelPrefetchDepth', () => {
  it('is 0 on save-data', () => {
    const original = (navigator as Navigator & { connection?: unknown }).connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '4g' },
    });
    expect(getReelPrefetchDepth()).toBe(0);
    Object.defineProperty(navigator, 'connection', { configurable: true, value: original });
  });

  it('is 4 on 3g', () => {
    const original = (navigator as Navigator & { connection?: unknown }).connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, effectiveType: '3g' },
    });
    expect(getReelPrefetchDepth()).toBe(4);
    Object.defineProperty(navigator, 'connection', { configurable: true, value: original });
  });

  it('is 6 on 4g', () => {
    const original = (navigator as Navigator & { connection?: unknown }).connection;
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, effectiveType: '4g' },
    });
    expect(getReelPrefetchDepth()).toBe(6);
    Object.defineProperty(navigator, 'connection', { configurable: true, value: original });
  });
});

describe('pickPrefetchTarget', () => {
  it('prefers hls playlist when present', () => {
    expect(
      pickPrefetchTarget({
        playback: { type: 'hls', url: null, hlsUrl: 'https://cdn.test/master.m3u8' },
        posterUrl: 'https://cdn.test/b.jpg',
        videoUrl: null,
      })
    ).toBe('https://cdn.test/master.m3u8');
  });

  it('uses progressive mp4 when HLS is missing', () => {
    expect(
      pickPrefetchTarget({
        playback: { type: 'hls', url: 'https://cdn.test/a.mp4', hlsUrl: null },
        videoUrl: 'https://cdn.test/a.mp4',
        posterUrl: 'https://cdn.test/a.jpg',
      })
    ).toBe('https://cdn.test/a.mp4');
  });

  it('returns null without a media url', () => {
    expect(
      pickPrefetchTarget({
        posterUrl: 'https://cdn.test/a.jpg',
        videoUrl: null,
        playback: { type: null, url: null, hlsUrl: null },
      })
    ).toBeNull();
  });
});

describe('firstM3u8Uri', () => {
  it('resolves the first variant playlist against the master url', () => {
    const master = '#EXTM3U\n#EXT-X-STREAM-INF:BANDWIDTH=800000\n720/index.m3u8\n';
    expect(firstM3u8Uri(master, 'https://cdn.test/hls/master.m3u8')).toBe('https://cdn.test/hls/720/index.m3u8');
  });

  it('resolves the first segment against the variant url', () => {
    const variant = '#EXTM3U\n#EXTINF:2.0,\nseg_000.ts\n#EXTINF:2.0,\nseg_001.ts\n';
    expect(firstM3u8Uri(variant, 'https://cdn.test/hls/720/index.m3u8')).toBe('https://cdn.test/hls/720/seg_000.ts');
  });

  it('returns null for empty playlists', () => {
    expect(firstM3u8Uri('#EXTM3U\n', 'https://cdn.test/master.m3u8')).toBeNull();
  });
});

describe('warmReelMedia', () => {
  it('fetches master → variant → first segment', async () => {
    const fetchMock = vi.fn(async (url: string | URL | Request) => {
      if (String(url).endsWith('master.m3u8')) {
        return { ok: true, text: async () => '#EXTM3U\n720/index.m3u8\n' };
      }
      if (String(url).includes('index.m3u8')) {
        return { ok: true, text: async () => '#EXTM3U\n#EXTINF:2.0,\nseg_000.ts\n' };
      }
      return { ok: true, text: async () => '' };
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    try {
      await warmReelMedia(
        {
          playback: { type: 'hls', url: null, hlsUrl: 'https://cdn.test/hls/master.m3u8' },
          posterUrl: null,
          videoUrl: null,
        },
        new AbortController().signal
      );
      expect(fetchMock.mock.calls.map((call) => String(call[0]))).toEqual([
        'https://cdn.test/hls/master.m3u8',
        'https://cdn.test/hls/720/index.m3u8',
        'https://cdn.test/hls/720/seg_000.ts',
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

describe('isHlsPrefetchUrl', () => {
  it('detects m3u8 and /hls/ paths', () => {
    expect(isHlsPrefetchUrl('https://cdn.test/master.m3u8')).toBe(true);
    expect(isHlsPrefetchUrl('https://cdn.test/hls/720/index.m3u8?x=1')).toBe(true);
    expect(isHlsPrefetchUrl('https://cdn.test/clip.mp4')).toBe(false);
  });
});

describe('runPrefetchPool', () => {
  it('runs with bounded concurrency and preserves start order priority', async () => {
    const seen: string[] = [];
    const controller = new AbortController();
    await runPrefetchPool(
      ['a', 'b', 'c'],
      async (item) => {
        seen.push(`start:${item}`);
        await Promise.resolve();
        seen.push(`end:${item}`);
      },
      2,
      controller.signal
    );
    expect(seen[0]).toBe('start:a');
    expect(seen).toContain('start:b');
    expect(seen).toContain('end:c');
    expect(seen.filter((entry) => entry.startsWith('start:'))).toEqual(['start:a', 'start:b', 'start:c']);
  });
});
