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
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { normaliseLiveStreamMatches } from '@/lib/utils/liveStreamUtils';
import { LiveTab, UpcomingTab } from '@/pages/live/tabs';
import { useGetLiveMatchesQuery } from '@/store/api/liveApi';
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
        <div key={i} className="h-[200px] animate-pulse rounded-[20px] bg-[#1A1A1A]" />
      ))}
    </div>
  );
}

function LiveHubError({ onRetry }) {
  return (
    <div className="py-12 text-center">
      <p className="text-[13px] text-[#A2A6AB]">Failed to load live matches.</p>
      <button type="button" onClick={onRetry} className="mt-3 text-[13px] font-medium text-white underline underline-offset-2">
        Try again
      </button>
    </div>
  );
}

export default function Live() {
  const { data, isLoading, isError, refetch } = useGetLiveMatchesQuery(undefined, {
    pollingInterval: 60_000,
  });

  const matches = useMemo(() => normaliseLiveStreamMatches(data), [data]);

  const liveMatches = useMemo(() => matches.filter((m) => m.stream?.status === 'live'), [matches]);

  const startingMatches = useMemo(() => matches.filter((m) => m.stream?.status === 'starting'), [matches]);

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
                <span>Live ({liveMatches.length})</span>
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
                Starting ({startingMatches.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="mt-0 focus:outline-none">
              <LiveTab matches={liveMatches} />
            </TabsContent>

            <TabsContent value="starting" className="mt-0 focus:outline-none">
              <UpcomingTab matches={startingMatches} />
            </TabsContent>
          </Tabs>
        )}
      </Container>
    </div>
  );
}
