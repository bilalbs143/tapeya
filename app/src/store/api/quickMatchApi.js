import { baseApi } from './baseApi';

/**
 * Quick Match API — standalone matches (no tournament).
 * POST/GET/PATCH /quick-matches, add/remove players.
 */
export const quickMatchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuickMatches: builder.query({
      query: (params = {}) => ({
        url: '/quick-matches',
        params: {
          all: params.all === false ? undefined : 1,
          ...(params.status ? { status: params.status } : {}),
        },
      }),
      transformResponse: (response) => {
        const data = response?.data;
        if (Array.isArray(data)) return { data, meta: response?.meta };
        if (data && Array.isArray(data.data)) return { data: data.data, meta: data.meta ?? response?.meta };
        return { data: [], meta: response?.meta };
      },
      providesTags: (result) =>
        result?.data?.length
          ? [...result.data.map((m) => ({ type: 'Match', id: m.id })), { type: 'Match', id: 'QUICK_LIST' }]
          : [{ type: 'Match', id: 'QUICK_LIST' }],
    }),

    getQuickMatch: builder.query({
      query: (matchId) => `/quick-matches/${matchId}`,
      transformResponse: (response) => response?.data ?? response,
      providesTags: (result) => (result?.id != null ? [{ type: 'Match', id: result.id }] : []),
    }),

    createQuickMatch: builder.mutation({
      query: (body) => ({
        url: '/quick-matches',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: [
        { type: 'Match', id: 'QUICK_LIST' },
        { type: 'Team', id: 'LIST' },
        { type: 'User', id: 'LOOKUP_MINE' },
      ],
    }),

    updateQuickMatch: builder.mutation({
      query: ({ matchId, ...body }) => ({
        url: `/quick-matches/${matchId}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) => [
        { type: 'Match', id: matchId },
        { type: 'Match', id: 'QUICK_LIST' },
      ],
    }),

    addQuickMatchPlayer: builder.mutation({
      query: ({ matchId, teamId, ...body }) => ({
        url: `/quick-matches/${matchId}/teams/${teamId}/players`,
        method: 'POST',
        body,
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId, teamId }) =>
        [
          { type: 'Match', id: matchId },
          { type: 'MatchState', id: matchId },
          { type: 'User', id: 'LOOKUP_MINE' },
          teamId ? { type: 'TeamSquad', id: teamId } : null,
        ].filter(Boolean),
    }),

    removeQuickMatchPlayer: builder.mutation({
      query: ({ matchId, teamId, userId }) => ({
        url: `/quick-matches/${matchId}/teams/${teamId}/players/${userId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId, teamId }) =>
        [
          { type: 'Match', id: matchId },
          { type: 'MatchState', id: matchId },
          teamId ? { type: 'TeamSquad', id: teamId } : null,
        ].filter(Boolean),
    }),
  }),
});

export const {
  useGetQuickMatchesQuery,
  useGetQuickMatchQuery,
  useCreateQuickMatchMutation,
  useUpdateQuickMatchMutation,
  useAddQuickMatchPlayerMutation,
  useRemoveQuickMatchPlayerMutation,
} = quickMatchApi;
