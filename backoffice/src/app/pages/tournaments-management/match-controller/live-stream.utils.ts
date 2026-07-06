import type { LiveStreamStatus } from 'src/app/services/live-stream.service';

export function liveStreamStatusLabel(status: LiveStreamStatus | null | undefined): string {
  if (!status) {
    return 'No Stream';
  }
  const labels: Record<LiveStreamStatus, string> = {
    idle: 'Idle — Waiting For OBS/vMix',
    starting: 'Connecting…',
    live: 'Live',
    ended: 'Ended',
    error: 'Error',
  };
  return labels[status] ?? status;
}

/** Short label for the match controller header (Theme-style line). */
export function liveStreamHeaderStatusLabel(status: LiveStreamStatus | null | undefined, hasStream: boolean): string {
  if (!hasStream || !status) {
    return 'Not Configured';
  }
  const labels: Record<LiveStreamStatus, string> = {
    idle: 'Idle — Waiting For OBS/vMix',
    starting: 'Starting',
    live: 'Live',
    ended: 'Ended',
    error: 'Error',
  };
  return labels[status] ?? status;
}

export function liveStreamPresenceEligible(status: LiveStreamStatus | null | undefined): boolean {
  return status === 'live' || status === 'starting';
}

export function matchControllerLink(matchId: number): (string | number)[] {
  return ['/tournaments-management/match-controller', matchId];
}
