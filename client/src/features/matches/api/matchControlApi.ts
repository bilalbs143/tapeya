import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData, unwrapMessage } from '@/shared/api/unwrap';

import { type MatchAnalyticsSettings, toAnalyticsSettings } from '../model/scoringFixture';
import { type MatchNoteRow, matchNoteWireSchema } from './matchesApiShared';

export type { MatchNoteRow } from './matchesApiShared';

export const matchControlApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Revise chase target — POST /matches/:id/target-revision. */
    reviseTarget: builder.mutation<
      string | undefined,
      { matchId: number; revisedTarget: number; action: 'continue' | 'end_innings' }
    >({
      query: ({ matchId, revisedTarget, action }) => ({
        url: `/matches/${matchId}/target-revision`,
        method: 'POST',
        body: { revised_target: revisedTarget, action },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
      ],
    }),

    /** Manual end innings — POST /matches/:id/innings/:inningsId/end. */
    endInnings: builder.mutation<
      string | undefined,
      {
        matchId: number;
        inningsId: number;
        endReason: string;
        endComments?: string | null | undefined;
        pointsAwardedEach?: boolean | undefined;
      }
    >({
      query: ({ matchId, inningsId, endReason, endComments, pointsAwardedEach }) => ({
        url: `/matches/${matchId}/innings/${inningsId}/end`,
        method: 'POST',
        body: {
          end_reason: endReason,
          end_comments: endComments ?? null,
          ...(pointsAwardedEach != null ? { points_awarded_each: pointsAwardedEach } : {}),
        },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
      ],
    }),

    /** Cancel / end match — POST /matches/:id/end. */
    endMatch: builder.mutation<
      string | undefined,
      {
        matchId: number;
        cancelReason: string;
        cancelComments?: string | null | undefined;
        cancelPointsAwardedEach?: boolean | undefined;
      }
    >({
      query: ({ matchId, cancelReason, cancelComments, cancelPointsAwardedEach }) => ({
        url: `/matches/${matchId}/end`,
        method: 'POST',
        body: {
          cancel_reason: cancelReason,
          cancel_comments: cancelComments ?? null,
          ...(cancelPointsAwardedEach != null ? { cancel_points_awarded_each: cancelPointsAwardedEach } : {}),
        },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
        { type: 'Match', id: 'QUICK_LIST' },
      ],
    }),

    /** Award / draw — POST /matches/:id/declare-result. */
    declareResult: builder.mutation<
      string | undefined,
      {
        matchId: number;
        declareResultType: 'award' | 'draw';
        winnerTeamId?: number | null | undefined;
        declareResultNote?: string | null | undefined;
      }
    >({
      query: ({ matchId, declareResultType, winnerTeamId, declareResultNote }) => ({
        url: `/matches/${matchId}/declare-result`,
        method: 'POST',
        body: {
          declare_result_type: declareResultType,
          ...(winnerTeamId != null ? { winner_team_id: winnerTeamId } : {}),
          declare_result_note: declareResultNote ?? null,
        },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
        { type: 'Match', id: 'QUICK_LIST' },
      ],
    }),

    /** Match settings — PATCH /matches/:id/analytics-settings. */
    updateMatchAnalyticsSettings: builder.mutation<
      MatchAnalyticsSettings,
      {
        matchId: number;
        wagonWheelEnabled?: boolean | undefined;
        umpires?: string | null | undefined;
        scorers?: string | null | undefined;
        commentators?: string | null | undefined;
      }
    >({
      query: ({ matchId, wagonWheelEnabled, umpires, scorers, commentators }) => ({
        url: `/matches/${matchId}/analytics-settings`,
        method: 'PATCH',
        body: {
          ...(wagonWheelEnabled != null ? { wagon_wheel_enabled: wagonWheelEnabled } : {}),
          ...(umpires !== undefined ? { umpires: umpires?.trim() || null } : {}),
          ...(scorers !== undefined ? { scorers: scorers?.trim() || null } : {}),
          ...(commentators !== undefined ? { commentators: commentators?.trim() || null } : {}),
        },
      }),
      transformResponse: (raw: unknown) => {
        const data = unwrapData(
          z.object({
            analytics_settings: z
              .object({
                wagon_wheel_enabled: z.boolean().optional(),
                umpires: z.string().nullable().optional(),
                scorers: z.string().nullable().optional(),
                commentators: z.string().nullable().optional(),
              })
              .optional(),
          })
        )(raw);
        return toAnalyticsSettings(data.analytics_settings);
      },
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'Match', id: matchId },
        { type: 'MatchState', id: matchId },
      ],
    }),

    /** Match break — POST /matches/:id/breaks. */
    storeMatchBreak: builder.mutation<
      string | undefined,
      { matchId: number; breakType: string; notes?: string | null | undefined; inningsId?: number | null | undefined }
    >({
      query: ({ matchId, breakType, notes, inningsId }) => ({
        url: `/matches/${matchId}/breaks`,
        method: 'POST',
        body: { break_type: breakType, notes: notes ?? null, ...(inningsId != null ? { innings_id: inningsId } : {}) },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [{ type: 'Match', id: matchId }],
    }),

    /** Crease substitute — POST /matches/:id/substitutes. */
    storeMatchSubstitute: builder.mutation<
      string | undefined,
      {
        matchId: number;
        inningsId: number;
        replacedPlayerId: number;
        substitutePlayerId: number;
        fielderId?: number | null | undefined;
      }
    >({
      query: ({ matchId, inningsId, replacedPlayerId, substitutePlayerId, fielderId }) => ({
        url: `/matches/${matchId}/substitutes`,
        method: 'POST',
        body: {
          innings_id: inningsId,
          replaced_player_id: replacedPlayerId,
          substitute_player_id: substitutePlayerId,
          ...(fielderId != null ? { fielder_id: fielderId } : {}),
        },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: matchId },
      ],
    }),

    /** Match notes list — GET /matches/:id/notes. */
    getMatchNotes: builder.query<
      MatchNoteRow[],
      { matchId: number; sort?: 'asc' | 'desc' | undefined; q?: string | undefined }
    >({
      query: ({ matchId, sort = 'desc', q }) => ({
        url: `/matches/${matchId}/notes`,
        params: { sort, ...(q ? { q } : {}) },
      }),
      transformResponse: (raw: unknown) => {
        const data = unwrapData(z.object({ notes: z.array(matchNoteWireSchema) }))(raw);
        return data.notes.map((n) => ({
          id: n.id,
          body: n.body,
          authorName: n.author_name?.trim() || null,
          createdAt: n.created_at ?? null,
        }));
      },
      providesTags: (_r, _e, { matchId }) => [{ type: 'Match', id: `${matchId}-notes` }],
    }),

    createMatchNote: builder.mutation<string | undefined, { matchId: number; body: string }>({
      query: ({ matchId, body }) => ({ url: `/matches/${matchId}/notes`, method: 'POST', body: { body } }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [{ type: 'Match', id: `${matchId}-notes` }],
    }),

    deleteMatchNote: builder.mutation<string | undefined, { matchId: number; noteId: number }>({
      query: ({ matchId, noteId }) => ({ url: `/matches/${matchId}/notes/${noteId}`, method: 'DELETE' }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [{ type: 'Match', id: `${matchId}-notes` }],
    }),
    /** GET /graphic-themes */
  }),
});

export const {
  useReviseTargetMutation,
  useEndInningsMutation,
  useEndMatchMutation,
  useDeclareResultMutation,
  useUpdateMatchAnalyticsSettingsMutation,
  useStoreMatchBreakMutation,
  useStoreMatchSubstituteMutation,
  useGetMatchNotesQuery,
  useCreateMatchNoteMutation,
  useDeleteMatchNoteMutation,
} = matchControlApi;
