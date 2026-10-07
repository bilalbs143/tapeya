/**
 * Comment-thread API adapters for PostCommentsThread.
 * Args stay reel-shaped (`reelId`) so the thread UI stays shared; drama maps to episodeId.
 */

import {
  useAddDramaEpisodeCommentMutation,
  useDeleteDramaEpisodeCommentMutation,
  useGetDramaEpisodeCommentRepliesQuery,
  useGetDramaEpisodeCommentsQuery,
  useLazyGetDramaEpisodeCommentRepliesQuery,
  useLazyGetDramaEpisodeCommentsQuery,
  useLikeDramaEpisodeCommentMutation,
  useUnlikeDramaEpisodeCommentMutation,
} from '@/store/api/dramaApi';
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

function useDramaCommentsQuery(args, options) {
  return useGetDramaEpisodeCommentsQuery(toEpisodeArgs(args), options);
}

function useLazyDramaCommentsQuery() {
  const [trigger, state] = useLazyGetDramaEpisodeCommentsQuery();
  const mapped = (args, preferCacheValue) => trigger(toEpisodeArgs(args), preferCacheValue);
  return [mapped, state];
}

function useDramaRepliesQuery(args, options) {
  return useGetDramaEpisodeCommentRepliesQuery(toEpisodeArgs(args), options);
}

function useLazyDramaRepliesQuery() {
  const [trigger, state] = useLazyGetDramaEpisodeCommentRepliesQuery();
  const mapped = (args, preferCacheValue) => trigger(toEpisodeArgs(args), preferCacheValue);
  return [mapped, state];
}

function useAddDramaCommentMutation() {
  const [trigger, state] = useAddDramaEpisodeCommentMutation();
  const mapped = (args) =>
    trigger({
      episodeId: args.reelId,
      body: args.body,
      parentId: args.parentId,
    });
  return [mapped, state];
}

function useDeleteDramaCommentMutation() {
  const [trigger, state] = useDeleteDramaEpisodeCommentMutation();
  const mapped = (args) =>
    trigger({
      episodeId: args.reelId,
      commentId: args.commentId,
    });
  return [mapped, state];
}

function useLikeDramaCommentMutation() {
  const [trigger, state] = useLikeDramaEpisodeCommentMutation();
  const mapped = (args) =>
    trigger({
      episodeId: args.reelId,
      commentId: args.commentId,
    });
  return [mapped, state];
}

function useUnlikeDramaCommentMutation() {
  const [trigger, state] = useUnlikeDramaEpisodeCommentMutation();
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
  drama: {
    useCommentsQuery: useDramaCommentsQuery,
    useLazyCommentsQuery: useLazyDramaCommentsQuery,
    useRepliesQuery: useDramaRepliesQuery,
    useLazyRepliesQuery: useLazyDramaRepliesQuery,
    useAddCommentMutation: useAddDramaCommentMutation,
    useDeleteCommentMutation: useDeleteDramaCommentMutation,
    useLikeCommentMutation: useLikeDramaCommentMutation,
    useUnlikeCommentMutation: useUnlikeDramaCommentMutation,
  },
};
