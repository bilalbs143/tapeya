import type { BroadcastPhase } from './broadcastCameraUtils';

/** Chip copy when the stream is not yet live. */
export function goLiveStatusLabel(phase: BroadcastPhase): string | null {
  if (phase === 'reconnecting') return 'Reconnecting…';
  if (phase === 'connecting') return 'Starting…';
  if (phase === 'requesting_permissions') return 'Permissions…';
  if (phase === 'previewing') return 'Ready';
  return null;
}
