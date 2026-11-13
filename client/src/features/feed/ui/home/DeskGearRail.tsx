import { useGetHomePopularProductsQuery } from '@/features/feed/api/homeApi';

import { HomeRail } from './HomeRail';

/** Always-on desk widget — “Gear near you” shop picks (same Card chrome as media rail). */
export function DeskGearRail() {
  const { data: products = [] } = useGetHomePopularProductsQuery({ perPage: 4 });
  if (!products.length) return null;
  return <HomeRail products={products} />;
}
