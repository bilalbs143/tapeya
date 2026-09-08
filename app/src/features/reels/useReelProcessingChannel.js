/**
 * Listen for reel.processing.updated on the user's private channel.
 * Patches poster/playback into open reel lists. Broad-invalidates only when
 * the reel was not already cached. Mounted app-wide (ConsumerRouterEffects).
 */

import { useEffect, useRef } from 'react';

import { createEcho } from '@/config/reverb';
import { forgetClientReelPoster } from '@/features/reels/clientReelPoster';
import { REELS_LIST_ARG, safeUpdateQueryData } from '@/store/api/postEngagementCache';
import { reelsApi } from '@/store/api/reelsApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

function sameId(a, b) {
  return a != null && b != null && String(a) === String(b);
}

function applyPlayback(reel, posterUrl, playback) {
  if (!reel) return reel;
  const nextPlayback = reel.playback
    ? {
        ...reel.playback,
        ...(posterUrl ? { posterUrl } : null),
        ...(playback?.url != null ? { url: playback.url } : null),
        ...(playback?.hls_url != null ? { hlsUrl: playback.hls_url } : null),
        ...(playback?.type != null ? { type: playback.type } : null),
        ...(playback?.is_processed != null ? { isProcessed: Boolean(playback.is_processed) } : null),
      }
    : reel.playback;

  return {
    ...reel,
    ...(posterUrl ? { posterUrl, coverUrl: posterUrl } : null),
    playback: nextPlayback,
  };
}

/**
 * @returns {boolean} true if at least one cached reel entry was patched
 */
function patchReelPlayback(dispatch, reelId, posterUrl, playback) {
  if (reelId == null || reelId === '') return false;
  let patched = false;

  for (const [endpointName, arg] of [
    ['getReelsFeed', REELS_LIST_ARG],
    ['getMyReels', REELS_LIST_ARG],
    ['getFollowingReels', REELS_LIST_ARG],
    ['getSavedReels', REELS_LIST_ARG],
  ]) {
    safeUpdateQueryData(dispatch, endpointName, arg, (draft) => {
      if (!draft?.items) return;
      draft.items.forEach((reel, idx) => {
        if (!sameId(reel.id, reelId)) return;
        draft.items[idx] = applyPlayback(reel, posterUrl, playback);
        patched = true;
      });
    });
  }

  safeUpdateQueryData(dispatch, 'getReel', reelId, (draft) => {
    if (!draft) return;
    Object.assign(draft, applyPlayback(draft, posterUrl, playback));
    patched = true;
  });

  return patched;
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
      const playback = payload?.playback ?? null;
      const posterUrl = playback?.poster_url ?? null;
      if (posterUrl) {
        forgetClientReelPoster(reelId);
      }
      const patched = patchReelPlayback(dispatch, reelId, posterUrl, playback);

      const tags = [];
      if (reelId != null && reelId !== '') {
        tags.push({ type: 'Reel', id: reelId }, { type: 'Post', id: reelId });
      }
      if (!patched) {
        tags.push(
          { type: 'Reel', id: 'MINE' },
          { type: 'Reel', id: 'FEED' },
          { type: 'Post', id: 'FEED' },
          { type: 'Post', id: 'FOLLOWING' },
          { type: 'Reel', id: `USER-${userId}` },
        );
      }
      if (tags.length) {
        dispatch(reelsApi.util.invalidateTags(tags));
      }
    };

    channel.listen('.reel.processing.updated', handler);

    return () => {
      channel.stopListening('.reel.processing.updated', handler);
      echo.disconnect();
      echoRef.current = null;
    };
  }, [accessToken, userId, dispatch]);
}
