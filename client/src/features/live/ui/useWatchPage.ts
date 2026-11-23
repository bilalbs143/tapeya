import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { settingsByKey, useGetPublicSystemSettingsQuery } from '@/shared/api/systemSettingsApi';
import { APP_PATHS } from '@/shared/config/paths';
import { buildLiveBroadcastShareUrl, shareLink } from '@/shared/native/share';
import { useImmersiveLandscape } from '@/shared/native/useImmersiveLandscape';
import { selectIsAuthenticated, selectUserId } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';
import { toast } from '@/shared/ui/toast';

import { useGetLiveStreamQuery, useSendLiveCommentMutation, useSendLiveHeartMutation } from '../api/liveApi';
import { sanitizeLiveCommentBody } from '../lib/appendLiveComment';
import { displayInitials } from '../lib/displayInitials';
import { STATUS_BADGE } from '../lib/playback';
import { useFloatingHearts } from '../lib/useFloatingHearts';
import { useLiveStreamChannel } from '../lib/useLiveStreamChannel';
import { type HeartEventPayload } from '../lib/useStreamChatChannel';
import { useStreamComments } from '../lib/useStreamComments';
import { useStreamPresenceChannel } from '../lib/useStreamPresenceChannel';
import { useVanityViewerCount } from '../lib/useVanityViewerCount';
import {
  watchAllowRotate,
  watchChatLive,
  watchLiveChatGloballyEnabled,
  watchPortraitSelfServeLive,
  watchPosterUrl,
  watchViewerLabel,
} from '../lib/watchPage';
import type { LiveStream } from '../model/schemas';
import { liveRoutes } from '../routes';

/** Watch session — stream/chat channels, landscape, hearts, comment send. */
export function useWatchPage(streamId: number, valid: boolean) {
  const navigate = useNavigate();
  const isAuthed = useAppSelector(selectIsAuthenticated);
  const myUserId = useAppSelector(selectUserId);
  const { data: me } = useMeQuery(undefined, { skip: !isAuthed });

  // 5s so starting→live (YouTube ingest) is picked up without a long empty LIVE embed.
  const streamQuery = useGetLiveStreamQuery({ streamId, authed: isAuthed }, { skip: !valid, pollingInterval: 5_000 });
  const [sendComment] = useSendLiveCommentMutation();
  const [sendHeart] = useSendLiveHeartMutation();

  const stream = streamQuery.data;
  const portraitSelfServeLive = watchPortraitSelfServeLive(stream);
  const allowRotate = watchAllowRotate(portraitSelfServeLive);
  // Wait until stream is known — otherwise loading briefly unlocks tilt before a portrait live is detected.
  const { landscape, deviceLandscape, enterLandscape, exitLandscape } = useImmersiveLandscape(
    Boolean(stream) && allowRotate
  );
  const [draft, setDraft] = useState('');
  const lastSend = useRef(0);
  const { hearts: floatingHearts, spawnBurst, removeHeart, clearHearts } = useFloatingHearts();

  useLiveStreamChannel(valid ? streamId : null, { enabled: valid });

  const onHeartEvent = useCallback(
    (payload: HeartEventPayload) => {
      if (landscape) return;
      // Own heart already spawned locally on send — skip the echo.
      if (payload.userId != null && myUserId != null && payload.userId === myUserId) return;
      spawnBurst(payload.avatarUrl, payload.initials);
    },
    [landscape, myUserId, spawnBurst]
  );

  const chatLive = watchChatLive(stream?.status);
  /** Load while live/starting so chat + vanity both see `live_chat_enabled` / vanity keys. */
  const { data: settingsRows } = useGetPublicSystemSettingsQuery(undefined, {
    skip: !chatLive,
  });
  const settingsMap = useMemo(() => settingsByKey(settingsRows), [settingsRows]);
  const liveChatGloballyEnabled = watchLiveChatGloballyEnabled(settingsMap.live_chat_enabled);
  const chatEnabled = Boolean(chatLive && liveChatGloballyEnabled);

  const { messages: comments, addMessage } = useStreamComments(valid ? streamId : null, {
    enabled: valid && isAuthed && chatEnabled,
    onHeart: onHeartEvent,
  });

  /** Presence + vanity gate — live/starting + authed (same channel backoffice occupancy reads). */
  const presenceEnabled = Boolean(isAuthed && chatLive);
  const realViewerCount = useStreamPresenceChannel(valid ? streamId : null, presenceEnabled);
  const vanitySelfServe = settingsMap.stream_vanity_viewer_self_serve === '1';
  const viewerCount = useVanityViewerCount(realViewerCount, {
    enabled: Boolean(presenceEnabled && stream && (!stream.isSelfServe || vanitySelfServe)),
    settingsReady: settingsRows != null,
    streamId: valid ? streamId : null,
    startedAt: stream?.startedAt ?? null,
    min: settingsMap.stream_vanity_viewer_min,
    max: settingsMap.stream_vanity_viewer_max,
  });

  useEffect(() => {
    clearHearts();
  }, [landscape, clearHearts]);

  const canChat = chatEnabled;
  const poster = stream ? watchPosterUrl(stream) : null;
  const isLive = stream?.status === 'live';
  const statusLabel = stream ? STATUS_BADGE[String(stream.status)] : undefined;
  const viewerLabel = watchViewerLabel(presenceEnabled, viewerCount);

  function requireSession(action: () => void) {
    if (isAuthed) {
      action();
      return;
    }
    toast({ title: 'Sign In to Join the Chat' });
    navigate(APP_PATHS.login, { state: { returnTo: liveRoutes.broadcast(streamId) } });
  }

  function goLoginToWatch() {
    navigate(APP_PATHS.login, { state: { returnTo: liveRoutes.broadcast(streamId) } });
  }

  function goLiveList() {
    navigate(liveRoutes.list());
  }

  async function send() {
    requireSession(() => {
      void (async () => {
        const text = sanitizeLiveCommentBody(draft);
        if (!text) return;
        const now = Date.now();
        if (now - lastSend.current < 2000) {
          toast({ title: 'Slow Down a Little' });
          return;
        }
        lastSend.current = now;
        setDraft('');
        try {
          // Append locally after POST — own comment may not echo on WS.
          const result = await sendComment({ streamId, body: text }).unwrap();
          addMessage({
            id: result.id || String(Date.now()),
            name: me?.nickname?.trim() || me?.name?.trim() || 'Viewer',
            text,
            sentAt: new Date().toISOString(),
            avatarUrl: me?.avatarUrl ?? null,
          });
        } catch {
          toast({ title: 'Comment Not Sent', tone: 'error' });
        }
      })();
    });
  }

  function heart() {
    requireSession(() => {
      if (landscape || !chatEnabled) return;
      spawnBurst(me?.avatarUrl ?? null, displayInitials(me?.name, me?.nickname));
      void sendHeart({ streamId })
        .unwrap()
        .catch(() => {
          /* fire-and-forget — remotes still see the WS event when POST succeeds */
        });
    });
  }

  async function handleShare(current: LiveStream) {
    const result = await shareLink({
      title: current.title,
      url: buildLiveBroadcastShareUrl(streamId),
    });
    if (result === 'copied') toast({ title: 'Link Copied', tone: 'success' });
  }

  return {
    streamId,
    navigate,
    streamQuery,
    stream,
    isAuthed,
    me,
    landscape,
    deviceLandscape,
    enterLandscape,
    exitLandscape,
    allowRotate,
    draft,
    setDraft,
    floatingHearts,
    removeHeart,
    canChat,
    comments,
    poster,
    isLive,
    statusLabel,
    viewerLabel,
    viewerCount,
    presenceEnabled,
    goLiveList,
    goLoginToWatch,
    send,
    heart,
    handleShare,
  };
}
