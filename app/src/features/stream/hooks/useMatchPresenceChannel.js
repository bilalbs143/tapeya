import { useEffect } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { useAppSelector } from '@/store/hooks';

/**
 * Join the presence channel `match.{matchId}.presence` so the viewer is counted.
 * No UI state — presence is for backoffice "X watching" only.
 *
 * @param {string|number|null} matchId
 * @param {boolean} [enabled] Pass false when stream is idle/ended
 */
export function useMatchPresenceChannel(matchId, enabled = true) {
  const accessToken = useAppSelector((s) => s.auth?.accessToken);

  useEffect(() => {
    if (!matchId || !enabled || !accessToken) {
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `match.${matchId}.presence`;
    echo.join(channelName);

    return () => {
      echo.leave(channelName);
      releaseEcho();
    };
  }, [matchId, enabled, accessToken]);
}
