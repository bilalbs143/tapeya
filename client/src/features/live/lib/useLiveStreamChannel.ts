import { useEffect } from 'react';

import { createRealtimeClient, isRealtimeConfigured } from '@/shared/config/realtime';
import { selectAccessToken } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

import { liveApi } from '../api/liveApi';
import { liveStreamWireSchema, toLiveStream } from '../model/schemas';

/** Public `live-stream.{streamId}` — patch getLiveStream on status updates; invalidate list on reconnect-worthy drops. */
export function useLiveStreamChannel(streamId: number | null, { enabled = true }: { enabled?: boolean } = {}) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const configured = isRealtimeConfigured();

  useEffect(() => {
    if (!enabled || !streamId || !configured) return;

    const client = createRealtimeClient({ authToken: accessToken });
    if (!client) return;

    const channelName = `live-stream.${streamId}`;
    const channel = client.channel(channelName);

    channel.listen('.live-stream.status.updated', (raw) => {
      const event = raw as { stream?: unknown; match_stream?: unknown } | null;
      const payload = event?.stream ?? event?.match_stream ?? raw;
      const parsed = liveStreamWireSchema.safeParse(payload);
      if (!parsed.success) {
        dispatch(liveApi.util.invalidateTags([{ type: 'LiveStreams', id: streamId }]));
        return;
      }
      const stream = toLiveStream(parsed.data);
      dispatch(liveApi.util.updateQueryData('getLiveStream', { streamId, authed: true }, () => stream));
      dispatch(liveApi.util.updateQueryData('getLiveStream', { streamId, authed: false }, () => stream));
      dispatch(liveApi.util.invalidateTags([{ type: 'LiveStreams', id: 'LIST' }]));
    });

    return () => {
      client.leave(channelName);
      client.disconnect();
    };
  }, [accessToken, configured, dispatch, enabled, streamId]);
}
