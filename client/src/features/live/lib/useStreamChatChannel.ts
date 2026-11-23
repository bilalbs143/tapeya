import { useEffect, useRef } from 'react';

import { acquireRealtimeClient, isRealtimeConfigured, releaseRealtimeClient } from '@/shared/config/realtime';
import { selectAccessToken } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

import { type LiveComment, liveCommentWireSchema, toLiveComment } from '../model/schemas';
import { appendLiveComment } from './appendLiveComment';
import { type HeartEventPayload, parseHeartEventPayload } from './heartEvent';

export type { HeartEventPayload };

type Options = {
  enabled?: boolean | undefined;
  /** Local feed callback (legacy-style). Cache is still patched for RTK consumers. */
  onMessage?: ((comment: LiveComment) => void) | undefined;
  onHeart?: ((payload: HeartEventPayload) => void) | undefined;
  /** Fired when the socket reconnects after a drop — refetch history to close gaps. */
  onReconnect?: (() => void) | undefined;
};

/** Public `live-stream.{id}.chat` — comments + hearts; callbacks ref-held across landscape toggles. */
export function useStreamChatChannel(
  streamId: number | null,
  { enabled = true, onMessage, onHeart, onReconnect }: Options = {}
) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const configured = isRealtimeConfigured();
  const messageRef = useRef(onMessage);
  const heartRef = useRef(onHeart);
  const reconnectRef = useRef(onReconnect);
  useEffect(() => {
    messageRef.current = onMessage;
  }, [onMessage]);
  useEffect(() => {
    heartRef.current = onHeart;
  }, [onHeart]);
  useEffect(() => {
    reconnectRef.current = onReconnect;
  }, [onReconnect]);

  useEffect(() => {
    if (!enabled || !streamId || !configured) return;

    const client = acquireRealtimeClient({ authToken: accessToken });
    if (!client) return;

    const channelName = `live-stream.${streamId}.chat`;
    const channel = client.channel(channelName);

    channel.listen('.live-stream.chat.message', (raw) => {
      const parsed = liveCommentWireSchema.safeParse(raw);
      if (!parsed.success) return;
      const comment = toLiveComment(parsed.data);
      appendLiveComment(dispatch, streamId, comment);
      messageRef.current?.(comment);
    });

    channel.listen('.live-stream.chat.heart', (raw) => {
      heartRef.current?.(parseHeartEventPayload(raw));
    });

    let hadDisconnect = false;
    const unsubConnection = client.onConnectionChange((status) => {
      if (status === 'disconnected' || status === 'unavailable' || status === 'failed') {
        hadDisconnect = true;
        return;
      }
      if (status === 'connected' && hadDisconnect) {
        hadDisconnect = false;
        reconnectRef.current?.();
      }
    });

    return () => {
      unsubConnection();
      client.leave(channelName);
      releaseRealtimeClient(client);
    };
  }, [accessToken, configured, dispatch, enabled, streamId]);
}
