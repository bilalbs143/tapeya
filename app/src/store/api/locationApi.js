import { baseApi } from './baseApi';

/**
 * Location API – countries and cities for dropdowns.
 * Same endpoints as backoffice: GET /countries, GET /countries/cities?country_code=XX
 */
export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCountries: builder.query({
      query: (params = {}) => ({
        url: '/countries',
        params: params.search ? { search: params.search } : undefined,
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
    getCities: builder.query({
      query: (countryCode) => ({
        url: '/countries/cities',
        params: { country_code: countryCode },
      }),
      transformResponse: (response) => response?.data ?? response ?? [],
    }),
  }),
});

export const { useGetCountriesQuery, useGetCitiesQuery } = locationApi;
