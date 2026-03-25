import { baseApi } from './baseApi';

export const supportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    submitSupportMessage: builder.mutation({
      query: (body) => ({
        url: '/support/messages',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const { useSubmitSupportMessageMutation } = supportApi;
