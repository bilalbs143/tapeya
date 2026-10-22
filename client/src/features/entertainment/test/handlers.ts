import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

const serialFixture = {
  id: 1,
  title: 'Street Cricket Tales',
  description: 'Tape-ball stories from the gali.',
  poster: 'https://cdn.example/serial.jpg',
  episodes_count: 2,
  first_episode_id: 10,
  episodes: [
    {
      id: 10,
      serial_id: 1,
      episode_number: 1,
      title: 'First Ball',
      thumbnail: 'https://cdn.example/ep1.jpg',
      duration: '22:00',
      views_count: 1200,
      likes_count: 40,
      dislikes_count: 1,
      comments_count: 3,
      shares_count: 2,
    },
    {
      id: 11,
      serial_id: 1,
      episode_number: 2,
      title: 'Last Over',
      thumbnail: 'https://cdn.example/ep2.jpg',
      duration: '24:10',
      views_count: 900,
      likes_count: 22,
      dislikes_count: 0,
      comments_count: 1,
      shares_count: 0,
    },
  ],
};

const episodeFixture = {
  id: 10,
  serial_id: 1,
  episode_number: 1,
  title: 'First Ball',
  description: 'The season opens.',
  thumbnail: 'https://cdn.example/ep1.jpg',
  video_source: 'youtube',
  video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  duration: '22:00',
  views_count: 1200,
  likes_count: 40,
  dislikes_count: 1,
  comments_count: 3,
  shares_count: 2,
  my_reaction: null,
  serial: { id: 1, title: 'Street Cricket Tales', poster: 'https://cdn.example/serial.jpg' },
  prev_episode_id: null,
  next_episode_id: 11,
};

const commentFixtures = [
  {
    id: 1,
    episode_id: 10,
    parent_id: null,
    body: 'What a first ball!',
    likes_count: 4,
    liked: false,
    is_pinned: false,
    replies_count: 1,
    user: {
      id: 2,
      name: 'Ayesha',
      nickname: 'ayesha',
      avatar_url: null,
      is_official: false,
    },
    created_at: '2026-03-01T10:00:00Z',
  },
  {
    id: 2,
    episode_id: 10,
    parent_id: null,
    body: 'Need episode 2 already.',
    likes_count: 1,
    liked: true,
    is_pinned: false,
    replies_count: 0,
    user: {
      id: 3,
      name: 'Bilal',
      nickname: 'bilal',
      avatar_url: null,
      is_official: false,
    },
    created_at: '2026-03-01T11:00:00Z',
  },
];

const replyFixtures = [
  {
    id: 3,
    episode_id: 10,
    parent_id: 1,
    body: '@ayesha agreed!',
    likes_count: 0,
    liked: false,
    is_pinned: false,
    replies_count: 0,
    user: {
      id: 4,
      name: 'Cam',
      nickname: 'cam',
      avatar_url: null,
      is_official: false,
    },
    created_at: '2026-03-01T10:30:00Z',
  },
];

export const entertainmentHandlers = [
  http.get(`${env.VITE_API_URL}/drama-serials`, () =>
    HttpResponse.json({
      data: [serialFixture],
      meta: { current_page: 1, last_page: 1, per_page: 50, total: 1 },
      type: 'SUCCESS',
    })
  ),

  http.get(`${env.VITE_API_URL}/drama-serials/:id`, ({ params }) => {
    if (String(params.id) !== '1') {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: serialFixture, type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/drama-episodes/:id`, ({ params }) => {
    if (String(params.id) !== '10') {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: episodeFixture, type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/drama-episodes/:id/like`, () =>
    HttpResponse.json({ data: { my_reaction: 'like' }, type: 'SUCCESS' })
  ),
  http.post(`${env.VITE_API_URL}/drama-episodes/:id/dislike`, () =>
    HttpResponse.json({ data: { my_reaction: 'dislike' }, type: 'SUCCESS' })
  ),
  http.post(`${env.VITE_API_URL}/drama-episodes/:id/share`, () =>
    HttpResponse.json({ data: { shares_count: 3 }, type: 'SUCCESS' })
  ),

  http.get(`${env.VITE_API_URL}/drama-episodes/:id/comments`, ({ params }) => {
    if (String(params.id) !== '10') {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        items: commentFixtures,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: commentFixtures.length,
      },
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/drama-episodes/:id/comments/:commentId/replies`, ({ params }) => {
    if (String(params.id) !== '10' || String(params.commentId) !== '1') {
      return HttpResponse.json({
        data: { items: [], current_page: 1, last_page: 1, per_page: 20, total: 0 },
        type: 'SUCCESS',
      });
    }
    return HttpResponse.json({
      data: {
        items: replyFixtures,
        current_page: 1,
        last_page: 1,
        per_page: 20,
        total: replyFixtures.length,
      },
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/drama-episodes/:id/comments`, async ({ request, params }) => {
    const body = (await request.json()) as { body?: string; parent_id?: number };
    return HttpResponse.json(
      {
        data: {
          id: 99,
          episode_id: Number(params.id),
          parent_id: body.parent_id ?? null,
          body: body.body ?? '',
          likes_count: 0,
          liked: false,
          is_pinned: false,
          replies_count: 0,
          user: {
            id: 7,
            name: 'You',
            nickname: 'you',
            avatar_url: null,
            is_official: false,
          },
          created_at: new Date().toISOString(),
        },
        type: 'CREATED',
        message: 'Comment posted.',
      },
      { status: 201 }
    );
  }),

  http.delete(
    `${env.VITE_API_URL}/drama-episodes/:id/comments/:commentId`,
    () => new HttpResponse(null, { status: 204 })
  ),

  http.post(`${env.VITE_API_URL}/drama-episodes/:id/comments/:commentId/like`, () =>
    HttpResponse.json({ data: { liked: true, likes_count: 5 }, type: 'SUCCESS' })
  ),

  http.delete(`${env.VITE_API_URL}/drama-episodes/:id/comments/:commentId/like`, () =>
    HttpResponse.json({ data: { liked: false, likes_count: 4 }, type: 'SUCCESS' })
  ),
];
