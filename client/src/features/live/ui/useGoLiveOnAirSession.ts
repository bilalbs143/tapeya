import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useMeQuery } from '@/features/auth';

import { getApiErrorMessage } from '@/shared/api/errors';
import { settingsByKey, useGetPublicSystemSettingsQuery } from '@/shared/api/systemSettingsApi';
import { confirm } from '@/shared/dialogs/helpers';
import { buildLiveBroadcastShareUrl, shareLink } from '@/shared/native/share';
import {
  type BroadcastNetworkQuality,
  onBroadcastStateChanged,
  onBroadcastStats,
  setBroadcastMuted,
  startBroadcast,
  stopBroadcast,
  stopBroadcastPreview,
  switchBroadcastCamera,
} from '@/shared/native/tapeyaBroadcast';
import { useKeepAwake } from '@/shared/native/useKeepAwake';
import { useKeyboardInset } from '@/shared/native/useKeyboardInset';
import { isNativePlatform } from '@/shared/platform/platform';
import { selectUserId } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { toast } from '@/shared/ui/toast';

import {
  useEndBroadcastMutation,
  useGetBroadcastQuery,
  useGetLiveCommentsQuery,
  useGetLiveStreamQuery,
  useSendLiveCommentMutation,
  useSendLiveHeartMutation,
  useStartBroadcastSessionMutation,
} from '../api/liveApi';
import { appendLiveComment, sanitizeLiveCommentBody } from '../lib/appendLiveComment';
import {
  type BroadcastPhase,
  isBroadcastLivePhase,
  resolveBroadcastOrientation,
  SELF_SERVE_MAX_DURATION_SECONDS,
  shouldConfirmEndOnLeave,
} from '../lib/broadcastCameraUtils';
import { displayInitials } from '../lib/displayInitials';
import { useBroadcastCameraUnderlay } from '../lib/useBroadcastCameraUnderlay';
import { useBroadcastNativePreview } from '../lib/useBroadcastNativePreview';
import { useBroadcastOrientationLock } from '../lib/useBroadcastOrientationLock';
import { useFloatingHearts } from '../lib/useFloatingHearts';
import { useLiveStreamChannel } from '../lib/useLiveStreamChannel';
import { type HeartEventPayload, useStreamChatChannel } from '../lib/useStreamChatChannel';
import { useVanityViewerCount } from '../lib/useVanityViewerCount';
import { watchLiveChatGloballyEnabled, watchViewerLabel } from '../lib/watchPage';
import type { OwnerBroadcast } from '../model/schemas';
import { liveRoutes } from '../routes';

/** Native + RTMP session lifecycle for GoLiveOnAirPage. */
export function useGoLiveOnAirSession(streamId: number, valid: boolean) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const native = isNativePlatform();
  const myUserId = useAppSelector(selectUserId);
  const { data: me } = useMeQuery();

  const [phase, setPhase] = useState<BroadcastPhase>('loading');
  const sessionFinished = phase === 'ending' || phase === 'ended';
  useKeepAwake(valid && !sessionFinished);

  const broadcastQuery = useGetBroadcastQuery(streamId, { skip: !valid || sessionFinished });
  const publicQuery = useGetLiveStreamQuery(
    { streamId, authed: true },
    { skip: !valid || sessionFinished, pollingInterval: 30_000 }
  );
  const [startSession, startState] = useStartBroadcastSessionMutation();
  const [endSession, endState] = useEndBroadcastMutation();
  const [sendComment, sendCommentState] = useSendLiveCommentMutation();
  const [sendHeart] = useSendLiveHeartMutation();

  const [ended, setEnded] = useState<{ durationSec: number; peakViewers: number; reason?: string | undefined } | null>(
    null
  );
  const [localLiveAt, setLocalLiveAt] = useState<number | null>(null);
  const [serverStartedAtMs, setServerStartedAtMs] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [networkQuality, setNetworkQuality] = useState<BroadcastNetworkQuality | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'front' | 'back'>('front');
  /** Local latch once we call native/server start (survives status lag). */
  const [localPublishActive, setLocalPublishActive] = useState(false);
  const [previewGeneration, setPreviewGeneration] = useState(0);
  const [endReason, setEndReason] = useState<string | null>(null);
  const [peakViewers, setPeakViewers] = useState(0);
  const [draft, setDraft] = useState('');
  const [commentsVisible, setCommentsVisible] = useState(true);
  const lastSend = useRef(0);

  const publishSessionActiveRef = useRef(false);
  const endingInFlightRef = useRef(false);
  const nativeEndSyncedRef = useRef(false);
  const leaveTeardownGenerationRef = useRef(0);
  const elapsedRef = useRef(0);
  const peakViewersRef = useRef(0);
  const serverStopHandledRef = useRef(false);

  const broadcast = broadcastQuery.data;
  const publicStream = publicQuery.data;
  const isLivePhase = isBroadcastLivePhase(phase);
  const orientation = resolveBroadcastOrientation(broadcast?.orientation ?? publicStream?.orientation);
  const publishSessionActive = localPublishActive || broadcast?.status === 'starting' || broadcast?.status === 'live';
  const serverStatus = publicStream?.status;

  useEffect(() => {
    publishSessionActiveRef.current = publishSessionActive;
  }, [publishSessionActive]);

  useEffect(() => {
    elapsedRef.current = elapsed;
  }, [elapsed]);

  useEffect(() => {
    peakViewersRef.current = peakViewers;
  }, [peakViewers]);

  useBroadcastCameraUnderlay(native && !sessionFinished && phase !== 'permission_denied');
  useLiveStreamChannel(valid ? streamId : null, { enabled: valid && !sessionFinished });

  const orientationLocked = useBroadcastOrientationLock({
    orientation,
    enabled: native && !sessionFinished,
  });

  /** Landscape stream but orientation lock failed → coach mark. */
  const [portraitViewport, setPortraitViewport] = useState(
    () => typeof window !== 'undefined' && window.innerHeight > window.innerWidth
  );
  useEffect(() => {
    if (orientation !== 'landscape' || orientationLocked) return undefined;
    const sync = () => setPortraitViewport(window.innerHeight > window.innerWidth);
    const raf = window.requestAnimationFrame(sync);
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync);
    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, [orientation, orientationLocked]);
  const needsLandscapeRotate = orientation === 'landscape' && !orientationLocked && portraitViewport;

  const streamChatActive = serverStatus === 'live' || serverStatus === 'starting';
  const chatLive = streamChatActive || publishSessionActive || isLivePhase;
  const { data: settingsRows } = useGetPublicSystemSettingsQuery(undefined, { skip: !chatLive });
  const settingsMap = useMemo(() => settingsByKey(settingsRows), [settingsRows]);
  const liveChatGloballyEnabled = watchLiveChatGloballyEnabled(settingsMap.live_chat_enabled);
  const chatEnabled = Boolean(chatLive && liveChatGloballyEnabled);
  const presenceEnabled = Boolean(isLivePhase || streamChatActive || publishSessionActive);
  const vanitySelfServe = settingsMap.stream_vanity_viewer_self_serve === '1';

  const commentsQuery = useGetLiveCommentsQuery(streamId, { skip: !valid || !chatEnabled });
  const { hearts: floatingHearts, spawnBurst, removeHeart } = useFloatingHearts();

  const onHeartEvent = useCallback(
    (payload: HeartEventPayload) => {
      if (payload.userId != null && myUserId != null && Number(payload.userId) === Number(myUserId)) {
        return;
      }
      spawnBurst(payload.avatarUrl, payload.initials);
    },
    [myUserId, spawnBurst]
  );

  useStreamChatChannel(valid ? streamId : null, {
    enabled: valid && chatEnabled,
    onHeart: onHeartEvent,
  });

  const viewerCount = useVanityViewerCount(0, {
    enabled: Boolean(presenceEnabled && (!publicStream || !publicStream.isSelfServe || vanitySelfServe)),
    settingsReady: settingsRows != null,
    streamId: valid ? streamId : null,
    startedAt: publicStream?.startedAt ?? null,
    min: settingsMap.stream_vanity_viewer_min,
    max: settingsMap.stream_vanity_viewer_max,
  });
  const viewerLabel = watchViewerLabel(presenceEnabled, viewerCount);

  useEffect(() => {
    if (viewerCount == null) return;
    const next = viewerCount;
    queueMicrotask(() => {
      setPeakViewers((prev) => Math.max(prev, next));
    });
  }, [viewerCount]);

  const keyboardInset = useKeyboardInset();

  const startPublishing = useCallback(
    async (broadcastData: OwnerBroadcast) => {
      if (!broadcastData.rtmpUrl || !broadcastData.streamKey) {
        toast({ title: 'Missing stream credentials. Create the broadcast again.', tone: 'error' });
        setPhase('error');
        return;
      }
      if (!native) {
        // Web cannot encode camera → RTMP. Never mark the server session live from here.
        toast({
          title: 'Open the Tapeya app on your phone to go live with the camera.',
          tone: 'error',
        });
        return;
      }
      setPhase('connecting');
      let serverStarted = false;
      try {
        const started = await startSession(streamId).unwrap();
        serverStarted = true;
        setLocalPublishActive(true);
        const startedMs = started.startedAt ? new Date(started.startedAt).getTime() : Date.now();
        setServerStartedAtMs(Number.isFinite(startedMs) ? startedMs : Date.now());
        setLocalLiveAt(Date.now());
        await startBroadcast({
          rtmpUrl: broadcastData.rtmpUrl,
          streamKey: broadcastData.streamKey,
          orientation: resolveBroadcastOrientation(broadcastData.orientation),
          maxDurationSeconds: SELF_SERVE_MAX_DURATION_SECONDS,
          streamId,
        });
      } catch (error) {
        setLocalPublishActive(false);
        setLocalLiveAt(null);
        if (serverStarted) {
          // POST …/start already marked the row live — roll back so the hub is not stuck.
          try {
            await endSession(streamId).unwrap();
          } catch {
            toast({
              title: 'Could not start the encoder. End the stream from Go Live if it still shows as live.',
              tone: 'error',
            });
          }
        }
        setPhase('error');
        toast({ title: getApiErrorMessage(error, 'Could not go live.'), tone: 'error' });
      }
    },
    [native, startSession, endSession, streamId]
  );

  const { resetSession } = useBroadcastNativePreview({
    broadcast,
    phase,
    setPhase,
    onResumedWhileLive: startPublishing,
    previewGeneration,
  });

  useEffect(() => {
    const stateSub = onBroadcastStateChanged(({ state, reason }) => {
      if (state === 'connecting') setPhase('connecting');
      else if (state === 'live') setPhase('live');
      else if (state === 'reconnecting') setPhase('reconnecting');
      else if (state === 'ended') {
        let adopted = false;
        setPhase((prev) => {
          if (prev === 'ending') return prev;
          adopted = true;
          return 'ended';
        });
        if (adopted) {
          if (reason) setEndReason(reason);
          setEnded(
            (prev) =>
              prev ?? {
                durationSec: elapsedRef.current,
                peakViewers: peakViewersRef.current,
                ...(reason ? { reason } : {}),
              }
          );
          setLocalLiveAt(null);
        }
      } else if (state === 'error') setPhase('error');
    });
    const statsSub = onBroadcastStats(({ networkQuality: quality }) => setNetworkQuality(quality));
    return () => {
      stateSub.remove();
      statsSub.remove();
    };
  }, []);

  useEffect(() => {
    if (!isLivePhase) return undefined;
    const fromPublic = publicStream?.startedAt ? new Date(publicStream.startedAt).getTime() : null;
    const anchor =
      (fromPublic && Number.isFinite(fromPublic) ? fromPublic : null) ?? serverStartedAtMs ?? localLiveAt ?? Date.now();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - anchor) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isLivePhase, publicStream?.startedAt, serverStartedAtMs, localLiveAt]);

  // Server-driven stop (admin ban, provider sync, remote end).
  useEffect(() => {
    if (serverStatus !== 'ended' && serverStatus !== 'error') {
      serverStopHandledRef.current = false;
      return;
    }
    if (phase === 'ended' || phase === 'error' || phase === 'ending') return;
    if (serverStopHandledRef.current) return;
    serverStopHandledRef.current = true;
    const terminal = serverStatus;
    publishSessionActiveRef.current = false;
    void stopBroadcast();
    void stopBroadcastPreview();
    // Defer React updates — RTK/query status is React state; sync body must not setState.
    queueMicrotask(() => {
      setLocalPublishActive(false);
      if (terminal === 'ended') {
        setEnded((prev) => prev ?? { durationSec: elapsedRef.current, peakViewers: peakViewersRef.current });
        setPhase('ended');
      } else {
        setPhase('error');
      }
    });
  }, [serverStatus, phase]);

  useEffect(() => {
    if (phase !== 'ended' || endReason !== 'backgrounded' || nativeEndSyncedRef.current) return;
    nativeEndSyncedRef.current = true;
    endingInFlightRef.current = true;
    publishSessionActiveRef.current = false;
    setLocalPublishActive(false);

    void (async () => {
      await Promise.allSettled([stopBroadcast(), stopBroadcastPreview()]);
      try {
        await endSession(streamId).unwrap();
      } catch (error) {
        toast({
          title: getApiErrorMessage(
            error,
            'Broadcast stopped on device, but the server could not end it. Try again from Go Live.'
          ),
          tone: 'error',
        });
      }
      setEnded({ durationSec: elapsedRef.current, peakViewers: peakViewersRef.current, reason: endReason });
      setLocalLiveAt(null);
    })();
  }, [phase, endReason, streamId, endSession]);

  // Unmount while publishing → stop native + end server session (generation ref for Strict Mode).
  useEffect(() => {
    const generation = ++leaveTeardownGenerationRef.current;
    return () => {
      if (endingInFlightRef.current || !publishSessionActiveRef.current || !streamId) return;
      const snapshotStreamId = streamId;
      queueMicrotask(() => {
        // eslint-disable-next-line react-hooks/exhaustive-deps -- compare against remount generation
        if (leaveTeardownGenerationRef.current !== generation) return;
        if (endingInFlightRef.current || !publishSessionActiveRef.current) return;
        publishSessionActiveRef.current = false;
        void stopBroadcast();
        void stopBroadcastPreview();
        void endSession(snapshotStreamId);
      });
    };
  }, [streamId, endSession]);

  async function handleStart() {
    if (!broadcast) return;
    await startPublishing(broadcast);
  }

  async function endBroadcastNow(reason?: string | undefined) {
    setPhase('ending');
    endingInFlightRef.current = true;
    publishSessionActiveRef.current = false;
    setLocalPublishActive(false);

    await Promise.allSettled([stopBroadcast(), stopBroadcastPreview()]);

    try {
      await endSession(streamId).unwrap();
    } catch (error) {
      toast({
        title: getApiErrorMessage(error, 'Broadcast stopped on device, but the server could not confirm it.'),
        tone: 'error',
      });
    }
    setEnded({
      durationSec: elapsedRef.current,
      peakViewers: peakViewersRef.current,
      ...(reason ? { reason } : {}),
    });
    setLocalLiveAt(null);
    setPhase('ended');
  }

  async function handleEnd() {
    const ok = await confirm({
      title: 'End This Broadcast?',
      message: 'Viewers will see the stream end. This cannot be undone.',
      confirmLabel: 'End Broadcast',
      tone: 'danger',
    });
    if (!ok) return;
    await endBroadcastNow();
  }

  async function handleLeave() {
    if (shouldConfirmEndOnLeave(phase, publishSessionActive)) {
      await handleEnd();
      return;
    }
    navigate(liveRoutes.list());
  }

  async function handleFlip() {
    try {
      await switchBroadcastCamera();
      setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front'));
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Could not switch camera.'), tone: 'error' });
    }
  }

  async function handleToggleMute() {
    const next = !isMuted;
    try {
      await setBroadcastMuted(next);
      setIsMuted(next);
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Could not update microphone.'), tone: 'error' });
    }
  }

  async function handleShare() {
    const result = await shareLink({ url: buildLiveBroadcastShareUrl(streamId) });
    if (result === 'copied') {
      toast({ title: 'Link Copied.' });
    }
  }

  async function handleSendComment() {
    const body = sanitizeLiveCommentBody(draft);
    if (!body || !chatEnabled || sendCommentState.isLoading) return;
    const now = Date.now();
    if (now - lastSend.current < 2000) {
      toast({ title: 'Slow down a little.', tone: 'error' });
      return;
    }
    lastSend.current = now;
    const optimisticId = `local-${now}`;
    const name = me?.nickname?.trim() || me?.name?.trim() || 'You';
    appendLiveComment(dispatch, streamId, {
      id: optimisticId,
      name,
      text: body,
      sentAt: new Date().toISOString(),
      avatarUrl: me?.avatarUrl ?? null,
    });
    setDraft('');
    try {
      const result = await sendComment({ streamId, body }).unwrap();
      appendLiveComment(dispatch, streamId, {
        id: result.id,
        name,
        text: body,
        sentAt: new Date().toISOString(),
        avatarUrl: me?.avatarUrl ?? null,
      });
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Could not send comment.'), tone: 'error' });
    }
  }

  async function handleSendHeart() {
    if (!chatEnabled) return;
    spawnBurst(me?.avatarUrl ?? null, displayInitials(me?.name, me?.nickname));
    try {
      await sendHeart({ streamId }).unwrap();
    } catch (error) {
      toast({ title: getApiErrorMessage(error, 'Could not send heart.'), tone: 'error' });
    }
  }

  async function handleRetry() {
    setPhase('loading');
    setEndReason(null);
    setEnded(null);
    setIsMuted(false);
    setCameraFacing('front');
    endingInFlightRef.current = false;
    nativeEndSyncedRef.current = false;
    serverStopHandledRef.current = false;
    setPeakViewers(0);
    await resetSession();
    setPreviewGeneration((n) => n + 1);
    void broadcastQuery.refetch();
    void publicQuery.refetch();
  }

  return {
    native,
    phase,
    sessionFinished,
    broadcast,
    broadcastQuery,
    streamTitle: publicStream?.title ?? '',
    ended,
    endReason,
    elapsed,
    networkQuality,
    isMuted,
    cameraFacing,
    orientation,
    needsLandscapeRotate,
    startState,
    endState,
    publishSessionActive,
    comments: commentsQuery.data ?? [],
    draft,
    setDraft,
    commentsVisible,
    setCommentsVisible,
    chatEnabled,
    viewerLabel,
    viewerCount,
    floatingHearts,
    removeHeart,
    keyboardInset,
    me,
    handleStart,
    handleEnd,
    handleLeave,
    handleFlip,
    handleToggleMute,
    handleShare,
    handleSendComment,
    handleSendHeart,
    handleRetry,
  };
}
