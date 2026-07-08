/**
 * During-broadcast — route `/live/go-live/:streamId`. Permissions, camera preview,
 * publish, then the live UI. Chrome matches watch-live (LIVE badge, viewer pill,
 * comment list + input row over the camera).
 */

import { useCallback, useEffect, useRef, useState } from 'react';

import { useNavigate } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { CommentInputRow } from '@/features/stream/CommentInputRow';
import CommentList from '@/features/stream/CommentList';
import { FloatingHeartsOverlay } from '@/features/stream/FloatingHeartsOverlay';
import { useFloatingHearts } from '@/features/stream/hooks/useFloatingHearts';
import { useLiveStreamChannel } from '@/features/stream/hooks/useLiveStreamChannel';
import { useStreamComments } from '@/features/stream/hooks/useStreamComments';
import { useStreamPresenceChannel } from '@/features/stream/hooks/useStreamPresenceChannel';
import { LiveStatusBadge, LiveViewerCountBadge } from '@/features/stream/LiveStatusBadges';
import { useToast } from '@/hooks/useToast';
import { getApiErrorMessage } from '@/lib/apiErrors';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import {
  LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
  LIVE_BROADCAST_HEADER_OVERLAY_Z,
  LIVE_BROADCAST_SHELL_HEIGHT,
} from '@/lib/constants/liveBroadcastLayout';
import { getInitials } from '@/lib/utils/displayUtils';
import {
  onBroadcastStateChanged,
  onBroadcastStats,
  requestBroadcastPermissions,
  setBroadcastMuted,
  startBroadcast,
  startBroadcastPreview,
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

/** Mirrors LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS (API is the source of truth). */
const SELF_SERVE_MAX_DURATION_SECONDS = 7200;

const NETWORK_LABEL = { good: 'Good', fair: 'Fair', poor: 'Poor' };

const commentIcon = `${CLOUDFRONT_APP_BASE}/images/icons/comment-icon.svg`;

const TOGGLE_BTN =
  'flex h-9 w-9 shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/[0.13] backdrop-blur-[9.7px] transition-opacity active:opacity-80';

const CONTROL_PILL =
  'rounded-full bg-black/70 px-3 py-2 text-[11px] font-semibold tracking-wide text-white uppercase backdrop-blur-sm transition-opacity active:opacity-80';

function formatElapsed(totalSeconds) {
  const capped = Math.min(Math.max(totalSeconds, 0), SELF_SERVE_MAX_DURATION_SECONDS);
  const h = Math.floor(capped / 3600);
  const m = Math.floor((capped % 3600) / 60);
  const s = Math.floor(capped % 60);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Two rAFs, not one — a single tick isn't reliably post-layout on first paint. */
function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

export default function DuringBroadcast({ streamId }) {
  const navigate = useNavigate();
  const toast = useToast();
  const previewRef = useRef(null);
  const initRanRef = useRef(false);
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
  const isLivePhase = phase === 'live' || phase === 'reconnecting';
  const presenceEnabled = isLivePhase || serverStatus === 'live';

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

  // Shared by the resumed-while-live init path and the manual "Start Broadcasting" button —
  // both need to issue the same native startBroadcast() call.
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

  // Init: request permissions + start the camera preview once the broadcast row is loaded.
  useEffect(() => {
    if (!broadcast || initRanRef.current) return;
    initRanRef.current = true;

    if (broadcast.status !== 'idle' && broadcast.status !== 'starting' && broadcast.status !== 'live') {
      return;
    }

    // Resumed session (app relaunched or task-killed while the server still shows the
    // broadcast as live): this is a fresh native plugin instance with no RTMP session of its
    // own, so the server's "live" status does not mean the encoder is actually publishing.
    const resumedWhileLive = broadcast.status === 'live';

    (async () => {
      setPhase('requesting_permissions');
      const perms = await requestBroadcastPermissions();
      if (perms.camera !== 'granted' || perms.microphone !== 'granted') {
        setPhase('permission_denied');
        return;
      }

      // Wait for the preview container to actually be laid out — reading its rect on the
      // same tick as the first render can measure 0×0 before the browser/webview has
      // completed layout, which the native side then silently no-ops on (zero-size frame).
      await waitForNextPaint();
      const rect = previewRef.current?.getBoundingClientRect();
      await startBroadcastPreview({
        position: 'front',
        x: Math.round(rect?.left ?? 0),
        y: Math.round(rect?.top ?? 0),
        width: Math.round(rect?.width ?? 0),
        height: Math.round(rect?.height ?? 0),
      });
      setPhase('previewing');

      if (resumedWhileLive) {
        await startPublishing(broadcast);
      }
    })();
  }, [broadcast, startPublishing]);

  // Plugin lifecycle → local phase (see "Plugin lifecycle" state machine in the doc).
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

  // Elapsed timer, anchored to the server-confirmed started_at once live.
  useEffect(() => {
    if (!isLivePhase) return undefined;
    const startedAt = publicBroadcast?.stream?.started_at ? new Date(publicBroadcast.stream.started_at).getTime() : Date.now();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - startedAt) / 1000)));
    tick();
    const interval = window.setInterval(tick, 1000);
    return () => window.clearInterval(interval);
  }, [isLivePhase, publicBroadcast?.stream?.started_at]);

  // Reconcile: if the server says the stream ended (admin ban, auto-expiry) while we still
  // think we're live, stop both the native RTMP publish and the local preview, and reflect
  // that immediately — stopping only the preview left the encoder still publishing until it
  // hit its own max-duration timeout or a network-level disconnect.
  useEffect(() => {
    if ((serverStatus === 'ended' || serverStatus === 'error') && phase !== 'ended' && phase !== 'error') {
      void stopBroadcast();
      void stopBroadcastPreview();
      setPhase(serverStatus);
    }
  }, [serverStatus, phase]);

  // iOS backgrounds end the native encoder immediately (reason: 'backgrounded'). Sync the
  // server row too so the one-active guard does not block the user's next broadcast.
  useEffect(() => {
    if (phase !== 'ended' || endReason !== 'backgrounded' || nativeEndSyncedRef.current) return;
    nativeEndSyncedRef.current = true;

    void (async () => {
      await Promise.allSettled([stopBroadcastPreview(), endBroadcastMutation(streamId).unwrap()]);
      setEndSummary((prev) => prev ?? { durationSeconds: elapsed, peakViewers });
    })();
  }, [phase, endReason, streamId, endBroadcastMutation, elapsed, peakViewers]);

  useEffect(
    () => () => {
      if (initRanRef.current) void stopBroadcastPreview();
    },
    [],
  );

  const handleStartBroadcasting = useCallback(() => startPublishing(broadcast), [broadcast, startPublishing]);

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
              <p>Duration: {formatElapsed(endSummary.durationSeconds)}</p>
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
            <p>Duration: {formatElapsed(endSummary.durationSeconds)}</p>
            <p>Peak viewers: {endSummary.peakViewers}</p>
          </div>
        )}
        <Button variant="auth" onClick={() => navigate('/live', { replace: true })}>
          Done
        </Button>
      </div>
    );
  }

  const statusLabel =
    phase === 'reconnecting'
      ? 'Reconnecting…'
      : phase === 'connecting'
        ? 'Starting…'
        : phase === 'previewing'
          ? 'Preview'
          : undefined;
  const statusKey = phase === 'reconnecting' || phase === 'connecting' ? 'starting' : isLivePhase ? 'live' : null;

  return (
    <div className="relative flex flex-col bg-black" style={{ height: LIVE_BROADCAST_SHELL_HEIGHT }}>
      <div ref={previewRef} className="relative min-h-0 w-full flex-1 overflow-hidden bg-[#0b0b0a]">
        {!isNative() && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-[12px] text-white/40">
            Camera preview is only available in the Tapeya app.
          </div>
        )}

        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-linear-to-b from-black/75 via-black/35 to-transparent px-4 pt-2 pb-6"
          style={{ zIndex: LIVE_BROADCAST_HEADER_OVERLAY_Z }}
        >
          <div className="flex items-center justify-between gap-2">
            <AppSubpageBackButton onClick={() => navigate(-1)} aria-label="Back" className="pointer-events-auto" />
            <div className="pointer-events-none flex min-w-0 flex-1 items-center justify-center gap-2">
              {statusKey && <LiveStatusBadge status={statusKey} label={statusLabel} />}
              {isLivePhase && (
                <span className="inline-flex items-center rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white tabular-nums">
                  {formatElapsed(elapsed)}
                </span>
              )}
              {networkQuality && isLivePhase && (
                <span className="rounded-full bg-black/70 px-2 py-1 text-[10px] text-white/80">
                  {NETWORK_LABEL[networkQuality] ?? networkQuality}
                </span>
              )}
            </div>
            <div className="flex h-7 min-w-7 shrink-0 items-center justify-end">
              {presenceEnabled ? <LiveViewerCountBadge viewerCount={viewerCount} /> : <span className="h-7 w-7" aria-hidden />}
            </div>
          </div>
        </div>

        {phase === 'permission_denied' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-[13px] text-white/80">Camera and microphone access are required to go live.</p>
            <p className="text-muted text-[12px]">Enable them in your device settings, then come back to this screen.</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-[13px] text-white/80">We lost the connection and couldn&apos;t reconnect.</p>
            <Button
              variant="auth"
              onClick={() => {
                initRanRef.current = false;
                setPhase('loading');
              }}
            >
              Try Again
            </Button>
          </div>
        )}

        {isLivePhase && <FloatingHeartsOverlay hearts={floatingHearts} onHeartEnd={removeHeart} />}

        {isLivePhase && (
          <div
            className={`pointer-events-none absolute inset-0 ${chatOpen ? 'bg-linear-to-t from-black/80 via-black/10 to-transparent' : 'bg-linear-to-t from-black/25 to-transparent'}`}
          />
        )}

        {/* Bottom overlays: comments + controls — same stacking as watch-live */}
        {(phase === 'previewing' || phase === 'connecting' || isLivePhase) && (
          <div
            className="pointer-events-none absolute right-0 bottom-0 left-0 px-4 pb-3"
            style={{ zIndex: LIVE_BROADCAST_CONTROLS_OVERLAY_Z }}
          >
            <div className="pointer-events-auto flex w-full flex-col gap-2">
              {isLivePhase && chatOpen && <CommentList messages={messages} />}

              <div className="flex items-end gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  {isLivePhase && chatOpen && (
                    <CommentInputRow
                      onSend={handleSendComment}
                      onSendHeart={handleSendHeart}
                      disabled={isSending || sendCooldown}
                    />
                  )}

                  {(phase === 'previewing' || phase === 'connecting') && (
                    <Button variant="auth" className="w-full" disabled={phase === 'connecting'} onClick={handleStartBroadcasting}>
                      {phase === 'connecting' ? 'Connecting…' : 'Start Broadcasting'}
                    </Button>
                  )}

                  <Button
                    type="button"
                    className="w-full rounded-[12px] border border-red-500/40 bg-black/60 py-3 text-[14px] font-bold tracking-wide text-red-300 uppercase backdrop-blur-sm transition-opacity active:opacity-90"
                    onClick={() => setConfirmEndOpen(true)}
                  >
                    End Broadcast
                  </Button>
                </div>

                <div className="flex shrink-0 flex-col items-center gap-2 pb-0.5">
                  {isNative() && (phase === 'previewing' || isLivePhase) && (
                    <>
                      <button type="button" className={CONTROL_PILL} onClick={handleFlipCamera} aria-label="Flip camera">
                        Flip
                      </button>
                      {isLivePhase && (
                        <button
                          type="button"
                          className={CONTROL_PILL}
                          onClick={handleToggleMute}
                          aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
                        >
                          {isMuted ? 'Unmute' : 'Mute'}
                        </button>
                      )}
                    </>
                  )}
                  {isLivePhase && (
                    <button
                      type="button"
                      onClick={() => setChatOpen((v) => !v)}
                      className={`${TOGGLE_BTN} ${chatOpen ? '' : 'ring-1 ring-white/25'}`}
                      aria-label={chatOpen ? 'Hide comments' : 'Show comments'}
                      aria-pressed={chatOpen}
                    >
                      <img
                        src={commentIcon}
                        alt=""
                        className={`h-5 w-5 shrink-0 object-contain ${chatOpen ? 'opacity-100' : 'opacity-45'}`}
                        aria-hidden
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

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
