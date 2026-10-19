/**
 * Comment-thread API adapters for PostCommentsThread.
 * Args stay reel-shaped (`reelId`) so the thread UI stays shared; entertainment maps to episodeId.
 */

import {
  useAddEntertainmentEpisodeCommentMutation,
  useDeleteEntertainmentEpisodeCommentMutation,
  useGetEntertainmentEpisodeCommentRepliesQuery,
  useGetEntertainmentEpisodeCommentsQuery,
  useLazyGetEntertainmentEpisodeCommentRepliesQuery,
  useLazyGetEntertainmentEpisodeCommentsQuery,
  useLikeEntertainmentEpisodeCommentMutation,
  useUnlikeEntertainmentEpisodeCommentMutation,
} from '@/store/api/entertainmentApi';
import {
  useAddReelCommentMutation,
  useDeleteReelCommentMutation,
  useGetReelCommentRepliesQuery,
  useGetReelCommentsQuery,
  useLazyGetReelCommentRepliesQuery,
  useLazyGetReelCommentsQuery,
  useLikeReelCommentMutation,
  useUnlikeReelCommentMutation,
} from '@/store/api/reelsApi';

function toEpisodeArgs({ reelId, ...rest }) {
  return { episodeId: reelId, ...rest };
}

function useEntertainmentCommentsQuery(args, options) {
  return useGetEntertainmentEpisodeCommentsQuery(toEpisodeArgs(args), options);
}

function useLazyEntertainmentCommentsQuery() {
  const [trigger, state] = useLazyGetEntertainmentEpisodeCommentsQuery();
  const mapped = (args, preferCacheValue) => trigger(toEpisodeArgs(args), preferCacheValue);
  return [mapped, state];
}

function useEntertainmentRepliesQuery(args, options) {
  return useGetEntertainmentEpisodeCommentRepliesQuery(toEpisodeArgs(args), options);
}

function useLazyEntertainmentRepliesQuery() {
  const [trigger, state] = useLazyGetEntertainmentEpisodeCommentRepliesQuery();
  const mapped = (args, preferCacheValue) => trigger(toEpisodeArgs(args), preferCacheValue);
  return [mapped, state];
}

function useAddEntertainmentCommentMutation() {
  const [trigger, state] = useAddEntertainmentEpisodeCommentMutation();
  const mapped = (args) =>
    trigger({
      episodeId: args.reelId,
      body: args.body,
      parentId: args.parentId,
    });
  return [mapped, state];
}

function useDeleteEntertainmentCommentMutation() {
  const [trigger, state] = useDeleteEntertainmentEpisodeCommentMutation();
  const mapped = (args) =>
    trigger({
      episodeId: args.reelId,
      commentId: args.commentId,
    });
  return [mapped, state];
}

function useLikeEntertainmentCommentMutation() {
  const [trigger, state] = useLikeEntertainmentEpisodeCommentMutation();
  const mapped = (args) =>
    trigger({
      episodeId: args.reelId,
      commentId: args.commentId,
    });
  return [mapped, state];
}

function useUnlikeEntertainmentCommentMutation() {
  const [trigger, state] = useUnlikeEntertainmentEpisodeCommentMutation();
  const mapped = (args) =>
    trigger({
      episodeId: args.reelId,
      commentId: args.commentId,
    });
  return [mapped, state];
}

export const COMMENTS_THREAD_API = {
  reel: {
    useCommentsQuery: useGetReelCommentsQuery,
    useLazyCommentsQuery: useLazyGetReelCommentsQuery,
    useRepliesQuery: useGetReelCommentRepliesQuery,
    useLazyRepliesQuery: useLazyGetReelCommentRepliesQuery,
    useAddCommentMutation: useAddReelCommentMutation,
    useDeleteCommentMutation: useDeleteReelCommentMutation,
    useLikeCommentMutation: useLikeReelCommentMutation,
    useUnlikeCommentMutation: useUnlikeReelCommentMutation,
  },
  entertainment: {
    useCommentsQuery: useEntertainmentCommentsQuery,
    useLazyCommentsQuery: useLazyEntertainmentCommentsQuery,
    useRepliesQuery: useEntertainmentRepliesQuery,
    useLazyRepliesQuery: useLazyEntertainmentRepliesQuery,
    useAddCommentMutation: useAddEntertainmentCommentMutation,
    useDeleteCommentMutation: useDeleteEntertainmentCommentMutation,
    useLikeCommentMutation: useLikeEntertainmentCommentMutation,
    useUnlikeCommentMutation: useUnlikeEntertainmentCommentMutation,
  },
};
