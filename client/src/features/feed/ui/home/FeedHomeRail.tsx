import { useFeedHomeRailData } from '@/features/feed/lib/useFeedHomeData';

import { HomeRail } from './HomeRail';

/** Home shell rail (next match + products) — not Explore suggestions. */
export function FeedHomeRail() {
  const { products, nextMatch } = useFeedHomeRailData();
  return <HomeRail nextMatch={nextMatch} products={products} />;
}
