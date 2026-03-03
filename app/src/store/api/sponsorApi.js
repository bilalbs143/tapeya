import { baseApi } from './baseApi';

/**
 * Sponsors API – search users with sponsor role (for team-creation dropdown).
 * GET /sponsors?search=... — server-side search; use when dropdown has thousands.
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
