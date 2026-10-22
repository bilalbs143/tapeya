import { baseApi } from '@/shared/api/baseApi';
import { unwrapMessage } from '@/shared/api/unwrap';

import { type MatchSquadDetail, parseMatchSquad, parseTeamSquad, type TeamSquadPlayer } from '../model/squadSchemas';

export const matchSquadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Team-level roster — GET /teams/:id/squad (candidates for Declare XI + organizer squad editor). */
    getTeamSquad: builder.query<TeamSquadPlayer[], number>({
      query: (teamId) => ({ url: `/teams/${teamId}/squad` }),
      transformResponse: (raw: unknown) => parseTeamSquad(raw),
      providesTags: (_r, _e, teamId) => [
        { type: 'TeamSquad', id: teamId },
        { type: 'Match', id: `TEAM_SQUAD_${teamId}` },
      ],
    }),

    /** Replace team roster — POST /teams/:id/squad (`player_ids`). */
    updateTeamSquad: builder.mutation<
      string | undefined,
      { teamId: number; playerIds: number[]; tournamentId?: number | undefined }
    >({
      query: ({ teamId, playerIds }) => ({
        url: `/teams/${teamId}/squad`,
        method: 'POST',
        body: { player_ids: playerIds },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { teamId, tournamentId }) => {
        const tags: { type: 'TeamSquad' | 'Match' | 'TournamentSquadOccupancy'; id: number | string }[] = [
          { type: 'TeamSquad', id: teamId },
          { type: 'Match', id: `TEAM_SQUAD_${teamId}` },
        ];
        if (tournamentId != null) {
          tags.push({ type: 'TournamentSquadOccupancy', id: tournamentId });
        }
        return tags;
      },
    }),

    /** Announced match squad + C/WK — GET /matches/:id/teams/:teamId/squad. */
    getMatchTeamSquad: builder.query<MatchSquadDetail, { matchId: number; teamId: number }>({
      query: ({ matchId, teamId }) => ({ url: `/matches/${matchId}/teams/${teamId}/squad` }),
      transformResponse: (raw: unknown) => parseMatchSquad(raw),
      providesTags: (_r, _e, { matchId, teamId }) => [{ type: 'Match', id: `${matchId}-team-${teamId}` }],
    }),

    /** Announce match squad — POST /matches/:id/teams/:teamId/squad (app useSquadPersistence). */
    storeMatchSquad: builder.mutation<string | undefined, { matchId: number; teamId: number; playerIds: number[] }>({
      query: ({ matchId, teamId, playerIds }) => ({
        url: `/matches/${matchId}/teams/${teamId}/squad`,
        method: 'POST',
        body: { player_ids: playerIds },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId, teamId }) => [
        { type: 'Match', id: matchId },
        { type: 'Match', id: `${matchId}-team-${teamId}` },
      ],
    }),

    /** Playing XI — POST /matches/:id/teams/:teamId/playing-eleven. */
    storePlayingEleven: builder.mutation<string | undefined, { matchId: number; teamId: number; playerIds: number[] }>({
      query: ({ matchId, teamId, playerIds }) => ({
        url: `/matches/${matchId}/teams/${teamId}/playing-eleven`,
        method: 'POST',
        body: { player_ids: playerIds },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId, teamId }) => [
        { type: 'MatchState', id: matchId },
        { type: 'Scorecard', id: matchId },
        { type: 'Match', id: `${matchId}-xi-${teamId}` },
        { type: 'Match', id: matchId },
      ],
    }),

    updateMatchCaptain: builder.mutation<string | undefined, { matchId: number; teamId: number; captainId: number }>({
      query: ({ matchId, teamId, captainId }) => ({
        url: `/matches/${matchId}/captain`,
        method: 'PATCH',
        body: { team_id: teamId, captain_id: captainId },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId, teamId }) => [
        { type: 'Match', id: matchId },
        { type: 'Match', id: `${matchId}-team-${teamId}` },
      ],
    }),

    updateMatchWicketKeeper: builder.mutation<
      string | undefined,
      { matchId: number; teamId: number; wicketKeeperId: number }
    >({
      query: ({ matchId, teamId, wicketKeeperId }) => ({
        url: `/matches/${matchId}/wicket-keeper`,
        method: 'PATCH',
        body: { team_id: teamId, wicket_keeper_id: wicketKeeperId },
      }),
      transformResponse: (raw: unknown) => unwrapMessage()(raw),
      invalidatesTags: (_r, _e, { matchId, teamId }) => [
        { type: 'Match', id: matchId },
        { type: 'Match', id: `${matchId}-team-${teamId}` },
      ],
    }),
  }),
});

export const {
  useGetTeamSquadQuery,
  useUpdateTeamSquadMutation,
  useGetMatchTeamSquadQuery,
  useStoreMatchSquadMutation,
  useStorePlayingElevenMutation,
  useUpdateMatchCaptainMutation,
  useUpdateMatchWicketKeeperMutation,
} = matchSquadApi;
