import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

/** MSW auth handlers — Laravel `/auth/*` shapes; OTP length 4. */
export const authHandlers = [
  http.post(`${env.VITE_API_URL}/auth/request-otp`, () => {
    return HttpResponse.json({
      data: { otp: '4821' },
      message: 'Code sent.',
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { phone: string; name: string; nickname: string };
    return HttpResponse.json({
      data: {
        user: {
          id: 2,
          name: body.name,
          nickname: body.nickname,
          avatar_url: null,
        },
        otp: '4821',
      },
      message: 'auth.otp_sent',
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/auth/verify-otp`, async ({ request }) => {
    const body = (await request.json()) as { phone: string; code: string };

    if (body.code !== '4821') {
      return HttpResponse.json({ message: 'Invalid OTP.', type: 'UNAUTHORIZED' }, { status: 401 });
    }

    return HttpResponse.json({
      data: {
        user: {
          id: 1,
          name: 'Test User',
          nickname: 'testuser',
          avatar_url: null,
          email: null,
          phone: body.phone,
        },
        auth: {
          access_token: 'test-token',
          token_type: 'Bearer',
        },
      },
      message: 'auth.logged_in',
      type: 'SUCCESS',
    });
  }),

  http.get(`${env.VITE_API_URL}/me`, ({ request }) => {
    const auth = request.headers.get('Authorization');
    if (!auth || auth === 'Bearer expired') {
      return HttpResponse.json({ message: 'Unauthenticated.', type: 'UNAUTHORIZED' }, { status: 401 });
    }
    return HttpResponse.json({
      data: {
        id: 1,
        name: 'Test User',
        nickname: 'testuser',
        avatar_url: null,
        email: null,
        phone: '+923001234567',
        date_of_birth: null,
        playing_role: 'Batsman',
        playing_role_enum: 'BATSMAN',
        batting_style: null,
        bowling_style: null,
        city: 'Karachi',
        country: 'Pakistan',
        followers_count: 12,
        following_count: 8,
        reels_count: 2,
        posts_count: 4,
        is_official: false,
      },
      type: 'SUCCESS',
    });
  }),

  http.patch(`${env.VITE_API_URL}/profile`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      data: {
        id: 1,
        name: body.name ?? 'Test User',
        nickname: body.nickname ?? 'testuser',
        avatar_url: body.avatar === null ? null : null,
        email: body.email ?? null,
        phone: '+923001234567',
        date_of_birth: body.date_of_birth ?? null,
        playing_role: body.playing_role === 'batsman' ? 'Batsman' : (body.playing_role ?? null),
        playing_role_enum: typeof body.playing_role === 'string' ? body.playing_role.toUpperCase() : null,
        batting_style: body.batting_style ?? null,
        bowling_style: body.bowling_style ?? null,
        city: body.city ?? null,
        country: body.country ?? null,
        followers_count: 12,
        following_count: 8,
        reels_count: 2,
        posts_count: 4,
        is_official: false,
      },
      message: 'Profile updated.',
      type: 'SUCCESS',
    });
  }),

  http.post(`${env.VITE_API_URL}/profile`, async ({ request }) => {
    const form = await request.formData();
    return HttpResponse.json({
      data: {
        id: 1,
        name: form.get('name') ?? 'Test User',
        nickname: form.get('nickname') ?? 'testuser',
        avatar_url: 'https://cdn.example/avatar.jpg',
        email: form.get('email') || null,
        phone: '+923001234567',
        date_of_birth: form.get('date_of_birth') || null,
        playing_role: form.get('playing_role') || null,
        city: form.get('city') || null,
        country: form.get('country') || null,
        followers_count: 12,
        following_count: 8,
        reels_count: 2,
        posts_count: 4,
        is_official: false,
      },
      message: 'Profile updated.',
      type: 'SUCCESS',
    });
  }),

  http.delete(`${env.VITE_API_URL}/profile`, () => {
    return HttpResponse.json({ message: 'Account deleted.', type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out.', type: 'SUCCESS' });
  }),
];
