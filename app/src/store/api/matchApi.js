import { baseApi } from './baseApi';

const ballMutationInvalidates = (_result, _err, { matchId }) => [
  { type: 'Scorecard', id: matchId },
  { type: 'Match', id: matchId },
  { type: 'MatchPlayerStats', id: matchId },
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

    getMatchPlayerStats: builder.query({
      query: (matchId) => ({
        url: `/matches/${matchId}/player-stats`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _err, matchId) => (matchId ? [{ type: 'MatchPlayerStats', id: matchId }] : []),
    }),

    getMatchTeamSquad: builder.query({
      query: ({ matchId, teamId }) => ({
        url: `/matches/${matchId}/teams/${teamId}/squad`,
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _err, { matchId, teamId }) =>
        matchId && teamId ? [{ type: 'Match', id: `${matchId}-team-${teamId}` }] : [],
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

    updateWicketKeeper: builder.mutation({
      query: ({ matchId, team_id, wicket_keeper_id }) => ({
        url: `/matches/${matchId}/wicket-keeper`,
        method: 'PATCH',
        body: { team_id, wicket_keeper_id },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId, team_id }) =>
        matchId && team_id
          ? [
              { type: 'Match', id: matchId },
              { type: 'Match', id: `${matchId}-team-${team_id}` },
            ]
          : [],
    }),

    updateCaptain: builder.mutation({
      query: ({ matchId, team_id, captain_id }) => ({
        url: `/matches/${matchId}/captain`,
        method: 'PATCH',
        body: { team_id, captain_id },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId, team_id }) =>
        matchId && team_id
          ? [
              { type: 'Match', id: matchId },
              { type: 'Match', id: `${matchId}-team-${team_id}` },
            ]
          : [],
    }),

    storeMatchSubstitute: builder.mutation({
      query: ({ matchId, innings_id, replaced_player_id, substitute_player_id, fielder_id }) => ({
        url: `/matches/${matchId}/substitutes`,
        method: 'POST',
        body: {
          innings_id,
          replaced_player_id,
          substitute_player_id,
          fielder_id: fielder_id ?? undefined,
        },
      }),
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
      invalidatesTags: (_result, _err, { matchId }) =>
        matchId
          ? [
              { type: 'Scorecard', id: matchId },
              { type: 'Match', id: matchId },
              { type: 'MatchState', id: matchId },
            ]
          : [],
    }),

    storeMatchBreak: builder.mutation({
      query: ({ matchId, break_type, notes, innings_id }) => ({
        url: `/matches/${matchId}/breaks`,
        method: 'POST',
        body: {
          break_type,
          notes,
          innings_id: innings_id ?? undefined,
        },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) => (matchId ? [{ type: 'Match', id: matchId }] : []),
    }),

    getMatchNotes: builder.query({
      query: ({ matchId, sort = 'desc', q }) => ({
        url: `/matches/${matchId}/notes`,
        params: {
          sort,
          ...(q ? { q } : {}),
        },
      }),
      transformResponse: (response) => response?.data ?? response,
      providesTags: (_result, _err, { matchId }) => (matchId ? [{ type: 'Match', id: matchId }] : []),
    }),

    createMatchNote: builder.mutation({
      query: ({ matchId, body }) => ({
        url: `/matches/${matchId}/notes`,
        method: 'POST',
        body: { body },
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) => (matchId ? [{ type: 'Match', id: matchId }] : []),
    }),

    deleteMatchNote: builder.mutation({
      query: ({ matchId, noteId }) => ({
        url: `/matches/${matchId}/notes/${noteId}`,
        method: 'DELETE',
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) => (matchId ? [{ type: 'Match', id: matchId }] : []),
    }),

    storeAdditionalRuns: builder.mutation({
      query: ({ matchId, inningsId, runs }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/additional-runs`,
        method: 'POST',
        body: { runs },
      }),
      ...ballMutationConfig,
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

    reviseTarget: builder.mutation({
      query: ({ matchId, revised_target, action }) => ({
        url: `/matches/${matchId}/target-revision`,
        method: 'POST',
        body: { revised_target, action },
      }),
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
      invalidatesTags: (_result, _err, { matchId }) =>
        matchId
          ? [
              { type: 'Scorecard', id: matchId },
              { type: 'Match', id: matchId },
              { type: 'MatchState', id: matchId },
            ]
          : [],
    }),

    declareResult: builder.mutation({
      query: ({ matchId, declare_result_type, winner_team_id, declare_result_note }) => ({
        url: `/matches/${matchId}/declare-result`,
        method: 'POST',
        body: {
          declare_result_type,
          winner_team_id: winner_team_id ?? undefined,
          declare_result_note,
        },
      }),
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
      invalidatesTags: (_result, _err, { matchId }) =>
        matchId
          ? [
              { type: 'Scorecard', id: matchId },
              { type: 'Match', id: matchId },
              { type: 'MatchState', id: matchId },
            ]
          : [],
    }),

    endMatch: builder.mutation({
      query: ({ matchId, cancel_reason, cancel_comments, cancel_points_awarded_each }) => ({
        url: `/matches/${matchId}/end`,
        method: 'POST',
        body: {
          cancel_reason,
          cancel_comments,
          cancel_points_awarded_each,
        },
      }),
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
      invalidatesTags: (_result, _err, { matchId }) =>
        matchId
          ? [
              { type: 'Scorecard', id: matchId },
              { type: 'Match', id: matchId },
              { type: 'MatchState', id: matchId },
            ]
          : [],
    }),

    endInnings: builder.mutation({
      query: ({ matchId, inningsId, end_reason, end_comments, points_awarded_each }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/end`,
        method: 'POST',
        body: {
          end_reason,
          end_comments,
          points_awarded_each,
        },
      }),
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
      invalidatesTags: (_result, _err, { matchId }) =>
        matchId
          ? [
              { type: 'Scorecard', id: matchId },
              { type: 'Match', id: matchId },
            ]
          : [],
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

    updateMatchAnalyticsSettings: builder.mutation({
      query: ({ matchId, ...body }) => ({
        url: `/matches/${matchId}/analytics-settings`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => response?.data ?? response,
      invalidatesTags: (_result, _err, { matchId }) =>
        matchId
          ? [
              { type: 'Match', id: matchId },
              { type: 'MatchState', id: matchId },
            ]
          : [],
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
  useGetMatchPlayerStatsQuery,
  useLazyGetMatchPlayerStatsQuery,
  useGetMatchTeamSquadQuery,
  useStoreMatchSquadMutation,
  useUpdateWicketKeeperMutation,
  useStoreMatchSubstituteMutation,
  useUpdateBattingStatsMutation,
  useUpdateBowlingStatsMutation,
  useStoreMatchBreakMutation,
  useGetMatchNotesQuery,
  useCreateMatchNoteMutation,
  useDeleteMatchNoteMutation,
  useStoreAdditionalRunsMutation,
  useStorePlayingElevenMutation,
  useStoreBallMutation,
  useUpdateBallMutation,
  useDeleteBallMutation,
  useDeleteLastBallMutation,
  useEndInningsMutation,
  useEndMatchMutation,
  useDeclareResultMutation,
  useReviseTargetMutation,
  useUpdateTossMutation,
  useUpdatePlayerOfMatchMutation,
  useUpdateCreaseMutation,
  useUpdateMatchAnalyticsSettingsMutation,
  useSendLiveCommentMutation,
  useSendLiveHeartMutation,
  useUpdateCaptainMutation,
} = matchApi;
