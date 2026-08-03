/**
 * Reels API — RTK Query endpoints for feed, mine, upload, and CRUD.
 *
 * Coding guidelines: docs/Coding guidelines.md
 */

import { baseApi } from './baseApi';
import { uploadMediaFile } from './mediaApi';
import {
  bumpPostCommentCount,
  FEED_LIST_ARG,
  optimisticLikePatches,
  optimisticSavePatches,
  optimisticSharePatches,
  REELS_LIST_ARG,
  safeUpdateQueryData,
  syncLikeCountPatches,
  syncSaveCountPatches,
  syncShareCountPatches,
} from './postEngagementCache';

/**
 * @param {Record<string, unknown>} raw
 */
export function normalizeReel(raw) {
  const creator = raw.creator ?? {};
  const playback = raw.playback ?? {};
  const counts = raw.counts ?? {};
  const viewer = raw.viewer ?? {};

  return {
    id: raw.id,
    caption: raw.caption ?? '',
    status: raw.status ?? 'uploading',
    visibility: raw.visibility ?? 'public',
    durationMs: raw.duration_ms ?? null,
    width: raw.width ?? null,
    height: raw.height ?? null,
    processingError: raw.processing_error ?? null,
    playback: {
      type: playback.type ?? 'hls',
      url: playback.url ?? null,
      posterUrl: playback.poster_url ?? null,
      hlsUrl: playback.hls_url ?? null,
      isProcessed: Boolean(playback.is_processed),
    },
    // HLS when ready; temporary original while the owner's reel is still encoding.
    videoUrl: playback.hls_url || playback.url || null,
    // Match PostResource: cover_url and playback.poster_url are both poster sources.
    posterUrl: playback.poster_url || raw.cover_url || null,
    likes: counts.likes ?? 0,
    comments: counts.comments ?? 0,
    views: counts.views ?? 0,
    saves: counts.saves ?? 0,
    shares: counts.shares ?? 0,
    liked: Boolean(viewer.liked),
    saved: Boolean(viewer.saved),
    followingCreator: Boolean(viewer.following_creator),
    username: creator.name ?? '',
    handle: creator.nickname ? `@${creator.nickname}` : '',
    creator: {
      id: creator.id ?? null,
      name: creator.name ?? '',
      nickname: creator.nickname ?? null,
      avatarUrl: creator.avatar_url ?? null,
      isOfficial: Boolean(creator.is_official),
    },
    publishedAt: raw.published_at ?? null,
    createdAt: raw.created_at ?? null,
    readyAt: raw.ready_at ?? null,
    hashtags: Array.isArray(raw.hashtags) ? raw.hashtags : [],
    upload: raw.upload ?? null,
  };
}

/**
 * @param {Record<string, unknown>|undefined} data
 */
function normalizeCursorPage(data) {
  const items = (data?.items ?? []).map(normalizeReel);
  return {
    items,
    nextCursor: data?.next_cursor ?? null,
    prevCursor: data?.prev_cursor ?? null,
    hasMore: Boolean(data?.has_more),
    perPage: data?.per_page ?? 10,
  };
}

export const reelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReelsFeed: builder.query({
      query: ({ cursor, perPage = 10 } = {}) => ({
        url: '/reels/feed',
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          ...newItems,
          items: [...currentCache.items, ...appended],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result) =>
        result
          ? [...result.items.map((r) => ({ type: 'Reel', id: r.id })), { type: 'Reel', id: 'FEED' }]
          : [{ type: 'Reel', id: 'FEED' }],
    }),

    getMyReels: builder.query({
      query: ({ cursor, perPage = 10 } = {}) => ({
        url: '/reels/mine',
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          ...newItems,
          items: [...currentCache.items, ...appended],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result) =>
        result
          ? [...result.items.map((r) => ({ type: 'Reel', id: r.id })), { type: 'Reel', id: 'MINE' }]
          : [{ type: 'Reel', id: 'MINE' }],
    }),

    getFollowingReels: builder.query({
      query: ({ cursor, perPage = 10 } = {}) => ({
        url: '/reels/feed/following',
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          ...newItems,
          items: [...currentCache.items, ...appended],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result) =>
        result
          ? [...result.items.map((r) => ({ type: 'Reel', id: r.id })), { type: 'Reel', id: 'FOLLOWING' }]
          : [{ type: 'Reel', id: 'FOLLOWING' }],
    }),

    getSavedReels: builder.query({
      query: ({ cursor, perPage = 10 } = {}) => ({
        url: '/reels/saved',
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          ...newItems,
          items: [...currentCache.items, ...appended],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result) =>
        result
          ? [...result.items.map((r) => ({ type: 'Reel', id: r.id })), { type: 'Reel', id: 'SAVED' }]
          : [{ type: 'Reel', id: 'SAVED' }],
    }),

    getLikedReels: builder.query({
      query: ({ cursor, perPage = 10 } = {}) => ({
        url: '/reels/liked',
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          ...newItems,
          items: [...currentCache.items, ...appended],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result) =>
        result
          ? [...result.items.map((r) => ({ type: 'Reel', id: r.id })), { type: 'Reel', id: 'LIKED' }]
          : [{ type: 'Reel', id: 'LIKED' }],
    }),

    getUserReels: builder.query({
      query: ({ userId, cursor, perPage = 12 } = {}) => ({
        url: `/users/${userId}/reels`,
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}-${queryArgs?.userId}`,
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          ...newItems,
          items: [...currentCache.items, ...appended],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor || currentArg?.userId !== previousArg?.userId,
      providesTags: (result, _e, arg) =>
        result
          ? [...result.items.map((r) => ({ type: 'Reel', id: r.id })), { type: 'Reel', id: `USER-${arg.userId}` }]
          : [{ type: 'Reel', id: `USER-${arg?.userId}` }],
    }),

    getUserProfile: builder.query({
      query: (userId) => `/users/${userId}/profile`,
      transformResponse: (response) => {
        const raw = response?.data ?? {};
        return {
          id: raw.id,
          name: raw.name ?? '',
          nickname: raw.nickname ?? null,
          avatarUrl: raw.avatar_url ?? null,
          playingRole: raw.playing_role ?? null,
          playingRoleEnum: raw.playing_role_enum ?? null,
          battingStyle: raw.batting_style ?? null,
          battingStyleEnum: raw.batting_style_enum ?? null,
          bowlingStyle: raw.bowling_style ?? null,
          bowlingStyleEnum: raw.bowling_style_enum ?? null,
          followersCount: raw.followers_count ?? 0,
          followingCount: raw.following_count ?? 0,
          reelsCount: raw.reels_count ?? 0,
          isFollowing: Boolean(raw.is_following),
          isOfficial: Boolean(raw.is_official),
          country: raw.country ?? null,
          city: raw.city ?? null,
        };
      },
      providesTags: (_r, _e, userId) => [{ type: 'User', id: userId }],
    }),

    getTrendingReels: builder.query({
      query: ({ cursor, perPage = 10 } = {}) => ({
        url: '/reels/trending',
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (!arg?.cursor) {
          return newItems;
        }
        const seen = new Set(currentCache.items.map((r) => r.id));
        const appended = newItems.items.filter((r) => !seen.has(r.id));
        return {
          ...newItems,
          items: [...currentCache.items, ...appended],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: (result) =>
        result
          ? [...result.items.map((r) => ({ type: 'Reel', id: r.id })), { type: 'Reel', id: 'TRENDING' }]
          : [{ type: 'Reel', id: 'TRENDING' }],
    }),

    searchReels: builder.query({
      query: ({ q, cursor, perPage = 10 }) => ({
        url: '/reels/search',
        params: {
          q,
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
    }),

    searchHashtags: builder.query({
      query: (q) => ({
        url: '/hashtags/search',
        params: { q },
      }),
      transformResponse: (response) => response?.data ?? [],
    }),

    getHashtagReels: builder.query({
      query: ({ name, cursor, perPage = 10 }) => ({
        url: `/hashtags/${encodeURIComponent(name)}/reels`,
        params: {
          cursor: cursor || undefined,
          per_page: perPage,
        },
      }),
      transformResponse: (response) => normalizeCursorPage(response?.data),
    }),

    getReel: builder.query({
      query: (id) => `/reels/${id}`,
      transformResponse: (response) => normalizeReel(response?.data ?? {}),
      providesTags: (_result, _error, id) => [{ type: 'Reel', id }],
    }),

    createReel: builder.mutation({
      query: (body) => ({
        url: '/reels',
        method: 'POST',
        body,
      }),
      transformResponse: (response) => normalizeReel(response?.data ?? {}),
      // Do not invalidate MINE here — the shell is status=uploading with no playback yet.
      // Floating upload navigates to My Videos immediately; invalidating would insert an empty slide.
      // reelUploadSessionStore invalidates MINE/FEED after the original finishes uploading.
    }),

    updateReel: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/reels/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response) => normalizeReel(response?.data ?? {}),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Reel', id: arg.id },
        { type: 'Reel', id: 'MINE' },
        { type: 'Reel', id: 'FEED' },
      ],
    }),

    deleteReel: builder.mutation({
      query: (id) => ({
        url: `/reels/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Reel', id },
        { type: 'Reel', id: 'MINE' },
        { type: 'Reel', id: 'FEED' },
      ],
    }),

    likeReel: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/like`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Reel', id: 'LIKED' }],
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

    unlikeReel: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/like`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Reel', id: 'LIKED' }],
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

    saveReel: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/save`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Reel', id: 'SAVED' }],
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

    unsaveReel: builder.mutation({
      query: (id) => ({
        url: `/posts/${id}/save`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Reel', id: 'SAVED' }],
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

    shareReel: builder.mutation({
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

    followReelCreator: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'POST',
      }),
      async onQueryStarted(userId, { dispatch, getState, queryFulfilled }) {
        const patches = patchCreatorFollowingCaches(dispatch, getState, userId, true);
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    unfollowReelCreator: builder.mutation({
      query: (userId) => ({
        url: `/users/${userId}/follow`,
        method: 'DELETE',
      }),
      async onQueryStarted(userId, { dispatch, getState, queryFulfilled }) {
        const patches = patchCreatorFollowingCaches(dispatch, getState, userId, false);
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    reportReel: builder.mutation({
      query: ({ id, reason, details }) => ({
        url: `/posts/${id}/report`,
        method: 'POST',
        body: { reason, details },
      }),
    }),

    getReelComments: builder.query({
      query: ({ reelId, page = 1, perPage = 20 }) => ({
        url: `/posts/${reelId}/comments`,
        params: { page, per_page: perPage },
      }),
      transformResponse: (response) => ({
        items: (response?.data?.items ?? []).map(normalizeComment),
        currentPage: response?.data?.current_page ?? 1,
        lastPage: response?.data?.last_page ?? 1,
        total: response?.data?.total ?? 0,
      }),
      providesTags: (_r, _e, arg) => [{ type: 'Reel', id: `COMMENTS-${arg.reelId}` }],
    }),

    getReelCommentReplies: builder.query({
      query: ({ reelId, commentId, page = 1, perPage = 20 }) => ({
        url: `/posts/${reelId}/comments/${commentId}/replies`,
        params: { page, per_page: perPage },
      }),
      transformResponse: (response) => ({
        items: (response?.data?.items ?? []).map(normalizeComment),
        currentPage: response?.data?.current_page ?? 1,
        lastPage: response?.data?.last_page ?? 1,
        total: response?.data?.total ?? 0,
      }),
      // Shares the parent comment list's tag so deleting any comment (top-level or reply)
      // refreshes an already-expanded replies thread too.
      providesTags: (_r, _e, arg) => [{ type: 'Reel', id: `COMMENTS-${arg.reelId}` }],
    }),

    addReelComment: builder.mutation({
      query: ({ reelId, body, parentId }) => ({
        url: `/posts/${reelId}/comments`,
        method: 'POST',
        body: { body, parent_id: parentId || undefined },
      }),
      transformResponse: (response) => normalizeComment(response?.data ?? {}),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Reel', id: `COMMENTS-${arg.reelId}` },
        { type: 'Reel', id: arg.reelId },
        { type: 'Reel', id: 'FEED' },
        { type: 'Reel', id: 'MINE' },
        { type: 'Reel', id: 'FOLLOWING' },
        { type: 'Post', id: arg.reelId },
      ],
      async onQueryStarted({ reelId }, { dispatch, queryFulfilled }) {
        const patches = bumpPostCommentCount(dispatch, reelId, 1);
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    deleteReelComment: builder.mutation({
      query: ({ reelId, commentId }) => ({
        url: `/posts/${reelId}/comments/${commentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, arg) => [
        { type: 'Reel', id: `COMMENTS-${arg.reelId}` },
        { type: 'Reel', id: arg.reelId },
        { type: 'Post', id: arg.reelId },
      ],
      async onQueryStarted({ reelId, removedCount = 1 }, { dispatch, queryFulfilled }) {
        const delta = -Math.max(1, Number(removedCount) || 1);
        const patches = bumpPostCommentCount(dispatch, reelId, delta);
        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    likeReelComment: builder.mutation({
      query: ({ reelId, commentId }) => ({
        url: `/posts/${reelId}/comments/${commentId}/like`,
        method: 'POST',
      }),
      async onQueryStarted({ reelId, commentId }, { dispatch, getState, queryFulfilled }) {
        const patches = optimisticCommentLikePatches(dispatch, getState, reelId, commentId, true);
        try {
          const { data } = await queryFulfilled;
          const likes = data?.data?.likes_count;
          if (likes != null) {
            syncCommentLikePatches(dispatch, getState, reelId, commentId, true, likes);
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    unlikeReelComment: builder.mutation({
      query: ({ reelId, commentId }) => ({
        url: `/posts/${reelId}/comments/${commentId}/like`,
        method: 'DELETE',
      }),
      async onQueryStarted({ reelId, commentId }, { dispatch, getState, queryFulfilled }) {
        const patches = optimisticCommentLikePatches(dispatch, getState, reelId, commentId, false);
        try {
          const { data } = await queryFulfilled;
          const likes = data?.data?.likes_count;
          if (likes != null) {
            syncCommentLikePatches(dispatch, getState, reelId, commentId, false, likes);
          }
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
    }),

    recordReelView: builder.mutation({
      query: ({ id, watched_ms, completion_rate }) => ({
        url: `/posts/${id}/views`,
        method: 'POST',
        body: { watched_ms, completion_rate },
      }),
    }),

    initReelMultipart: builder.mutation({
      query: (id) => ({
        url: `/reels/${id}/upload/init`,
        method: 'POST',
      }),
      transformResponse: (response) => response?.data ?? {},
    }),

    uploadReelMultipartPart: builder.mutation({
      query: ({ id, uploadId, partNumber, file }) => {
        const fd = new FormData();
        fd.append('upload_id', uploadId);
        fd.append('part_number', String(partNumber));
        fd.append('file', file);
        return {
          url: `/reels/${id}/upload/part`,
          method: 'POST',
          body: fd,
        };
      },
    }),

    completeReelMultipart: builder.mutation({
      query: ({ id, uploadId, totalParts, filename, contentType }) => ({
        url: `/reels/${id}/upload/complete`,
        method: 'POST',
        body: {
          upload_id: uploadId,
          total_parts: totalParts,
          filename: filename || undefined,
          content_type: contentType || undefined,
        },
      }),
      transformResponse: (response) => normalizeReel(response?.data ?? {}),
      invalidatesTags: [{ type: 'Reel', id: 'MINE' }],
    }),

    abortReelMultipart: builder.mutation({
      query: ({ id, uploadId }) => ({
        url: `/reels/${id}/upload/abort`,
        method: 'POST',
        body: { upload_id: uploadId },
      }),
    }),
  }),
});

/**
 * @param {Record<string, unknown>} raw
 */
function normalizeComment(raw) {
  const user = raw.user ?? {};
  return {
    id: raw.id,
    // API uses post_id; keep reelId alias for callers that still expect it.
    reelId: raw.post_id ?? raw.reel_id ?? null,
    parentId: raw.parent_id ?? null,
    body: raw.body ?? '',
    likesCount: Number(raw.likes_count ?? 0),
    liked: Boolean(raw.liked),
    isPinned: Boolean(raw.is_pinned),
    repliesCount: raw.replies_count ?? 0,
    user: {
      id: user.id ?? null,
      name: user.name ?? '',
      nickname: user.nickname ?? null,
      avatarUrl: user.avatar_url ?? null,
      isOfficial: Boolean(user.is_official),
    },
    createdAt: raw.created_at ?? null,
  };
}

function sameId(a, b) {
  return a != null && b != null && String(a) === String(b);
}

function patchCommentCaches(dispatch, getState, reelId, commentId, updater) {
  const patches = [];
  const queries = getState()?.api?.queries ?? {};

  Object.values(queries).forEach((entry) => {
    if (!entry?.data?.items || !Array.isArray(entry.data.items)) return;
    if (entry.endpointName !== 'getReelComments' && entry.endpointName !== 'getReelCommentReplies') {
      return;
    }
    if (!sameId(entry.originalArgs?.reelId, reelId)) return;

    patches.push(
      safeUpdateQueryData(dispatch, entry.endpointName, entry.originalArgs, (draft) => {
        if (!draft?.items) return;
        const idx = draft.items.findIndex((c) => sameId(c.id, commentId));
        if (idx >= 0) {
          draft.items[idx] = updater(draft.items[idx]);
        }
      }),
    );
  });

  return patches;
}

function optimisticCommentLikePatches(dispatch, getState, reelId, commentId, liked) {
  return patchCommentCaches(dispatch, getState, reelId, commentId, (comment) => ({
    ...comment,
    liked,
    likesCount: liked
      ? Math.max(0, (comment.likesCount ?? 0) + (comment.liked ? 0 : 1))
      : Math.max(0, (comment.likesCount ?? 0) - (comment.liked ? 1 : 0)),
  }));
}

function syncCommentLikePatches(dispatch, getState, reelId, commentId, liked, likesCount) {
  return patchCommentCaches(dispatch, getState, reelId, commentId, (comment) => ({
    ...comment,
    liked,
    likesCount,
  }));
}

function patchCreatorFollowingCaches(dispatch, getState, creatorId, following) {
  const patches = [];
  const listEndpoints = [
    ['getReelsFeed', REELS_LIST_ARG],
    ['getMyReels', REELS_LIST_ARG],
    ['getFollowingReels', REELS_LIST_ARG],
    ['getSavedReels', REELS_LIST_ARG],
  ];

  listEndpoints.forEach(([endpointName, arg]) => {
    patches.push(
      safeUpdateQueryData(dispatch, endpointName, arg, (draft) => {
        if (!draft?.items) return;
        draft.items.forEach((reel, idx) => {
          if (sameId(reel.creator?.id, creatorId)) {
            draft.items[idx] = { ...reel, followingCreator: following };
          }
        });
      }),
    );
  });

  for (const endpoint of ['getHomeFeed', 'getFollowingFeed']) {
    patches.push(
      safeUpdateQueryData(dispatch, endpoint, FEED_LIST_ARG, (draft) => {
        if (!draft?.items) return;
        draft.items.forEach((post, idx) => {
          if (sameId(post.authorId, creatorId)) {
            draft.items[idx] = { ...post, followingCreator: following };
          }
        });
      }),
    );
  }

  const queries = getState()?.api?.queries ?? {};
  Object.values(queries).forEach((entry) => {
    if (entry?.endpointName !== 'getReel' || !entry?.data) return;
    if (!sameId(entry.data.creator?.id, creatorId)) return;
    patches.push(
      safeUpdateQueryData(dispatch, 'getReel', entry.originalArgs, (draft) => {
        if (draft) draft.followingCreator = following;
      }),
    );
  });

  Object.values(queries).forEach((entry) => {
    if (entry?.endpointName !== 'getPost' || !entry?.data) return;
    if (!sameId(entry.data.authorId, creatorId)) return;
    patches.push(
      safeUpdateQueryData(dispatch, 'getPost', entry.originalArgs, (draft) => {
        if (draft) draft.followingCreator = following;
      }),
    );
  });

  Object.values(queries).forEach((entry) => {
    if (entry?.endpointName !== 'getUserProfile' || !entry?.data) return;
    if (!sameId(entry.originalArgs, creatorId)) return;
    patches.push(
      safeUpdateQueryData(dispatch, 'getUserProfile', entry.originalArgs, (draft) => {
        if (!draft) return;
        const wasFollowing = Boolean(draft.isFollowing);
        if (wasFollowing === following) return;
        draft.isFollowing = following;
        const nextCount = Number(draft.followersCount ?? 0) + (following ? 1 : -1);
        draft.followersCount = Math.max(0, nextCount);
      }),
    );
  });

  // Explore "Suggested for you": drop a user once followed so they don't linger in the widget.
  if (following) {
    Object.values(queries).forEach((entry) => {
      if (entry?.endpointName !== 'getSuggestedUsers' || !Array.isArray(entry?.data)) return;
      patches.push(
        safeUpdateQueryData(dispatch, 'getSuggestedUsers', entry.originalArgs, (draft) => {
          if (!Array.isArray(draft)) return;
          const next = draft.filter((user) => !sameId(user.id, creatorId));
          draft.splice(0, draft.length, ...next);
        }),
      );
    });
  }

  return patches;
}

export const {
  useGetReelsFeedQuery,
  useGetMyReelsQuery,
  useGetFollowingReelsQuery,
  useGetSavedReelsQuery,
  useGetLikedReelsQuery,
  useGetUserReelsQuery,
  useGetUserProfileQuery,
  useGetTrendingReelsQuery,
  useSearchReelsQuery,
  useSearchHashtagsQuery,
  useGetHashtagReelsQuery,
  useGetReelQuery,
  useCreateReelMutation,
  useUpdateReelMutation,
  useDeleteReelMutation,
  useLikeReelMutation,
  useUnlikeReelMutation,
  useSaveReelMutation,
  useUnsaveReelMutation,
  useShareReelMutation,
  useFollowReelCreatorMutation,
  useUnfollowReelCreatorMutation,
  useReportReelMutation,
  useGetReelCommentsQuery,
  useLazyGetReelCommentsQuery,
  useGetReelCommentRepliesQuery,
  useLazyGetReelCommentRepliesQuery,
  useAddReelCommentMutation,
  useDeleteReelCommentMutation,
  useLikeReelCommentMutation,
  useUnlikeReelCommentMutation,
  useRecordReelViewMutation,
  useInitReelMultipartMutation,
  useUploadReelMultipartPartMutation,
  useCompleteReelMultipartMutation,
  useAbortReelMultipartMutation,
  useLazyGetReelsFeedQuery,
  useLazyGetMyReelsQuery,
  useLazyGetFollowingReelsQuery,
  useLazyGetSavedReelsQuery,
  useLazyGetLikedReelsQuery,
  useLazyGetUserReelsQuery,
  useLazyGetTrendingReelsQuery,
} = reelsApi;

/**
 * Create reel metadata then upload the original video file.
 * Uses chunked multipart when those mutations are provided (default).
 *
 * @param {{ createReel: Function, uploadMedia: Function, initMultipart?: Function, uploadPart?: Function, completeMultipart?: Function, abortMultipart?: Function }} mutations
 * @param {{ file: File, caption?: string, visibility?: string, clientDurationMs?: number, onProgress?: (p: { stage: string, percent: number }) => void }} opts
 */
export async function publishReel(mutations, { file, caption, visibility, clientDurationMs, onProgress }) {
  const { createReel, uploadMedia, initMultipart, uploadPart, completeMultipart, abortMultipart } = mutations;

  const report = (stage, percent) => {
    onProgress?.({ stage, percent: Math.min(100, Math.max(0, Math.round(percent))) });
  };

  report('preparing', 2);

  const created = await createReel({
    caption: caption || undefined,
    visibility: visibility || undefined,
    client_duration_ms: clientDurationMs || undefined,
  }).unwrap();

  report('preparing', 8);

  const useMultipart = Boolean(initMultipart && uploadPart && completeMultipart);

  if (!useMultipart) {
    report('uploading', 15);
    await uploadMediaFile(uploadMedia, {
      type: 'reel',
      id: created.id,
      field: 'original',
      file,
    });
    report('finishing', 100);
    return created;
  }

  const init = await initMultipart(created.id).unwrap();
  const uploadId = init.upload_id;
  const partSize = init.part_size || 1 * 1024 * 1024;
  const totalParts = Math.max(1, Math.ceil(file.size / partSize));

  report('uploading', 10);

  try {
    for (let partNumber = 1; partNumber <= totalParts; partNumber += 1) {
      const start = (partNumber - 1) * partSize;
      const blob = file.slice(start, start + partSize);
      await uploadPart({
        id: created.id,
        uploadId,
        partNumber,
        file: new File([blob], `part-${partNumber}`, { type: file.type || 'application/octet-stream' }),
      }).unwrap();
      // Leave 10–92% for bytes; finalizing uses the rest.
      report('uploading', 10 + (partNumber / totalParts) * 82);
    }
    report('finishing', 94);
    await completeMultipart({
      id: created.id,
      uploadId,
      totalParts,
      filename: file.name,
      contentType: file.type || undefined,
    }).unwrap();
    report('finishing', 100);
  } catch (err) {
    if (abortMultipart && uploadId) {
      try {
        await abortMultipart({ id: created.id, uploadId }).unwrap();
      } catch {
        // ignore abort errors
      }
    }
    throw err;
  }

  return created;
}
