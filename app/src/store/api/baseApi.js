import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { isUnauthorizedError } from '@/lib/apiErrors';
import { baseUrl } from '@/lib/apiOrigin';
import { clearCredentials } from '@/store/slices/authSlice';

export { baseUrl, getApiOrigin } from '@/lib/apiOrigin';

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Accept', 'application/json');
    return headers;
  },
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: async (args, api, extraOptions) => {
    const isFormDataRequest = args && typeof args === 'object' && 'body' in args && args.body instanceof FormData;

    if (!isFormDataRequest && args && typeof args === 'object') {
      args.headers = {
        'Content-Type': 'application/json',
        ...(args.headers || {}),
      };
    }

    const result = await rawBaseQuery(args, api, extraOptions);

    if (isUnauthorizedError(result.error)) {
      api.dispatch(clearCredentials());
    }

    return result;
  },
  tagTypes: [
    'User',
    'Auth',
    'List',
    'Item',
    'Shop',
    'Tournament',
    'TournamentRequest',
    'TournamentTeams',
    'TournamentSquadOccupancy',
    'TournamentMatches',
    'Team',
    'TeamSquad',
    'Match',
    'MatchState',
    'Scorecard',
    'MatchPlayerStats',
    'InterestCampaign',
    'LiveStreams',
    'LiveScores',
    'Highlight',
    'Reel',
    'Post',
  ],
  endpoints: () => ({}),
});
