import { useEffect, useState } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { useAppSelector } from '@/store/hooks';

/**
 * Join `live-stream.{streamId}.presence` and track viewer count.
 */
export function useStreamPresenceChannel(streamId, enabled = true) {
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (!streamId || !enabled || !accessToken) {
      setViewerCount(0);
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `live-stream.${streamId}.presence`;
    let count = 0;

    echo
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
      echo.leave(channelName);
      releaseEcho();
      setViewerCount(0);
    };
  }, [streamId, enabled, accessToken]);

  return viewerCount;
}
