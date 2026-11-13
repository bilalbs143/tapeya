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

/** RTK `getState()` is untyped here; `selectAccessToken` only needs `{ auth }`. */
type AuthTokenState = Parameters<typeof selectAccessToken>[0];

function accessTokenFrom(getState: () => unknown): string | null {
  return selectAccessToken(getState() as AuthTokenState);
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = accessTokenFrom(getState);
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

    const tokenAtStart = accessTokenFrom(api.getState);
    const result = await rawBaseQuery(args, api, extraOptions);

    // 401 + Bearer on a protected route = session expiry (OTP failure is also 401).
    // Only clear if this request actually had a token AND that token is still the
    // current session — avoids boot races (/me before hydrate) and stale in-flight
    // 401s wiping a freshly logged-in session.
    if (result.error?.status === 401 && tokenAtStart && !isPublicAuthRequest(resolveRequestUrl(args))) {
      const tokenNow = accessTokenFrom(api.getState);
      if (tokenNow && tokenNow === tokenAtStart) {
        await clearAuthSession(api.dispatch);
        // dialogStore is callable outside React — §13.1
        dialogStore.open('sessionExpired', {
          onLogIn: () => {
            dialogStore.closeAll();
            window.location.assign(APP_PATHS.login);
          },
        });
      }
    }

    return result;
  },
  endpoints: () => ({}),
});
