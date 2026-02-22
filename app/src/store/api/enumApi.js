import { baseApi } from './baseApi';

/**
 * Enum API – options for app forms (event type, cricket format, match timings).
 * GET /enums is public; response shape: { data: { event_type, cricket_format, match_timings } }.
 */
export const enumApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEnums: builder.query({
      query: () => ({ url: '/enums' }),
      transformResponse: (response) => response?.data ?? {},
    }),
  }),
});

export const { useGetEnumsQuery } = enumApi;
