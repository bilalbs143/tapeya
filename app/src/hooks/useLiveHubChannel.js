/**
 * Private `live-hub` Reverb channel — pushes a status change for ANY stream (not just one
 * you're already viewing), so the Home page's live section and the /live hub list update
 * instantly instead of waiting on their own 60s poll. Mounted app-wide (ConsumerRouterEffects),
 * not per-page, since the RTK Query cache it patches is shared across both screens regardless
 * of which one is currently mounted.
 *
 * Auth-gated to match GET /live/matches — payloads include unlisted YouTube embed IDs.
 */

import { useEffect } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { liveApi } from '@/store/api/liveApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

export function useLiveHubChannel() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = 'live-hub';

    echo.private(channelName).listen('.live-hub.updated', ({ visible, stream }) => {
      if (!stream?.id) return;

      dispatch(
        liveApi.util.updateQueryData('getLiveStreams', undefined, (draft) => {
          if (!Array.isArray(draft)) return;

          const index = draft.findIndex((item) => String(item.id) === String(stream.id));

          if (!visible) {
            if (index !== -1) draft.splice(index, 1);
            return;
          }

          if (index === -1) {
            draft.unshift(stream);
          } else {
            draft[index] = stream;
          }
        }),
      );
    });

    return () => {
      echo.leave(channelName);
      releaseEcho();
    };
  }, [dispatch, accessToken]);
}
