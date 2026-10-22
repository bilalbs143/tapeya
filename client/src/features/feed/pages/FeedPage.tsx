import { useShellRail } from '@/shared/layout';

import { FeedPageBody } from '../ui/FeedPageBody';
import { FeedHomeRail } from '../ui/home/FeedHomeRail';
import { useFeedPage } from '../ui/useFeedPage';

/** Home feed — four tabs; interstitial bands (reels, shop, etc.) sit in the scroll column. */
export default function FeedPage() {
  useShellRail(FeedHomeRail);
  const flow = useFeedPage();
  return <FeedPageBody flow={flow} />;
}
