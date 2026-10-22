import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

const sampleStream = {
  id: 101,
  match_id: null,
  tournament_id: null,
  is_self_serve: true,
  orientation: 'portrait',
  title: 'Sunday Cup — Semi 1',
  description: 'Ground A · Block B',
  thumbnail_url: null,
  broadcaster: {
    id: 7,
    name: 'Ayesha Khan',
    nickname: 'ayesha',
    avatar_url: null,
    is_official: false,
  },
  stream: {
    status: 'live',
    provider: 'external',
    embed_id: null,
    playback: {
      mode: 'iframe',
      embed_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      embed_id: 'dQw4w9WgXcQ',
    },
    started_at: new Date().toISOString(),
    ended_at: null,
  },
};

export const liveHandlers = [
  http.get(`${env.VITE_API_URL}/live/matches`, () => HttpResponse.json({ data: [sampleStream], type: 'success' })),

  http.get(`${env.VITE_API_URL}/live/streams/:streamId`, ({ params }) => {
    const id = Number(params.streamId);
    return HttpResponse.json({
      data: { ...sampleStream, id },
      type: 'success',
    });
  }),

  http.get(`${env.VITE_API_URL}/live/streams/:streamId/live-comments`, () =>
    HttpResponse.json({
      data: [
        {
          id: 'c1',
          name: 'Raza',
          text: 'Let’s go!',
          sent_at: new Date().toISOString(),
          avatar_url: 'https://cdn.example/raza.jpg',
        },
        {
          id: 'c2',
          name: 'Sana',
          text: 'What a shot',
          sent_at: new Date().toISOString(),
          avatar_url: null,
        },
      ],
      type: 'success',
    })
  ),

  http.post(`${env.VITE_API_URL}/live/streams/:streamId/live-comments`, async ({ request }) => {
    const body = (await request.json()) as { body?: string };
    return HttpResponse.json(
      { data: { id: `c-${Date.now()}`, name: 'You', text: body.body ?? '' }, type: 'success' },
      { status: 201 }
    );
  }),

  http.post(`${env.VITE_API_URL}/live/streams/:streamId/live-hearts`, () => new HttpResponse(null, { status: 204 })),

  http.post(`${env.VITE_API_URL}/live/broadcasts/accept-terms`, () =>
    HttpResponse.json({
      data: { broadcast_terms_accepted_at: new Date().toISOString() },
      type: 'success',
    })
  ),

  http.post(`${env.VITE_API_URL}/live/broadcasts`, async ({ request }) => {
    const body = (await request.json()) as { title?: string; orientation?: string };
    return HttpResponse.json(
      {
        data: {
          stream_id: 202,
          rtmp_url: 'rtmps://example.live/app',
          stream_key: 'demo-key',
          orientation: body.orientation ?? 'portrait',
        },
        type: 'success',
      },
      { status: 201 }
    );
  }),

  http.get(`${env.VITE_API_URL}/live/broadcasts/:streamId`, ({ params }) =>
    HttpResponse.json({
      data: {
        stream_id: Number(params.streamId),
        rtmp_url: 'rtmps://example.live/app',
        stream_key: 'demo-key',
        status: 'idle',
        orientation: 'portrait',
      },
      type: 'success',
    })
  ),

  http.post(`${env.VITE_API_URL}/live/broadcasts/:streamId/start`, () =>
    HttpResponse.json({
      data: { status: 'live', started_at: new Date().toISOString() },
      type: 'success',
    })
  ),

  http.post(`${env.VITE_API_URL}/live/broadcasts/:streamId/end`, () =>
    HttpResponse.json({ data: { status: 'ended' }, type: 'success' })
  ),

  http.post(`${env.VITE_API_URL}/live/broadcasts/:streamId/thumbnail`, () =>
    HttpResponse.json({ data: { thumbnail_url: null }, type: 'success' })
  ),
];
