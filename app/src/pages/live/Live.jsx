/**
 * Live hub — live broadcasts only.
 * Route: /live
 *
 * Polls GET /live/matches every 60 s and lists streams with status = live.
 */

import { useMemo } from 'react';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { normaliseLiveStreams } from '@/lib/utils/liveStreamUtils';
import { LiveTab } from '@/pages/live/tabs';
import { useGetLiveStreamsQuery } from '@/store/api/liveApi';
import { Container } from '@/ui/Container';
import { ListError } from '@/ui/ListState';
import { LoaderBlock } from '@/ui/Loader';

function LiveHubSkeleton() {
  return <LoaderBlock label="Loading live matches" className="py-16" />;
}

export default function Live() {
  const { data, isLoading, isError, refetch } = useGetLiveStreamsQuery(undefined, {
    pollingInterval: 60_000,
  });

  const streams = useMemo(() => normaliseLiveStreams(data), [data]);
  const liveStreams = useMemo(() => streams.filter((item) => item.stream?.status === 'live'), [streams]);

  return (
    <div>
      <AppSubpageHeader title="LIVE" />
      <Container className="pt-2">
        {isLoading ? (
          <LiveHubSkeleton />
        ) : isError ? (
          <ListError message="Could not load live matches." onRetry={refetch} />
        ) : (
          <LiveTab streams={liveStreams} />
        )}
      </Container>
    </div>
  );
}
