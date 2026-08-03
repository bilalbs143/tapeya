/**
 * Cross-surface RTK cache patches for the posts spine.
 *
 * Feed cards (`Post` tags / likesCount) and the reels player (`Reel` tags / likes)
 * share one Post model but keep separate RTK endpoint caches — always dual-patch
 * engagement so Home and /reels stay consistent for the same id.
 */

import { baseApi } from './baseApi';

/** Must match FeedRegion / feed list subscriptions. */
export const FEED_LIST_ARG = { perPage: 10 };

/** Must match reels list subscriptions used by patchReelCaches. */
export const REELS_LIST_ARG = { perPage: 10 };

const NOOP_PATCH = { undo() {} };

function sameId(a, b) {
  return a != null && b != null && String(a) === String(b);
}

function detailKeys(id) {
  return Array.from(new Set([id, Number(id), String(id)].filter((key) => key !== '' && !Number.isNaN(key))));
}

/**
 * Feed endpoints are code-split with the Home route. Calling updateQueryData before
 * feedApi has been imported throws (`Cannot read properties of undefined (reading 'select')`).
 */
export function isApiEndpointRegistered(endpointName) {
  return Boolean(baseApi.endpoints?.[endpointName]);
}

/**
 * @param {import('@reduxjs/toolkit').Dispatch} dispatch
 * @param {string} endpointName
 * @param {unknown} arg
 * @param {(draft: any) => void} recipe
 */
export function safeUpdateQueryData(dispatch, endpointName, arg, recipe) {
  if (!isApiEndpointRegistered(endpointName)) {
    return NOOP_PATCH;
  }
  try {
    return dispatch(baseApi.util.updateQueryData(endpointName, arg, recipe));
  } catch {
    return NOOP_PATCH;
  }
}

/**
 * @param {import('@reduxjs/toolkit').Dispatch} dispatch
 * @param {string|number} id
 * @param {(post: object) => object} updater
 */
export function patchPostCaches(dispatch, id, updater) {
  const patches = [];
  for (const endpoint of ['getHomeFeed', 'getFollowingFeed', 'getMineFeed', 'getSavedFeed']) {
    patches.push(
      safeUpdateQueryData(dispatch, endpoint, FEED_LIST_ARG, (draft) => {
        if (!draft?.items) return;
        const idx = draft.items.findIndex((p) => sameId(p.id, id));
        if (idx >= 0) {
          draft.items[idx] = updater(draft.items[idx]);
        }
      }),
    );
  }

  detailKeys(id).forEach((key) => {
    patches.push(
      safeUpdateQueryData(dispatch, 'getPost', key, (draft) => {
        if (draft) Object.assign(draft, updater(draft));
      }),
    );
  });

  return patches;
}

/**
 * @param {import('@reduxjs/toolkit').Dispatch} dispatch
 * @param {string|number} id
 * @param {(reel: object) => object} updater
 */
export function patchReelCaches(dispatch, id, updater) {
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
        const idx = draft.items.findIndex((r) => sameId(r.id, id));
        if (idx >= 0) {
          draft.items[idx] = updater(draft.items[idx]);
        }
      }),
    );
  });

  detailKeys(id).forEach((key) => {
    patches.push(
      safeUpdateQueryData(dispatch, 'getReel', key, (draft) => {
        if (!draft) return;
        Object.assign(draft, updater(draft));
      }),
    );
  });

  return patches;
}

/**
 * @param {import('@reduxjs/toolkit').Dispatch} dispatch
 * @param {string|number} id
 * @param {{ updatePost: (post: object) => object, updateReel: (reel: object) => object }} mappers
 */
export function dualPatchEngagement(dispatch, id, { updatePost, updateReel }) {
  return [...patchPostCaches(dispatch, id, updatePost), ...patchReelCaches(dispatch, id, updateReel)];
}

/** @param {boolean} liked */
export function optimisticLikePatches(dispatch, id, liked) {
  return dualPatchEngagement(dispatch, id, {
    updatePost: (post) => ({
      ...post,
      liked,
      likesCount: liked
        ? Math.max(0, (post.likesCount ?? 0) + (post.liked ? 0 : 1))
        : Math.max(0, (post.likesCount ?? 0) - (post.liked ? 1 : 0)),
    }),
    updateReel: (reel) => ({
      ...reel,
      liked,
      likes: liked
        ? Math.max(0, (reel.likes ?? 0) + (reel.liked ? 0 : 1))
        : Math.max(0, (reel.likes ?? 0) - (reel.liked ? 1 : 0)),
    }),
  });
}

/** Absolute like count from API response. */
export function syncLikeCountPatches(dispatch, id, liked, likesCount) {
  return dualPatchEngagement(dispatch, id, {
    updatePost: (post) => ({ ...post, liked, likesCount }),
    updateReel: (reel) => ({ ...reel, liked, likes: likesCount }),
  });
}

/** @param {boolean} saved */
export function optimisticSavePatches(dispatch, id, saved) {
  return dualPatchEngagement(dispatch, id, {
    updatePost: (post) => ({ ...post, saved }),
    updateReel: (reel) => ({
      ...reel,
      saved,
      saves: saved
        ? Math.max(0, (reel.saves ?? 0) + (reel.saved ? 0 : 1))
        : Math.max(0, (reel.saves ?? 0) - (reel.saved ? 1 : 0)),
    }),
  });
}

export function syncSaveCountPatches(dispatch, id, saved, savesCount) {
  return dualPatchEngagement(dispatch, id, {
    updatePost: (post) => ({ ...post, saved }),
    updateReel: (reel) => ({ ...reel, saved, saves: savesCount }),
  });
}

export function optimisticSharePatches(dispatch, id) {
  return dualPatchEngagement(dispatch, id, {
    updatePost: (post) => ({
      ...post,
      sharesCount: Math.max(0, (post.sharesCount ?? 0) + 1),
    }),
    updateReel: (reel) => ({
      ...reel,
      shares: Math.max(0, (reel.shares ?? 0) + 1),
    }),
  });
}

export function syncShareCountPatches(dispatch, id, sharesCount) {
  return dualPatchEngagement(dispatch, id, {
    updatePost: (post) => ({ ...post, sharesCount }),
    updateReel: (reel) => ({ ...reel, shares: sharesCount }),
  });
}

/** Optimistic comment-count bump for list + detail on both surfaces. */
export function bumpPostCommentCount(dispatch, id, delta = 1) {
  return dualPatchEngagement(dispatch, id, {
    updatePost: (post) => ({
      ...post,
      commentsCount: Math.max(0, (post.commentsCount ?? 0) + delta),
    }),
    updateReel: (reel) => ({
      ...reel,
      comments: Math.max(0, (reel.comments ?? 0) + delta),
    }),
  });
}

/**
 * Pure helpers for unit tests — map post-shaped engagement onto reel fields.
 * @param {{ liked?: boolean, likesCount?: number, saved?: boolean, sharesCount?: number, commentsCount?: number, saves?: number }} fields
 */
export function mapPostEngagementToReel(fields) {
  const next = {};
  if (fields.liked != null) next.liked = fields.liked;
  if (fields.likesCount != null) next.likes = fields.likesCount;
  if (fields.saved != null) next.saved = fields.saved;
  if (fields.sharesCount != null) next.shares = fields.sharesCount;
  if (fields.commentsCount != null) next.comments = fields.commentsCount;
  if (fields.saves != null) next.saves = fields.saves;
  return next;
}
