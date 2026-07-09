/**
 * During-broadcast — route `/live/go-live/:streamId`. Full-bleed camera preview with
 * floating Snapchat-style controls over the video (hero layout, transparent navbar).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

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
import { useFloatingHearts } from '@/features/stream/hooks/useFloatingHearts';
import { useLiveStreamChannel } from '@/features/stream/hooks/useLiveStreamChannel';
import { useStreamComments } from '@/features/stream/hooks/useStreamComments';
import { useStreamPresenceChannel } from '@/features/stream/hooks/useStreamPresenceChannel';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { LIVE_BROADCAST_IMMERSIVE_HEIGHT } from '@/lib/constants/liveBroadcastLayout';
import { getInitials } from '@/lib/utils/displayUtils';
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
import {
  useEndBroadcastMutation,
  useGetBroadcastQuery,
  useGetLiveStreamQuery,
  useSendLiveCommentMutation,
  useSendLiveHeartMutation,
} from '@/store/api/liveApi';
import { useAppSelector } from '@/store/hooks';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from '@/ui/AlertDialog';
import { Button } from '@/ui/Button';

import { useVanityViewerCount } from './useVanityViewerCount';

export default function DuringBroadcast({ streamId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const nativeEndSyncedRef = useRef(false);
  const cooldownTimerRef = useRef(null);

  const myAvatar = useAppSelector((s) => s.auth?.user?.avatar_url ?? s.auth?.user?.avatar ?? null);
  const myInitials = useAppSelector((s) => getInitials(s.auth?.user?.name, s.auth?.user?.nickname));

  const { data: broadcast, isLoading, isError, error } = useGetBroadcastQuery(streamId);
  const { data: publicBroadcast } = useGetLiveStreamQuery(streamId);
  const [endBroadcastMutation] = useEndBroadcastMutation();

  const [phase, setPhase] = useState('loading');
  const [networkQuality, setNetworkQuality] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [peakViewers, setPeakViewers] = useState(0);
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(true);
  const [endSummary, setEndSummary] = useState(null);
  const [endReason, setEndReason] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [sendCooldown, setSendCooldown] = useState(false);

  const serverStatus = publicBroadcast?.stream?.status;
  const isLivePhase = isBroadcastLivePhase(phase);
  const presenceEnabled = isLivePhase || serverStatus === 'live';

  useBroadcastCameraUnderlay();
  useLiveStreamChannel(streamId);
  const realViewerCount = useStreamPresenceChannel(streamId, presenceEnabled);
  const viewerCount = useVanityViewerCount(realViewerCount);
  const { hearts: floatingHearts, spawnBurst, removeHeart } = useFloatingHearts();
  const handleRemoteHeart = useCallback(
    (payload) => {
      spawnBurst(payload?.avatar_url ?? null, payload?.initials ?? '?');
    },
    [spawnBurst],
  );
  const { messages } = useStreamComments(streamId, presenceEnabled, handleRemoteHeart);
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
        await startBroadcast({
          rtmpUrl: broadcastData.rtmp_url,
          streamKey: broadcastData.stream_key,
          maxDurationSeconds: SELF_SERVE_MAX_DURATION_SECONDS,
          streamId,
        });
      } catch (err) {
        setPhase('error');
        toast.error(getApiErrorMessage(err, 'Failed to start broadcasting.'));
      }
    },
    [streamId, toast],
  );

  const { previewRef, resetSession } = useBroadcastNativePreview({
    broadcast,
    phase,
    setPhase,
    onResumedWhileLive: startPublishing,
  });

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
      void stopBroadcast();
      void stopBroadcastPreview();
      setPhase(serverStatus);
    }
  }, [serverStatus, phase]);

  useEffect(() => {
    if (phase !== 'ended' || endReason !== 'backgrounded' || nativeEndSyncedRef.current) return;
    nativeEndSyncedRef.current = true;

    void (async () => {
      await Promise.allSettled([stopBroadcastPreview(), endBroadcastMutation(streamId).unwrap()]);
      setEndSummary((prev) => prev ?? { durationSeconds: elapsed, peakViewers });
    })();
  }, [phase, endReason, streamId, endBroadcastMutation, elapsed, peakViewers]);

  const handleConfirmEnd = useCallback(async () => {
    setConfirmEndOpen(false);
    setPhase('ending');
    await Promise.allSettled([stopBroadcast(), endBroadcastMutation(streamId).unwrap()]);
    setEndSummary({ durationSeconds: elapsed, peakViewers });
    setPhase('ended');
  }, [streamId, endBroadcastMutation, elapsed, peakViewers]);

  const handleSendComment = useCallback(
    async (text) => {
      const body = text.trim();
      if (!body || isSending || sendCooldown) return;

      setSendCooldown(true);
      cooldownTimerRef.current = window.setTimeout(() => {
        setSendCooldown(false);
      }, 2000);

      try {
        await sendComment({ streamId, body }).unwrap();
      } catch (err) {
        const type = err?.data?.type;
        toast.error(type === 'TOO_MANY_REQUESTS' ? 'Slow down a little' : getApiErrorMessage(err, 'Failed to send comment.'));
      }
    },
    [streamId, sendComment, toast, isSending, sendCooldown],
  );

  const handleSendHeart = useCallback(() => {
    spawnBurst(myAvatar, myInitials);
    sendHeart({ streamId });
  }, [streamId, sendHeart, spawnBurst, myAvatar, myInitials]);

  const handleFlipCamera = useCallback(async () => {
    try {
      await switchBroadcastCamera();
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

  const handleCapturePress = useCallback(() => {
    if (isLivePhase) {
      setConfirmEndOpen(true);
      return;
    }
    if (phase === 'previewing') {
      void handleStartBroadcasting();
    }
  }, [phase, isLivePhase, handleStartBroadcasting]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" />
      </div>
    );
  }

  if (isError) {
    const status = error?.status;
    const message =
      status === 403
        ? 'This broadcast belongs to someone else.'
        : status === 410
          ? 'This broadcast has ended.'
          : 'Failed to load broadcast.';

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-black px-4 text-center">
        <p className="text-[14px] text-white/70">{message}</p>
        <Button variant="auth" onClick={() => navigate('/live/go-live', { replace: true })}>
          Back to Go Live
        </Button>
      </div>
    );
  }

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
          <Button variant="auth" onClick={() => navigate('/live/go-live', { replace: true })}>
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
        <Button variant="auth" onClick={() => navigate('/live', { replace: true })}>
          Done
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
            variant="auth"
            onClick={() => {
              resetSession();
              setPhase('loading');
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      {isLivePhase && <FloatingHeartsOverlay hearts={floatingHearts} onHeartEnd={removeHeart} />}

      {showFloatingControls && (
        <>
          <BroadcastCameraHeader
            onBack={() => navigate(-1)}
            statusKey={statusKey}
            statusLabel={statusLabel}
            elapsed={formatBroadcastElapsed(elapsed)}
            networkLabel={networkLabel}
            showTimer={isLivePhase}
            showNetwork={Boolean(networkQuality && isLivePhase)}
            presenceEnabled={presenceEnabled}
            viewerCount={viewerCount}
          />
          <BroadcastCameraControlDock
            phase={phase}
            captureMode={captureMode}
            isLive={isLivePhase}
            isNative={isNative()}
            chatOpen={chatOpen}
            isMuted={isMuted}
            isSending={isSending}
            sendCooldown={sendCooldown}
            messages={messages}
            onCapturePress={handleCapturePress}
            onFlip={handleFlipCamera}
            onToggleMute={handleToggleMute}
            onToggleChat={() => setChatOpen((v) => !v)}
            onSendComment={handleSendComment}
            onSendHeart={handleSendHeart}
          />
        </>
      )}

      <AlertDialog open={confirmEndOpen} onOpenChange={setConfirmEndOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>End Broadcast?</AlertDialogTitle>
          <AlertDialogDescription>Your broadcast will end immediately for all viewers.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmEnd}>End Broadcast</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
