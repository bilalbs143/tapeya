import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import type { MutationResult, Paginated } from '@/shared/api/types';
import { unwrapData, unwrapMessage, unwrapMutation } from '@/shared/api/unwrap';

import { createdQuickMatchSchema, type QuickMatchPayload } from '../lib/quickMatchPayload';
import { createdTournamentMatchSchema, type StartMatchPayload } from '../lib/startMatchPayload';
import {
  type MatchLiveSnapshot,
  type MatchResultDetail,
  parseMatchDetail,
  parseMatchState,
  toLiveSnapshot,
  toResultDetail,
} from '../model/liveSchemas';
import type { Match } from '../model/schemas';
import { mapMatchList } from './matchesApiShared';

export const matchListApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuickMatches: builder.query<Paginated<Match>, { status?: string } | undefined>({
      query: (params) => ({
        url: '/quick-matches',
        params: { all: 1, ...(params && 'status' in params && params.status ? { status: params.status } : {}) },
      }),
      transformResponse: mapMatchList,
      providesTags: (result) =>
        result
          ? [...result.items.map((m) => ({ type: 'Match' as const, id: m.id })), { type: 'Match', id: 'QUICK_LIST' }]
          : [{ type: 'Match', id: 'QUICK_LIST' }],
    }),

    /** Completed match result + MOTM — GET /matches/:id (TournamentMatchResource). */
    getMatchResult: builder.query<MatchResultDetail, number>({
      query: (matchId) => ({ url: `/matches/${matchId}` }),
      transformResponse: (raw: unknown) => toResultDetail(parseMatchDetail(raw)),
      providesTags: (_r, _e, matchId) => [{ type: 'Match', id: matchId }],
    }),

    /** Live scoring snapshot for My Matches live cards. Sides ids let transform map batting without embedding the list row. */
    getMatchLiveSnapshot: builder.query<
      MatchLiveSnapshot | null,
      { matchId: number; homeId: number | null; awayId: number | null }
    >({
      query: ({ matchId }) => ({ url: `/matches/${matchId}/match-state` }),
      transformResponse: (raw: unknown, _meta, arg) => {
        const wire = parseMatchState(raw);
        return toLiveSnapshot(wire, { homeId: arg.homeId, awayId: arg.awayId });
      },
      serializeQueryArgs: ({ queryArgs }) => queryArgs.matchId,
      providesTags: (_r, _e, { matchId }) => [{ type: 'MatchState', id: matchId }],
    }),

    createQuickMatch: builder.mutation<MutationResult<{ id: number }>, QuickMatchPayload>({
      query: (body) => ({ url: '/quick-matches', method: 'POST', body }),
      transformResponse: (raw: unknown) => unwrapMutation(createdQuickMatchSchema)(raw),
      invalidatesTags: [{ type: 'Match', id: 'QUICK_LIST' }],
    }),

    /** Tournament fixture — POST /tournaments/:id/matches (StoreTournamentMatchRequest). */
    createTournamentMatch: builder.mutation<
      MutationResult<{ id: number }>,
      { tournamentId: number; body: StartMatchPayload }
    >({
      query: ({ tournamentId, body }) => ({ url: `/tournaments/${tournamentId}/matches`, method: 'POST', body }),
      transformResponse: (raw: unknown) => unwrapMutation(createdTournamentMatchSchema)(raw),
      invalidatesTags: (_r, _e, { tournamentId }) => [
        { type: 'Match', id: 'QUICK_LIST' },
        { type: 'Tournament', id: tournamentId },
      ],
    }),

    /** Man of the Match — PATCH /matches/:id/player-of-match */
    setPlayerOfMatch: builder.mutation<string | undefined, { matchId: number; playerOfMatchUserId: number | null }>({
      query: ({ matchId, playerOfMatchUserId }) => ({
        url: `/matches/${matchId}/player-of-match`,
        method: 'PATCH',
        body: { player_of_match_user_id: playerOfMatchUserId },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId }) => [
        { type: 'Match', id: matchId },
        { type: 'Match', id: 'QUICK_LIST' },
        { type: 'MatchState', id: matchId },
      ],
    }),

    /** Walk-up / existing player onto a quick-match side. */
    addQuickMatchPlayer: builder.mutation<
      { id: number; name: string },
      { matchId: number; teamId: number; body: { user_id: number } | { name: string; phone: string } }
    >({
      query: ({ matchId, teamId, body }) => ({
        url: `/quick-matches/${matchId}/teams/${teamId}/players`,
        method: 'POST',
        body,
      }),
      transformResponse: (raw: unknown) => {
        const data = unwrapData(
          z.object({
            player: z.object({
              id: z.number(),
              name: z.string().nullable().optional(),
              nickname: z.string().nullable().optional(),
            }),
          })
        )(raw);
        return {
          id: data.player.id,
          name: data.player.name?.trim() || data.player.nickname?.trim() || 'Player',
        };
      },
      invalidatesTags: (_r, _e, { matchId, teamId }) => [
        { type: 'Match', id: matchId },
        { type: 'Match', id: `TEAM_SQUAD_${teamId}` },
        { type: 'Match', id: `${matchId}-team-${teamId}` },
      ],
    }),
  }),
});

export const {
  useGetQuickMatchesQuery,
  useGetMatchResultQuery,
  useGetMatchLiveSnapshotQuery,
  useCreateQuickMatchMutation,
  useCreateTournamentMatchMutation,
  useSetPlayerOfMatchMutation,
  useAddQuickMatchPlayerMutation,
} = matchListApi;
