import { baseApi } from './baseApi';

const ballMutationInvalidates = (_result, _err, { matchId }) => [
  { type: 'Scorecard', id: matchId },
  { type: 'Match', id: matchId },
];

/** Shared lifecycle for ball mutations — response includes authoritative match_state. */
const ballMutationConfig = {
  transformResponse: (response) => response?.data ?? response,
  async onQueryStarted({ matchId }, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled;
      if (data?.match_state) {
        dispatch(matchApi.util.updateQueryData('getMatchState', String(matchId), () => data.match_state));
      }
    } catch {
      /* ignore */
    }
  },
  invalidatesTags: ballMutationInvalidates,
};

/**
 * Match & scoring API – get match, scorecard, balls, toss, playing eleven (auth required).
 * Used by organizer scoring flow.
 */
export const matchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMatchState: builder.query({
      query: (matchId) => ({
        url: `/matches/${matchId}/match-state`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (result, _err, matchId) => (result ? [{ type: 'MatchState', id: matchId }] : []),
    }),

    getMatch: builder.query({
      query: (matchId) => ({
        url: `/matches/${matchId}`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (result, _err, matchId) => (result ? [{ type: 'Match', id: matchId }] : []),
    }),

    getScorecard: builder.query({
      query: (matchId) => ({
        url: `/matches/${matchId}/scorecard`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (result, _err, matchId) => (matchId ? [{ type: 'Scorecard', id: matchId }] : []),
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
      invalidatesTags: (_result, _err, { matchId }) =>
        matchId
          ? [
              { type: 'MatchState', id: matchId },
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
      ...ballMutationConfig,
    }),

    updateBall: builder.mutation({
      query: ({ matchId, inningsId, ballId, payload }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls/${ballId}`,
        method: 'PATCH',
        body: payload,
      }),
      ...ballMutationConfig,
    }),

    deleteBall: builder.mutation({
      query: ({ matchId, inningsId, ballId }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls/${ballId}`,
        method: 'DELETE',
      }),
      ...ballMutationConfig,
    }),

    deleteLastBall: builder.mutation({
      query: ({ matchId, inningsId }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls/last`,
        method: 'DELETE',
      }),
      ...ballMutationConfig,
    }),

    updatePlayerOfMatch: builder.mutation({
      query: ({ matchId, player_of_match_user_id }) => ({
        url: `/matches/${matchId}/player-of-match`,
        method: 'PATCH',
        body: { player_of_match_user_id },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) => [{ type: 'Match', id: matchId }],
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
        { type: 'MatchState', id: matchId },
      ],
    }),

    updateCrease: builder.mutation({
      query: ({ matchId, ...patch }) => ({
        url: `/matches/${matchId}/crease`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (_result, _err, { matchId }) => (matchId ? [{ type: 'MatchState', id: matchId }] : []),
    }),

    sendLiveComment: builder.mutation({
      query: ({ matchId, body }) => ({
        url: `/matches/${matchId}/live-comments`,
        method: 'POST',
        body: { body },
      }),
      transformResponse: (response) => response?.data ?? response,
    }),
    sendLiveHeart: builder.mutation({
      query: ({ matchId }) => ({
        url: `/matches/${matchId}/live-hearts`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? response,
    }),
  }),
});

export const {
  useGetMatchStateQuery,
  useLazyGetMatchStateQuery,
  useGetMatchQuery,
  useLazyGetMatchQuery,
  useGetScorecardQuery,
  useLazyGetScorecardQuery,
  useStoreMatchSquadMutation,
  useStorePlayingElevenMutation,
  useStoreBallMutation,
  useUpdateBallMutation,
  useDeleteBallMutation,
  useDeleteLastBallMutation,
  useUpdateTossMutation,
  useUpdatePlayerOfMatchMutation,
  useUpdateCreaseMutation,
  useSendLiveCommentMutation,
  useSendLiveHeartMutation,
} = matchApi;
