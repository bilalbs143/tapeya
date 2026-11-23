import { useEffect, useState } from 'react';

import { acquireRealtimeClient, isRealtimeConfigured, releaseRealtimeClient } from '@/shared/config/realtime';
import { selectAccessToken } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

/**
 * Join `live-stream.{streamId}.presence` and track real viewer count.
 * Backoffice occupancy reads the same Reverb presence channel.
 */
export function useStreamPresenceChannel(streamId: number | null, enabled = true): number {
  const accessToken = useAppSelector(selectAccessToken);
  const configured = isRealtimeConfigured();
  const [viewerCount, setViewerCount] = useState(0);
  const active = Boolean(enabled && streamId && configured && accessToken);

  useEffect(() => {
    if (!active || !streamId || !accessToken) return undefined;

    const client = acquireRealtimeClient({ authToken: accessToken });
    if (!client) return undefined;

    const channelName = `live-stream.${streamId}.presence`;
    let count = 0;

    client
      .join(channelName)
      .here((members) => {
        count = members.length;
        setViewerCount(count);
      })
      .joining(() => {
        count += 1;
        setViewerCount(count);
      })
      .leaving(() => {
        count = Math.max(0, count - 1);
        setViewerCount(count);
      });

    return () => {
      client.leave(channelName);
      releaseRealtimeClient(client);
    };
  }, [accessToken, active, streamId]);

  return active ? viewerCount : 0;
}
