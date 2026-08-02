/**
 * Social feed / posts API — RTK Query.
 */

import { baseApi } from './baseApi';
import {
  bumpPostCommentCount,
  FEED_LIST_ARG,
  optimisticLikePatches,
  optimisticSavePatches,
  optimisticSharePatches,
  syncLikeCountPatches,
  syncSaveCountPatches,
  syncShareCountPatches,
} from './postEngagementCache';

export { bumpPostCommentCount, FEED_LIST_ARG };

/**
 * @param {Record<string, unknown>|null|undefined} raw
 */
export function normalizePost(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const creator = raw.creator ?? {};
  const playback = raw.playback ?? {};
  const counts = raw.counts ?? {};
  const viewer = raw.viewer ?? {};
  const media = Array.isArray(raw.media) ? raw.media : [];
  const type = raw.type ?? 'video';
  const latestComment = raw.latest_comment;

  const coverUrl = raw.cover_url || playback?.poster_url || media[0]?.url || null;

  const description = raw.body ?? raw.caption ?? '';
  const title = raw.title || (type === 'repost' ? '' : description.slice(0, 80));
  const unavailable = Boolean(raw.unavailable);

  return {
    id: raw.id,
    type,
    unavailable,
    caption: unavailable ? '' : (raw.caption ?? raw.body ?? ''),
    title: unavailable ? '' : title,
    description: unavailable ? '' : description,
    body: unavailable ? '' : (raw.body ?? raw.caption ?? ''),
    backgroundId: unavailable ? null : (raw.background_id ?? null),
    status: raw.status ?? 'ready',
    visibility: raw.visibility ?? 'public',
    imageUrl: unavailable ? null : coverUrl,
    coverUrl: unavailable ? null : coverUrl,
    publishedAt: unavailable ? null : (raw.published_at ?? raw.created_at ?? null),
    createdAt: raw.created_at ?? null,
    authorName: unavailable ? '' : (creator.name ?? 'User'),
    authorAvatarUrl: unavailable ? null : (creator.avatar_url ?? null),
    authorId: unavailable ? null : (creator.id ?? null),
    authorIsOfficial: unavailable ? false : Boolean(creator.is_official),
    handle: unavailable ? '' : creator.nickname ? `@${creator.nickname}` : '',
    likesCount: counts.likes ?? 0,
    commentsCount: counts.comments ?? 0,
    sharesCount: counts.shares ?? 0,
    repostsCount: counts.reposts ?? 0,
    viewsCount: counts.views ?? 0,
    liked: Boolean(viewer.liked),
    saved: Boolean(viewer.saved),
    followingCreator: Boolean(viewer.following_creator),
    playback: playback
      ? {
          type: playback.type ?? 'hls',
          url: playback.url ?? null,
          posterUrl: playback.poster_url ?? null,
          hlsUrl: playback.hls_url ?? null,
          isProcessed: Boolean(playback.is_processed),
        }
      : null,
    videoUrl: playback?.hls_url || playback?.url || null,
    posterUrl: playback?.poster_url ?? coverUrl,
    media: media.map((m) => ({
      id: m.id,
      kind: m.kind,
      url: m.url,
      width: m.width,
      height: m.height,
      sortOrder: m.sort_order,
    })),
    repostOf: raw.repost_of ? normalizePost(raw.repost_of) : null,
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags : [],
    latestComment:
      latestComment && typeof latestComment === 'object' && typeof latestComment.body === 'string'
        ? {
            id: latestComment.id,
            text: latestComment.body,
            createdAt: latestComment.created_at ?? null,
            commenterId: latestComment.user?.id ?? null,
            commenterName: latestComment.user?.name || latestComment.user?.nickname || 'User',
            commenterAvatarUrl: latestComment.user?.avatar_url ?? null,
            commenterIsOfficial: Boolean(latestComment.user?.is_official),
          }
        : null,
    upload: raw.upload ?? null,
  };
}

/**
 * @param {Record<string, unknown>|null|undefined} data
 */
export function normalizeCursorPage(data) {
  const items = (data?.items ?? []).map(normalizePost).filter(Boolean);
  return {
    items,
    nextCursor: data?.next_cursor ?? null,
    prevCursor: data?.prev_cursor ?? null,
    hasMore: Boolean(data?.has_more),
    perPage: data?.per_page ?? 10,
  };
}

/**
 * Infinite-cursor merge: no cursor → replace; with cursor → append unique ids.
 * Exported for unit tests.
 *
 * @param {{ items?: unknown[] }|null|undefined} currentCache
 * @param {{ items?: unknown[], nextCursor?: string|null, hasMore?: boolean, perPage?: number }} newPage
 * @param {{ cursor?: string|null }|undefined} arg
 */
export function mergeCursorPages(currentCache, newPage, arg) {
  if (!arg?.cursor || !currentCache?.items?.length) {
    return newPage;
  }
  const seen = new Set(currentCache.items.map((p) => String(p.id)));
  const appended = (newPage.items ?? []).filter((p) => !seen.has(String(p.id)));
  return {
    ...newPage,
    items: [...currentCache.items, ...appended],
  };
}

function cursorQueryOptions(listTag) {
  return {
    // One cache entry per list endpoint so first page + cursor pages merge together.
    serializeQueryArgs: ({ endpointName }) => endpointName,
    merge: (currentCache, newItems, { arg }) => mergeCursorPages(currentCache, newItems, arg),
    forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
    providesTags: (result) =>
      result
        ? [...result.items.map((p) => ({ type: 'Post', id: p.id })), { type: 'Post', id: listTag }]
        : [{ type: 'Post', id: listTag }],
  };
}

export const feedApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHomeFeed: builder.query({
      query: ({ cursor, perPage = FEED_LIST_ARG.perPage } = {}) => ({
        url: '/feed',
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      ...cursorQueryOptions('FEED'),
    }),

    getFollowingFeed: builder.query({
      query: ({ cursor, perPage = FEED_LIST_ARG.perPage } = {}) => ({
        url: '/feed/following',
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      ...cursorQueryOptions('FOLLOWING'),
    }),

    getSavedFeed: builder.query({
      query: ({ cursor, perPage = FEED_LIST_ARG.perPage } = {}) => ({
        url: '/feed/saved',
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      ...cursorQueryOptions('SAVED'),
    }),

    getPost: builder.query({
      query: (id) => `/posts/${id}`,
      transformResponse: (response) => normalizePost(response?.data),
      providesTags: (_r, _e, id) => [{ type: 'Post', id }],
    }),

    createPost: builder.mutation({
      query: (body) => {
        if (body instanceof FormData) {
          return {
            url: '/posts',
            method: 'POST',
            body,
          };
        }
        return {
          url: '/posts',
          method: 'POST',
          body,
        };
      },
      transformResponse: (response) => normalizePost(response?.data),
      invalidatesTags: [
        { type: 'Post', id: 'FEED' },
        { type: 'Post', id: 'FOLLOWING' },
      ],
    }),

    repostPost: builder.mutation({
      query: ({ id, body, visibility }) => ({
        url: `/posts/${id}/repost`,
        method: 'POST',
        body: {
          body: body || undefined,
          visibility: visibility || undefined,
        },
      }),
      transformResponse: (response) => normalizePost(response?.data),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Post', id: 'FEED' },
        { type: 'Post', id: 'FOLLOWING' },
        { type: 'Post', id },
      ],
    }),

    likePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/like`,
        method: 'POST',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = optimisticLikePatches(dispatch, id, true);
        try {
          const { data } = await queryFulfilled;
          const likes = data?.data?.likes_count;
          if (likes != null) {
            syncLikeCountPatches(dispatch, id, true, likes);
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    unlikePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/like`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = optimisticLikePatches(dispatch, id, false);
        try {
          const { data } = await queryFulfilled;
          const likes = data?.data?.likes_count;
          if (likes != null) {
            syncLikeCountPatches(dispatch, id, false, likes);
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    savePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/save`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Post', id: 'SAVED' }],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = optimisticSavePatches(dispatch, id, true);
        try {
          const { data } = await queryFulfilled;
          const saves = data?.data?.saves_count;
          if (saves != null) {
            syncSaveCountPatches(dispatch, id, true, saves);
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    unsavePost: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/save`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Post', id: 'SAVED' }],
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patches = optimisticSavePatches(dispatch, id, false);
        try {
          const { data } = await queryFulfilled;
          const saves = data?.data?.saves_count;
          if (saves != null) {
            syncSaveCountPatches(dispatch, id, false, saves);
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    sharePost: builder.mutation({
      query: ({ id, channel = 'copy_link' }) => ({
        url: `/posts/${id}/share`,
        method: 'POST',
        body: { channel },
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        const patches = optimisticSharePatches(dispatch, id);
        try {
          const { data } = await queryFulfilled;
          const shares = data?.data?.shares_count;
          if (shares != null) {
            syncShareCountPatches(dispatch, id, shares);
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),
  }),
});

export const {
  useGetHomeFeedQuery,
  useGetFollowingFeedQuery,
  useGetSavedFeedQuery,
  useLazyGetHomeFeedQuery,
  useLazyGetFollowingFeedQuery,
  useLazyGetSavedFeedQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useRepostPostMutation,
  useLikePostMutation,
  useUnlikePostMutation,
  useSavePostMutation,
  useUnsavePostMutation,
  useSharePostMutation,
} = feedApi;
