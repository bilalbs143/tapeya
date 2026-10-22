import { useEffect } from 'react';
import { z } from 'zod';

import { homeApi } from '@/features/feed/api/homeApi';
import {
  type HomeStream,
  liveStreamWireSchema as homeLiveStreamWireSchema,
  toHomeStream,
} from '@/features/feed/model/homeSchemas';

import { createRealtimeClient, isRealtimeConfigured } from '@/shared/config/realtime';
import { selectAccessToken } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

import { liveApi } from '../api/liveApi';
import { type LiveStream, liveStreamWireSchema, toLiveStream } from '../model/schemas';

/** Private `live-hub` — patch Home “Live Now” and `/live` lists (auth-gated embed payloads). */
const liveHubUpdatedWireSchema = z.object({
  visible: z.boolean(),
  stream: liveStreamWireSchema,
});

/** Broadcast resolves LiveStreamResource without an API user — keep richer auth list fields. */
function mergeLiveStream(existing: LiveStream | undefined, incoming: LiveStream): LiveStream {
  if (!existing) return incoming;
  return {
    ...incoming,
    streamingUrl: incoming.streamingUrl ?? existing.streamingUrl,
    provider: incoming.provider ?? existing.provider,
    embedId: incoming.embedId ?? existing.embedId,
    playback: incoming.playback ?? existing.playback,
  };
}

function patchLiveList(draft: LiveStream[] | undefined, stream: LiveStream, visible: boolean) {
  if (!Array.isArray(draft)) return;
  const index = draft.findIndex((item) => item.id === stream.id);
  if (!visible) {
    if (index !== -1) draft.splice(index, 1);
    return;
  }
  if (index === -1) draft.unshift(stream);
  else draft[index] = mergeLiveStream(draft[index], stream);
}

/** @returns false when the wire could not be mapped to a HomeStream row. */
function patchHomeList(draft: HomeStream[] | undefined, wire: unknown, visible: boolean): boolean {
  if (!Array.isArray(draft)) return true;
  const homeWire = homeLiveStreamWireSchema.safeParse(wire);
  if (!homeWire.success) return false;
  const row = toHomeStream(homeWire.data);
  const index = draft.findIndex((item) => item.id === row.id);
  if (!visible) {
    if (index !== -1) draft.splice(index, 1);
    return true;
  }
  if (index === -1) draft.unshift(row);
  else draft[index] = row;
  return true;
}

export function useLiveHubChannel() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);
  const configured = isRealtimeConfigured();

  useEffect(() => {
    if (!accessToken || !configured) return;

    const client = createRealtimeClient({ authToken: accessToken });
    if (!client) return;

    const channelName = 'live-hub';
    client.private(channelName).listen('.live-hub.updated', (raw) => {
      const parsed = liveHubUpdatedWireSchema.safeParse(raw);
      if (!parsed.success) {
        dispatch(liveApi.util.invalidateTags([{ type: 'LiveStreams', id: 'LIST' }]));
        return;
      }

      const stream = toLiveStream(parsed.data.stream);
      const { visible } = parsed.data;

      dispatch(
        liveApi.util.updateQueryData('getLiveStreams', undefined, (draft) => {
          patchLiveList(draft, stream, visible);
        })
      );

      let homeOk = true;
      dispatch(
        homeApi.util.updateQueryData('getHomeLiveStreams', undefined, (draft) => {
          homeOk = patchHomeList(draft, parsed.data.stream, visible);
        })
      );
      if (!homeOk) {
        dispatch(liveApi.util.invalidateTags([{ type: 'LiveStreams', id: 'LIST' }]));
      }
    });

    return () => {
      client.leave(channelName);
      client.disconnect();
    };
  }, [accessToken, configured, dispatch]);
}
