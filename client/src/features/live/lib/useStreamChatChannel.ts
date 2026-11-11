import { useEffect, useRef } from 'react';

import { acquireRealtimeClient, isRealtimeConfigured, releaseRealtimeClient } from '@/shared/config/realtime';
import { selectAccessToken } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

import { liveCommentWireSchema, toLiveComment } from '../model/schemas';
import { appendLiveComment } from './appendLiveComment';
import { type HeartEventPayload, parseHeartEventPayload } from './heartEvent';

export type { HeartEventPayload };

type Options = {
  enabled?: boolean | undefined;
  onHeart?: ((payload: HeartEventPayload) => void) | undefined;
};

/** Public `live-stream.{id}.chat` — comments + hearts; heart callback ref-held across landscape toggles. */
export function useStreamChatChannel(streamId: number | null, { enabled = true, onHeart }: Options = {}) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const configured = isRealtimeConfigured();
  const heartRef = useRef(onHeart);
  useEffect(() => {
    heartRef.current = onHeart;
  }, [onHeart]);

  useEffect(() => {
    if (!enabled || !streamId || !configured) return;

    const client = acquireRealtimeClient({ authToken: accessToken });
    if (!client) return;

    const channelName = `live-stream.${streamId}.chat`;
    const channel = client.channel(channelName);

    channel.listen('.live-stream.chat.message', (raw) => {
      const parsed = liveCommentWireSchema.safeParse(raw);
      if (!parsed.success) return;
      appendLiveComment(dispatch, streamId, toLiveComment(parsed.data));
    });

    channel.listen('.live-stream.chat.heart', (raw) => {
      heartRef.current?.(parseHeartEventPayload(raw));
    });

    return () => {
      client.leave(channelName);
      releaseRealtimeClient(client);
    };
  }, [accessToken, configured, dispatch, enabled, streamId]);
}
