/**
 * Listen for reel.processing.updated on the user's private channel.
 * Patches poster URLs into open reel lists immediately, then invalidates so
 * poster-gated discovery can refetch. Mounted app-wide (ConsumerRouterEffects).
 */

import { useEffect, useRef } from 'react';

import { createEcho } from '@/config/reverb';
import { REELS_LIST_ARG, safeUpdateQueryData } from '@/store/api/postEngagementCache';
import { reelsApi } from '@/store/api/reelsApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function sameId(a, b) {
  return a != null && b != null && String(a) === String(b);
}

function applyPoster(reel, posterUrl) {
  if (!reel || !posterUrl) return reel;
  return {
    ...reel,
    posterUrl,
    coverUrl: posterUrl,
    playback: reel.playback ? { ...reel.playback, posterUrl } : reel.playback,
  };
}

function patchPoster(dispatch, reelId, posterUrl) {
  if (reelId == null || reelId === '' || !posterUrl) return;

  for (const [endpointName, arg] of [
    ['getReelsFeed', REELS_LIST_ARG],
    ['getMyReels', REELS_LIST_ARG],
    ['getFollowingReels', REELS_LIST_ARG],
    ['getSavedReels', REELS_LIST_ARG],
  ]) {
    safeUpdateQueryData(dispatch, endpointName, arg, (draft) => {
      if (!draft?.items) return;
      draft.items.forEach((reel, idx) => {
        if (sameId(reel.id, reelId)) draft.items[idx] = applyPoster(reel, posterUrl);
      });
    });
  }

  safeUpdateQueryData(dispatch, 'getReel', reelId, (draft) => {
    if (draft) Object.assign(draft, applyPoster(draft, posterUrl));
  });
}

export function useReelProcessingChannel() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const userId = useAppSelector((s) => s.auth?.user?.id);
  const echoRef = useRef(null);

  useEffect(() => {
    if (!accessToken || userId == null) return undefined;

    const echo = createEcho({ authToken: accessToken });
    if (!echo) return undefined;
    echoRef.current = echo;

    const channel = echo.private(`App.Models.User.${userId}`);
    const handler = (payload) => {
      const reelId = payload?.post_id ?? payload?.reel_id;
      const posterUrl = payload?.playback?.poster_url ?? null;
      if (posterUrl && reelId != null && reelId !== '') {
        patchPoster(dispatch, reelId, posterUrl);
      }

      const tags = [
        { type: 'Reel', id: 'MINE' },
        { type: 'Reel', id: 'FEED' },
        { type: 'Post', id: 'FEED' },
        { type: 'Post', id: 'FOLLOWING' },
        { type: 'Reel', id: `USER-${userId}` },
      ];
      if (reelId != null && reelId !== '') {
        tags.push({ type: 'Reel', id: reelId }, { type: 'Post', id: reelId });
      }
      dispatch(reelsApi.util.invalidateTags(tags));
    };

    channel.listen('.reel.processing.updated', handler);

    return () => {
      channel.stopListening('.reel.processing.updated', handler);
      echo.disconnect();
      echoRef.current = null;
    };
  }, [accessToken, userId, dispatch]);
}
