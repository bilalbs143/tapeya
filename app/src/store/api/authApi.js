import { baseApi } from './baseApi';

/**
 * Auth API - inject into baseApi.
 *
 * API response shape (adapt to your backend):
 * { data: { user: {...}, auth: { access_token: "..." }, message?: "..." } }
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query({
      query: () => '/auth/profile/me',
      providesTags: ['User'],
    }),
  }),
});

export const { useLoginMutation, useGetMeQuery } = authApi;
