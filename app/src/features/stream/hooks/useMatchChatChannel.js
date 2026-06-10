import { useEffect, useRef } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { useAppSelector } from '@/store/hooks';

/**
 * Subscribe to the public `match.{matchId}.chat` Reverb channel.
 *
 * @param {string|number|null} matchId
 * @param {(msg: object) => void} onMessage  Stable callback for chat messages
 * @param {(payload: object) => void} [onHeart] Stable callback fired on heart events
 */
export function useMatchChatChannel(matchId, onMessage, onHeart) {
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const messageRef = useRef(onMessage);
  const heartRef = useRef(onHeart);
  messageRef.current = onMessage;
  heartRef.current = onHeart;

  useEffect(() => {
    if (!matchId) {
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `match.${matchId}.chat`;

    echo
      .channel(channelName)
      .listen('.match.chat.message', (payload) => {
        messageRef.current?.(payload);
      })
      .listen('.match.chat.heart', (payload) => {
        heartRef.current?.(payload);
      });

    return () => {
      echo.leave(channelName);
      releaseEcho();
    };
  }, [matchId, accessToken]);
}
