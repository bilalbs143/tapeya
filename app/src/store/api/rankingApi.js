import { baseApi } from './baseApi';

/**
 * Ranking API – player leaderboards based on tournament type stats.
 * Backend: GET /rankings?tournament_type=...&category=...
 */
export const rankingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRankings: builder.query({
      query: ({ tournament_type = 'open_tournament', category = 'batting', sort, min_innings } = {}) => ({
        url: '/rankings',
        params: {
          tournament_type,
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
