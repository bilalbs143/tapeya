import { baseApi } from '@/shared/api/baseApi';
import { unwrapList } from '@/shared/api/unwrap';
import {
  type City,
  cityWireSchema,
  type Country,
  countryWireSchema,
  mapCity,
  mapCountry,
} from '@/shared/model/location';

/** Geo lists — forms persist country/city names; ISO2 only loads cities. */
export const locationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getCountries: builder.query<Country[], { search?: string } | void>({
      query: (params) => ({
        url: '/countries',
        params: params != null && typeof params === 'object' && params.search ? { search: params.search } : undefined,
      }),
      transformResponse: (raw: unknown) => unwrapList(countryWireSchema)(raw).map(mapCountry),
      keepUnusedDataFor: 60 * 60,
      providesTags: ['Location'],
    }),
    getCities: builder.query<City[], string>({
      query: (countryCode) => ({
        url: '/countries/cities',
        params: { country_code: countryCode },
      }),
      transformResponse: (raw: unknown) => unwrapList(cityWireSchema)(raw).map(mapCity),
      keepUnusedDataFor: 60 * 60,
      providesTags: (_result, _err, countryCode) => [{ type: 'Location', id: `cities-${countryCode}` }],
    }),
  }),
});

export const { useGetCountriesQuery, useGetCitiesQuery } = locationApi;
