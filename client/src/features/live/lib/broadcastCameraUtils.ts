/** Mirrors LiveStreamService::SELF_SERVE_MAX_DURATION_SECONDS. */
export const SELF_SERVE_MAX_DURATION_SECONDS = 7200;

export const BROADCAST_NETWORK_LABEL = {
  good: 'Good',
  fair: 'Fair',
  poor: 'Poor',
} as const;

export type BroadcastPhase =
  | 'loading'
  | 'requesting_permissions'
  | 'permission_denied'
  | 'plugin_unavailable'
  | 'previewing'
  | 'connecting'
  | 'live'
  | 'reconnecting'
  | 'ending'
  | 'ended'
  | 'error';

/** Capacitor throws when TapeyaBroadcast is not registered in the native shell. */
export function isBroadcastPluginUnavailableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '');
  const lower = message.toLowerCase();
  return (
    lower.includes('not implemented') ||
    lower.includes('unimplemented') ||
    lower.includes('"tapeyabroadcast" plugin is not implemented') ||
    (lower.includes('tapeyabroadcast') && lower.includes('not available'))
  );
}

/** Two rAFs — one tick is not reliably post-layout on first paint in Capacitor. */
export function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
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

export function isBroadcastLivePhase(phase: BroadcastPhase): boolean {
  return phase === 'live' || phase === 'reconnecting';
}

export function shouldShowBroadcastControls(phase: BroadcastPhase): boolean {
  return phase === 'previewing' || phase === 'connecting' || isBroadcastLivePhase(phase);
}

export function shouldSyncPreviewLayout(phase: BroadcastPhase): boolean {
  return phase === 'previewing' || phase === 'connecting' || isBroadcastLivePhase(phase);
}

export function resolveBroadcastOrientation(value: string | null | undefined): 'portrait' | 'landscape' {
  return value === 'landscape' ? 'landscape' : 'portrait';
}

/** Owner/public statuses that can still open preview or resume publish. */
export function isResumableBroadcastStatus(status: string | null | undefined): boolean {
  return status === 'idle' || status === 'starting' || status === 'live';
}

/** True when leave/back should confirm end (actively publishing or connecting). */
export function shouldConfirmEndOnLeave(phase: BroadcastPhase, publishSessionActive: boolean): boolean {
  return publishSessionActive || phase === 'connecting' || phase === 'live' || phase === 'reconnecting';
}
