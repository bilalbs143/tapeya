import { z } from 'zod';

import { toUserSummary, userSummaryWireSchema } from '@/entities/user';

import { baseApi } from '@/shared/api/baseApi';
import { wireSuccessSchema } from '@/shared/api/envelope';
import { unwrapData, unwrapMessage } from '@/shared/api/unwrap';
import { clearAuthSession, persistAuthSession } from '@/shared/store/authSession';

import {
  type RegisterInput,
  type RegisterResult,
  registerResultWireSchema,
  type RequestOtpInput,
  type RequestOtpResult,
  toRegisterResult,
  toVerifyOtpResult,
  type VerifyOtpInput,
  type VerifyOtpResult,
  verifyOtpResultWireSchema,
} from '../model/schemas';

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
] as const;

type UpdateProfileBody = Record<string, unknown> & { avatar?: File | null };

function appendProfileTextFields(payload: UpdateProfileBody, target: FormData | Record<string, unknown>) {
  const isFormData = target instanceof FormData;
  for (const key of PROFILE_TEXT_FIELDS) {
    const value = payload[key];
    if (value == null) continue;
    if (isFormData) {
      target.append(key, String(value));
    } else {
      target[key] = value;
    }
  }
}

/** Profile PATCH — FormData with file; JSON with `avatar: null` when clearing. */
function buildProfilePayload(payload: UpdateProfileBody): FormData | UpdateProfileBody {
  const hasFile = payload.avatar instanceof File;
  const hasRemoval = 'avatar' in payload && payload.avatar === null;

  if (hasFile) {
    const fd = new FormData();
    appendProfileTextFields(payload, fd);
    fd.append('avatar', payload.avatar as File);
    return fd;
  }

  if (hasRemoval) {
    const body: UpdateProfileBody = {};
    appendProfileTextFields(payload, body);
    body.avatar = null;
    return body;
  }

  return payload;
}

/** Auth OTP + session — command-style endpoints, not CRUD resources. */
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    requestOtp: builder.mutation<RequestOtpResult, RequestOtpInput>({
      query: (body) => ({ url: '/auth/request-otp', method: 'POST', body }),
      transformResponse: (raw): RequestOtpResult => {
        const body = wireSuccessSchema.parse(raw);
        if (body.data == null) return {};
        const parsed = z.object({ otp: z.string().optional() }).safeParse(body.data);
        return parsed.success && parsed.data.otp ? { otp: parsed.data.otp } : {};
      },
    }),

    register: builder.mutation<RegisterResult, RegisterInput>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (raw): RegisterResult => {
        const body = wireSuccessSchema.parse(raw);
        if (body.data == null) {
          throw new Error('Expected success.data on register.');
        }
        return toRegisterResult(registerResultWireSchema.parse(body.data));
      },
    }),

    verifyOtp: builder.mutation<VerifyOtpResult, VerifyOtpInput>({
      query: (body) => ({ url: '/auth/verify-otp', method: 'POST', body }),
      transformResponse: (raw) => toVerifyOtpResult(unwrapData(verifyOtpResultWireSchema)(raw)),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          await persistAuthSession(dispatch, {
            accessToken: data.auth.accessToken,
            userId: data.user.id,
          });
        } catch {
          // Mutation error is surfaced to the form via unwrap(); do not rethrow.
        }
      },
    }),

    /** Saved-profile silent re-auth — bearer token before Redux session exists. */
    meWithToken: builder.query<ReturnType<typeof toUserSummary>, { token: string }>({
      query: ({ token }) => ({
        // Laravel GET /api/v1/me (auth:api) — not under the /auth prefix.
        url: '/me',
        headers: { Authorization: `Bearer ${token}` },
      }),
      transformResponse: (raw) => toUserSummary(unwrapData(userSummaryWireSchema)(raw)),
    }),

    /** Session user — composer avatar, isOwn, shell chip, You tab. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    me: builder.query<ReturnType<typeof toUserSummary>, void>({
      query: () => '/me',
      transformResponse: (raw) => toUserSummary(unwrapData(userSummaryWireSchema)(raw)),
      providesTags: [{ type: 'User', id: 'ME' }],
    }),

    updateProfile: builder.mutation<ReturnType<typeof toUserSummary>, UpdateProfileBody>({
      query: (body) => {
        const resolved = buildProfilePayload(body);
        if (resolved instanceof FormData) {
          return { url: '/profile', method: 'POST', body: resolved };
        }
        return { url: '/profile', method: 'PATCH', body: resolved };
      },
      transformResponse: (raw) => toUserSummary(unwrapData(userSummaryWireSchema)(raw)),
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg mutation
    deleteAccount: builder.mutation<string | undefined, void>({
      query: () => ({ url: '/profile', method: 'DELETE' }),
      transformResponse: unwrapMessage(),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          await clearAuthSession(dispatch);
        }
      },
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg mutation
    logout: builder.mutation<string | undefined, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      transformResponse: unwrapMessage(),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          await clearAuthSession(dispatch);
        }
      },
    }),

    /** Guideline 1.2 — existing users who registered before terms were required. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg mutation
    acceptTerms: builder.mutation<ReturnType<typeof toUserSummary>, void>({
      query: () => ({ url: '/me/accept-terms', method: 'POST' }),
      transformResponse: (raw) => toUserSummary(unwrapData(userSummaryWireSchema)(raw)),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(authApi.util.updateQueryData('me', undefined, () => data));
        } catch {
          // Mutation error surfaces via unwrap(); do not rethrow.
        }
      },
      invalidatesTags: [{ type: 'User', id: 'ME' }],
    }),
  }),
});

export const {
  useRequestOtpMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useLazyMeWithTokenQuery,
  useMeQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useLogoutMutation,
  useAcceptTermsMutation,
} = authApi;
