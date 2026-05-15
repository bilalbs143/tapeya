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
 * - PATCH /matches/:matchId/player-of-match
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
        { type: 'Match', id: matchId },
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
        { type: 'Match', id: matchId },
      ],
    }),

    deleteBall: builder.mutation({
      query: ({ matchId, inningsId, ballId }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls/${ballId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _err, { matchId }) => [
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
      ],
    }),

    updatePlayerOfMatch: builder.mutation({
      query: ({ matchId, player_of_match_user_id }) => ({
        url: `/matches/${matchId}/player-of-match`,
        method: 'PATCH',
        body: { player_of_match_user_id },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) => [
        { type: 'Match', id: matchId },
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

    /**
     * Notify the graphic session about the next batsman/bowler before they face
     * their first ball, so the overlay graphic shows them immediately instead of
     * showing a blank slot.
     *
     * Pass any subset of keys; each key omitted is left unchanged on the server.
     * Body is sent as-is (after removing `matchId` from the mutation argument).
     *
     * Keys: `next_batter_id`, `next_non_striker_id`, `next_bowler_id` (use `null` to clear).
     */
    setPendingGraphicPlayers: builder.mutation({
      query: ({ matchId, ...patch }) => ({
        url: `/matches/${matchId}/graphic-session/pending-players`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _err, { matchId }) =>
        matchId ? [{ type: 'Scorecard', id: matchId }] : [],
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
  useUpdatePlayerOfMatchMutation,
  useSetPendingGraphicPlayersMutation,
} = matchApi;
