/**
 * Live module — live and starting-soon broadcast listings.
 * Route: /live
 *
 * Polls GET /live/matches every 60 s. Splits results into "Live Now" (stream
 * status = live) and "Starting Soon" (stream status = starting).
 * API returns open-tournament matches only.
 */

import { useMemo } from 'react';

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { LIVE_STREAM_THUMBNAIL_ASPECT_CLASS } from '@/components/live/LiveStreamThumbnail';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { normaliseLiveStreams } from '@/lib/utils/liveStreamUtils';
import { LiveTab, UpcomingTab } from '@/pages/live/tabs';
import { useGetLiveStreamsQuery } from '@/store/api/liveApi';
import { Container } from '@/ui/Container';
import {
  profileListClass,
  profileTabIconClass,
  profileTabIconSize,
  profileTriggerClass,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/ui/Tabs';

const voiceCircleLiveIcon = `${CLOUDFRONT_APP_BASE}/images/icons/voice-cricle-live.svg`;

const liveTabListClass = `${profileListClass} justify-center`;
/** 12px mobile / 16px desktop; fixed width overrides profile flex-1. */
const liveTabTriggerClass = `${profileTriggerClass} w-[120px] md:w-[150px] flex-none shrink-0 md:text-[14px]`;

function LiveHubSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 pb-6 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-surface-border overflow-hidden rounded-[20px]">
          <div className={`bg-surface-deep w-full animate-pulse ${LIVE_STREAM_THUMBNAIL_ASPECT_CLASS}`} />
          <div className="space-y-2 px-4 py-4">
            <div className="bg-surface-deep h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-surface-deep h-3 w-1/2 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function LiveHubError({ onRetry }) {
  return (
    <div className="py-12 text-center">
      <p className="text-muted text-[13px]">Failed to load live matches.</p>
      <button type="button" onClick={onRetry} className="mt-3 text-[13px] font-medium text-white underline underline-offset-2">
        Try Again
      </button>
    </div>
  );
}

export default function Live() {
  const { data, isLoading, isError, refetch } = useGetLiveStreamsQuery(undefined, {
    pollingInterval: 60_000,
  });

  const streams = useMemo(() => normaliseLiveStreams(data), [data]);

  const liveStreams = useMemo(() => streams.filter((item) => item.stream?.status === 'live'), [streams]);

  const startingStreams = useMemo(() => streams.filter((item) => item.stream?.status === 'starting'), [streams]);

  return (
    <div>
      <AppSubpageHeader title="LIVE" />
      <Container className="pt-2">
        {isLoading ? (
          <LiveHubSkeleton />
        ) : isError ? (
          <LiveHubError onRetry={refetch} />
        ) : (
          <Tabs defaultValue="live" className="w-full">
            <TabsList className={`${liveTabListClass} mb-4`}>
              <TabsTrigger value="live" className={`${liveTabTriggerClass} gap-1.5`}>
                <span>Live ({liveStreams.length})</span>
                <img
                  src={voiceCircleLiveIcon}
                  alt=""
                  width={profileTabIconSize}
                  height={profileTabIconSize}
                  className={profileTabIconClass}
                  aria-hidden
                />
              </TabsTrigger>
              <TabsTrigger value="starting" className={liveTabTriggerClass}>
                Starting ({startingStreams.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="mt-0 focus:outline-none">
              <LiveTab streams={liveStreams} />
            </TabsContent>

            <TabsContent value="starting" className="mt-0 focus:outline-none">
              <UpcomingTab streams={startingStreams} />
            </TabsContent>
          </Tabs>
        )}
      </Container>
    </div>
  );
}
