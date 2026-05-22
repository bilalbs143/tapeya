/**
 * Live module — live and upcoming broadcast listings.
 * Route: /live
 */

import { AppSubpageHeader } from '@/components/AppSubpageHeader';
import { CLOUDFRONT_APP_BASE } from '@/lib/constants/assets';
import { LIVE_EVENTS, UPCOMING_EVENTS } from '@/pages/live/liveData';
import { LiveTab, UpcomingTab } from '@/pages/live/tabs';
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
/** 12px mobile / 16px desktop; fixed 100px width (overrides profile flex-1). */
const liveTabTriggerClass = `${profileTriggerClass} w-[120px] md:w-[150px] flex-none shrink-0 md:text-[14px]`;

export default function Live() {
  const liveCount = LIVE_EVENTS.length;
  const upcomingCount = UPCOMING_EVENTS.length;

  return (
    <div className="min-h-screen bg-black">
      <AppSubpageHeader title="LIVE" />
      <Container className="pt-2">
        <Tabs defaultValue="live" className="w-full">
          <TabsList className={`${liveTabListClass} mb-4`}>
            <TabsTrigger value="live" className={`${liveTabTriggerClass} gap-1.5`}>
              <span>Live ({liveCount})</span>
              <img
                src={voiceCircleLiveIcon}
                alt=""
                width={profileTabIconSize}
                height={profileTabIconSize}
                className={profileTabIconClass}
                aria-hidden
              />
            </TabsTrigger>
            <TabsTrigger value="upcoming" className={liveTabTriggerClass}>
              Upcoming ({upcomingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-0 focus:outline-none">
            <LiveTab events={LIVE_EVENTS} />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0 focus:outline-none">
            <UpcomingTab events={UPCOMING_EVENTS} />
          </TabsContent>
        </Tabs>
      </Container>
    </div>
  );
}
