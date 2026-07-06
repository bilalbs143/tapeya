import { useEffect } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { liveApi } from '@/store/api/liveApi';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

/**
 * Subscribes to `live-stream.{streamId}` and patches live stream RTK caches.
 */
export function useLiveStreamChannel(streamId) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((s) => s.auth?.accessToken);

  useEffect(() => {
    if (!streamId) {
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `live-stream.${streamId}`;

    echo.channel(channelName).listen('.live-stream.status.updated', ({ status, playback }) => {
      dispatch(
        liveApi.util.updateQueryData('getLiveStream', String(streamId), (draft) => {
          if (draft?.stream) {
            draft.stream.status = status;
            draft.stream.playback = playback ?? draft.stream.playback;
          }
        }),
      );

      dispatch(
        liveApi.util.updateQueryData('getLiveStreams', undefined, (draft) => {
          const row = draft?.find?.((item) => String(item.id) === String(streamId));
          if (row?.stream) {
            row.stream.status = status;
            if (playback) {
              row.stream.playback = playback;
            }
          }
        }),
      );
    });

    return () => {
      echo.leave(channelName);
      releaseEcho();
    };
  }, [streamId, dispatch, accessToken]);
}
