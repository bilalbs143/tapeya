import { RANKING_TOURNAMENT_TYPE } from '@/lib/constants/ranking';

import { baseApi } from './baseApi';

/**
 * Cricket profile stats / ranking / teams for a user.
 * App-user typeahead lives in userApi (`lookupUsers` → GET /users/lookup).
 */
export const playerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlayerStats: builder.query({
      query: ({ userId, tournament_type = 'all' }) => ({
        url: `/users/${userId}/stats`,
        params: { tournament_type },
      }),
      transformResponse: (response) => response?.data ?? response ?? null,
      providesTags: (result, error, { userId }) => (result ? [{ type: 'User', id: `stats-${userId}` }] : []),
    }),
    /**
     * Open-tournament rank; pass category + sort from user playing role.
     * Params may be omitted — API derives category/sort from the user's profile when absent.
     */
    getPlayerRankingPosition: builder.query({
      query: ({ userId, tournament_type = RANKING_TOURNAMENT_TYPE, category, sort, min_innings }) => ({
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
    getPlayerRecentMatches: builder.query({
      query: ({ userId, limit = 10 }) => ({
        url: `/users/${userId}/recent-matches`,
        params: { limit },
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
  }),
});

export const {
  useGetPlayerStatsQuery,
  useGetPlayerRankingPositionQuery,
  useGetPlayerTeamsQuery,
  useGetPlayerRecentMatchesQuery,
} = playerApi;
