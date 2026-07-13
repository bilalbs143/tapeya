/** Mirrors LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS (API is the source of truth). */
export const SELF_SERVE_MAX_DURATION_SECONDS = 7200;

export const BROADCAST_NETWORK_LABEL = { good: 'Good', fair: 'Fair', poor: 'Poor' };

/** Two rAFs — one tick is not reliably post-layout on first paint in Capacitor. */
export function waitForNextPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
}

export function formatBroadcastElapsed(totalSeconds) {
  const capped = Math.min(Math.max(totalSeconds, 0), SELF_SERVE_MAX_DURATION_SECONDS);
  const h = Math.floor(capped / 3600);
  const m = Math.floor((capped % 3600) / 60);
  const s = Math.floor(capped % 60);
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

/** Full-window rect for native preview underlay compositing (iOS + Android). */
export function getFullWindowPreviewLayout() {
  return {
    x: 0,
    y: 0,
    width: Math.round(window.innerWidth),
    height: Math.round(window.innerHeight),
  };
}

export function isBroadcastLivePhase(phase) {
  return phase === 'live' || phase === 'reconnecting';
}

export function shouldShowBroadcastControls(phase) {
  return phase === 'previewing' || phase === 'connecting' || isBroadcastLivePhase(phase);
}

export function getBroadcastStatusDisplay(phase) {
  if (phase === 'reconnecting') {
    return { statusKey: 'starting', statusLabel: 'Reconnecting…' };
  }
  if (phase === 'connecting') {
    return { statusKey: 'starting', statusLabel: 'Starting…' };
  }
  if (phase === 'previewing') {
    return { statusKey: null, statusLabel: 'Preview' };
  }
  if (isBroadcastLivePhase(phase)) {
    return { statusKey: 'live', statusLabel: undefined };
  }
  return { statusKey: null, statusLabel: undefined };
}

export function getCaptureButtonMode(phase) {
  if (isBroadcastLivePhase(phase)) return 'end';
  if (phase === 'connecting') return 'connecting';
  return 'start';
}

export function shouldSyncPreviewLayout(phase) {
  return phase === 'previewing' || phase === 'connecting' || isBroadcastLivePhase(phase);
}
