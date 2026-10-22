import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { shareLink } from '@/shared/native/share';
import { useImmersiveLandscape } from '@/shared/native/useImmersiveLandscape';
import { useKeepAwake } from '@/shared/native/useKeepAwake';
import { toast } from '@/shared/ui/toast';

import { useDislikeHighlightMutation, useLikeHighlightMutation, useShareHighlightMutation } from '../api/highlightsApi';
import {
  highlightHasVideo,
  highlightIsUpload,
  highlightShareActionLabel,
  highlightYoutubeSrc,
} from '../lib/highlightDetail';
import type { Highlight, HighlightReaction } from '../model/schemas';
import { highlightRoutes } from '../routes';

/** Playback, reactions, and landscape for HighlightDetailPage. */
export function useHighlightDetail(clip: Highlight) {
  const navigate = useNavigate();
  const [playing, setPlaying] = useState(false);
  const [playSession, setPlaySession] = useState(0);
  const { landscape, deviceLandscape, enterLandscape, exitLandscape } = useImmersiveLandscape(true);
  const [likes, setLikes] = useState(clip.likesCount);
  // Upload path (YouTube is covered by YoutubeProxyPlayer). Ref-counted — safe if both run.
  useKeepAwake(playing);

  const [dislikes, setDislikes] = useState(clip.dislikesCount);
  const [shares, setShares] = useState(clip.sharesCount);
  const [myReaction, setMyReaction] = useState<HighlightReaction | null>(clip.myReaction);

  const [likeHighlight, { isLoading: liking }] = useLikeHighlightMutation();
  const [dislikeHighlight, { isLoading: disliking }] = useDislikeHighlightMutation();
  const [shareHighlight, { isLoading: sharing }] = useShareHighlightMutation();
  const reacting = liking || disliking || sharing;

  const hasVideo = highlightHasVideo(clip);
  const youtubeSrc = highlightYoutubeSrc(clip);
  const isUpload = highlightIsUpload(clip);
  const shareLabel = highlightShareActionLabel(shares);

  function startPlayback() {
    if (!hasVideo) return;
    setPlaySession((n) => n + 1);
    setPlaying(true);
  }

  function applyCounts(result: {
    likesCount: number;
    dislikesCount: number;
    sharesCount: number;
    myReaction?: HighlightReaction | null;
  }) {
    setLikes(result.likesCount);
    setDislikes(result.dislikesCount);
    setShares(result.sharesCount);
    if ('myReaction' in result) setMyReaction(result.myReaction ?? null);
  }

  async function handleLike() {
    if (reacting) return;
    try {
      const result = await likeHighlight(clip.id).unwrap();
      applyCounts(result);
    } catch {
      /* ignore */
    }
  }

  async function handleDislike() {
    if (reacting) return;
    try {
      const result = await dislikeHighlight(clip.id).unwrap();
      applyCounts(result);
    } catch {
      /* ignore */
    }
  }

  async function handleShare() {
    if (reacting) return;
    const url = `${window.location.origin}${highlightRoutes.detail(clip.id)}`;
    const channel = await shareLink({ title: clip.title, url });
    if (channel === 'cancelled') return;
    if (channel === 'copied') toast({ title: 'Link Copied', tone: 'success' });
    try {
      const result = await shareHighlight(clip.id).unwrap();
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

  function goList() {
    navigate(highlightRoutes.list());
  }

  function openRelated(id: number) {
    navigate(highlightRoutes.detail(id), { replace: true });
  }

  return {
    clip,
    playing,
    playSession,
    landscape,
    deviceLandscape,
    exitLandscape,
    likes,
    dislikes,
    shares,
    myReaction,
    reacting,
    hasVideo,
    youtubeSrc,
    isUpload,
    shareLabel,
    startPlayback,
    handleLike,
    handleDislike,
    handleShare,
    onEnterLandscape,
    goList,
    openRelated,
  };
}
