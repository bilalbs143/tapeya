import { baseApi } from './baseApi';

/**
 * Team owner API – search app users (for sponsor/owner dropdown when adding a team).
 * GET /sponsors?search=... — server assigns sponsor role on team create if needed.
 */
export const sponsorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSponsors: builder.query({
      query: () => ({ url: '/sponsors' }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    searchSponsors: builder.query({
      query: (search = '') => ({
        url: '/sponsors',
        params:
          search != null && String(search).trim() !== ''
            ? { search: String(search).trim() }
            : {},
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
  }),
});

export const { useGetSponsorsQuery, useSearchSponsorsQuery } = sponsorApi;
