import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import type { ReelWire } from '../model/schemas';

function reelFixture(overrides: Partial<ReelWire> & { id: number }): ReelWire {
  return {
    caption: 'Tape ball six',
    status: 'ready',
    duration_ms: 24000,
    cover_url: 'https://cdn.example/cover.jpg',
    playback: {
      poster_url: 'https://cdn.example/poster.jpg',
      url: null,
      hls_url: null,
      is_processed: true,
    },
    counts: { likes: 12, comments: 2, views: 840, saves: 1, shares: 0 },
    viewer: { liked: false, saved: false, following_creator: false },
    creator: {
      id: 2,
      name: 'Ayesha Khan',
      nickname: 'aye',
      avatar_url: null,
    },
    hashtags: ['cricket'],
    ...overrides,
  };
}

const fixtures: ReelWire[] = [
  reelFixture({ id: 3, caption: 'Straight drive' }),
  reelFixture({
    id: 4,
    caption: 'Yorked him',
    playback: {
      poster_url: 'https://cdn.example/poster.jpg',
      url: null,
      hls_url: 'https://cdn.example/reel-4.m3u8',
      type: 'hls',
      is_processed: true,
    },
    viewer: { liked: true, saved: true, following_creator: true },
    counts: { likes: 40, comments: 5, views: 2200, saves: 8, shares: 1 },
  }),
];

function cursorPage(items: ReelWire[]) {
  return HttpResponse.json({
    data: {
      items,
      next_cursor: null,
      prev_cursor: null,
      has_more: false,
      per_page: 10,
    },
    type: 'SUCCESS',
  });
}

export const reelsHandlers = [
  http.get(`${env.VITE_API_URL}/reels/feed`, () => cursorPage(fixtures)),
  http.get(`${env.VITE_API_URL}/reels/feed/following`, () => {
    const saved = fixtures.find((r) => r.id === 4);
    return cursorPage(saved ? [saved] : []);
  }),
  http.get(`${env.VITE_API_URL}/reels/mine`, () => cursorPage([])),
  http.get(`${env.VITE_API_URL}/reels/saved`, () => {
    const saved = fixtures.find((r) => r.id === 4);
    return cursorPage(saved ? [saved] : []);
  }),
  http.get(`${env.VITE_API_URL}/reels/:id`, ({ params }) => {
    const reel = fixtures.find((r) => r.id === Number(params.id));
    if (!reel) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: reel, type: 'SUCCESS' });
  }),
  http.get(`${env.VITE_API_URL}/users/:userId/reels`, ({ params }) => {
    const userId = Number(params.userId);
    return cursorPage(
      fixtures.map((r) => ({
        ...r,
        creator: { ...r.creator, id: userId, name: 'Sara Ali', nickname: 'sara' },
      }))
    );
  }),
  http.post(`${env.VITE_API_URL}/posts/:id/like`, () =>
    HttpResponse.json({ data: { liked: true, likes_count: 13 }, type: 'SUCCESS' })
  ),
  http.delete(`${env.VITE_API_URL}/posts/:id/like`, () =>
    HttpResponse.json({ data: { liked: false, likes_count: 12 }, type: 'SUCCESS' })
  ),
  http.post(`${env.VITE_API_URL}/posts/:id/save`, () =>
    HttpResponse.json({ data: { saved: true, saves_count: 2 }, type: 'SUCCESS' })
  ),
  http.delete(`${env.VITE_API_URL}/posts/:id/save`, () =>
    HttpResponse.json({ data: { saved: false, saves_count: 1 }, type: 'SUCCESS' })
  ),
  http.post(`${env.VITE_API_URL}/posts/:id/share`, () =>
    HttpResponse.json({ data: { shares_count: 2 }, type: 'SUCCESS' })
  ),
];
