import { baseApi } from './baseApi';

/**
 * Players API – list/search users with player role, and player stats for profile.
 * GET /players, GET /players?search=..., GET /users/{user}/stats, GET /users/{user}/teams
 */
export const playerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlayers: builder.query({
      query: (params = {}) => ({
        url: '/players',
        params: params?.search != null && String(params.search).trim() !== '' ? { search: String(params.search).trim() } : {},
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    searchPlayers: builder.query({
      query: (search = '') => ({
        url: '/players',
        params: search != null && String(search).trim() !== '' ? { search: String(search).trim() } : {},
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

export const {
  useGetPlayersQuery,
  useSearchPlayersQuery,
  useGetPlayerStatsQuery,
  useGetPlayerRankingPositionQuery,
  useGetPlayerTeamsQuery,
} = playerApi;
