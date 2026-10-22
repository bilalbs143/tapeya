import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import type { MutationResult } from '@/shared/api/types';
import { unwrapData, unwrapMessage, unwrapMutation } from '@/shared/api/unwrap';

import type { UpdateBallPayload } from '../lib/editBallPayload';
import type { StoreBallPayload } from '../lib/storeBallPayload';
import { parseScorecard, type Scorecard } from '../model/scorecardSchemas';
import {
  parseScoringFixture,
  type ScoringFixture,
  scoringFixtureWireSchema,
  toScoringFixture,
} from '../model/scoringFixture';
import {
  parseScoringState,
  type ScoringSession,
  scoringStateWireSchema,
  toScoringSession,
} from '../model/scoringSession';
import { parseStoreBallResponse, type StoreBallResult } from '../model/storeBallSchemas';

export const matchScoringApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Fixture + toss for the scorer — GET /matches/:id. */
    getScoringFixture: builder.query<ScoringFixture, number>({
      query: (matchId) => ({ url: `/matches/${matchId}` }),
      transformResponse: (raw: unknown) => parseScoringFixture(raw),
      providesTags: (_r, _e, matchId) => [{ type: 'Match', id: matchId }],
    }),

    /** Canonical live state — GET /matches/:id/match-state. */
    getScoringState: builder.query<ScoringSession, number>({
      query: (matchId) => ({ url: `/matches/${matchId}/match-state` }),
      transformResponse: (raw: unknown) => parseScoringState(raw),
      providesTags: (_r, _e, matchId) => [{ type: 'MatchState', id: matchId }],
    }),

    /** Full ball history + innings tables — GET /matches/:id/scorecard. */
    getScorecard: builder.query<Scorecard, number>({
      query: (matchId) => ({ url: `/matches/${matchId}/scorecard` }),
      transformResponse: (raw: unknown) => parseScorecard(raw),
      providesTags: (_r, _e, matchId) => [{ type: 'Scorecard', id: matchId }],
    }),

    updateToss: builder.mutation<
      MutationResult<ScoringFixture>,
      { matchId: number; winningTeamId: number; choseTo: 'bat' | 'bowl' }
    >({
      query: ({ matchId, winningTeamId, choseTo }) => ({
        url: `/matches/${matchId}/toss`,
        method: 'PATCH',
        body: { winning_team_id: winningTeamId, chose_to_bat_or_bowl: choseTo },
      }),
      transformResponse: (raw: unknown) => {
        const result = unwrapMutation(scoringFixtureWireSchema)(raw);
        return {
          message: result.message,
          created: result.created,
          data: result.data ? toScoringFixture(result.data) : null,
        };
      },
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'Match', id: matchId },
        { type: 'Match', id: 'QUICK_LIST' },
        { type: 'MatchState', id: matchId },
      ],
    }),

    updateCrease: builder.mutation<
      string | undefined,
      {
        matchId: number;
        nextBatterId?: number | null | undefined;
        nextNonStrikerId?: number | null | undefined;
        nextBowlerId?: number | null | undefined;
      }
    >({
      query: ({ matchId, nextBatterId, nextNonStrikerId, nextBowlerId }) => ({
        url: `/matches/${matchId}/crease`,
        method: 'PATCH',
        body: {
          ...(nextBatterId !== undefined ? { next_batter_id: nextBatterId } : {}),
          ...(nextNonStrikerId !== undefined ? { next_non_striker_id: nextNonStrikerId } : {}),
          ...(nextBowlerId !== undefined ? { next_bowler_id: nextBowlerId } : {}),
        },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [{ type: 'MatchState', id: matchId }],
    }),

    storeBall: builder.mutation<StoreBallResult, { matchId: number; inningsId: number; payload: StoreBallPayload }>({
      query: ({ matchId, inningsId, payload }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls`,
        method: 'POST',
        body: payload,
      }),
      transformResponse: (raw: unknown) => parseStoreBallResponse(raw),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
        { type: 'Match', id: 'QUICK_LIST' },
      ],
    }),

    updateBall: builder.mutation<
      StoreBallResult,
      { matchId: number; inningsId: number; ballId: number; payload: UpdateBallPayload }
    >({
      query: ({ matchId, inningsId, ballId, payload }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls/${ballId}`,
        method: 'PATCH',
        body: payload,
      }),
      transformResponse: (raw: unknown) => parseStoreBallResponse(raw),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
        { type: 'Match', id: 'QUICK_LIST' },
      ],
    }),

    deleteBall: builder.mutation<
      { matchState: ScoringSession },
      { matchId: number; inningsId: number; ballId: number }
    >({
      query: ({ matchId, inningsId, ballId }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls/${ballId}`,
        method: 'DELETE',
      }),
      transformResponse: (raw: unknown) => {
        const data = unwrapData(z.object({ match_state: scoringStateWireSchema }))(raw);
        return { matchState: toScoringSession(data.match_state) };
      },
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
        { type: 'Match', id: 'QUICK_LIST' },
      ],
    }),

    deleteLastBall: builder.mutation<unknown, { matchId: number; inningsId: number }>({
      query: ({ matchId, inningsId }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/balls/last`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
        { type: 'Match', id: 'QUICK_LIST' },
      ],
    }),

    /** Correction runs — POST /matches/:id/innings/:inningsId/additional-runs. */
    storeAdditionalRuns: builder.mutation<string | undefined, { matchId: number; inningsId: number; runs: number }>({
      query: ({ matchId, inningsId, runs }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/additional-runs`,
        method: 'POST',
        body: { runs },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
      ],
    }),
  }),
});

export const {
  useGetScoringFixtureQuery,
  useGetScoringStateQuery,
  useGetScorecardQuery,
  useUpdateTossMutation,
  useUpdateCreaseMutation,
  useStoreBallMutation,
  useUpdateBallMutation,
  useDeleteBallMutation,
  useDeleteLastBallMutation,
  useStoreAdditionalRunsMutation,
} = matchScoringApi;
