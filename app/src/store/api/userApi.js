import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    updateActivePlatform: builder.mutation({
      query: (platform) => ({
        url: '/active-platform',
        method: 'PUT',
        body: { platform },
      }),
    }),
  }),
});

export const { useUpdateActivePlatformMutation } = userApi;
