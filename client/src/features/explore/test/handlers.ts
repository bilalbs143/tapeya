import { http, HttpResponse } from 'msw';

import { env } from '@/shared/config/env';

import type { SuggestedUserWire } from '../model/schemas';

const fixtures: SuggestedUserWire[] = [
  {
    id: 11,
    name: 'Sara Ali',
    nickname: 'sara',
    avatar_url: null,
    is_official: false,
    followers_count: 1200,
    playing_role: 'Batter',
    is_following: false,
    subtitle: 'Batter',
  },
  {
    id: 12,
    name: 'Tapeya Cricket',
    nickname: 'tapeya',
    avatar_url: null,
    is_official: true,
    followers_count: 50000,
    playing_role: null,
    is_following: false,
    subtitle: 'Official account',
  },
];

export const exploreHandlers = [
  http.get(`${env.VITE_API_URL}/users/suggestions`, () => {
    return HttpResponse.json({ data: fixtures, type: 'SUCCESS' });
  }),

  http.post(`${env.VITE_API_URL}/users/:id/follow`, () => {
    return HttpResponse.json({
      data: { followers_count: 1201, following_count: 10, am_following: true },
      type: 'SUCCESS',
    });
  }),

  http.delete(`${env.VITE_API_URL}/users/:id/follow`, () => {
    return HttpResponse.json({
      data: { followers_count: 1200, following_count: 9, am_following: false },
      type: 'SUCCESS',
    });
  }),
];
