import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

const fixtures = [
  {
    id: 44,
    title: 'Boundary barrage — Azadi Cup',
    description: 'Final over fireworks.',
    thumbnail: 'https://cdn.example/hl.jpg',
    video_source: 'youtube',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    duration: '12',
    views_count: 1200,
    likes_count: 40,
    dislikes_count: 1,
    shares_count: 3,
    my_reaction: null,
    created_at: '2026-10-18T12:00:00+00:00',
  },
  {
    id: 45,
    title: 'Hat-trick at Model Colony',
    description: null,
    thumbnail: null,
    video_source: 'upload',
    video_url: 'https://cdn.example/clip.mp4',
    duration: '4 min',
    views_count: 9800,
    likes_count: 210,
    dislikes_count: 4,
    shares_count: 12,
    my_reaction: null,
    created_at: '2026-10-10T09:00:00+00:00',
  },
  {
    id: 46,
    title: 'Super over finish',
    description: null,
    thumbnail: null,
    video_source: 'youtube',
    video_url: null,
    duration: null,
    views_count: 500,
    likes_count: 8,
    dislikes_count: 0,
    shares_count: 0,
    my_reaction: null,
    created_at: '2026-09-28T18:00:00+00:00',
  },
];

export const highlightsHandlers = [
  http.get(`${env.VITE_API_URL}/highlights`, ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('filter[search]') ?? '').trim().toLowerCase();
    const data = search ? fixtures.filter((h) => h.title.toLowerCase().includes(search)) : fixtures;
    return HttpResponse.json({ data, type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/highlights/:id`, ({ params }) => {
    const highlight = fixtures.find((h) => h.id === Number(params.id));
    if (!highlight) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: highlight, type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/highlights/:id/like`, ({ params }) => {
    const highlight = fixtures.find((h) => h.id === Number(params.id));
    if (!highlight) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        likes_count: highlight.likes_count + 1,
        dislikes_count: highlight.dislikes_count,
        shares_count: highlight.shares_count,
        my_reaction: 'like',
      },
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/highlights/:id/dislike`, ({ params }) => {
    const highlight = fixtures.find((h) => h.id === Number(params.id));
    if (!highlight) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        likes_count: highlight.likes_count,
        dislikes_count: highlight.dislikes_count + 1,
        shares_count: highlight.shares_count,
        my_reaction: 'dislike',
      },
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/highlights/:id/share`, ({ params }) => {
    const highlight = fixtures.find((h) => h.id === Number(params.id));
    if (!highlight) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({
      data: {
        likes_count: highlight.likes_count,
        dislikes_count: highlight.dislikes_count,
        shares_count: highlight.shares_count + 1,
      },
      type: 'SUCCESS',
    });
  }),
];
