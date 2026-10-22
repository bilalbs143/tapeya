import { useEffect, useRef } from 'react';

import { createRealtimeClient, isRealtimeConfigured } from '@/shared/config/realtime';
import { selectAccessToken } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

import { liveCommentWireSchema, toLiveComment } from '../model/schemas';
import { appendLiveComment } from './appendLiveComment';

export type HeartEventPayload = {
  userId: number | null;
  avatarUrl: string | null;
  initials: string;
};

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

    const client = createRealtimeClient({ authToken: accessToken });
    if (!client) return;

    const channelName = `live-stream.${streamId}.chat`;
    const channel = client.channel(channelName);

    channel.listen('.live-stream.chat.message', (raw) => {
      const parsed = liveCommentWireSchema.safeParse(raw);
      if (!parsed.success) return;
      appendLiveComment(dispatch, streamId, toLiveComment(parsed.data));
    });

    channel.listen('.live-stream.chat.heart', (raw) => {
      const event = raw as { user_id?: number; avatar_url?: string | null; initials?: string } | null;
      heartRef.current?.({
        userId: event?.user_id ?? null,
        avatarUrl: event?.avatar_url ?? null,
        initials: event?.initials?.trim() || '?',
      });
    });

    return () => {
      client.leave(channelName);
      client.disconnect();
    };
  }, [accessToken, configured, dispatch, enabled, streamId]);
}
