/**
 * Listen for reel.processing.updated on the user's private channel.
 * When poster/transcode progress lands, refresh My Videos, Home feed, and profile grids
 * so poster-gated discovery can pick the reel up without a full reload.
 */

import { useEffect, useRef } from 'react';

import { createEcho } from '@/config/reverb';
import { reelsApi } from '@/store/api/reelsApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function useReelProcessingChannel() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const userId = useAppSelector((s) => s.auth?.user?.id);
  const echoRef = useRef(null);

  useEffect(() => {
    if (!accessToken || userId == null) {
      return undefined;
    }

    const echo = createEcho({ authToken: accessToken });
    if (!echo) return undefined;
    echoRef.current = echo;

    const channel = echo.private(`App.Models.User.${userId}`);
    const handler = (payload) => {
      const reelId = payload?.post_id ?? payload?.reel_id;
      const tags = [
        { type: 'Reel', id: 'MINE' },
        { type: 'Reel', id: 'FEED' },
        { type: 'Post', id: 'FEED' },
        { type: 'Post', id: 'FOLLOWING' },
        { type: 'Reel', id: `USER-${userId}` },
      ];
      if (reelId != null && reelId !== '') {
        tags.push({ type: 'Reel', id: reelId });
        tags.push({ type: 'Post', id: reelId });
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
