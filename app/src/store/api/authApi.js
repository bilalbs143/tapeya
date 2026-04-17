import { baseApi } from './baseApi';

/**
 * Auth API - inject into baseApi.
 *
 * Backend success: { data?, message?, type }.
 * Backend error (4xx/5xx): { message?, type?, errors? }.
 */

const PROFILE_TEXT_FIELDS = [
  'name',
  'nickname',
  'email',
  'phone',
  'date_of_birth',
  'bowling_style',
  'batting_style',
  'playing_role',
  'country',
  'city',
];

function buildProfilePayload(payload) {
  const hasFile = payload.avatar instanceof File;
  const hasRemoval = 'avatar' in payload && payload.avatar === null;

  if (hasFile) {
    const fd = new FormData();
    for (const key of PROFILE_TEXT_FIELDS) {
      if (payload[key] != null) fd.append(key, payload[key]);
    }
    fd.append('avatar', payload.avatar);
    return fd;
  }

  if (hasRemoval) {
    const body = {};
    for (const key of PROFILE_TEXT_FIELDS) {
      if (payload[key] != null) body[key] = payload[key];
    }
    body.avatar = null;
    return body;
  }

  return payload;
}

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
      invalidatesTags: ['Auth'],
    }),
    getMe: builder.query({
      query: () => '/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (body) => {
        if (body instanceof FormData) {
          return { url: '/profile', method: 'POST', body };
        }
        const resolved = buildProfilePayload(body);
        if (resolved instanceof FormData) {
          return { url: '/profile', method: 'POST', body: resolved };
        }
        return {
          url: '/profile',
          method: 'PATCH',
          body: resolved,
        };
      },
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
