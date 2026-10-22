import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import type { MutationResult, Paginated } from '@/shared/api/types';
import { unwrapData, unwrapList, unwrapMessage, unwrapMutation, unwrapPaginated } from '@/shared/api/unwrap';

import {
  parseReactionCounts,
  parseScorecardHub,
  parseTournamentMatches,
  type ScorecardHub,
  type TournamentFixture,
  type TournamentMatchWire,
  tournamentMatchWireSchema,
  type TournamentReactionCounts,
} from '../model/matchSchemas';
import {
  type CreateTournamentInput,
  toDomain,
  type Tournament,
  type TournamentWire,
  tournamentWireSchema,
  toWireBody,
} from '../model/schemas';
import { parseTournamentSeasonStats, type TournamentSeasonStats } from '../model/seasonStatsSchemas';
import { parseSquadOccupancy, type SquadOccupancy } from '../model/squadSchemas';
import { parseTournamentStandings, type TournamentStandings } from '../model/standingsSchemas';
import {
  type CreateTeamInput,
  createTeamToWire,
  teamToDomain,
  type TournamentTeam,
  tournamentTeamWireSchema,
} from '../model/teamSchemas';

function mapTournamentPage(raw: unknown): Paginated<Tournament> {
  const page = unwrapPaginated(tournamentWireSchema)(raw);
  return { items: page.items.map(toDomain), meta: page.meta };
}

function mapTournament(raw: unknown): Tournament {
  return toDomain(unwrapData(tournamentWireSchema)(raw));
}

function mapTournamentMutation(raw: unknown): MutationResult<Tournament> {
  const result = unwrapMutation(tournamentWireSchema)(raw);
  return {
    message: result.message,
    created: result.created,
    data: result.data ? toDomain(result.data) : null,
  };
}

function mapTournamentTeams(raw: unknown): TournamentTeam[] {
  return unwrapList(tournamentTeamWireSchema)(raw).map(teamToDomain);
}

function mapTeamMutation(raw: unknown): MutationResult<TournamentTeam> {
  const result = unwrapMutation(tournamentTeamWireSchema)(raw);
  return {
    message: result.message,
    created: result.created,
    data: result.data ? teamToDomain(result.data) : null,
  };
}

export const tournamentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Organizer list — GET /tournaments?organizer_tournaments=1 */
    getTournaments: builder.query<Paginated<Tournament>, { page?: number; all?: boolean } | undefined>({
      query: (params) => ({
        url: '/tournaments',
        params: {
          organizer_tournaments: 1,
          ...(params && 'all' in params && params.all ? { all: 1 } : {}),
          ...(params && 'page' in params && params.page != null ? { page: params.page } : {}),
        },
      }),
      transformResponse: mapTournamentPage,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((t) => ({ type: 'Tournament' as const, id: t.id })),
              { type: 'Tournament', id: 'LIST' },
            ]
          : [{ type: 'Tournament', id: 'LIST' }],
    }),

    getTournament: builder.query<Tournament, number>({
      query: (id) => `/tournaments/${id}`,
      transformResponse: mapTournament,
      providesTags: (_result, _error, id) => [{ type: 'Tournament', id }],
    }),

    /** Fan discover — GET /tournaments?all=1; client filters upcoming by end_date. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getDiscoverTournaments: builder.query<Paginated<Tournament>, void>({
      query: () => ({
        url: '/tournaments',
        params: { all: 1 },
      }),
      transformResponse: mapTournamentPage,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map((t) => ({ type: 'Tournament' as const, id: t.id })),
              { type: 'Tournament', id: 'DISCOVER' },
            ]
          : [{ type: 'Tournament', id: 'DISCOVER' }],
    }),

    /** Scorecard hub — GET /tournaments?all=1&with_matches=1. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getScorecardHub: builder.query<ScorecardHub, void>({
      query: () => ({
        url: '/tournaments',
        params: { all: 1, with_matches: 1 },
      }),
      transformResponse: (raw: unknown): ScorecardHub => {
        const page = unwrapPaginated(
          tournamentWireSchema.extend({
            matches: z.array(tournamentMatchWireSchema).optional(),
          })
        )(raw);
        return parseScorecardHub(
          page.items.map((wire) => ({
            id: wire.id,
            name: wire.tournament_name,
            matches: (wire.matches ?? []) as TournamentMatchWire[],
          }))
        );
      },
      providesTags: [{ type: 'Tournament', id: 'SCORECARD_HUB' }],
    }),

    /** Fixtures — GET /tournaments/:id/matches?all=1 */
    getTournamentMatches: builder.query<TournamentFixture[], number>({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/matches`,
        params: { all: 1 },
      }),
      transformResponse: (raw: unknown) => parseTournamentMatches(raw),
      providesTags: (_r, _e, tournamentId) => [
        { type: 'Match', id: `TOURNAMENT_${tournamentId}` },
        { type: 'Tournament', id: tournamentId },
      ],
    }),

    likeTournament: builder.mutation<TournamentReactionCounts, number>({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/like`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => parseReactionCounts(raw),
    }),

    dislikeTournament: builder.mutation<TournamentReactionCounts, number>({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/dislike`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => parseReactionCounts(raw),
    }),

    shareTournament: builder.mutation<TournamentReactionCounts, number>({
      query: (tournamentId) => ({
        url: `/tournaments/${tournamentId}/share`,
        method: 'POST',
      }),
      transformResponse: (raw: unknown) => parseReactionCounts(raw),
    }),

    /** Teams attached to a tournament — GET /tournaments/:id/teams */
    getTournamentTeams: builder.query<TournamentTeam[], number>({
      query: (tournamentId) => `/tournaments/${tournamentId}/teams`,
      transformResponse: mapTournamentTeams,
      providesTags: (_r, _e, tournamentId) => [
        { type: 'Team', id: `TOURNAMENT_${tournamentId}` },
        { type: 'Tournament', id: tournamentId },
      ],
    }),

    /** Squad conflict UI — GET /tournaments/:id/squad-occupancy. */
    getTournamentSquadOccupancy: builder.query<
      SquadOccupancy[],
      { tournamentId: number; excludeTeamId?: number | undefined }
    >({
      query: ({ tournamentId, excludeTeamId }) => ({
        url: `/tournaments/${tournamentId}/squad-occupancy`,
        ...(excludeTeamId != null ? { params: { exclude_team_id: excludeTeamId } } : {}),
      }),
      transformResponse: (raw: unknown) => parseSquadOccupancy(raw),
      providesTags: (_r, _e, { tournamentId }) => [{ type: 'TournamentSquadOccupancy', id: tournamentId }],
    }),

    /** Instant create — no consumer DELETE tournament route. */
    createTournament: builder.mutation<MutationResult<Tournament>, CreateTournamentInput>({
      query: (body) => ({ url: '/tournaments', method: 'POST', body: toWireBody(body) }),
      transformResponse: mapTournamentMutation,
      invalidatesTags: [
        { type: 'Tournament', id: 'LIST' },
        { type: 'Tournament', id: 'DISCOVER' },
      ],
    }),

    /** Search clubs — GET /teams?search=… (attach typeahead). */
    searchTeams: builder.query<TournamentTeam[], string>({
      query: (search) => ({
        url: '/teams',
        params: search.trim() ? { search: search.trim() } : {},
      }),
      transformResponse: mapTournamentTeams,
      providesTags: [{ type: 'Team', id: 'LIST' }],
    }),

    /** Create club — POST /teams. */
    createTeam: builder.mutation<MutationResult<TournamentTeam>, CreateTeamInput>({
      query: (body) => ({ url: '/teams', method: 'POST', body: createTeamToWire(body) }),
      transformResponse: mapTeamMutation,
      invalidatesTags: [{ type: 'Team', id: 'LIST' }],
    }),

    /** Attach clubs — POST /tournaments/:id/teams. */
    attachTeamsToTournament: builder.mutation<
      string | undefined,
      { tournamentId: number; teamIds: number[]; groupIndex?: number | undefined }
    >({
      query: ({ tournamentId, teamIds, groupIndex }) => ({
        url: `/tournaments/${tournamentId}/teams`,
        method: 'POST',
        body: {
          team_ids: teamIds,
          ...(groupIndex != null ? { group_index: groupIndex } : {}),
        },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { tournamentId }) => [
        { type: 'Team', id: `TOURNAMENT_${tournamentId}` },
        { type: 'Tournament', id: tournamentId },
        { type: 'Tournament', id: 'LIST' },
      ],
    }),

    /** Detach club — DELETE /tournaments/:id/teams/:teamId. */
    removeTeamFromTournament: builder.mutation<string | undefined, { tournamentId: number; teamId: number }>({
      query: ({ tournamentId, teamId }) => ({
        url: `/tournaments/${tournamentId}/teams/${teamId}`,
        method: 'DELETE',
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { tournamentId }) => [
        { type: 'Team', id: `TOURNAMENT_${tournamentId}` },
        { type: 'Tournament', id: tournamentId },
        { type: 'Tournament', id: 'LIST' },
        { type: 'TournamentSquadOccupancy', id: tournamentId },
      ],
    }),

    /** Points table — GET /tournaments/:id/standings (flat or groups). */
    getTournamentStandings: builder.query<TournamentStandings, number>({
      query: (tournamentId) => `/tournaments/${tournamentId}/standings`,
      transformResponse: parseTournamentStandings,
      providesTags: (_r, _e, tournamentId) => [{ type: 'TournamentStandings', id: tournamentId }],
    }),

    /** Season leaderboards — GET /tournaments/:id/season-stats. */
    getTournamentSeasonStats: builder.query<TournamentSeasonStats, number>({
      query: (tournamentId) => `/tournaments/${tournamentId}/season-stats`,
      transformResponse: parseTournamentSeasonStats,
      providesTags: (_r, _e, tournamentId) => [{ type: 'TournamentSeasonStats', id: tournamentId }],
    }),
  }),
});

export const {
  useGetTournamentsQuery,
  useGetDiscoverTournamentsQuery,
  useGetScorecardHubQuery,
  useGetTournamentQuery,
  useGetTournamentTeamsQuery,
  useGetTournamentMatchesQuery,
  useGetTournamentSquadOccupancyQuery,
  useCreateTournamentMutation,
  useSearchTeamsQuery,
  useCreateTeamMutation,
  useAttachTeamsToTournamentMutation,
  useRemoveTeamFromTournamentMutation,
  useLikeTournamentMutation,
  useDislikeTournamentMutation,
  useShareTournamentMutation,
  useGetTournamentStandingsQuery,
  useGetTournamentSeasonStatsQuery,
} = tournamentsApi;

/** Re-export for tests that assert wire parsing. */

export type { TournamentWire };
