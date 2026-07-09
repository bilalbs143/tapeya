const FLOATING_BTN_BASE =
  'flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full backdrop-blur-md transition-[transform,background-color,color,box-shadow] active:scale-95 disabled:opacity-50';

const FLOATING_BTN_TONE = {
  default: 'bg-black/45 text-white',
  /** Rear camera / secondary capture state */
  active: 'bg-white/22 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]',
  /** Microphone muted */
  danger: 'bg-red-500/25 text-red-300 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.45)]',
};

/** @deprecated Use CameraFacingIcon — kept for any external imports */
export function FlipCameraIcon() {
  return <CameraFacingIcon facing="front" />;
}

/** Distinct glyphs for front (selfie) vs rear camera — primary flip affordance. */
export function CameraFacingIcon({ facing = 'front' }) {
  if (facing === 'back') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 8.5V17a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 8.5h2.2l1.3-2h3l1.3 2H18"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="13" r="3.25" stroke="currentColor" strokeWidth="1.75" />
        <path d="M17.5 9.5h.01" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="7" y="4" width="10" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="10" r="2.75" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M10 16.5h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M12 6.5v1.2"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        opacity="0.65"
      />
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
        <path
          d="m4 4 16 16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
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
      <path
        d="M9.5 9.5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

export function FloatingControlButton({
  onClick,
  disabled,
  ariaLabel,
  children,
  tone = 'default',
  /** @deprecated Prefer `tone` — ring-only feedback is too subtle on camera overlay */
  active = false,
}) {
  const resolvedTone = active && tone === 'default' ? 'active' : tone;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${FLOATING_BTN_BASE} ${FLOATING_BTN_TONE[resolvedTone] ?? FLOATING_BTN_TONE.default}`}
      aria-label={ariaLabel}
      aria-pressed={resolvedTone === 'active' || resolvedTone === 'danger' ? true : undefined}
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
