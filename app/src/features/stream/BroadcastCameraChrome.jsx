import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import {
  BroadcastCaptureButton,
  FlipCameraIcon,
  FloatingControlButton,
  MicIcon,
} from '@/features/stream/BroadcastCaptureControls';
import { CommentInputRow } from '@/features/stream/CommentInputRow';
import CommentList from '@/features/stream/CommentList';
import { LiveStatusBadge, LiveViewerCountBadge } from '@/features/stream/LiveStatusBadges';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import {
  LIVE_BROADCAST_BOTTOM_SCRIM,
  LIVE_BROADCAST_CAMERA_HEADER_CLASS,
  LIVE_BROADCAST_CAMERA_HEADER_TOP,
  LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
  LIVE_BROADCAST_HEADER_OVERLAY_Z,
} from '@/lib/constants/liveBroadcastLayout';

const commentIcon = `${CLOUDFRONT_APP_BASE}/images/icons/comment-icon.svg`;
const PREVIEW_FLIP_SLOT = 'w-11 shrink-0';
const LIVE_ROW_SLOT = 'w-[104px] shrink-0';

function CommentToggleIcon({ dimmed = false }) {
  return (
    <img
      src={commentIcon}
      alt=""
      className={`h-5 w-5 shrink-0 object-contain ${dimmed ? 'opacity-55' : 'opacity-100'}`}
      aria-hidden
    />
  );
}

function FlipButton({ onClick }) {
  return (
    <FloatingControlButton onClick={onClick} ariaLabel="Flip camera">
      <FlipCameraIcon />
    </FloatingControlButton>
  );
}

function LiveSideControls({ isMuted, chatOpen, onFlip, onToggleMute, onToggleChat, layout }) {
  const wrapClass =
    layout === 'column' ? 'flex shrink-0 flex-col items-center gap-3 pb-1' : 'flex items-center justify-end gap-2';

  return (
    <div className={wrapClass}>
      <FlipButton onClick={onFlip} />
      <FloatingControlButton
        onClick={onToggleMute}
        ariaLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        active={isMuted}
      >
        <MicIcon muted={isMuted} />
      </FloatingControlButton>
      <FloatingControlButton
        onClick={onToggleChat}
        ariaLabel={chatOpen ? 'Hide comments' : 'Show comments'}
        active={chatOpen}
      >
        <CommentToggleIcon dimmed={!chatOpen} />
      </FloatingControlButton>
    </div>
  );
}

export function BroadcastCameraHeader({
  onBack,
  statusKey,
  statusLabel,
  elapsed,
  networkLabel,
  showTimer,
  showNetwork,
  presenceEnabled,
  viewerCount,
}) {
  return (
    <div className={LIVE_BROADCAST_CAMERA_HEADER_CLASS} style={{ zIndex: LIVE_BROADCAST_HEADER_OVERLAY_Z }}>
      <div
        className="pointer-events-auto flex items-center justify-between gap-2"
        style={{ paddingTop: LIVE_BROADCAST_CAMERA_HEADER_TOP }}
      >
        <AppSubpageBackButton onClick={onBack} aria-label="Back" />
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2">
          {statusKey && <LiveStatusBadge status={statusKey} label={statusLabel} />}
          {showTimer && (
            <span className="inline-flex items-center rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white tabular-nums backdrop-blur-sm">
              {elapsed}
            </span>
          )}
          {showNetwork && networkLabel && (
            <span className="rounded-full bg-black/70 px-2 py-1 text-[10px] text-white/80 backdrop-blur-sm">
              {networkLabel}
            </span>
          )}
        </div>
        <div className="flex h-7 min-w-7 shrink-0 items-center justify-end">
          {presenceEnabled ? (
            <LiveViewerCountBadge viewerCount={viewerCount} />
          ) : (
            <span className="h-7 w-7" aria-hidden />
          )}
        </div>
      </div>
    </div>
  );
}

export function BroadcastCameraControlDock({
  phase,
  captureMode,
  isLive,
  isNative,
  chatOpen,
  isMuted,
  isSending,
  sendCooldown,
  messages,
  onCapturePress,
  onFlip,
  onToggleMute,
  onToggleChat,
  onSendComment,
  onSendHeart,
}) {
  const showSideColumn = isNative && isLive && chatOpen;
  const showPreviewFlip = isNative && !isLive;
  const showLiveRow = isNative && isLive && !chatOpen;

  return (
    <>
      {isLive && chatOpen && (
        <div
          className="pointer-events-none absolute right-0 left-0 px-4"
          style={{
            zIndex: LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
            bottom: 'calc(env(safe-area-inset-bottom) + 200px)',
          }}
        >
          <CommentList messages={messages} />
        </div>
      )}

      <div className={LIVE_BROADCAST_BOTTOM_SCRIM} style={{ zIndex: 5 }} />

      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 px-4"
        style={{
          zIndex: LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        {isLive && chatOpen && (
          <div className="pointer-events-auto mb-3 flex items-end gap-3">
            <div className="min-w-0 flex-1">
              <CommentInputRow
                onSend={onSendComment}
                onSendHeart={onSendHeart}
                disabled={isSending || sendCooldown}
              />
            </div>
            {showSideColumn && (
              <LiveSideControls
                layout="column"
                isMuted={isMuted}
                chatOpen={chatOpen}
                onFlip={onFlip}
                onToggleMute={onToggleMute}
                onToggleChat={onToggleChat}
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-center gap-6">
          <span className={PREVIEW_FLIP_SLOT} aria-hidden />
          <div className="pointer-events-auto">
            <BroadcastCaptureButton mode={captureMode} onClick={onCapturePress} disabled={phase === 'ending'} />
          </div>
          {showPreviewFlip ? (
            <div className={`pointer-events-auto ${PREVIEW_FLIP_SLOT}`}>
              <FlipButton onClick={onFlip} />
            </div>
          ) : showLiveRow ? (
            <div className={`pointer-events-auto ${LIVE_ROW_SLOT}`}>
              <LiveSideControls
                layout="row"
                isMuted={isMuted}
                chatOpen={chatOpen}
                onFlip={onFlip}
                onToggleMute={onToggleMute}
                onToggleChat={onToggleChat}
              />
            </div>
          ) : (
            <span className={PREVIEW_FLIP_SLOT} aria-hidden />
          )}
        </div>
      </div>
    </>
  );
}
