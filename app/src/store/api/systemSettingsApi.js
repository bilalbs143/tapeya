import { baseApi } from './baseApi';

export const systemSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicSystemSettings: builder.query({
      query: () => ({ url: '/system-settings' }),
      transformResponse: (response) => response?.data ?? [],
    }),
  }),
});

export const { useGetPublicSystemSettingsQuery } = systemSettingsApi;
