/**
 * During-broadcast — route `/live/go-live/:streamId`. Full-bleed camera preview with
 * floating Snapchat-style controls over the video (hero layout, transparent navbar).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { useDialog } from '@/context/DialogContext';
import { BroadcastCameraControlDock, BroadcastCameraHeader } from '@/features/stream/BroadcastCameraChrome';
import {
  BROADCAST_NETWORK_LABEL,
  formatBroadcastElapsed,
  getBroadcastStatusDisplay,
  getCaptureButtonMode,
  isBroadcastLivePhase,
  SELF_SERVE_MAX_DURATION_SECONDS,
  shouldShowBroadcastControls,
} from '@/features/stream/broadcastCameraUtils';
import { FloatingHeartsOverlay } from '@/features/stream/FloatingHeartsOverlay';
import { useBroadcastCameraUnderlay } from '@/features/stream/hooks/useBroadcastCameraUnderlay';
import { useBroadcastNativePreview } from '@/features/stream/hooks/useBroadcastNativePreview';
import { useBroadcastOrientationLock } from '@/features/stream/hooks/useBroadcastOrientationLock';
import { useFloatingHearts } from '@/features/stream/hooks/useFloatingHearts';
import { useLiveStreamChannel } from '@/features/stream/hooks/useLiveStreamChannel';
import { useStreamComments } from '@/features/stream/hooks/useStreamComments';
import { useStreamPresenceChannel } from '@/features/stream/hooks/useStreamPresenceChannel';
import { useAppBack } from '@/hooks/useAppBack';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { LIVE_BROADCAST_CAMERA_BANNER_TOP, LIVE_BROADCAST_IMMERSIVE_HEIGHT } from '@/lib/constants/liveBroadcastLayout';
import { getInitials } from '@/lib/utils/displayUtils';
import { getStreamOrientation } from '@/lib/utils/liveStreamUtils';
import { mapSystemSettingsByKey } from '@/lib/utils/settingsUtils';
import {
  onBroadcastStateChanged,
  onBroadcastStats,
  setBroadcastMuted,
  startBroadcast,
  stopBroadcast,
  stopBroadcastPreview,
  switchBroadcastCamera,
} from '@/native/tapeyaBroadcast';
import { isNative } from '@/platform/platform';
import { getStreamOrientationOptions, useGetEnumsQuery } from '@/store/api/enumApi';
import {
  useEndBroadcastMutation,
  useGetBroadcastQuery,
  useGetLiveStreamQuery,
  useSendLiveCommentMutation,
  useSendLiveHeartMutation,
  useStartBroadcastSessionMutation,
} from '@/store/api/liveApi';
import { useGetPublicSystemSettingsQuery } from '@/store/api/systemSettingsApi';
import { useAppSelector } from '@/store/hooks';
import { Button } from '@/ui/Button';
import { ListError } from '@/ui/ListState';
import { FullScreenLoader } from '@/ui/Loader';

export default function DuringBroadcast({ streamId }) {
  const navigate = useNavigate();
  const goBack = useAppBack();
  const { openDialog } = useDialog();
  const toast = useToast();
  const nativeEndSyncedRef = useRef(false);
  const cooldownTimerRef = useRef(null);
  /** Tracks whether RTMP publish (or server live session) is active for leave teardown. */
  const publishSessionActiveRef = useRef(false);
  const endingInFlightRef = useRef(false);
  /** Bumped on mount so Strict Mode remount cancels a deferred orphan-end. */
  const leaveTeardownGenerationRef = useRef(0);

  const myAvatar = useAppSelector((s) => s.auth?.user?.avatar_url ?? s.auth?.user?.avatar ?? null);
  const myInitials = useAppSelector((s) => getInitials(s.auth?.user?.name, s.auth?.user?.nickname));
  const myUserId = useAppSelector((s) => s.auth?.user?.id ?? null);
  const myDisplayName = useAppSelector((s) => s.auth?.user?.nickname || s.auth?.user?.name || 'Viewer');

  const [phase, setPhase] = useState('loading');
  const sessionFinished = phase === 'ending' || phase === 'ended';

  const {
    data: broadcast,
    isLoading,
    isError,
    error,
  } = useGetBroadcastQuery(streamId, {
    // End invalidates this query; the owner show endpoint then returns 410 — skip so we
    // don't flash "Failed to load broadcast" over the ended / leave flow.
    skip: sessionFinished,
  });
  const { data: publicBroadcast } = useGetLiveStreamQuery(streamId, {
    skip: sessionFinished,
  });
  const { data: settingsRows } = useGetPublicSystemSettingsQuery();
  const { data: enums = {} } = useGetEnumsQuery();
  const settingsByKey = useMemo(() => mapSystemSettingsByKey(settingsRows), [settingsRows]);
  const liveChatGloballyEnabled = settingsByKey.live_chat_enabled !== '0';
  const [endBroadcastMutation] = useEndBroadcastMutation();
  const [startBroadcastSession] = useStartBroadcastSessionMutation();

  const [networkQuality, setNetworkQuality] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [peakViewers, setPeakViewers] = useState(0);
  const [endSummary, setEndSummary] = useState(null);
  const [endReason, setEndReason] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('front');
  const [commentsVisible, setCommentsVisible] = useState(true);
  const [sendCooldown, setSendCooldown] = useState(false);
  const [publishSessionActive, setPublishSessionActive] = useState(false);

  useEffect(() => {
    publishSessionActiveRef.current = publishSessionActive;
  }, [publishSessionActive]);

  const serverStatus = publicBroadcast?.stream?.status;
  const isLivePhase = isBroadcastLivePhase(phase);
  const streamChatActive = serverStatus === 'live' || serverStatus === 'starting';
  const chatEnabled = liveChatGloballyEnabled && (streamChatActive || publishSessionActive || isLivePhase);
  const presenceEnabled = isLivePhase || streamChatActive || publishSessionActive;

  useBroadcastCameraUnderlay();
  useLiveStreamChannel(streamId);
  const realViewerCount = useStreamPresenceChannel(streamId, presenceEnabled);
  // Go-live camera is always self-serve — show real presence, never vanity.
  const viewerCount = realViewerCount;
  const { hearts: floatingHearts, spawnBurst, removeHeart } = useFloatingHearts();
  const handleRemoteHeart = useCallback(
    (payload) => {
      if (payload?.user_id != null && myUserId != null && Number(payload.user_id) === Number(myUserId)) {
        return;
      }
      spawnBurst(payload?.avatar_url ?? null, payload?.initials ?? '?');
    },
    [spawnBurst, myUserId],
  );
  const { messages, addMessage } = useStreamComments(streamId, chatEnabled, handleRemoteHeart);
  const [sendComment, { isLoading: isSending }] = useSendLiveCommentMutation();
  const [sendHeart] = useSendLiveHeartMutation();

  useEffect(() => {
    setPeakViewers((prev) => Math.max(prev, realViewerCount));
  }, [realViewerCount]);

  useEffect(
    () => () => {
      if (cooldownTimerRef.current) {
        window.clearTimeout(cooldownTimerRef.current);
      }
    },
    [],
  );

  const startPublishing = useCallback(
    async (broadcastData) => {
      if (!broadcastData?.rtmp_url || !broadcastData?.stream_key) return;
      setPhase('connecting');
      try {
        await startBroadcastSession(streamId).unwrap();
        setPublishSessionActive(true);
        await startBroadcast({
          rtmpUrl: broadcastData.rtmp_url,
          streamKey: broadcastData.stream_key,
          orientation: getStreamOrientation(broadcastData),
          maxDurationSeconds: SELF_SERVE_MAX_DURATION_SECONDS,
          streamId,
        });
      } catch (err) {
        setPhase('error');
        toast.error(getApiErrorMessage(err, 'Failed to start broadcasting.'));
      }
    },
    [streamId, toast, startBroadcastSession],
  );

  const [previewGeneration, setPreviewGeneration] = useState(0);
  const { previewRef, resetSession } = useBroadcastNativePreview({
    broadcast,
    phase,
    setPhase,
    onResumedWhileLive: startPublishing,
    previewGeneration,
  });

  useEffect(() => {
    if (broadcast?.status === 'starting' || broadcast?.status === 'live') {
      setPublishSessionActive(true);
    }
  }, [broadcast?.status]);

  const handleStartBroadcasting = useCallback(() => startPublishing(broadcast), [broadcast, startPublishing]);

  useEffect(() => {
    const stateSub = onBroadcastStateChanged(({ state, reason }) => {
      if (state === 'connecting') setPhase('connecting');
      else if (state === 'live') setPhase('live');
      else if (state === 'reconnecting') setPhase('reconnecting');
      else if (state === 'ended') {
        let adoptedPluginEnd = false;
        setPhase((prev) => {
          if (prev === 'ending') return prev;
          adoptedPluginEnd = true;
          return 'ended';
        });
        if (adoptedPluginEnd && reason) setEndReason(reason);
      } else if (state === 'error') setPhase('error');
    });
    const statsSub = onBroadcastStats(({ networkQuality: quality }) => setNetworkQuality(quality));

    return () => {
      stateSub?.remove?.();
      statsSub?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (!isLivePhase) return undefined;
    const startedAt = publicBroadcast?.stream?.started_at ? new Date(publicBroadcast.stream.started_at).getTime() : Date.now();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isLivePhase, publicBroadcast?.stream?.started_at]);

  useEffect(() => {
    if ((serverStatus === 'ended' || serverStatus === 'error') && phase !== 'ended' && phase !== 'error') {
      publishSessionActiveRef.current = false;
      setPublishSessionActive(false);
      void stopBroadcast();
      void stopBroadcastPreview();
      setPhase(serverStatus);
    }
  }, [serverStatus, phase]);

  useEffect(() => {
    if (phase !== 'ended' || endReason !== 'backgrounded' || nativeEndSyncedRef.current) return;
    nativeEndSyncedRef.current = true;
    endingInFlightRef.current = true;
    publishSessionActiveRef.current = false;
    setPublishSessionActive(false);

    void (async () => {
      await Promise.allSettled([stopBroadcast(), stopBroadcastPreview()]);
      try {
        await endBroadcastMutation(streamId).unwrap();
      } catch (err) {
        toast.error(
          getApiErrorMessage(err, 'Broadcast stopped on device, but the server could not end it. Try again from Go Live.'),
        );
      }
      setEndSummary((prev) => prev ?? { durationSeconds: elapsed, peakViewers });
    })();
  }, [phase, endReason, streamId, endBroadcastMutation, elapsed, peakViewers, toast]);

  // Orphan guard: if the route unmounts while still publishing (deep link, etc.), end the
  // server session. Deferred + generation so React Strict Mode remount does not false-end.
  useEffect(() => {
    const generation = ++leaveTeardownGenerationRef.current;
    return () => {
      if (endingInFlightRef.current || !publishSessionActiveRef.current || !streamId) return;
      const snapshotStreamId = streamId;
      queueMicrotask(() => {
        if (leaveTeardownGenerationRef.current !== generation) return;
        if (endingInFlightRef.current || !publishSessionActiveRef.current) return;
        publishSessionActiveRef.current = false;
        void stopBroadcast();
        void stopBroadcastPreview();
        void endBroadcastMutation(snapshotStreamId);
      });
    };
  }, [streamId, endBroadcastMutation]);

  const handleConfirmEnd = useCallback(async () => {
    setPhase('ending');
    endingInFlightRef.current = true;
    publishSessionActiveRef.current = false;
    setPublishSessionActive(false);

    await Promise.allSettled([stopBroadcast(), stopBroadcastPreview()]);

    // Prefer leaving Go Live even if /end fails — native capture is already stopped.
    try {
      await endBroadcastMutation(streamId).unwrap();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Broadcast stopped on device, but the server could not confirm it.'));
    }
    navigate('/live/go-live', { replace: true });
  }, [streamId, endBroadcastMutation, navigate, toast]);

  const handleSendComment = useCallback(
    async (text) => {
      const body = text.trim();
      if (!body || isSending || sendCooldown || !chatEnabled) return;

      setSendCooldown(true);
      cooldownTimerRef.current = window.setTimeout(() => {
        setSendCooldown(false);
      }, 2000);

      try {
        const result = await sendComment({ streamId, body }).unwrap();
        addMessage({
          id: result?.id ?? `${Date.now()}`,
          name: myDisplayName,
          text: body,
        });
      } catch (err) {
        const type = err?.data?.type;
        toast.error(type === 'TOO_MANY_REQUESTS' ? 'Slow down a little' : getApiErrorMessage(err, 'Failed to send comment.'));
      }
    },
    [streamId, sendComment, toast, isSending, sendCooldown, chatEnabled, addMessage, myDisplayName],
  );

  const handleSendHeart = useCallback(async () => {
    if (!chatEnabled) return;
    spawnBurst(myAvatar, myInitials);
    try {
      await sendHeart({ streamId }).unwrap();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to send heart.'));
    }
  }, [streamId, sendHeart, spawnBurst, myAvatar, myInitials, chatEnabled, toast]);

  const handleFlipCamera = useCallback(async () => {
    try {
      await switchBroadcastCamera();
      setCameraFacing((prev) => (prev === 'front' ? 'back' : 'front'));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to switch camera.'));
    }
  }, [toast]);

  const handleToggleMute = useCallback(async () => {
    const nextMuted = !isMuted;
    try {
      await setBroadcastMuted(nextMuted);
      setIsMuted(nextMuted);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update microphone.'));
    }
  }, [isMuted, toast]);

  const handleToggleComments = useCallback(() => {
    setCommentsVisible((visible) => !visible);
  }, []);

  const confirmEndBroadcast = useCallback(() => {
    openDialog('confirm', {
      title: 'End Broadcast?',
      message: 'Your broadcast will end immediately for all viewers.',
      confirmLabel: 'End Broadcast',
      onConfirm: handleConfirmEnd,
    });
  }, [openDialog, handleConfirmEnd]);

  const handleCapturePress = useCallback(() => {
    if (isLivePhase) {
      confirmEndBroadcast();
      return;
    }
    if (phase === 'previewing') {
      void handleStartBroadcasting();
    }
  }, [phase, isLivePhase, handleStartBroadcasting, confirmEndBroadcast]);

  const shouldConfirmEndOnLeave = isLivePhase || phase === 'connecting';

  const handleBack = useCallback(() => {
    if (shouldConfirmEndOnLeave) {
      confirmEndBroadcast();
      return;
    }
    goBack();
  }, [shouldConfirmEndOnLeave, goBack, confirmEndBroadcast]);

  const streamOrientation = getStreamOrientation({
    orientation: broadcast?.orientation ?? publicBroadcast?.orientation,
  });
  const orientationOptions = getStreamOrientationOptions(enums);
  // Landscape is the second StreamOrientationEnum case (after portrait).
  const landscapeValue = orientationOptions[1]?.value;
  const isLandscapeStream = Boolean(landscapeValue && streamOrientation === landscapeValue);

  // Native hard-lock: rotate the whole view (WebView chrome + native camera preview) to match the
  // selected orientation. `orientationLocked` is false on web / when the plugin is unavailable, in
  // which case we fall back to the coach-mark nudge below.
  const orientationLocked = useBroadcastOrientationLock({ orientation: streamOrientation });

  const [needsLandscapeRotate, setNeedsLandscapeRotate] = useState(false);
  useEffect(() => {
    if (!isLandscapeStream || orientationLocked || typeof window === 'undefined') {
      setNeedsLandscapeRotate(false);
      return undefined;
    }
    const sync = () => setNeedsLandscapeRotate(window.innerHeight > window.innerWidth);
    sync();
    window.addEventListener('resize', sync, { passive: true });
    window.addEventListener('orientationchange', sync, { passive: true });
    return () => {
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, [isLandscapeStream, orientationLocked]);

  // Prefer ended UI over query errors — ending invalidates getBroadcast and the API returns 410.
  if (phase === 'ended') {
    if (endReason === 'backgrounded') {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center">
          <h1 className="text-[16px] font-bold text-white uppercase">Broadcast Ended</h1>
          <p className="max-w-xs text-[13px] text-white/80">
            You left the app, so your broadcast stopped. Viewers can no longer watch.
          </p>
          {endSummary && (
            <div className="text-muted text-[13px]">
              <p>Duration: {formatBroadcastElapsed(endSummary.durationSeconds)}</p>
              <p>Peak viewers: {endSummary.peakViewers}</p>
            </div>
          )}
          <Button variant="orange" onClick={() => navigate('/live/go-live', { replace: true })}>
            Start New Broadcast
          </Button>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center">
        <h1 className="text-[16px] font-bold text-white uppercase">Broadcast Ended</h1>
        {endSummary && (
          <div className="text-muted text-[13px]">
            <p>Duration: {formatBroadcastElapsed(endSummary.durationSeconds)}</p>
            <p>Peak viewers: {endSummary.peakViewers}</p>
          </div>
        )}
        <Button variant="orange" onClick={() => navigate('/live/go-live', { replace: true })}>
          Done
        </Button>
      </div>
    );
  }

  if (phase === 'ending') {
    return <FullScreenLoader label="Ending broadcast" />;
  }

  if (isLoading) {
    return <FullScreenLoader label="Loading broadcast" />;
  }

  if (isError) {
    const status = error?.status;
    // Owner show returns 410 after end — treat as a clean leave, not a hard failure.
    if (status === 410) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black px-4 text-center">
          <h1 className="text-[16px] font-bold text-white uppercase">Broadcast Ended</h1>
          <Button variant="orange" onClick={() => navigate('/live/go-live', { replace: true })}>
            Back to Go Live
          </Button>
        </div>
      );
    }

    const message = status === 403 ? 'This broadcast belongs to someone else.' : 'Could not load broadcast.';

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-black px-4 text-center">
        <ListError message={message} />
        <Button variant="orange" onClick={() => navigate('/live/go-live', { replace: true })}>
          Back to Go Live
        </Button>
      </div>
    );
  }

  const { statusKey, statusLabel } = getBroadcastStatusDisplay(phase);
  const showFloatingControls = shouldShowBroadcastControls(phase);
  const captureMode = getCaptureButtonMode(phase);
  const networkLabel = networkQuality ? (BROADCAST_NETWORK_LABEL[networkQuality] ?? networkQuality) : null;

  return (
    <div
      className={`fixed inset-0 z-0 overflow-hidden lg:mx-auto lg:max-w-lg ${isNative() ? 'bg-transparent' : 'bg-black'}`}
      style={{ height: LIVE_BROADCAST_IMMERSIVE_HEIGHT }}
    >
      <div ref={previewRef} className="pointer-events-none absolute inset-0" aria-hidden />

      {!isNative() && (
        <div className="absolute inset-0 flex items-center justify-center bg-black px-6 text-center text-[12px] text-white/40">
          Camera preview is only available in the Tapeya app.
        </div>
      )}

      {phase === 'permission_denied' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/90 px-6 text-center">
          <p className="text-[13px] text-white/80">Camera and microphone access are required to go live.</p>
          <p className="text-muted text-[12px]">Enable them in your device settings, then come back to this screen.</p>
        </div>
      )}

      {phase === 'error' && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black/90 px-6 text-center">
          <p className="text-[13px] text-white/80">We lost the connection and couldn&apos;t reconnect.</p>
          <Button
            variant="orange"
            onClick={() => {
              void (async () => {
                await resetSession();
                setPreviewGeneration((g) => g + 1);
                setPhase('loading');
              })();
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      {(isLivePhase || publishSessionActive) && <FloatingHeartsOverlay hearts={floatingHearts} onHeartEnd={removeHeart} />}

      {showFloatingControls && (
        <>
          <BroadcastCameraHeader
            onBack={handleBack}
            statusKey={statusKey}
            statusLabel={statusLabel}
            elapsed={formatBroadcastElapsed(elapsed)}
            networkLabel={networkLabel}
            showTimer={isLivePhase}
            showNetwork={Boolean(networkQuality && isLivePhase)}
            presenceEnabled={presenceEnabled}
            viewerCount={viewerCount}
            orientation={streamOrientation}
          />
          {needsLandscapeRotate && landscapeValue && (
            <div
              className="pointer-events-none absolute right-4 left-4 z-20 flex justify-center"
              style={{ top: LIVE_BROADCAST_CAMERA_BANNER_TOP }}
              role="status"
              aria-live="polite"
            >
              <p className="rounded-full bg-black/80 px-3 py-2 text-center text-[11px] font-semibold tracking-wide text-white backdrop-blur-sm">
                Rotate your phone sideways for {orientationOptions.find((o) => o.value === landscapeValue)?.label ?? 'landscape'}
              </p>
            </div>
          )}
          <BroadcastCameraControlDock
            phase={phase}
            captureMode={captureMode}
            isLive={isLivePhase}
            isNative={isNative()}
            isMuted={isMuted}
            cameraFacing={cameraFacing}
            isSending={isSending}
            sendCooldown={sendCooldown}
            chatEnabled={chatEnabled}
            messages={messages}
            commentsVisible={commentsVisible}
            onCapturePress={handleCapturePress}
            onFlip={handleFlipCamera}
            onToggleMute={handleToggleMute}
            onToggleComments={handleToggleComments}
            onSendComment={handleSendComment}
            onSendHeart={handleSendHeart}
          />
        </>
      )}
    </div>
  );
}
