import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { clearCredentials } from '@/store/slices/authSlice';

export const baseUrl =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

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
    // Ensure JSON Content-Type only when body is not FormData
    const isFormDataRequest =
      args &&
      typeof args === 'object' &&
      'body' in args &&
      args.body instanceof FormData;

    if (!isFormDataRequest && args && typeof args === 'object') {
      args.headers = {
        'Content-Type': 'application/json',
        ...(args.headers || {}),
      };
    }

    const result = await rawBaseQuery(args, api, extraOptions);

    // On 401, clear auth so RequireAuth redirects to login (handles expired/invalid token or cleared session)
    if (result.error?.status === 401) {
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
    'TournamentTeams',
    'TournamentMatches',
    'TeamSquad',
    'Match',
    'Scorecard',
  ],
  endpoints: () => ({}),
});
