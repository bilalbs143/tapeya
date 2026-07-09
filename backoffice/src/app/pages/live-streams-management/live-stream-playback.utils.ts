import type { LiveStreamPlayback, LiveStreamStatus } from 'src/app/services/live-stream.service';

export function liveStreamMonitorMessage(status: LiveStreamStatus | null | undefined, hasPlayback: boolean): string {
  if (hasPlayback) {
    return '';
  }

  switch (status) {
    case 'idle':
      return 'Waiting for the broadcaster to start publishing (OBS, vMix, or mobile Go Live).';
    case 'starting':
      return 'Stream is connecting. Playback will appear once YouTube accepts the feed.';
    case 'live':
      return 'Stream is live but no embed or playback URL is available yet. Try Sync Status or open the stream URL below.';
    case 'ended':
      return 'This broadcast has ended. VOD playback may appear if YouTube retained the recording.';
    case 'error':
      return 'Stream is in an error state. Check provider credentials and sync status.';
    default:
      return 'No playback available for this stream.';
  }
}

export function liveStreamKindLabel(matchId: number | null | undefined, ownerUserId: number | null | undefined): string {
  if (matchId) {
    return `Match #${matchId}`;
  }
  if (ownerUserId) {
    return 'Self-serve (mobile)';
  }
  return 'Standalone (admin)';
}

export function liveStreamOpenUrl(
  playback: LiveStreamPlayback | null | undefined,
  streamingUrl: string | null | undefined
): string | null {
  if (playback?.mode === 'hls' && playback.url) {
    return playback.url;
  }
  if (playback?.mode === 'iframe' && playback.embed_url) {
    return playback.embed_url;
  }
  return streamingUrl?.trim() || null;
}
