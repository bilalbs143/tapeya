import { baseApi } from './baseApi';

/**
 * Players API – search users for squad/icon pickers, and player stats for profile.
 * GET /players?for_squad=1&search=... — all eligible squad members (player, sponsor, organizer)
 * GET /users/{user}/stats, GET /users/{user}/teams
 */
export const playerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchSquadMembers: builder.query({
      query: (search = '') => ({
        url: '/players',
        params: {
          for_squad: 1,
          ...(search != null && String(search).trim() !== '' ? { search: String(search).trim() } : {}),
        },
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    getPlayerStats: builder.query({
      query: ({ userId, tournament_type = 'all' }) => ({
        url: `/users/${userId}/stats`,
        params: { tournament_type },
      }),
      transformResponse: (response) => response?.data ?? response ?? null,
      providesTags: (result, error, { userId }) => (result ? [{ type: 'User', id: `stats-${userId}` }] : []),
    }),
    /**
     * Open-tournament rank; pass category + sort from user playing role (see getProfileRankingParamsByPlayingRole).
     * Params may be omitted — API derives category/sort from the user's profile when absent.
     */
    getPlayerRankingPosition: builder.query({
      query: ({ userId, tournament_type = 'open_tournament', category, sort, min_innings }) => ({
        url: `/users/${userId}/ranking-position`,
        params: {
          tournament_type,
          ...(category != null ? { category } : {}),
          ...(sort != null ? { sort } : {}),
          ...(min_innings != null ? { min_innings } : {}),
        },
      }),
      transformResponse: (response) => response?.data ?? response ?? null,
    }),
    getPlayerTeams: builder.query({
      query: (userId) => ({
        url: `/users/${userId}/teams`,
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: (result, error, userId) => (result?.length ? [{ type: 'User', id: `teams-${userId}` }] : []),
    }),
  }),
});

export const { useSearchSquadMembersQuery, useGetPlayerStatsQuery, useGetPlayerRankingPositionQuery, useGetPlayerTeamsQuery } =
  playerApi;
