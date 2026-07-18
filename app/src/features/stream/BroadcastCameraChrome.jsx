import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import {
  BroadcastCaptureButton,
  CameraFacingIcon,
  ChatIcon,
  FloatingControlButton,
  MicIcon,
} from '@/features/stream/BroadcastCaptureControls';
import { CommentInputRow } from '@/features/stream/CommentInputRow';
import CommentList from '@/features/stream/CommentList';
import { LiveStatusBadge, LiveViewerCountBadge } from '@/features/stream/LiveStatusBadges';
import {
  LIVE_BROADCAST_BOTTOM_SCRIM,
  LIVE_BROADCAST_CAMERA_HEADER_CLASS,
  LIVE_BROADCAST_CAMERA_HEADER_TOP,
  LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
  LIVE_BROADCAST_HEADER_OVERLAY_Z,
} from '@/lib/constants/liveBroadcastLayout';
import { getStreamOrientationLabel, getStreamOrientationOptions, useGetEnumsQuery } from '@/store/api/enumApi';

const LIVE_SIDE_SLOT = 'flex shrink-0 items-center justify-end gap-2';

function FlipButton({ onClick, facing = 'front' }) {
  const isBack = facing === 'back';

  return (
    <FloatingControlButton
      onClick={onClick}
      ariaLabel={isBack ? 'Switch to front camera' : 'Switch to back camera'}
      tone={isBack ? 'active' : 'default'}
    >
      <CameraFacingIcon facing={facing} />
    </FloatingControlButton>
  );
}

function LiveSideControls({
  cameraFacing,
  isMuted,
  onFlip,
  onToggleMute,
  canToggleComments = false,
  commentsVisible = true,
  onToggleComments,
}) {
  return (
    <div className={LIVE_SIDE_SLOT}>
      {canToggleComments && (
        <FloatingControlButton
          onClick={onToggleComments}
          ariaLabel={commentsVisible ? 'Hide comments' : 'Show comments'}
          tone={commentsVisible ? 'active' : 'default'}
        >
          <ChatIcon off={!commentsVisible} />
        </FloatingControlButton>
      )}
      <FlipButton onClick={onFlip} facing={cameraFacing} />
      <FloatingControlButton
        onClick={onToggleMute}
        ariaLabel={isMuted ? 'Unmute microphone' : 'Mute microphone'}
        tone={isMuted ? 'danger' : 'default'}
      >
        <MicIcon muted={isMuted} />
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
  orientation,
}) {
  const { data: enums = {} } = useGetEnumsQuery();
  const orientationLabel = getStreamOrientationLabel(orientation, getStreamOrientationOptions(enums));

  return (
    <div className={LIVE_BROADCAST_CAMERA_HEADER_CLASS} style={{ zIndex: LIVE_BROADCAST_HEADER_OVERLAY_Z }}>
      <div
        className="pointer-events-auto flex items-center justify-between gap-2"
        style={{ paddingTop: LIVE_BROADCAST_CAMERA_HEADER_TOP }}
      >
        <AppSubpageBackButton onClick={onBack} aria-label="Back" />
        <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2">
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
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-black/75 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white backdrop-blur-sm"
            aria-label={`Selected orientation: ${orientationLabel}`}
          >
            <span className="bg-brand h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
            {orientationLabel}
          </span>
        </div>
        <div className="flex h-7 min-w-7 shrink-0 items-center justify-end">
          {presenceEnabled ? <LiveViewerCountBadge viewerCount={viewerCount} /> : <span className="h-7 w-7" aria-hidden />}
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
  isMuted,
  cameraFacing = 'front',
  isSending,
  sendCooldown,
  chatEnabled,
  messages,
  commentsVisible = true,
  onCapturePress,
  onFlip,
  onToggleMute,
  onToggleComments,
  onSendComment,
  onSendHeart,
}) {
  const showSideControls = isNative;

  return (
    <>
      <div className={LIVE_BROADCAST_BOTTOM_SCRIM} style={{ zIndex: 5 }} />

      <div
        className="pointer-events-none absolute right-0 bottom-0 left-0 px-4"
        style={{
          zIndex: LIVE_BROADCAST_CONTROLS_OVERLAY_Z,
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
      >
        <div className="pointer-events-none mb-2 w-full">
          <CommentList messages={messages} />
        </div>

        {isLive && commentsVisible && (
          <div className="pointer-events-auto mb-3 w-full">
            <CommentInputRow
              onSend={onSendComment}
              onSendHeart={onSendHeart}
              disabled={!chatEnabled || isSending || sendCooldown}
            />
          </div>
        )}

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div aria-hidden />
          <div className="pointer-events-auto">
            <BroadcastCaptureButton mode={captureMode} onClick={onCapturePress} disabled={phase === 'ending'} />
          </div>
          <div className="flex justify-end">
            {showSideControls && (
              <div className="pointer-events-auto">
                <LiveSideControls
                  cameraFacing={cameraFacing}
                  isMuted={isMuted}
                  onFlip={onFlip}
                  onToggleMute={onToggleMute}
                  canToggleComments={isLive}
                  commentsVisible={commentsVisible}
                  onToggleComments={onToggleComments}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
