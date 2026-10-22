import { useNavigate } from 'react-router-dom';

import { useGetLiveStreamsQuery } from '../api/liveApi';
import { filterLiveStreams, LIVE_HUB_POLL_MS } from '../lib/liveHub';

/** Live streams list with 60s polling for LiveHubPage. */
export function useLiveHub() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch, isFetching } = useGetLiveStreamsQuery(undefined, {
    pollingInterval: LIVE_HUB_POLL_MS,
  });

  const streams = filterLiveStreams(data);

  function goHome() {
    navigate('/');
  }

  return {
    streams,
    isLoading,
    isError,
    isFetching,
    refetch,
    goHome,
  };
}
