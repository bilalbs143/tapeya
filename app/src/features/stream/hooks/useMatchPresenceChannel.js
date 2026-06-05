import { useEffect, useState } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { useAppSelector } from '@/store/hooks';

/**
 * Join the presence channel `match.{matchId}.presence` and track viewer count.
 *
 * @param {string|number|null} matchId
 * @param {boolean} [enabled] Pass false when stream is idle/ended
 * @returns {number} viewerCount
 */
export function useMatchPresenceChannel(matchId, enabled = true) {
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const [viewerCount, setViewerCount] = useState(0);

  useEffect(() => {
    if (!matchId || !enabled || !accessToken) {
      setViewerCount(0);
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `match.${matchId}.presence`;
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
  }, [matchId, enabled, accessToken]);

  return viewerCount;
}
