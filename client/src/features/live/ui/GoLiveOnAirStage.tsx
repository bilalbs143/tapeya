import { cn } from '@/shared/lib/cn';
import type { BroadcastNetworkQuality } from '@/shared/native/tapeyaBroadcast';
import { IconButton } from '@/shared/ui/IconButton';
import {
  type CameraFacing,
  CameraFacingIcon,
  ChevronLeftIcon,
  CommentIcon,
  MicIcon,
  ShareIcon,
  WifiOffIcon,
} from '@/shared/ui/icons';
import { LiveBadge } from '@/shared/ui/LiveBadge';

import {
  BROADCAST_NETWORK_LABEL,
  type BroadcastPhase,
  isBroadcastLivePhase,
  resolveGoLiveCaptureMode,
  shouldShowBroadcastControls,
} from '../lib/broadcastCameraUtils';
import { goLiveStatusLabel } from '../lib/goLiveOnAirStatus';
import { formatBroadcastElapsed } from '../lib/playback';
import type { FloatingHeart } from '../lib/useFloatingHearts';
import type { LiveComment, OwnerBroadcast } from '../model/schemas';
import { ChatDock } from './ChatDock';
import { FloatingHeartsOverlay } from './FloatingHeartsOverlay';
import { GoLiveCaptureButton } from './GoLiveCaptureButton';
import { GoLiveWebGate } from './GoLiveWebGate';

type ComposerUser = {
  id?: number | undefined;
  name: string | null;
  nickname?: string | null | undefined;
  avatarUrl: string | null;
};

type GoLiveOnAirStageProps = {
  native: boolean;
  phase: BroadcastPhase;
  broadcast: OwnerBroadcast;
  title?: string | undefined;
  orientation: 'portrait' | 'landscape';
  elapsed: number;
  networkQuality: BroadcastNetworkQuality | null;
  isMuted: boolean;
  cameraFacing: CameraFacing;
  needsLandscapeRotate: boolean;
  startLoading: boolean;
  endLoading: boolean;
  comments: LiveComment[];
  draft: string;
  onDraft: (value: string) => void;
  onSendComment: () => void;
  commentsVisible: boolean;
  chatEnabled: boolean;
  viewerLabel: string | null;
  floatingHearts: FloatingHeart[];
  onHeartEnd: (id: number) => void;
  keyboardInset: number;
  composerUser?: ComposerUser | undefined;
  onStart: () => void;
  onEnd: () => void;
  onLeave: () => void;
  onFlip: () => void;
  onToggleMute: () => void;
  onShare: () => void;
  onSendHeart: () => void;
  onToggleComments: () => void;
};

/** Phone on-air chrome — header + chat + shutter dock over the native camera underlay. */
export function GoLiveOnAirStage({
  native,
  phase,
  broadcast,
  title,
  orientation,
  elapsed,
  networkQuality,
  isMuted,
  cameraFacing,
  needsLandscapeRotate,
  startLoading,
  endLoading,
  comments,
  draft,
  onDraft,
  onSendComment,
  commentsVisible,
  chatEnabled,
  viewerLabel,
  floatingHearts,
  onHeartEnd,
  keyboardInset,
  composerUser,
  onStart,
  onEnd,
  onLeave,
  onFlip,
  onToggleMute,
  onShare,
  onSendHeart,
  onToggleComments,
}: GoLiveOnAirStageProps) {
  const isLivePhase = isBroadcastLivePhase(phase);
  const statusLabel = goLiveStatusLabel(phase);
  const showLiveBadge = phase === 'live';
  const showChat = isLivePhase && commentsVisible && chatEnabled;
  const showNativeControls = native && shouldShowBroadcastControls(phase);
  const captureMode = resolveGoLiveCaptureMode(phase, startLoading, endLoading);
  const facingBack = cameraFacing === 'back';
  const leaveLabel = isLivePhase || phase === 'connecting' || phase === 'ending' ? 'Leave Broadcast' : 'Back';

  return (
    <div className={cn('flex min-h-dvh flex-col', native ? 'bg-transparent' : 'bg-surface')}>
      <GoLiveWebGate />

      <div
        className={cn(
          'relative flex min-h-0 flex-1 flex-col overflow-hidden text-white tab:hidden',
          native ? 'bg-transparent' : 'bg-black'
        )}
        style={{ paddingBottom: keyboardInset }}
      >
        {!native ? <div aria-hidden className="absolute inset-0 bg-white/10" /> : null}
        {!native ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-4xs font-semibold tracking-eyebrow text-white/25 uppercase">
            Preview · start when ready
          </div>
        ) : null}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-linear-to-b from-black/55 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-linear-to-t from-black/70 via-black/35 to-transparent"
        />

        {isLivePhase ? <FloatingHeartsOverlay hearts={floatingHearts} onHeartEnd={onHeartEnd} /> : null}

        <header className="relative z-10 flex flex-col gap-2 px-3.5 pt-[max(10px,env(safe-area-inset-top))]">
          <div className="flex items-start gap-2">
            <IconButton label={leaveLabel} variant="media" round size="md" onClick={() => void onLeave()}>
              <ChevronLeftIcon size="md" strokeWidth={2.2} />
            </IconButton>

            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5 pt-0.5">
              <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5">
                {showLiveBadge ? (
                  <LiveBadge
                    variant="media"
                    viewers={viewerLabel}
                    aria-label={viewerLabel ? `Live · ${viewerLabel} watching` : 'Live'}
                  />
                ) : (
                  <span className="font-mono inline-flex rounded-chip bg-black/55 px-2.5 py-1 text-4xs font-bold tracking-eyebrow text-white uppercase backdrop-blur-sm">
                    {statusLabel ?? 'Ready'}
                  </span>
                )}
                {isLivePhase ? (
                  <span className="font-mono rounded-chip bg-black/55 px-2.5 py-1 text-3xs font-semibold text-white tabular-nums backdrop-blur-sm">
                    {formatBroadcastElapsed(elapsed)}
                  </span>
                ) : null}
                {networkQuality && isLivePhase ? (
                  <span className="font-mono inline-flex items-center gap-1 rounded-chip bg-black/55 px-2.5 py-1 text-4xs font-semibold text-white uppercase backdrop-blur-sm">
                    {networkQuality === 'poor' ? <WifiOffIcon className="h-3 w-3" /> : null}
                    {BROADCAST_NETWORK_LABEL[networkQuality]}
                  </span>
                ) : null}
              </div>
              <p className="font-mono inline-flex max-w-full items-center gap-1.5 truncate rounded-chip bg-black/55 px-2.5 py-1 text-4xs font-semibold tracking-eyebrow text-white/90 uppercase backdrop-blur-sm">
                <span className="bg-brand h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
                <span className="truncate">
                  {orientation === 'landscape' ? 'Landscape' : 'Portrait'}
                  {title ? ` · ${title}` : ''}
                </span>
              </p>
            </div>

            <div className="flex w-10 shrink-0 justify-end">
              {isLivePhase ? (
                <IconButton label="Share Stream" variant="media" round size="md" onClick={() => void onShare()}>
                  <ShareIcon size="sm" strokeWidth={2} />
                </IconButton>
              ) : (
                <span className="h-10 w-10" aria-hidden />
              )}
            </div>
          </div>

          {needsLandscapeRotate ? (
            <div className="pointer-events-none flex justify-center" role="status" aria-live="polite">
              <p className="rounded-chip bg-black/80 px-3 py-2 text-center text-3xs font-semibold tracking-wide text-white backdrop-blur-sm">
                Rotate your phone sideways for landscape
              </p>
            </div>
          ) : null}
        </header>

        <div className="relative z-10 mt-auto flex flex-col gap-3 px-3.5 pb-[max(16px,env(safe-area-inset-bottom))]">
          {!native && broadcast.rtmpUrl ? (
            <div className="rounded-panel bg-black/55 px-3 py-2.5 text-3xs leading-relaxed text-white/85 backdrop-blur-sm">
              <p className="font-mono font-bold tracking-eyebrow uppercase">RTMP (OBS)</p>
              <p className="mt-1 break-all font-mono text-4xs">{broadcast.rtmpUrl}</p>
              {broadcast.streamKey ? (
                <p className="mt-1 break-all font-mono text-4xs">Key · {broadcast.streamKey}</p>
              ) : null}
            </div>
          ) : null}

          {showChat ? (
            <ChatDock
              variant="overlay"
              comments={comments}
              draft={draft}
              onDraft={onDraft}
              onSend={onSendComment}
              onHeart={() => void onSendHeart()}
              canChat={chatEnabled}
              {...(composerUser ? { user: composerUser } : {})}
              className="max-h-[36vh]"
            />
          ) : null}

          {showNativeControls && captureMode ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
              <div aria-hidden />
              <GoLiveCaptureButton
                mode={captureMode}
                disabled={
                  captureMode === 'start'
                    ? phase !== 'previewing' || !native
                    : captureMode === 'end'
                      ? phase === 'ending' || endLoading
                      : false
                }
                onClick={() => {
                  if (captureMode === 'start') void onStart();
                  else if (captureMode === 'end') void onEnd();
                }}
              />
              <div className="flex flex-col items-end justify-end gap-2 pb-1">
                {isLivePhase ? (
                  <IconButton
                    label={commentsVisible ? 'Hide Comments' : 'Show Comments'}
                    variant={commentsVisible ? 'mediaActive' : 'media'}
                    round
                    size="lg"
                    aria-pressed={commentsVisible}
                    onClick={onToggleComments}
                  >
                    <CommentIcon size="md" strokeWidth={1.75} off={!commentsVisible} />
                  </IconButton>
                ) : null}
                <IconButton
                  label={facingBack ? 'Switch to Front Camera' : 'Switch to Back Camera'}
                  variant={facingBack ? 'mediaActive' : 'media'}
                  round
                  size="lg"
                  aria-pressed={facingBack}
                  onClick={() => void onFlip()}
                >
                  <CameraFacingIcon size="md" facing={cameraFacing} />
                </IconButton>
                <IconButton
                  label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                  variant={isMuted ? 'mediaDanger' : 'media'}
                  round
                  size="lg"
                  aria-pressed={isMuted}
                  onClick={() => void onToggleMute()}
                >
                  <MicIcon size="md" muted={isMuted} />
                </IconButton>
              </div>
            </div>
          ) : null}

          {!native && (phase === 'previewing' || phase === 'connecting') ? (
            <p className="text-center text-3xs text-white/70">
              Open Tapeya on your phone to go live, or use the RTMP details above in OBS.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
