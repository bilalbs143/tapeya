import { baseApi } from './baseApi';

/**
 * Ranking API – player leaderboards based on tournament type stats.
 * Backend: GET /rankings?tournament_type=...&cricket_format=...&category=...
 */
export const rankingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRankings: builder.query({
      query: ({ tournament_type = 'open_tournament', cricket_format = 'all', category = 'batting', sort, min_innings } = {}) => ({
        url: '/rankings',
        params: {
          tournament_type,
          cricket_format,
          category,
          sort,
          min_innings,
        },
      }),
      transformResponse: (response) => response?.data ?? response ?? {},
    }),
  }),
});

export const { useGetRankingsQuery } = rankingApi;
