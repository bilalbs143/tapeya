import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import type { PostWire } from '../model/schemas';

function postFixture(overrides: Partial<PostWire> & Pick<PostWire, 'id' | 'type'>): PostWire {
  return {
    caption: null,
    title: null,
    body: 'Opening stand looking solid.',
    background_id: null,
    status: 'published',
    visibility: 'public',
    duration_ms: null,
    cover_url: null,
    media: [],
    playback: null,
    repost_of: null,
    counts: { likes: 12, comments: 2, views: 40, saves: 1, shares: 0, reposts: 0 },
    viewer: { liked: false, saved: false, following_creator: false },
    creator: {
      id: 7,
      name: 'Aisha Khan',
      nickname: 'aisha',
      avatar_url: null,
      is_official: false,
    },
    published_at: '2026-09-01T10:00:00+00:00',
    created_at: '2026-09-01T10:00:00+00:00',
    ...overrides,
  };
}

const fixtures: PostWire[] = [
  postFixture({ id: 1, type: 'text', body: 'Great spell from the openers.', background_id: 'pitch' }),
  postFixture({ id: 11, type: 'text', body: 'Floodlights on. Game on.', background_id: 'night' }),
  postFixture({ id: 12, type: 'text', body: 'Brand gold energy.', background_id: 'gold' }),
  postFixture({ id: 13, type: 'text', body: 'Century knock.', background_id: 'century' }),
  postFixture({
    id: 2,
    type: 'image',
    body: 'Boundary celebration',
    media: [
      { id: 10, kind: 'image', url: 'https://cdn.example/p1.jpg', sort_order: 0 },
      { id: 11, kind: 'image', url: 'https://cdn.example/p2.jpg', sort_order: 1 },
    ],
  }),
  postFixture({
    id: 3,
    type: 'video',
    body: 'Match highlight',
    duration_ms: 65000,
    cover_url: 'https://cdn.example/cover.jpg',
    playback: {
      type: 'hls',
      url: null,
      poster_url: 'https://cdn.example/poster.jpg',
      hls_url: 'https://cdn.example/hls.m3u8',
      is_processed: true,
    },
  }),
];

function cursorPage(items: PostWire[], hasMore = false) {
  return HttpResponse.json({
    data: {
      items,
      next_cursor: hasMore ? 'cursor-next' : null,
      prev_cursor: null,
      has_more: hasMore,
      per_page: 10,
    },
    type: 'SUCCESS',
  });
}

export const feedHandlers = [
  http.get(`${env.VITE_API_URL}/feed`, () => cursorPage(fixtures, true)),
  http.get(`${env.VITE_API_URL}/feed/following`, () => cursorPage([])),
  http.get(`${env.VITE_API_URL}/feed/mine`, () => {
    const mine = fixtures[0];
    return cursorPage(mine ? [mine] : []);
  }),
  http.get(`${env.VITE_API_URL}/feed/saved`, () => cursorPage([])),

  http.get(`${env.VITE_API_URL}/posts/:id`, ({ params }) => {
    const post = fixtures.find((p) => p.id === Number(params.id));
    if (!post) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: post, type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/users/:userId/posts`, ({ params }) => {
    const userId = Number(params.userId);
    const first = fixtures[0];
    return cursorPage(
      first
        ? [
            {
              ...first,
              creator: {
                id: userId,
                name: 'Sara Ali',
                nickname: 'sara',
                avatar_url: null,
                is_official: false,
              },
            },
          ]
        : []
    );
  }),

  http.get(`${env.VITE_API_URL}/reels/feed`, () =>
    cursorPage([
      postFixture({
        id: 3,
        type: 'video',
        counts: { likes: 1, comments: 0, views: 1200, saves: 0, shares: 0, reposts: 0 },
        cover_url: 'https://cdn.example/cover.jpg',
        playback: { poster_url: 'https://cdn.example/poster.jpg' },
      }),
    ])
  ),

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

  http.get(`${env.VITE_API_URL}/posts/:id/comments`, () =>
    HttpResponse.json({
      data: {
        items: [
          {
            id: 101,
            post_id: 1,
            parent_id: null,
            body: 'What a spell!',
            likes_count: 2,
            liked: false,
            is_pinned: false,
            replies_count: 1,
            user: {
              id: 8,
              name: 'Omar',
              nickname: 'omar',
              avatar_url: null,
              is_official: false,
            },
            created_at: '2026-09-01T11:00:00+00:00',
          },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: 1,
      },
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/posts/:id/comments/:commentId/replies`, () =>
    HttpResponse.json({
      data: {
        items: [
          {
            id: 102,
            post_id: 1,
            parent_id: 101,
            body: '@omar agreed',
            likes_count: 0,
            liked: false,
            is_pinned: false,
            replies_count: 0,
            user: {
              id: 9,
              name: 'Noor',
              nickname: 'noor',
              avatar_url: null,
              is_official: false,
            },
            created_at: '2026-09-01T11:05:00+00:00',
          },
        ],
        current_page: 1,
        last_page: 1,
        per_page: 50,
        total: 1,
      },
      type: 'SUCCESS',
    })
  ),

  http.post(`${env.VITE_API_URL}/posts/:id/comments`, async ({ request, params }) => {
    const body = (await request.json()) as { body?: string; parent_id?: number };
    return HttpResponse.json(
      {
        data: {
          id: 200,
          post_id: Number(params.id),
          parent_id: body.parent_id ?? null,
          body: body.body ?? '',
          likes_count: 0,
          liked: false,
          is_pinned: false,
          replies_count: 0,
          user: {
            id: 1,
            name: 'Test User',
            nickname: 'testuser',
            avatar_url: null,
            is_official: false,
          },
          created_at: new Date().toISOString(),
        },
        message: 'Comment added.',
        type: 'CREATED',
      },
      { status: 201 }
    );
  }),

  http.delete(`${env.VITE_API_URL}/posts/:id/comments/:commentId`, () =>
    HttpResponse.json({ message: 'Comment deleted.', type: 'SUCCESS' })
  ),

  http.post(`${env.VITE_API_URL}/posts/:id/comments/:commentId/like`, () =>
    HttpResponse.json({ data: { liked: true, likes_count: 3 }, type: 'SUCCESS' })
  ),
  http.delete(`${env.VITE_API_URL}/posts/:id/comments/:commentId/like`, () =>
    HttpResponse.json({ data: { liked: false, likes_count: 2 }, type: 'SUCCESS' })
  ),

  http.post(`${env.VITE_API_URL}/posts`, async ({ request }) => {
    const contentType = request.headers.get('Content-Type') ?? '';
    let bodyText = 'New post';
    let type: PostWire['type'] = 'text';
    let background_id: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      type = (form.get('type') as PostWire['type']) || 'image';
      bodyText = String(form.get('body') ?? '');
    } else {
      const body = (await request.json()) as {
        type?: PostWire['type'];
        body?: string;
        background_id?: string | null;
      };
      type = body.type ?? 'text';
      bodyText = body.body ?? 'New post';
      background_id = body.background_id ?? null;
    }

    const created = postFixture({
      id: 99,
      type,
      body: bodyText,
      background_id,
      creator: {
        id: 1,
        name: 'Test User',
        nickname: 'testuser',
        avatar_url: null,
      },
    });
    return HttpResponse.json({ data: created, message: 'Post created.', type: 'CREATED' }, { status: 201 });
  }),

  http.delete(`${env.VITE_API_URL}/posts/:id`, () =>
    HttpResponse.json({ data: null, message: 'Post deleted.', type: 'SUCCESS' })
  ),

  http.post(`${env.VITE_API_URL}/posts/:id/report`, async ({ request }) => {
    const body = (await request.json()) as { reason?: string; details?: string };
    return HttpResponse.json({
      data: {
        reported: true,
        already_reported: false,
        reports_count: 1,
        reason: body.reason ?? 'spam',
      },
      message: 'Report submitted.',
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/posts/:id/repost`, ({ params }) => {
    const originalId = Number(params.id);
    const original = postFixture({ id: originalId, type: 'text' });
    const created = postFixture({
      id: 500 + originalId,
      type: 'repost',
      body: null,
      creator: {
        id: 1,
        name: 'Test User',
        nickname: 'testuser',
        avatar_url: null,
      },
      repost_of: original,
      counts: { likes: 0, comments: 0, views: 0, saves: 0, shares: 0, reposts: 0 },
    });
    return HttpResponse.json({ data: created, message: 'Reposted.', type: 'CREATED' }, { status: 201 });
  }),

  http.get(`${env.VITE_API_URL}/live/scores`, () =>
    HttpResponse.json({
      data: [
        {
          id: 12,
          tournament_id: 3,
          match_label: 'WPL',
          overs_limit: 50,
          home_team: { id: 1, name: 'Karachi Kids', logo: null },
          away_team: { id: 2, name: 'Rawalpindi Royals', logo: null },
          tournament: { id: 3, name: 'Women Premier League', short_name: 'WPL' },
          innings: [
            {
              innings_number: 1,
              innings_status: 'completed',
              batting_team_id: 1,
              total_runs: 234,
              total_wickets: 7,
              overs_display: '50.0',
            },
            {
              innings_number: 2,
              innings_status: 'in_progress',
              batting_team_id: 2,
              total_runs: 27,
              total_wickets: 1,
              overs_display: '4.4',
              target: 235,
              runs_to_win: 208,
              balls_remaining: 272,
            },
          ],
          active_innings: {
            innings_number: 2,
            innings_status: 'in_progress',
            batting_team_id: 2,
            total_runs: 27,
            total_wickets: 1,
            overs_display: '4.4',
            current_run_rate: '5.79',
            target: 235,
            runs_to_win: 208,
            balls_remaining: 272,
          },
        },
      ],
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/live/matches`, () =>
    HttpResponse.json({
      data: [
        {
          id: 88,
          match_id: 12,
          title: 'WPL · Semi-final',
          thumbnail_url: 'https://cdn.example/live-thumb.jpg',
          viewer_count: 3400,
          broadcaster: { name: 'Tapeya' },
          tournament: { short_name: 'WPL' },
        },
      ],
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/shop/products`, () =>
    HttpResponse.json({
      data: [
        {
          id: 1,
          name: 'CA Plus 15000 bat',
          price: 6400,
          sale_price: null,
          is_featured: true,
          images: [{ path: 'https://cdn.example/bat.jpg' }],
          brand: { name: 'CA' },
          vendor: { store_name: 'Sadar Sports' },
        },
      ],
      meta: { current_page: 1, last_page: 1, per_page: 9, total: 1 },
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/hero-sliders`, () =>
    HttpResponse.json({
      data: [
        {
          id: 1,
          image_mobile: 'https://cdn.example/hero-mobile.jpg',
          image_desktop: 'https://cdn.example/hero-desktop.jpg',
          cta_type: 'url',
          cta_label: 'Explore',
          cta_url: '/upcoming-tournaments',
          cta_target_blank: false,
          cta_dialog_key: null,
          cta_dialog_param: null,
        },
      ],
      type: 'SUCCESS',
    })
  ),
];
