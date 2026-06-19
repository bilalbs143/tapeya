import type { MatchStreamStatus } from 'src/app/services/match-stream.service';

export function matchStreamStatusLabel(status: MatchStreamStatus | null | undefined): string {
  if (!status) {
    return 'No stream';
  }
  const labels: Record<MatchStreamStatus, string> = {
    idle: 'Idle — waiting for OBS/vMix',
    starting: 'Connecting…',
    live: 'Live',
    ended: 'Ended',
    error: 'Error',
  };
  return labels[status] ?? status;
}

/** Short label for the match controller header (Theme-style line). */
export function matchStreamHeaderStatusLabel(status: MatchStreamStatus | null | undefined, hasStream: boolean): string {
  if (!hasStream || !status) {
    return 'Not configured';
  }
  const labels: Record<MatchStreamStatus, string> = {
    idle: 'Idle — waiting for OBS/vMix',
    starting: 'Starting',
    live: 'Live',
    ended: 'Ended',
    error: 'Error',
  };
  return labels[status] ?? status;
}

export function matchStreamPresenceEligible(status: MatchStreamStatus | null | undefined): boolean {
  return status === 'live' || status === 'starting';
}
