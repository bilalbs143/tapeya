export const LIVE_HUB_POLL_MS = 60_000;

export function filterLiveStreams<T extends { status: string }>(streams: T[] | undefined): T[] {
  return (streams ?? []).filter((s) => s.status === 'live');
}
