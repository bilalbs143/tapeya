import { baseApi } from '@/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/shared/api/unwrap';

import {
  type PlayerStats,
  playerStatsWireSchema,
  type PlayerTeam,
  playerTeamWireSchema,
  type StatsBucket,
  toPlayerStats,
  toPlayerTeam,
} from '../model/schemas';

function mapStats(raw: unknown): PlayerStats {
  return toPlayerStats(unwrapData(playerStatsWireSchema)(raw));
}

function mapTeams(raw: unknown): PlayerTeam[] {
  return unwrapList(playerTeamWireSchema)(raw).map(toPlayerTeam);
}

export type GetPlayerStatsArg = {
  userId: number;
  tournamentType?: StatsBucket | undefined;
  cricketFormat?: string | undefined;
};

export const statsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlayerStats: builder.query<PlayerStats, GetPlayerStatsArg>({
      query: ({ userId, tournamentType = 'all', cricketFormat = 'all' }) => ({
        url: `/users/${userId}/stats`,
        params: { tournament_type: tournamentType, cricket_format: cricketFormat },
      }),
      transformResponse: mapStats,
      providesTags: (_r, _e, { userId }) => [{ type: 'User', id: `stats-${userId}` }],
    }),
    getPlayerTeams: builder.query<PlayerTeam[], number>({
      query: (userId) => `/users/${userId}/teams`,
      transformResponse: mapTeams,
      providesTags: (_r, _e, userId) => [{ type: 'User', id: `teams-${userId}` }],
    }),
  }),
});

export const { useGetPlayerStatsQuery, useGetPlayerTeamsQuery } = statsApi;
