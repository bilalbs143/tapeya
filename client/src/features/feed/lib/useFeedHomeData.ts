import { useGetDramaSerialsQuery } from '@/features/entertainment';
import { useGetQuickMatchesQuery } from '@/features/matches';

import { selectUserId } from '@/shared/store/authSlice';
import { useAppSelector } from '@/shared/store/hooks';

import {
  useGetHomeHeroSlidersQuery,
  useGetHomeHighlightsQuery,
  useGetHomeLiveScoresQuery,
  useGetHomeLiveStreamsQuery,
  useGetHomePopularProductsQuery,
} from '../api/homeApi';
import type { HomeNextMatch } from '../model/homeSchemas';

function pickNextMatch(items: ReturnType<typeof useGetQuickMatchesQuery>['data']): HomeNextMatch | null {
  const match = items?.items.find((m: { section: string }) => m.section === 'scheduled' || m.section === 'toss');
  if (!match) return null;
  const opponent = match.away ?? match.home;
  if (!opponent) return null;
  return {
    id: match.id,
    opponent: { name: opponent.name, short: opponent.short },
    date: match.matchDate ?? 'TBD',
    time: match.matchTime ?? 'TBD',
    venue: match.venueName ?? 'Venue TBD',
  };
}

/** Live scores, streams, products, highlights, next match for Home chrome. */
export function useFeedHomeWidgets(enabled: boolean) {
  const userId = useAppSelector(selectUserId);
  const scores = useGetHomeLiveScoresQuery(undefined, {
    skip: !enabled,
    pollingInterval: enabled ? 60_000 : 0,
  });
  const streams = useGetHomeLiveStreamsQuery(undefined, {
    skip: !enabled,
    // Safety net — primary updates come from private `live-hub` (useLiveHubChannel).
    pollingInterval: enabled ? 60_000 : 0,
  });
  const products = useGetHomePopularProductsQuery({ perPage: 9 }, { skip: !enabled });
  const highlights = useGetHomeHighlightsQuery({ perPage: 12 }, { skip: !enabled });
  const serials = useGetDramaSerialsQuery({ perPage: 12 }, { skip: !enabled });
  const heroSliders = useGetHomeHeroSlidersQuery(undefined, { skip: !enabled });
  const { data: quick } = useGetQuickMatchesQuery(undefined, {
    skip: !enabled || userId == null,
  });

  // Hero banners failing must not blank the whole home chrome.
  const homeError = Boolean(
    enabled && (scores.isError || streams.isError || products.isError || highlights.isError || serials.isError)
  );

  function refetchHome() {
    void scores.refetch();
    void streams.refetch();
    void products.refetch();
    void highlights.refetch();
    void serials.refetch();
    void heroSliders.refetch();
  }

  return {
    matches: scores.data ?? [],
    streaming: streams.data ?? [],
    products: products.data ?? [],
    highlights: highlights.data ?? [],
    entertainments: serials.data ?? [],
    slides: heroSliders.data ?? [],
    slidesLoading: enabled && heroSliders.isLoading,
    liveCount: scores.data?.length ?? 0,
    nextMatch: pickNextMatch(quick),
    homeError,
    refetchHome,
  };
}

export function useFeedHomeRailData() {
  const userId = useAppSelector(selectUserId);
  const { data: products = [] } = useGetHomePopularProductsQuery({ perPage: 4 });
  const { data: quick } = useGetQuickMatchesQuery(undefined, { skip: userId == null });
  return {
    products,
    nextMatch: pickNextMatch(quick),
  };
}
