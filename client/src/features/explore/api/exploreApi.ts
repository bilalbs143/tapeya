import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { unwrapData, unwrapList } from '@/shared/api/unwrap';

import {
  type FollowResult,
  followResultWireSchema,
  type SuggestedUser,
  suggestedUserWireSchema,
  toFollowResult,
  toSuggestedUser,
} from '../model/schemas';

function mapSuggestions(raw: unknown): SuggestedUser[] {
  return unwrapList(suggestedUserWireSchema)(raw).map(toSuggestedUser);
}

function mapFollow(raw: unknown): FollowResult {
  return toFollowResult(unwrapData(followResultWireSchema)(raw));
}

type SuggestionsArg = { limit?: number | undefined };

/** Same reason set as post reports — `UserSafetyController`. */
export type SafetyReportReason = 'spam' | 'harassment' | 'inappropriate' | 'violence' | 'copyright' | 'other';

const blockResultSchema = z.object({
  blocked: z.boolean(),
});

const userReportResultSchema = z.object({
  reported: z.boolean(),
});

export type BlockResult = { blocked: boolean };
export type UserReportResult = { reported: boolean };

type BlockUserArg = {
  userId: number;
  reason?: SafetyReportReason | undefined;
  details?: string | undefined;
};

type ReportUserArg = {
  userId: number;
  reason: SafetyReportReason;
  details?: string | undefined;
};

function patchSuggestion(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- onQueryStarted dispatch
  dispatch: any,
  userId: number,
  following: boolean
) {
  return dispatch(
    exploreApi.util.updateQueryData('getSuggestedUsers', {}, (draft) => {
      const row = draft.find((u) => u.id === userId);
      if (row) row.following = following;
    })
  );
}

export const exploreApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Ranked who-to-follow — Explore rail, Discover page, Following empty CTA. */
    getSuggestedUsers: builder.query<SuggestedUser[], SuggestionsArg>({
      query: (arg = {}) => ({
        url: '/users/suggestions',
        params: { limit: arg.limit ?? 20 },
      }),
      transformResponse: mapSuggestions,
      serializeQueryArgs: ({ endpointName }) => endpointName,
      providesTags: [{ type: 'User', id: 'SUGGESTIONS' }],
    }),

    followUser: builder.mutation<FollowResult, number>({
      query: (userId) => ({ url: `/users/${userId}/follow`, method: 'POST' }),
      transformResponse: mapFollow,
      invalidatesTags: (_r, _e, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'SUGGESTIONS' },
        { type: 'User', id: 'ME' },
      ],
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        const patch = patchSuggestion(dispatch, userId, true);
        try {
          const { data } = await queryFulfilled;
          patchSuggestion(dispatch, userId, data.following);
        } catch {
          patch.undo();
        }
      },
    }),

    unfollowUser: builder.mutation<FollowResult, number>({
      query: (userId) => ({ url: `/users/${userId}/follow`, method: 'DELETE' }),
      transformResponse: mapFollow,
      invalidatesTags: (_r, _e, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'SUGGESTIONS' },
        { type: 'User', id: 'ME' },
      ],
      async onQueryStarted(userId, { dispatch, queryFulfilled }) {
        const patch = patchSuggestion(dispatch, userId, false);
        try {
          const { data } = await queryFulfilled;
          patchSuggestion(dispatch, userId, data.following);
        } catch {
          patch.undo();
        }
      },
    }),

    /** Guideline 1.2 — hide author content from the blocker’s feeds. */
    blockUser: builder.mutation<BlockResult, BlockUserArg>({
      query: ({ userId, reason, details }) => ({
        url: `/users/${userId}/block`,
        method: 'POST',
        body: {
          reason: reason ?? 'other',
          details: details || undefined,
        },
      }),
      transformResponse: (raw): BlockResult => {
        const data = unwrapData(blockResultSchema)(raw);
        return { blocked: data.blocked };
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: 'User', id: arg.userId },
        { type: 'User', id: 'SUGGESTIONS' },
        'Post',
        'Reel',
      ],
    }),

    unblockUser: builder.mutation<BlockResult, number>({
      query: (userId) => ({ url: `/users/${userId}/block`, method: 'DELETE' }),
      transformResponse: (raw): BlockResult => {
        const data = unwrapData(blockResultSchema)(raw);
        return { blocked: data.blocked };
      },
      invalidatesTags: (_r, _e, userId) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'SUGGESTIONS' },
        'Post',
        'Reel',
      ],
    }),

    reportUser: builder.mutation<UserReportResult, ReportUserArg>({
      query: ({ userId, reason, details }) => ({
        url: `/users/${userId}/report`,
        method: 'POST',
        body: {
          reason,
          details: details || undefined,
        },
      }),
      transformResponse: (raw): UserReportResult => {
        const data = unwrapData(userReportResultSchema)(raw);
        return { reported: data.reported };
      },
    }),
  }),
});

export const {
  useGetSuggestedUsersQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
  useReportUserMutation,
} = exploreApi;
