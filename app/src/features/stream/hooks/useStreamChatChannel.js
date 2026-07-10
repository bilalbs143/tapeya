import { useEffect, useRef } from 'react';

import { acquireEcho, releaseEcho } from '@/config/echoManager';
import { useAppSelector } from '@/store/hooks';

/**
 * Subscribe to the public `live-stream.{streamId}.chat` Reverb channel
 * (comments + hearts). Used by viewers — the broadcaster has its own dedicated
 * socket in `useBroadcastOwnerChat` so it's unaffected by this hook or by
 * `echoManager` rebuilds.
 */
export function useStreamChatChannel(streamId, onMessage, onHeart) {
  const accessToken = useAppSelector((s) => s.auth?.accessToken);

  const messageRef = useRef(onMessage);
  const heartRef = useRef(onHeart);
  messageRef.current = onMessage;
  heartRef.current = onHeart;

  useEffect(() => {
    if (streamId == null || streamId === '') {
      return undefined;
    }

    const id = String(streamId);
    const echo = acquireEcho({ authToken: accessToken });
    if (!echo) {
      return undefined;
    }

    const channelName = `live-stream.${id}.chat`;
    const channel = echo.channel(channelName);

    channel.listen('.live-stream.chat.message', (payload) => {
      messageRef.current?.(payload);
    });
    channel.listen('.live-stream.chat.heart', (payload) => {
      heartRef.current?.(payload);
    });

    return () => {
      channel.stopListening('.live-stream.chat.message');
      channel.stopListening('.live-stream.chat.heart');
      echo.leave(channelName);
      releaseEcho();
    };
  }, [streamId, accessToken]);
}
