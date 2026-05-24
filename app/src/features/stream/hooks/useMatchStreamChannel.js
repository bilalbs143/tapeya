import { useEffect } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { matchApi } from '@/store/api/matchApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/**
 * Subscribes to the public `match.{matchId}.stream` Reverb channel and patches
 * the RTK Query `getMatch` cache when stream status changes.
 */
export function useMatchStreamChannel(matchId) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);

  useEffect(() => {
    if (!matchId) {
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `match.${matchId}.stream`;

    echo.channel(channelName).listen('.match.stream.status.updated', ({ status, playback }) => {
      dispatch(
        matchApi.util.updateQueryData('getMatch', String(matchId), (draft) => {
          if (draft?.stream) {
            draft.stream.status = status;
            draft.stream.playback = playback ?? draft.stream.playback;
          }
        }),
      );
    });

    return () => {
      echo.leave(channelName);
      releaseEcho();
    };
  }, [matchId, dispatch, accessToken]);
}
