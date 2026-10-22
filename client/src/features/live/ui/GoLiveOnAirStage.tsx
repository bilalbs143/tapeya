import { cn } from '@/shared/lib/cn';
import type { BroadcastNetworkQuality } from '@/shared/native/tapeyaBroadcast';
import { Button } from '@/shared/ui/Button';
import { HeartIcon, RotateIcon, ShareIcon, WifiOffIcon } from '@/shared/ui/icons';
import { LiveBadge } from '@/shared/ui/LiveBadge';

import {
  BROADCAST_NETWORK_LABEL,
  type BroadcastPhase,
  isBroadcastLivePhase,
  shouldShowBroadcastControls,
} from '../lib/broadcastCameraUtils';
import { goLiveStatusLabel } from '../lib/goLiveOnAirStatus';
import { formatBroadcastElapsed } from '../lib/playback';
import type { FloatingHeart } from '../lib/useFloatingHearts';
import type { LiveComment, OwnerBroadcast } from '../model/schemas';
import { ChatDock } from './ChatDock';
import { FloatingHeartsOverlay } from './FloatingHeartsOverlay';
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

/** Phone on-air chrome (status + controls + chat); web gate on wider viewports. */
export function GoLiveOnAirStage({
  native,
  phase,
  broadcast,
  title,
  orientation,
  elapsed,
  networkQuality,
  isMuted,
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

  return (
    <div className={cn('flex min-h-[100dvh] flex-col', native ? 'bg-transparent' : 'bg-surface')}>
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
          <div className="pointer-events-none absolute inset-0 grid place-items-center font-mono text-4xs font-semibold tracking-eyebrow text-white/20 uppercase">
            Preview · start when ready
          </div>
        ) : null}

        {isLivePhase ? <FloatingHeartsOverlay hearts={floatingHearts} onHeartEnd={onHeartEnd} /> : null}

        <div className="relative z-10 flex flex-col gap-2 px-3.5 pt-[max(10px,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2">
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
              <span className="font-mono ml-auto inline-flex items-center gap-1 rounded-chip bg-black/55 px-2.5 py-1 text-4xs font-semibold text-white uppercase backdrop-blur-sm">
                {networkQuality === 'poor' ? <WifiOffIcon className="h-3 w-3" /> : null}
                {BROADCAST_NETWORK_LABEL[networkQuality]}
              </span>
            ) : (
              <span className="ml-auto" aria-hidden />
            )}
            {isLivePhase ? (
              <button
                type="button"
                aria-label="Share Stream"
                onClick={() => void onShare()}
                className="grid h-8 w-8 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm"
              >
                <ShareIcon className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            ) : null}
          </div>
          <p className="font-mono text-4xs tracking-eyebrow text-white/70 uppercase">
            {orientation === 'landscape' ? 'Landscape' : 'Portrait'}
            {title ? ` · ${title}` : ''}
          </p>
          {needsLandscapeRotate ? (
            <div className="pointer-events-none flex justify-center pt-1" role="status" aria-live="polite">
              <p className="rounded-chip bg-black/80 px-3 py-2 text-center text-3xs font-semibold tracking-wide text-white backdrop-blur-sm">
                Rotate your phone sideways for landscape
              </p>
            </div>
          ) : null}
        </div>

        <div className="relative z-10 mt-auto flex flex-col gap-2.5 px-3.5 pb-[max(14px,env(safe-area-inset-bottom))]">
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
              canChat={chatEnabled}
              {...(composerUser ? { user: composerUser } : {})}
              className="max-h-[38vh]"
            />
          ) : null}

          {native && shouldShowBroadcastControls(phase) ? (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                aria-label="Flip Camera"
                onClick={() => void onFlip()}
                className="grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm"
              >
                <RotateIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-pressed={isMuted}
                aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                onClick={() => void onToggleMute()}
                className="font-mono grid h-11 min-w-11 place-items-center rounded-full bg-black/55 px-3 text-4xs font-bold tracking-eyebrow text-white uppercase backdrop-blur-sm"
              >
                {isMuted ? 'Muted' : 'Mic'}
              </button>
              {isLivePhase ? (
                <>
                  <button
                    type="button"
                    aria-label="Send Heart"
                    onClick={() => void onSendHeart()}
                    className="grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm"
                  >
                    <HeartIcon className="text-like h-4 w-4" strokeWidth={2} filled />
                  </button>
                  <button
                    type="button"
                    aria-pressed={commentsVisible}
                    aria-label={commentsVisible ? 'Hide Comments' : 'Show Comments'}
                    onClick={onToggleComments}
                    className="font-mono grid h-11 min-w-11 place-items-center rounded-full bg-black/55 px-3 text-4xs font-bold tracking-eyebrow text-white uppercase backdrop-blur-sm"
                  >
                    Chat
                  </button>
                </>
              ) : null}
            </div>
          ) : null}

          {phase === 'previewing' || phase === 'requesting_permissions' ? (
            <Button
              variant="positive"
              className="h-12 w-full"
              loading={startLoading || phase === 'requesting_permissions'}
              disabled={phase !== 'previewing' || !native}
              onClick={() => void onStart()}
            >
              Go Live
            </Button>
          ) : null}

          {phase === 'connecting' ? (
            <Button variant="positive" className="h-12 w-full" loading disabled>
              Starting…
            </Button>
          ) : null}

          {isLivePhase || phase === 'ending' ? (
            <Button
              variant="danger"
              className="h-12 w-full"
              loading={endLoading || phase === 'ending'}
              onClick={() => void onEnd()}
            >
              End Broadcast
            </Button>
          ) : null}

          <Button variant="secondary" className="h-11 w-full" onClick={() => void onLeave()}>
            Leave
          </Button>
        </div>
      </div>
    </div>
  );
}
