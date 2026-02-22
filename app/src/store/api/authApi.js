import { baseApi } from './baseApi';

/**
 * Auth API - inject into baseApi.
 *
 * Backend success: { data?, message?, type }.
 * Backend error (4xx/5xx): { message?, type?, errors? }.
 */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    requestOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/request-otp',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    verifyOtp: builder.mutation({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body: { phone: body.phone, code: body.code },
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
    getMe: builder.query({
      query: () => '/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/profile',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth', 'User'],
    }),
  }),
});

export const {
  useRegisterMutation,
  useRequestOtpMutation,
  useVerifyOtpMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useLogoutMutation,
} = authApi;
