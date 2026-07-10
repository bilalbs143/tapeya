import { useEffect, useRef } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { useAppSelector } from '@/store/hooks';

/**
 * Subscribe to the public `live-stream.{streamId}.chat` Reverb channel.
 */
export function useStreamChatChannel(streamId, onMessage, onHeart) {
  const accessToken = useAppSelector((s) => s.auth?.accessToken);
  const messageRef = useRef(onMessage);
  const heartRef = useRef(onHeart);
  messageRef.current = onMessage;
  heartRef.current = onHeart;

  useEffect(() => {
    if (!streamId) {
      return undefined;
    }

    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `live-stream.${streamId}.chat`;

    echo
      .channel(channelName)
      .listen('.live-stream.chat.message', (payload) => {
        messageRef.current?.(payload);
      })
      .listen('.live-stream.chat.heart', (payload) => {
        heartRef.current?.(payload);
      });

    return () => {
      echo.leave(channelName);
      releaseEcho();
    };
  }, [streamId, accessToken]);
}
