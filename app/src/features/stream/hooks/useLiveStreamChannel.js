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
    if (streamId == null || streamId === '') {
      return undefined;
    }

    const id = String(streamId);
    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `live-stream.${id}`;
    const channel = echo.channel(channelName);

    channel.listen('.live-stream.status.updated', ({ status, playback }) => {
      dispatch(
        liveApi.util.updateQueryData('getLiveStream', id, (draft) => {
          if (draft?.stream) {
            draft.stream.status = status;
            draft.stream.playback = playback ?? draft.stream.playback;
          }
        }),
      );

      dispatch(
        liveApi.util.updateQueryData('getLiveStreams', undefined, (draft) => {
          const row = draft?.find?.((item) => String(item.id) === id);
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
      channel.stopListening('.live-stream.status.updated');
      echo.leave(channelName);
      releaseEcho();
    };
  }, [streamId, dispatch, accessToken]);
}
