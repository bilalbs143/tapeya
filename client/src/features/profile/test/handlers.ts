import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import type { PublicProfileWire } from '../model/schemas';

const sara: PublicProfileWire = {
  id: 11,
  name: 'Sara Ali',
  nickname: 'sara',
  avatar_url: null,
  playing_role: 'Batsman',
  playing_role_enum: 'BATSMAN',
  city: 'Lahore',
  country: 'Pakistan',
  followers_count: 1200,
  following_count: 40,
  reels_count: 2,
  posts_count: 1,
  is_official: false,
  is_following: false,
};

const lookupUsers = [
  { id: 11, name: 'Sara Ali', nickname: 'sara', phone: null, playing_role: 'Batsman', playing_role_enum: 'BATSMAN' },
  {
    id: 1,
    name: 'Test User',
    nickname: 'testuser',
    phone: null,
    playing_role: 'Batsman',
    playing_role_enum: 'BATSMAN',
  },
];

export const profileHandlers = [
  http.get(`${env.VITE_API_URL}/users/lookup`, ({ request }) => {
    const url = new URL(request.url);
    const search = (url.searchParams.get('search') ?? '').trim().toLowerCase();
    if (!search) {
      return HttpResponse.json({ data: [], type: 'SUCCESS' });
    }
    const hits = lookupUsers.filter(
      (u) => u.nickname.toLowerCase().includes(search) || u.name.toLowerCase().includes(search)
    );
    return HttpResponse.json({ data: hits, type: 'SUCCESS' });
  }),

  http.get(`${env.VITE_API_URL}/users/:userId/profile`, ({ params }) => {
    const id = Number(params.userId);
    if (id === 1) {
      return HttpResponse.json({
        data: {
          id: 1,
          name: 'Test User',
          nickname: 'testuser',
          avatar_url: null,
          playing_role: 'Batsman',
          city: 'Karachi',
          country: 'Pakistan',
          followers_count: 12,
          following_count: 8,
          reels_count: 2,
          posts_count: 4,
          is_official: false,
          is_following: false,
        },
        type: 'SUCCESS',
      });
    }
    if (id !== 11) {
      return HttpResponse.json({ message: 'Not found.', type: 'NOT_FOUND' }, { status: 404 });
    }
    return HttpResponse.json({ data: sara, type: 'SUCCESS' });
  }),
];
