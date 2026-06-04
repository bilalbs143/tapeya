import { baseApi } from './baseApi';

export const deviceTokenApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    registerDeviceToken: builder.mutation({
      query: (body) => ({
        url: '/device-tokens',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useRegisterDeviceTokenMutation } = deviceTokenApi;
