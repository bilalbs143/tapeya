import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';
import { type Comment } from '@/features/feed';
import { resolveYoutubeEmbed } from '@/features/live';

import { getApiErrorMessage } from '@/shared/api/errors';
import { confirm } from '@/shared/dialogs';
import { shareLink } from '@/shared/native/share';
import { useImmersiveLandscape } from '@/shared/native/useImmersiveLandscape';
import { useKeepAwake } from '@/shared/native/useKeepAwake';
import { useKeyboardInset } from '@/shared/native/useKeyboardInset';
import { selectUserId } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';
import { RotateIcon, ShareIcon, ThumbsDownIcon, ThumbsUpIcon } from '@/shared/ui/icons';
import { type MediaActionItem } from '@/shared/ui/MediaActionRow';
import { toast } from '@/shared/ui/toast';

import {
  useAddDramaEpisodeCommentMutation,
  useDeleteDramaEpisodeCommentMutation,
  useDislikeDramaEpisodeMutation,
  useGetDramaEpisodeCommentsQuery,
  useLazyGetDramaEpisodeCommentRepliesQuery,
  useLikeDramaEpisodeCommentMutation,
  useLikeDramaEpisodeMutation,
  useShareDramaEpisodeMutation,
  useUnlikeDramaEpisodeCommentMutation,
} from '../api/entertainmentApi';
import { entertainmentPaths } from '../lib/entertainmentPaths';
import { compactCount, type DramaEpisode } from '../model/schemas';

type UseEntertainmentEpisodeDetailArgs = {
  episode: DramaEpisode;
  routeSerialId: number;
};

/** Playback, reactions, and comments for an entertainment episode. */
export function useEntertainmentEpisodeDetail({ episode, routeSerialId }: UseEntertainmentEpisodeDetailArgs) {
  const navigate = useNavigate();
  const userId = useAppSelector(selectUserId);
  const { data: me } = useMeQuery();
  const composerInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const {
    data: commentsPage,
    isLoading: commentsLoading,
    isError: commentsError,
    refetch: refetchComments,
  } = useGetDramaEpisodeCommentsQuery({ episodeId: episode.id });

  const [likeEpisode, { isLoading: liking }] = useLikeDramaEpisodeMutation();
  const [dislikeEpisode, { isLoading: disliking }] = useDislikeDramaEpisodeMutation();
  const [shareEpisode, { isLoading: sharing }] = useShareDramaEpisodeMutation();
  const [addComment, { isLoading: sending }] = useAddDramaEpisodeCommentMutation();
  const [deleteComment] = useDeleteDramaEpisodeCommentMutation();
  const [likeComment] = useLikeDramaEpisodeCommentMutation();
  const [unlikeComment] = useUnlikeDramaEpisodeCommentMutation();
  const [fetchReplies] = useLazyGetDramaEpisodeCommentRepliesQuery();

  const [playing, setPlaying] = useState(false);
  const [playSession, setPlaySession] = useState(0);
  const { landscape, deviceLandscape, enterLandscape, exitLandscape } = useImmersiveLandscape(true);
  /** Fixed comments column — pad root so the dock stays above the soft keyboard. */
  const keyboardInset = useKeyboardInset();
  useKeepAwake(playing);
  const [likes, setLikes] = useState(episode.likesCount);
  const [dislikes, setDislikes] = useState(episode.dislikesCount);
  const [shares, setShares] = useState(episode.sharesCount);
  const [myReaction, setMyReaction] = useState<'like' | 'dislike' | null>(episode.myReaction);
  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState<Comment | null>(null);

  const reacting = liking || disliking || sharing;
  const hasVideo = Boolean(episode.videoUrl);
  const youtubeSrc =
    episode.videoSource === 'youtube' && episode.videoUrl
      ? resolveYoutubeEmbed(episode.videoUrl, null, { showControls: true })
      : null;
  const isUpload = episode.videoSource === 'upload' && Boolean(episode.videoUrl);
  const poster = episode.thumbnail || episode.serial?.poster;

  function startPlayback() {
    if (!hasVideo) return;
    setPlaySession((n) => n + 1);
    setPlaying(true);
  }

  const backTo = episode.serial
    ? entertainmentPaths.detail(episode.serial.id)
    : Number.isFinite(routeSerialId)
      ? entertainmentPaths.detail(routeSerialId)
      : entertainmentPaths.list();
  const shareSerialId = episode.serial?.id ?? routeSerialId;
  const comments = commentsPage?.items ?? [];
  const commentsTotal = commentsPage?.total ?? episode.commentsCount;
  const meta = [
    episode.episodeNumber > 0 ? `EP ${episode.episodeNumber}` : null,
    episode.viewsCount > 0 ? `${compactCount(episode.viewsCount)} views` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  async function handleLike() {
    if (reacting) return;
    try {
      const result = await likeEpisode(episode.id).unwrap();
      setLikes(result.likesCount);
      setDislikes(result.dislikesCount);
      setShares(result.sharesCount);
      setMyReaction(result.myReaction);
    } catch {
      /* ignore */
    }
  }

  async function handleDislike() {
    if (reacting) return;
    try {
      const result = await dislikeEpisode(episode.id).unwrap();
      setLikes(result.likesCount);
      setDislikes(result.dislikesCount);
      setShares(result.sharesCount);
      setMyReaction(result.myReaction);
    } catch {
      /* ignore */
    }
  }

  async function handleShare() {
    if (reacting) return;
    const url = `${window.location.origin}${entertainmentPaths.episode(shareSerialId, episode.id)}`;
    const channel = await shareLink({ title: episode.title, url });
    if (channel === 'cancelled') return;
    if (channel === 'copied') toast({ title: 'Link Copied', tone: 'success' });
    try {
      const result = await shareEpisode(episode.id).unwrap();
      setLikes(result.likesCount);
      setDislikes(result.dislikesCount);
      setShares(result.sharesCount);
    } catch {
      /* ignore */
    }
  }

  function onEnterLandscape() {
    startPlayback();
    enterLandscape();
  }

  function startReply(comment: Comment) {
    setReplyTo(comment);
    setDraft(`@${comment.author.handle.replace(/^@/, '')} `);
    window.setTimeout(() => composerInputRef.current?.focus({ preventScroll: true }), 50);
  }

  async function sendComment() {
    const body = draft.trim();
    if (!body) return;
    try {
      await addComment({
        episodeId: episode.id,
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
      if (comment.liked) {
        await unlikeComment({ episodeId: episode.id, commentId: comment.id }).unwrap();
      } else {
        await likeComment({ episodeId: episode.id, commentId: comment.id }).unwrap();
      }
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
      await deleteComment({ episodeId: episode.id, commentId: comment.id }).unwrap();
    } catch (err) {
      toast({ title: getApiErrorMessage(err, 'Could not delete comment.'), tone: 'error' });
    }
  }

  async function loadReplies(commentId: number) {
    const page = await fetchReplies({
      episodeId: episode.id,
      commentId,
    }).unwrap();
    return page.items;
  }

  const episodeActions: MediaActionItem[] = [
    {
      key: 'like',
      label: compactCount(likes),
      ariaLabel: 'Like',
      onClick: () => void handleLike(),
      disabled: reacting,
      active: myReaction === 'like',
      icon: <ThumbsUpIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} filled={myReaction === 'like'} />,
    },
    {
      key: 'dislike',
      label: compactCount(dislikes),
      ariaLabel: 'Dislike',
      onClick: () => void handleDislike(),
      disabled: reacting,
      active: myReaction === 'dislike',
      icon: <ThumbsDownIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} filled={myReaction === 'dislike'} />,
    },
    {
      key: 'share',
      label: shares > 0 ? `Share · ${compactCount(shares)}` : 'Share',
      ariaLabel: 'Share',
      onClick: () => void handleShare(),
      disabled: reacting,
      icon: <ShareIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />,
    },
    {
      key: 'full',
      label: 'Full',
      ariaLabel: 'Rotate to Landscape',
      onClick: onEnterLandscape,
      icon: <RotateIcon className="h-3.5 w-3.5 shrink-0" />,
      className: 'tab:hidden',
    },
  ];

  return {
    navigate,
    userId,
    me,
    composerInputRef,
    commentsLoading,
    commentsError,
    refetchComments,
    playing,
    playSession,
    landscape,
    deviceLandscape,
    exitLandscape,
    keyboardInset,
    hasVideo,
    youtubeSrc,
    isUpload,
    poster,
    startPlayback,
    backTo,
    comments,
    commentsTotal,
    meta,
    draft,
    setDraft,
    replyTo,
    setReplyTo,
    sending,
    startReply,
    sendComment,
    toggleCommentLike,
    removeComment,
    loadReplies,
    episodeActions,
  };
}
