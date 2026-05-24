import { useEffect, useRef } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { useAppSelector } from '@/store/hooks';

/**
 * Subscribe to the public `match.{matchId}.chat` Reverb channel.
 *
 * @param {string|number|null} matchId
 * @param {(msg: object) => void} onMessage Stable callback (useCallback or dispatch)
 */
export function useMatchChatChannel(matchId, onMessage) {
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const callbackRef = useRef(onMessage);
  callbackRef.current = onMessage;

  useEffect(() => {
    if (!matchId) {
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `match.${matchId}.chat`;

    echo.channel(channelName).listen('.match.chat.message', (payload) => {
      callbackRef.current?.(payload);
    });

    return () => {
      echo.leave(channelName);
      releaseEcho();
    };
  }, [matchId, accessToken]);
}
