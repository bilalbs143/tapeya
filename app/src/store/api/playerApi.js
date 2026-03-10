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
        params:
          params?.search != null && String(params.search).trim() !== ''
            ? { search: String(params.search).trim() }
            : {},
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    searchPlayers: builder.query({
      query: (search = '') => ({
        url: '/players',
        params:
          search != null && String(search).trim() !== ''
            ? { search: String(search).trim() }
            : {},
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    getPlayerStats: builder.query({
      query: ({ userId, tournament_type = 'all' }) => ({
        url: `/users/${userId}/stats`,
        params: { tournament_type },
      }),
      transformResponse: (response) => response?.data ?? response ?? null,
      providesTags: (result, error, { userId }) =>
        result ? [{ type: 'User', id: `stats-${userId}` }] : [],
    }),
    getPlayerTeams: builder.query({
      query: (userId) => ({
        url: `/users/${userId}/teams`,
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
      providesTags: (result, error, userId) =>
        result?.length ? [{ type: 'User', id: `teams-${userId}` }] : [],
    }),
  }),
});

export const {
  useGetPlayersQuery,
  useSearchPlayersQuery,
  useGetPlayerStatsQuery,
  useGetPlayerTeamsQuery,
} = playerApi;
