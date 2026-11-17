import { useGetLiveStreamsQuery } from '../api/liveApi';
import { filterLiveStreams, LIVE_HUB_POLL_MS } from './liveHub';

/** True when the live hub list has at least one `status === 'live'` stream. */
export function useHasLiveStreams(): boolean {
  const { data } = useGetLiveStreamsQuery(undefined, {
    pollingInterval: LIVE_HUB_POLL_MS,
  });
  return filterLiveStreams(data).length > 0;
}
