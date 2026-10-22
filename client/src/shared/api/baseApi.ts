import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { dialogStore } from '@/shared/dialogs';
import { clearAuthSession } from '@/shared/store/authSession';
import { selectAccessToken } from '@/shared/store/authSlice';

import { env } from '../config/env';
import { APP_PATHS } from '../config/paths';

/** Central RTK Query tag union — typos fail the build instead of skipping invalidation. */
export const TAG_TYPES = [
  'User',
  'Tournament',
  'TournamentStandings',
  'TournamentSeasonStats',
  'Team',
  'TeamSquad',
  'TournamentSquadOccupancy',
  'Match',
  'MatchState',
  'Scorecard',
  'GraphicTheme',
  'GraphicSession',
  'Post',
  'Reel',
  'Highlight',
  'Shop',
  'VendorShop',
  'LiveScores',
  'LiveStreams',
  'HeroSlider',
  'Notification',
  'InterestCampaign',
  'DramaSerial',
  'DramaEpisode',
  'Enums',
  'Location',
] as const;
export type ApiTag = (typeof TAG_TYPES)[number];

/** Laravel returns 401 for bad OTP — that is not a session expiry. */
const PUBLIC_AUTH_PATHS = ['/auth/request-otp', '/auth/verify-otp', '/auth/register'] as const;

function resolveRequestUrl(args: unknown): string {
  if (typeof args === 'string') return args;
  if (typeof args === 'object' && args !== null && 'url' in args && typeof args.url === 'string') {
    return args.url;
  }
  return '';
}

function isPublicAuthRequest(url: string): boolean {
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RTK Query's own getState() is untyped at this layer; store.ts wires the real RootState.
    const token = selectAccessToken(getState() as any);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  tagTypes: TAG_TYPES,
  baseQuery: async (args, api, extraOptions) => {
    const isFormData = typeof args === 'object' && args !== null && 'body' in args && args.body instanceof FormData;

    if (!isFormData && typeof args === 'object' && args !== null) {
      args.headers = { 'Content-Type': 'application/json', ...(args.headers ?? {}) };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- same getState typing gap as prepareHeaders.
    const hadToken = Boolean(selectAccessToken(api.getState() as any));
    const result = await rawBaseQuery(args, api, extraOptions);

    // 401 + Bearer on a protected route = session expiry (OTP failure is also 401).
    if (result.error?.status === 401 && hadToken && !isPublicAuthRequest(resolveRequestUrl(args))) {
      await clearAuthSession(api.dispatch);
      // dialogStore is callable outside React — §13.1
      dialogStore.open('sessionExpired', {
        onLogIn: () => {
          dialogStore.closeAll();
          window.location.assign(APP_PATHS.login);
        },
      });
    }

    return result;
  },
  endpoints: () => ({}),
});
