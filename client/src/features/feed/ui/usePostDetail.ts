import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { getApiErrorMessage } from '@/shared/api/errors';
import { confirm } from '@/shared/dialogs';
import { selectUserId } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';
import { toast } from '@/shared/ui/toast';

import {
  useAddPostCommentMutation,
  useDeletePostCommentMutation,
  useGetPostCommentsQuery,
  useGetPostQuery,
  useLazyGetPostCommentRepliesQuery,
  useLikePostCommentMutation,
  useLikePostMutation,
  useRepostPostMutation,
  useSavePostMutation,
  useUnlikePostCommentMutation,
  useUnlikePostMutation,
  useUnsavePostMutation,
} from '../api/feedApi';
import { postDetailReplyDraft } from '../lib/postDetail';
import type { Comment } from '../model/commentSchemas';
import { feedRoutes } from '../routes';

/** Post + comments queries and actions for PostDetailPage. */
export function usePostDetail(postId: number, valid: boolean) {
  const navigate = useNavigate();
  const location = useLocation();
  const userId = useAppSelector(selectUserId);
  const { data: me } = useMeQuery();
  const composerInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const { data, isLoading, isError, refetch } = useGetPostQuery(postId, { skip: !valid });
  const {
    data: commentsPage,
    isLoading: commentsLoading,
    isError: commentsError,
    refetch: refetchComments,
  } = useGetPostCommentsQuery({ postId }, { skip: !valid || data?.kind === 'video' });

  const [likePost] = useLikePostMutation();
  const [unlikePost] = useUnlikePostMutation();
  const [savePost] = useSavePostMutation();
  const [unsavePost] = useUnsavePostMutation();
  const [repostPost, { isLoading: reposting }] = useRepostPostMutation();
  const [addComment, { isLoading: sending }] = useAddPostCommentMutation();
  const [deleteComment] = useDeletePostCommentMutation();
  const [likeComment] = useLikePostCommentMutation();
  const [unlikeComment] = useUnlikePostCommentMutation();
  const [fetchReplies] = useLazyGetPostCommentRepliesQuery();

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  useEffect(() => {
    if (data?.kind === 'video') {
      navigate(feedRoutes.reel(data.id), { replace: true });
    }
  }, [data, navigate]);

  useEffect(() => {
    if (location.hash !== '#comments' || !data || data.kind === 'video') return;
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => composerInputRef.current?.focus({ preventScroll: true }), 350);
  }, [location.hash, data]);

  async function toggleLike() {
    if (!data) return;
    try {
      if (data.liked) await unlikePost(data.id).unwrap();
      else await likePost(data.id).unwrap();
    } catch {
      toast({ title: 'Could Not Update Like', tone: 'error' });
    }
  }

  async function toggleSave() {
    if (!data) return;
    try {
      if (data.saved) await unsavePost(data.id).unwrap();
      else await savePost(data.id).unwrap();
    } catch {
      toast({ title: 'Could Not Update Save', tone: 'error' });
    }
  }

  async function repost() {
    if (!data) return;
    try {
      await repostPost({ postId: data.id }).unwrap();
      toast({ title: 'Reposted', tone: 'success' });
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not repost.'), tone: 'error' });
    }
  }

  function focusComposer() {
    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => composerInputRef.current?.focus({ preventScroll: true }), 350);
  }

  function startReply(comment: Comment) {
    setReplyTo(comment);
    setDraft(postDetailReplyDraft(comment.author.handle));
    window.setTimeout(() => composerInputRef.current?.focus({ preventScroll: true }), 50);
  }

  function cancelReply() {
    setReplyTo(null);
    setDraft('');
  }

  async function sendComment() {
    const body = draft.trim();
    if (!body || !valid) return;
    try {
      await addComment({
        postId,
        body,
        parentId: replyTo?.id,
      }).unwrap();
      setDraft('');
      setReplyTo(null);
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not post comment.'), tone: 'error' });
    }
  }

  async function toggleCommentLike(comment: Comment) {
    try {
      if (comment.liked) await unlikeComment({ postId, commentId: comment.id }).unwrap();
      else await likeComment({ postId, commentId: comment.id }).unwrap();
    } catch {
      toast({ title: 'Could Not Update Like', tone: 'error' });
    }
  }

  async function removeComment(comment: Comment) {
    const ok = await confirm({
      title: 'Delete Comment?',
      message: 'This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await deleteComment({
        postId,
        commentId: comment.id,
        removedCount: 1 + comment.repliesCount,
      }).unwrap();
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not delete comment.'), tone: 'error' });
    }
  }

  async function loadReplies(commentId: number) {
    const page = await fetchReplies({ postId, commentId }).unwrap();
    return page.items;
  }

  function goHome() {
    navigate(feedRoutes.home());
  }

  const comments = commentsPage?.items ?? [];
  const isVideo = data?.kind === 'video';

  return {
    postId,
    valid,
    navigate,
    userId,
    me,
    composerInputRef,
    data,
    isLoading,
    isError,
    refetch,
    comments,
    commentsLoading,
    commentsError,
    refetchComments,
    reposting,
    sending,
    draft,
    setDraft,
    replyTo,
    isVideo,
    goHome,
    toggleLike,
    toggleSave,
    repost,
    focusComposer,
    startReply,
    cancelReply,
    sendComment,
    toggleCommentLike,
    removeComment,
    loadReplies,
  };
}
