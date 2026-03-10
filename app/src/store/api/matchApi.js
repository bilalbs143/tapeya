import { baseApi } from './baseApi';

/**
 * Match & scoring API – get match, scorecard, balls, toss, playing eleven (auth required).
 * Used by organizer scoring flow.
 *
 * Endpoints:
 * - GET /matches/:matchId
 * - GET /matches/:matchId/scorecard
 * - GET /matches/:matchId/teams/:teamId/playing-eleven
 * - POST /matches/:matchId/innings/:inningsId/balls
 * - PATCH /matches/:matchId/innings/:inningsId/balls/:ballId
 * - DELETE /matches/:matchId/innings/:inningsId/balls/:ballId
 * - PATCH /matches/:matchId/toss
 */
export const matchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMatch: builder.query({
      query: (matchId) => ({
        url: `/matches/${matchId}`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (result, _err, matchId) =>
        result ? [{ type: 'Match', id: matchId }] : [],
    }),

    getScorecard: builder.query({
      query: (matchId) => ({
        url: `/matches/${matchId}/scorecard`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (result, _err, matchId) =>
        matchId ? [{ type: 'Scorecard', id: matchId }] : [],
    }),

    getPlayingEleven: builder.query({
      query: ({ matchId, teamId }) => ({
        url: `/matches/${matchId}/teams/${teamId}/playing-eleven`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _err, { matchId, teamId }) =>
        matchId && teamId
          ? [{ type: 'Match', id: `${matchId}-team-${teamId}` }]
          : [],
    }),

    storeMatchSquad: builder.mutation({
      query: ({ matchId, teamId, player_ids }) => ({
        url: `/matches/${matchId}/teams/${teamId}/squad`,
        method: 'POST',
        body: { player_ids },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId, teamId }) =>
        matchId && teamId
          ? [
              { type: 'Match', id: matchId },
              { type: 'Match', id: `${matchId}-team-${teamId}` },
            ]
          : [],
    }),

    storePlayingEleven: builder.mutation({
      query: ({ matchId, teamId, player_ids }) => ({
        url: `/matches/${matchId}/teams/${teamId}/playing-eleven`,
        method: 'POST',
        body: { player_ids },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId, teamId }) =>
        matchId && teamId
          ? [
              { type: 'Match', id: matchId },
              { type: 'Match', id: `${matchId}-team-${teamId}` },
              { type: 'Scorecard', id: matchId },
            ]
          : [],
    }),

    storeBall: builder.mutation({
      query: ({ matchId, inningsId, payload }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls`,
        method: 'POST',
        body: payload,
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) => [
        { type: 'Scorecard', id: matchId },
      ],
    }),

    updateBall: builder.mutation({
      query: ({ matchId, inningsId, ballId, payload }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls/${ballId}`,
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) => [
        { type: 'Scorecard', id: matchId },
      ],
    }),

    deleteBall: builder.mutation({
      query: ({ matchId, inningsId, ballId }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls/${ballId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { matchId }) => [
        { type: 'Scorecard', id: matchId },
      ],
    }),

    updateToss: builder.mutation({
      query: ({ matchId, winning_team_id, chose_to_bat_or_bowl }) => ({
        url: `/matches/${matchId}/toss`,
        method: 'PATCH',
        body: { winning_team_id, chose_to_bat_or_bowl },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) => [
        { type: 'Match', id: matchId },
        { type: 'Scorecard', id: matchId },
      ],
    }),
  }),
});

export const {
  useGetMatchQuery,
  useLazyGetMatchQuery,
  useGetScorecardQuery,
  useLazyGetScorecardQuery,
  useGetPlayingElevenQuery,
  useLazyGetPlayingElevenQuery,
  useStoreMatchSquadMutation,
  useStorePlayingElevenMutation,
  useStoreBallMutation,
  useUpdateBallMutation,
  useDeleteBallMutation,
  useUpdateTossMutation,
} = matchApi;
