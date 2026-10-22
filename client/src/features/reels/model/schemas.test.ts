import { describe, expect, it } from 'vitest';

import { formatDurationMs, matchChipLabel, type ReelWire, toDomain } from './schemas';

describe('toDomain', () => {
  it('maps reel wire into player domain fields', () => {
    const wire: ReelWire = {
      id: 9,
      caption: 'Six over midwicket',
      duration_ms: 65000,
      cover_url: 'https://cdn.example/cover.jpg',
      playback: {
        type: 'hls',
        poster_url: 'https://cdn.example/poster.jpg',
        url: null,
        hls_url: 'https://cdn.example/hls.m3u8',
        is_processed: true,
      },
      counts: { likes: 12, comments: 3, views: 900, saves: 1, shares: 0 },
      viewer: { liked: true, saved: false, following_creator: false },
      creator: {
        id: 2,
        name: 'Ayesha',
        nickname: 'aye',
        avatar_url: null,
      },
      hashtags: ['cricket'],
    };

    expect(toDomain(wire)).toMatchObject({
      id: 9,
      caption: 'Six over midwicket',
      posterUrl: 'https://cdn.example/poster.jpg',
      videoUrl: 'https://cdn.example/hls.m3u8',
      playback: { hlsUrl: 'https://cdn.example/hls.m3u8', url: null, type: 'hls' },
      likes: 12,
      liked: true,
      saved: false,
      author: { name: 'Ayesha', handle: '@aye', following: false },
      match: null,
    });
    expect(formatDurationMs(65000)).toBe('1:05');
  });

  it('maps optional match for caption chip', () => {
    const wire: ReelWire = {
      id: 1,
      match: {
        id: 44,
        home_short: 'CB',
        away_short: 'KK',
        home_score: '142/4',
        away_score: '—',
      },
    };
    const domain = toDomain(wire);
    expect(domain.match).toEqual({
      id: 44,
      label: null,
      homeShort: 'CB',
      awayShort: 'KK',
      homeScore: '142/4',
      awayScore: '—',
    });
    expect(domain.match && matchChipLabel(domain.match)).toBe('CB 142/4 · KK —');
  });
});
