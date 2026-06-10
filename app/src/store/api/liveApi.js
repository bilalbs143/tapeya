import { baseApi } from './baseApi';

/**
 * Live stream hub — matches with stream status live or starting (open tournaments only).
 */
export const liveApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLiveMatches: builder.query({
      query: () => ({
        url: '/live/matches',
      }),
      transformResponse: (response) => response?.data ?? [],
      providesTags: [{ type: 'LiveStreams', id: 'LIST' }],
    }),
  }),
});

export const { useGetLiveMatchesQuery } = liveApi;
