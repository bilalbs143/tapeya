import { useFeedHomeRailData } from '@/features/feed/lib/useFeedHomeData';

import { HomeRail } from './HomeRail';

/** Home shell rail — next match only; “Gear near you” lives in always-on `DeskGearRail`. */
export function FeedHomeRail() {
  const { nextMatch } = useFeedHomeRailData();
  return <HomeRail nextMatch={nextMatch} />;
}
