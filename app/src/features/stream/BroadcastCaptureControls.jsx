const FLOATING_BTN =
  'flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-md transition-transform active:scale-95 disabled:opacity-50';

export function FlipCameraIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M11 6h8a2 2 0 0 1 2 2v8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m14 18 3-3-3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 18H5a2 2 0 0 1-2-2V8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m10 6-3-3-3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MicIcon({ muted = false }) {
  if (muted) {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 19v3M8 11v1a4 4 0 0 0 8 0v-1M12 15a4 4 0 0 0 4-4V7a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4Z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="m3 3 18 18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 19v3M8 11v1a4 4 0 0 0 8 0v-1M12 15a4 4 0 0 0 4-4V7a4 4 0 0 0-8 0v4a4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FloatingControlButton({ onClick, disabled, ariaLabel, children, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${FLOATING_BTN} ${active ? 'ring-2 ring-white/70' : ''}`}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}

/**
 * Snapchat-style shutter — red circle to start, red square to stop/end.
 */
export function BroadcastCaptureButton({ mode, onClick, disabled = false }) {
  const isEnd = mode === 'end';
  const isConnecting = mode === 'connecting';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isConnecting}
      className="relative flex h-[76px] w-[76px] touch-manipulation items-center justify-center rounded-full border-4 border-white transition-transform active:scale-95 disabled:opacity-60"
      aria-label={isEnd ? 'End broadcast' : isConnecting ? 'Connecting' : 'Start broadcast'}
    >
      {isConnecting ? (
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden />
      ) : isEnd ? (
        <span className="block h-7 w-7 rounded-[6px] bg-red-500" aria-hidden />
      ) : (
        <span className="block h-[62px] w-[62px] rounded-full bg-red-500" aria-hidden />
      )}
    </button>
  );
}
