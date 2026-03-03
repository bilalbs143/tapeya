import { baseApi } from './baseApi';

/**
 * Players API – list/search users with player role (icon players, squad picker, etc.).
 * GET /players, GET /players?search=...
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
  }),
});

export const { useGetPlayersQuery, useSearchPlayersQuery } = playerApi;
