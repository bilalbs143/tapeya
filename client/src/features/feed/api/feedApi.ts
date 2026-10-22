import { z } from 'zod';

import { baseApi } from '@/shared/api/baseApi';
import { mergeCursorPages } from '@/shared/api/mergeCursorPages';
import type { CursorPage } from '@/shared/api/types';
import { unwrapCursorPage, unwrapData, unwrapMessage } from '@/shared/api/unwrap';

import {
  type Comment,
  type CommentPage,
  commentPageWireSchema,
  commentWireSchema,
  toComment,
} from '../model/commentSchemas';
import {
  FEED_TAB_PATH,
  type FeedTab,
  type Post,
  postWireSchema,
  type ReelBandItem,
  reelBandItemWireSchema,
  toDomain,
  toReelBandItem,
} from '../model/schemas';

const likeResultSchema = z.object({
  liked: z.boolean(),
  likes_count: z.number(),
});

const saveResultSchema = z.object({
  saved: z.boolean(),
  saves_count: z.number(),
});

const commentLikeResultSchema = z.object({
  liked: z.boolean(),
  likes_count: z.number(),
});

const reportResultSchema = z.object({
  reported: z.boolean(),
  already_reported: z.boolean(),
  reports_count: z.number(),
});

export type LikeResult = { liked: boolean; likesCount: number };
export type SaveResult = { saved: boolean; savesCount: number };
export type CommentLikeResult = { liked: boolean; likesCount: number };
export type ReportReason = 'spam' | 'harassment' | 'inappropriate' | 'violence' | 'copyright' | 'other';
export type ReportResult = {
  reported: boolean;
  alreadyReported: boolean;
  reportsCount: number;
};

function mapFeedPage(raw: unknown): CursorPage<Post> {
  return unwrapCursorPage(postWireSchema, toDomain)(raw);
}

function mapPost(raw: unknown): Post {
  return toDomain(unwrapData(postWireSchema)(raw));
}

function mapCommentPage(raw: unknown): CommentPage {
  const page = unwrapData(commentPageWireSchema)(raw);
  return {
    items: page.items.map(toComment),
    currentPage: page.current_page,
    lastPage: page.last_page,
    total: page.total ?? page.items.length,
  };
}

function mapComment(raw: unknown): Comment {
  return toComment(unwrapData(commentWireSchema)(raw));
}

export type CreateTextPostInput = {
  body: string;
  /** API background_id — omit / null = plain. */
  backgroundId?: 'pitch' | 'night' | null | undefined;
};

export type CreateImagePostInput = {
  body: string;
  images: File[];
};

function buildImageFormData(input: CreateImagePostInput): FormData {
  const form = new FormData();
  form.append('type', 'image');
  form.append('body', input.body);
  for (const file of input.images) {
    form.append('images[]', file);
  }
  return form;
}

function mapReelBand(raw: unknown): CursorPage<ReelBandItem> {
  return unwrapCursorPage(reelBandItemWireSchema, toReelBandItem)(raw);
}

const FEED_TABS: FeedTab[] = ['explore', 'following', 'mine', 'saved'];

function patchPostInFeeds(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dispatch from onQueryStarted
  dispatch: any,
  postId: number,
  updater: (post: Post) => Post
) {
  const feedPatches = FEED_TABS.map((tab) =>
    dispatch(
      feedApi.util.updateQueryData('getFeed', { tab }, (draft) => {
        const idx = draft.items.findIndex((p) => p.id === postId);
        if (idx >= 0) {
          const current = draft.items[idx];
          if (current) draft.items[idx] = updater(current);
        }
      })
    )
  );
  const detailPatch = dispatch(
    feedApi.util.updateQueryData('getPost', postId, (draft) => {
      Object.assign(draft, updater(draft));
    })
  );
  return [...feedPatches, detailPatch];
}

function bumpPostCommentCount(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dispatch from onQueryStarted
  dispatch: any,
  postId: number,
  delta: number
) {
  return patchPostInFeeds(dispatch, postId, (p) => ({
    ...p,
    counts: { ...p.counts, comments: Math.max(0, p.counts.comments + delta) },
  }));
}

function patchCommentInCaches(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- RTK dispatch
  dispatch: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- getState
  getState: any,
  postId: number,
  commentId: number,
  updater: (comment: Comment) => Comment
) {
  const patches: { undo: () => void }[] = [];
  const queries = getState()?.api?.queries ?? {};

  Object.values(queries).forEach((entry) => {
    const e = entry as {
      endpointName?: string;
      originalArgs?: { postId?: number };
      data?: { items?: Comment[] };
    } | null;
    if (!e?.data?.items || !Array.isArray(e.data.items)) return;
    if (e.endpointName !== 'getPostComments' && e.endpointName !== 'getPostCommentReplies') return;
    if (e.originalArgs?.postId !== postId) return;

    patches.push(
      dispatch(
        feedApi.util.updateQueryData(
          e.endpointName as 'getPostComments' | 'getPostCommentReplies',
          e.originalArgs as never,
          (draft: CommentPage) => {
            const idx = draft.items.findIndex((c) => c.id === commentId);
            if (idx >= 0) {
              const current = draft.items[idx];
              if (current) draft.items[idx] = updater(current);
            }
          }
        )
      )
    );
  });

  return patches;
}

export const feedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** UC4 — tab = path; cursor merges into one cache entry per tab. */
    getFeed: builder.query<
      CursorPage<Post>,
      { tab: FeedTab; cursor?: string | undefined; perPage?: number | undefined }
    >({
      query: ({ tab, cursor, perPage = 10 }) => ({
        url: FEED_TAB_PATH[tab],
        params: { cursor: cursor ?? undefined, per_page: perPage },
      }),
      transformResponse: mapFeedPage,
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}(${queryArgs.tab})`,
      merge: mergeCursorPages,
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor || currentArg?.tab !== previousArg?.tab,
      providesTags: (result, _error, arg) =>
        result
          ? [...result.items.map((p) => ({ type: 'Post' as const, id: p.id })), { type: 'Post', id: `FEED-${arg.tab}` }]
          : [{ type: 'Post', id: `FEED-${arg.tab}` }],
    }),

    getPost: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      transformResponse: mapPost,
      providesTags: (_r, _e, id) => [{ type: 'Post', id }],
    }),

    getUserPosts: builder.query<
      CursorPage<Post>,
      { userId: number; cursor?: string | undefined; perPage?: number | undefined }
    >({
      query: ({ userId, cursor, perPage = 10 }) => ({
        url: `/users/${userId}/posts`,
        params: { cursor: cursor ?? undefined, per_page: perPage },
      }),
      transformResponse: mapFeedPage,
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}(${queryArgs.userId})`,
      merge: mergeCursorPages,
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.userId !== previousArg?.userId || currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result, _e, arg) =>
        result
          ? [
              ...result.items.map((p) => ({ type: 'Post' as const, id: p.id })),
              { type: 'Post', id: `USER-${arg.userId}` },
            ]
          : [{ type: 'Post', id: `USER-${arg.userId}` }],
    }),

    /** Explore reel strip — first page only. */
    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- RTK Query no-arg query
    getReelBand: builder.query<ReelBandItem[], void>({
      query: () => ({ url: '/reels/feed', params: { per_page: 12 } }),
      transformResponse: (raw) => mapReelBand(raw).items,
      providesTags: [{ type: 'Post', id: 'REEL-BAND' }],
    }),

    createPost: builder.mutation<Post, CreateTextPostInput | CreateImagePostInput>({
      query: (input) => {
        if ('images' in input) {
          return { url: '/posts', method: 'POST', body: buildImageFormData(input) };
        }
        return {
          url: '/posts',
          method: 'POST',
          body: {
            type: 'text',
            body: input.body,
            ...(input.backgroundId ? { background_id: input.backgroundId } : {}),
          },
        };
      },
      transformResponse: mapPost,
      invalidatesTags: [
        { type: 'Post', id: 'FEED-explore' },
        { type: 'Post', id: 'FEED-following' },
        { type: 'Post', id: 'FEED-mine' },
      ],
    }),

    getPostComments: builder.query<
      CommentPage,
      { postId: number; page?: number | undefined; perPage?: number | undefined }
    >({
      query: ({ postId, page = 1, perPage = 20 }) => ({
        url: `/posts/${postId}/comments`,
        params: { page, per_page: perPage },
      }),
      transformResponse: mapCommentPage,
      providesTags: (_r, _e, arg) => [{ type: 'Post', id: `COMMENTS-${arg.postId}` }],
    }),

    getPostCommentReplies: builder.query<
      CommentPage,
      { postId: number; commentId: number; page?: number | undefined; perPage?: number | undefined }
    >({
      query: ({ postId, commentId, page = 1, perPage = 50 }) => ({
        url: `/posts/${postId}/comments/${commentId}/replies`,
        params: { page, per_page: perPage },
      }),
      transformResponse: mapCommentPage,
      providesTags: (_r, _e, arg) => [{ type: 'Post', id: `COMMENTS-${arg.postId}` }],
    }),

    addPostComment: builder.mutation<Comment, { postId: number; body: string; parentId?: number | undefined }>({
      query: ({ postId, body, parentId }) => ({
        url: `/posts/${postId}/comments`,
        method: 'POST',
        body: { body, parent_id: parentId || undefined },
      }),
      transformResponse: mapComment,
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Post', id: `COMMENTS-${arg.postId}` },
        { type: 'Post', id: arg.postId },
      ],
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patches = bumpPostCommentCount(dispatch, postId, 1);
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    deletePostComment: builder.mutation<
      // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- delete has no payload
      void,
      { postId: number; commentId: number; removedCount?: number | undefined }
    >({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      transformResponse: (raw) => {
        unwrapMessage()(raw);
      },
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Post', id: `COMMENTS-${arg.postId}` },
        { type: 'Post', id: arg.postId },
      ],
      async onQueryStarted({ postId, removedCount = 1 }, { dispatch, queryFulfilled }) {
        const patches = bumpPostCommentCount(dispatch, postId, -Math.max(1, removedCount));
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    likePostComment: builder.mutation<CommentLikeResult, { postId: number; commentId: number }>({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      transformResponse: (raw): CommentLikeResult => {
        const data = unwrapData(commentLikeResultSchema)(raw);
        return { liked: data.liked, likesCount: data.likes_count };
      },
      async onQueryStarted({ postId, commentId }, { dispatch, getState, queryFulfilled }) {
        const patches = patchCommentInCaches(dispatch, getState, postId, commentId, (c) => ({
          ...c,
          liked: true,
          likes: c.liked ? c.likes : c.likes + 1,
        }));
        try {
          const { data } = await queryFulfilled;
          patchCommentInCaches(dispatch, getState, postId, commentId, (c) => ({
            ...c,
            liked: data.liked,
            likes: data.likesCount,
          }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    unlikePostComment: builder.mutation<CommentLikeResult, { postId: number; commentId: number }>({
      query: ({ postId, commentId }) => ({
        url: `/posts/${postId}/comments/${commentId}/like`,
        method: 'DELETE',
      }),
      transformResponse: (raw): CommentLikeResult => {
        const data = unwrapData(commentLikeResultSchema)(raw);
        return { liked: data.liked, likesCount: data.likes_count };
      },
      async onQueryStarted({ postId, commentId }, { dispatch, getState, queryFulfilled }) {
        const patches = patchCommentInCaches(dispatch, getState, postId, commentId, (c) => ({
          ...c,
          liked: false,
          likes: c.liked ? Math.max(0, c.likes - 1) : c.likes,
        }));
        try {
          const { data } = await queryFulfilled;
          patchCommentInCaches(dispatch, getState, postId, commentId, (c) => ({
            ...c,
            liked: data.liked,
            likes: data.likesCount,
          }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    likePost: builder.mutation<LikeResult, number>({
      query: (id) => ({ url: `/posts/${id}/like`, method: 'POST' }),
      transformResponse: (raw): LikeResult => {
        const data = unwrapData(likeResultSchema)(raw);
        return { liked: data.liked, likesCount: data.likes_count };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = patchPostInFeeds(dispatch, id, (p) => ({
          ...p,
          liked: true,
          counts: { ...p.counts, likes: p.liked ? p.counts.likes : p.counts.likes + 1 },
        }));
        try {
          const { data } = await queryFulfilled;
          patchPostInFeeds(dispatch, id, (p) => ({
            ...p,
            liked: data.liked,
            counts: { ...p.counts, likes: data.likesCount },
          }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    unlikePost: builder.mutation<LikeResult, number>({
      query: (id) => ({ url: `/posts/${id}/like`, method: 'DELETE' }),
      transformResponse: (raw): LikeResult => {
        const data = unwrapData(likeResultSchema)(raw);
        return { liked: data.liked, likesCount: data.likes_count };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = patchPostInFeeds(dispatch, id, (p) => ({
          ...p,
          liked: false,
          counts: { ...p.counts, likes: p.liked ? Math.max(0, p.counts.likes - 1) : p.counts.likes },
        }));
        try {
          const { data } = await queryFulfilled;
          patchPostInFeeds(dispatch, id, (p) => ({
            ...p,
            liked: data.liked,
            counts: { ...p.counts, likes: data.likesCount },
          }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    savePost: builder.mutation<SaveResult, number>({
      query: (id) => ({ url: `/posts/${id}/save`, method: 'POST' }),
      transformResponse: (raw): SaveResult => {
        const data = unwrapData(saveResultSchema)(raw);
        return { saved: data.saved, savesCount: data.saves_count };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = patchPostInFeeds(dispatch, id, (p) => ({ ...p, saved: true }));
        try {
          const { data } = await queryFulfilled;
          patchPostInFeeds(dispatch, id, (p) => ({ ...p, saved: data.saved }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: [{ type: 'Post', id: 'FEED-saved' }],
    }),

    unsavePost: builder.mutation<SaveResult, number>({
      query: (id) => ({ url: `/posts/${id}/save`, method: 'DELETE' }),
      transformResponse: (raw): SaveResult => {
        const data = unwrapData(saveResultSchema)(raw);
        return { saved: data.saved, savesCount: data.saves_count };
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = patchPostInFeeds(dispatch, id, (p) => ({ ...p, saved: false }));
        try {
          const { data } = await queryFulfilled;
          patchPostInFeeds(dispatch, id, (p) => ({ ...p, saved: data.saved }));
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: [{ type: 'Post', id: 'FEED-saved' }],
    }),

    // eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- delete has no payload
    deletePost: builder.mutation<void, number>({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      transformResponse: (raw) => {
        unwrapMessage()(raw);
      },
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = FEED_TABS.map((tab) =>
          dispatch(
            feedApi.util.updateQueryData('getFeed', { tab }, (draft) => {
              draft.items = draft.items.filter((p) => p.id !== id);
            })
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: (_r, _e, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'FEED-explore' },
        { type: 'Post', id: 'FEED-following' },
        { type: 'Post', id: 'FEED-mine' },
        { type: 'Post', id: 'FEED-saved' },
      ],
    }),

    reportPost: builder.mutation<ReportResult, { postId: number; reason: ReportReason; details?: string | undefined }>({
      query: ({ postId, reason, details }) => ({
        url: `/posts/${postId}/report`,
        method: 'POST',
        body: { reason, details: details || undefined },
      }),
      transformResponse: (raw): ReportResult => {
        const data = unwrapData(reportResultSchema)(raw);
        return {
          reported: data.reported,
          alreadyReported: data.already_reported,
          reportsCount: data.reports_count,
        };
      },
    }),

    repostPost: builder.mutation<Post, { postId: number; body?: string | undefined }>({
      query: ({ postId, body }) => ({
        url: `/posts/${postId}/repost`,
        method: 'POST',
        body: { body: body || undefined },
      }),
      transformResponse: mapPost,
      async onQueryStarted({ postId }, { dispatch, queryFulfilled }) {
        const patches = patchPostInFeeds(dispatch, postId, (p) => ({
          ...p,
          counts: { ...p.counts, reposts: p.counts.reposts + 1 },
        }));
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: (_r, _e, { postId }) => [
        { type: 'Post', id: postId },
        { type: 'Post', id: 'FEED-explore' },
        { type: 'Post', id: 'FEED-following' },
        { type: 'Post', id: 'FEED-mine' },
      ],
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetPostQuery,
  useGetUserPostsQuery,
  useGetReelBandQuery,
  useCreatePostMutation,
  useGetPostCommentsQuery,
  useGetPostCommentRepliesQuery,
  useLazyGetPostCommentRepliesQuery,
  useAddPostCommentMutation,
  useDeletePostCommentMutation,
  useLikePostCommentMutation,
  useUnlikePostCommentMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useDeletePostMutation,
  useReportPostMutation,
  useRepostPostMutation,
} = feedApi;
