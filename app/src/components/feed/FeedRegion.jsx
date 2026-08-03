import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { buildFeedTimelineRows, FEED_TIMELINE_ROW_GAP_PX } from '@/components/feed/buildFeedTimelineRows';
import ComposerTrigger from '@/components/feed/ComposerTrigger';
import { FeedHighlightWidget } from '@/components/feed/FeedHighlightWidget';
import { FeedReelsWidget } from '@/components/feed/FeedReelsWidget';
import { FeedShopWidget } from '@/components/feed/FeedShopWidget';
import { FeedSuggestedFollowsWidget } from '@/components/feed/FeedSuggestedFollowsWidget';
import FeedTabs from '@/components/feed/FeedTabs';
import { useCatalogCycle } from '@/hooks/useCatalogCycle';
import { useStickyUnderNavbar } from '@/hooks/useStickyUnderNavbar';
import { NAVBAR_OFFSET_CSS, STICKY_TABS_Z } from '@/lib/constants/layout';
import { composeDestination } from '@/lib/feed/composeDestination';
import PostCard from '@/pages/feed/PostCard';
import {
  FEED_LIST_ARG,
  useGetFollowingFeedQuery,
  useGetHomeFeedQuery,
  useGetMineFeedQuery,
  useGetSavedFeedQuery,
  useLazyGetFollowingFeedQuery,
  useLazyGetHomeFeedQuery,
  useLazyGetMineFeedQuery,
  useLazyGetSavedFeedQuery,
  useLazyPeekHomeFeedQuery,
} from '@/store/api/feedApi';
import { useGetHighlightsQuery } from '@/store/api/highlightApi';
import { REELS_LIST_ARG } from '@/store/api/postEngagementCache';
import { useGetReelsFeedQuery } from '@/store/api/reelsApi';
import { useGetBrandsQuery, useGetProductsQuery } from '@/store/api/shopApi';
import { SUGGESTED_USERS_ARG, useGetSuggestedUsersQuery } from '@/store/api/userApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';

const TABS = [
  { id: 'explore', label: 'Explore', shortLabel: 'Explore', Icon: ExploreIcon, requiresAuth: false },
  { id: 'following', label: 'Following', shortLabel: 'Following', Icon: FollowingIcon, requiresAuth: true },
  { id: 'mine', label: 'Mine', shortLabel: 'Mine', Icon: MineIcon, requiresAuth: true },
  { id: 'saved', label: 'Saved', shortLabel: 'Saved', Icon: SavedIcon, requiresAuth: true },
];

const SUGGESTED_FOLLOWS_REFILL_AT = 5;
const VIRTUAL_OVERSCAN = 6;
const EMPTY_LIST = Object.freeze([]);

function ExploreIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5 10 10l-.5 4.5 4.5-.5.5-4.5Z" />
    </svg>
  );
}

function FollowingIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a3 3 0 0 1 0 5.74" />
    </svg>
  );
}

function MineIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function SavedIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 21 12 16 5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function PlusIcon({ className = '' }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TimelineRow({ row, onSuggestedFollowed }) {
  if (row.type === 'post') {
    return <PostCard post={row.post} />;
  }
  if (row.type === 'shop') {
    return <FeedShopWidget title={row.title} products={row.products} brands={row.brands} />;
  }
  if (row.type === 'suggested') {
    return <FeedSuggestedFollowsWidget users={row.users} onFollowed={onSuggestedFollowed} />;
  }
  if (row.type === 'highlight') {
    return <FeedHighlightWidget highlights={row.highlights} />;
  }
  return null;
}

/**
 * Home feed timeline: Explore | Following | Mine | Saved tabs, infinite cursor load.
 * Explore client-cycles after cursor exhaustion ({@link useCatalogCycle}) with
 * occasional page-1 peeks for new posts — never replacing the scrolled RTK cache.
 * Tab chrome uses CSS sticky under the fixed navbar ({@link NAVBAR_OFFSET_CSS}).
 * Timeline rows are window-virtualized for a light DOM on long sessions.
 *
 * @param {{ embedded?: boolean, className?: string }} props
 */
export default function FeedRegion({ embedded: _embedded = false, className = '' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [tab, setTab] = useState('explore');
  const { sentinelRef, isStuck } = useStickyUnderNavbar();
  const loadMoreRef = useRef(null);
  const loadMoreLockRef = useRef(false);
  const suggestionRefillLockRef = useRef(false);
  const suggestionRefillQueuedRef = useRef(false);
  const timelineRef = useRef(null);
  const [scrollMargin, setScrollMargin] = useState(0);

  const exploreQuery = useGetHomeFeedQuery(FEED_LIST_ARG, {
    skip: tab !== 'explore',
  });
  const followingQuery = useGetFollowingFeedQuery(FEED_LIST_ARG, {
    skip: tab !== 'following' || !isAuthenticated,
  });
  const mineQuery = useGetMineFeedQuery(FEED_LIST_ARG, {
    skip: tab !== 'mine' || !isAuthenticated,
  });
  const savedQuery = useGetSavedFeedQuery(FEED_LIST_ARG, {
    skip: tab !== 'saved' || !isAuthenticated,
  });

  const [fetchMoreExplore] = useLazyGetHomeFeedQuery();
  const [fetchMoreFollowing] = useLazyGetFollowingFeedQuery();
  const [fetchMoreMine] = useLazyGetMineFeedQuery();
  const [fetchMoreSaved] = useLazyGetSavedFeedQuery();
  const [peekHomeFeed] = useLazyPeekHomeFeedQuery();
  const shouldLoadShop = tab === 'explore';
  const { data: brandsResponse } = useGetBrandsQuery(
    { all: true },
    {
      skip: !shouldLoadShop,
    },
  );
  const { data: popularResponse } = useGetProductsQuery(
    { is_popular: true, per_page: 9 },
    {
      skip: !shouldLoadShop,
    },
  );
  const { data: specialOfferResponse } = useGetProductsQuery(
    { is_special_offer: true, per_page: 9 },
    {
      skip: !shouldLoadShop,
    },
  );
  const { data: highlightsData } = useGetHighlightsQuery(
    { per_page: 12 },
    {
      skip: tab !== 'explore',
    },
  );
  const highlights = highlightsData ?? EMPTY_LIST;
  const shouldLoadSuggestions = tab === 'explore';
  const { data: suggestedUsersData, refetch: refetchSuggestions } = useGetSuggestedUsersQuery(SUGGESTED_USERS_ARG, {
    skip: !shouldLoadSuggestions,
  });
  const suggestedUsers = suggestedUsersData ?? EMPTY_LIST;
  const { data: reelsPage, isError: isReelsError } = useGetReelsFeedQuery(REELS_LIST_ARG);
  const stripReels = isReelsError ? EMPTY_LIST : (reelsPage?.items ?? EMPTY_LIST);

  const refillSuggestions = useCallback(async () => {
    if (!shouldLoadSuggestions) return;

    if (suggestionRefillLockRef.current) {
      suggestionRefillQueuedRef.current = true;
      return;
    }

    suggestionRefillLockRef.current = true;
    try {
      do {
        suggestionRefillQueuedRef.current = false;
        await refetchSuggestions().unwrap();
      } while (suggestionRefillQueuedRef.current);
    } catch {
      // Keep the remaining buffered users visible; a later follow can retry.
    } finally {
      suggestionRefillLockRef.current = false;
    }
  }, [refetchSuggestions, shouldLoadSuggestions]);

  const active = tab === 'following' ? followingQuery : tab === 'mine' ? mineQuery : tab === 'saved' ? savedQuery : exploreQuery;
  const items = active.data?.items ?? EMPTY_LIST;
  const hasMore = Boolean(active.data?.hasMore);
  const nextCursor = active.data?.nextCursor ?? null;
  const isInitialLoading = active.isLoading || (active.isFetching && items.length === 0);
  const isFetchingMore = active.isFetching && items.length > 0;
  const isError = active.isError;
  const brands = brandsResponse?.data ?? EMPTY_LIST;
  const popularProducts = popularResponse?.data ?? EMPTY_LIST;
  const specialOfferProducts = specialOfferResponse?.data ?? EMPTY_LIST;
  const shopCollections = useMemo(
    () =>
      [
        {
          id: 'popular',
          title: 'Popular Products',
          products: popularProducts,
        },
        {
          id: 'special-offers',
          title: 'Special Offers',
          products: specialOfferProducts,
        },
      ].filter((collection) => collection.products.length > 0),
    [popularProducts, specialOfferProducts],
  );

  const peekPage = useCallback(() => peekHomeFeed(FEED_LIST_ARG, false).unwrap(), [peekHomeFeed]);

  const {
    displayCycles,
    freshItems,
    freshFromCycle,
    advance: advanceExploreCycle,
  } = useCatalogCycle({
    enabled: tab === 'explore',
    items: tab === 'explore' ? items : EMPTY_LIST,
    hasMore: tab === 'explore' ? hasMore : true,
    peekPage,
  });

  const timelineRows = useMemo(
    () =>
      buildFeedTimelineRows({
        posts: items,
        tab,
        shopCollections,
        brands,
        suggestedUsers,
        highlights,
        cycles: displayCycles,
        freshItems,
        freshFromCycle,
      }),
    [items, tab, shopCollections, brands, suggestedUsers, highlights, displayCycles, freshItems, freshFromCycle],
  );

  const shouldRefillSuggestions = suggestedUsers.length <= SUGGESTED_FOLLOWS_REFILL_AT + 1;
  const onSuggestedFollowed = shouldRefillSuggestions ? refillSuggestions : undefined;

  useLayoutEffect(() => {
    const timeline = timelineRef.current;
    if (!timeline) {
      setScrollMargin(0);
      return undefined;
    }

    const updateScrollMargin = () => {
      const nextScrollMargin = window.scrollY + timeline.getBoundingClientRect().top;
      setScrollMargin((current) => (current === nextScrollMargin ? current : nextScrollMargin));
    };

    updateScrollMargin();

    if (typeof ResizeObserver === 'undefined') return undefined;

    // Composer / Reels height changes shift the timeline origin for window virtualization.
    const observer = new ResizeObserver(updateScrollMargin);
    const feedColumn = timeline.parentElement;
    if (feedColumn) observer.observe(feedColumn);
    observer.observe(timeline);

    return () => observer.disconnect();
  }, [tab, stripReels.length, isError, isInitialLoading, items.length, timelineRows.length]);

  const virtualizer = useWindowVirtualizer({
    count: timelineRows.length,
    estimateSize: (index) => timelineRows[index]?.estimateSize ?? 420,
    overscan: VIRTUAL_OVERSCAN,
    gap: FEED_TIMELINE_ROW_GAP_PX,
    scrollMargin,
    getItemKey: (index) => timelineRows[index]?.key ?? index,
  });

  const loadMore = useCallback(() => {
    if (isInitialLoading || isFetchingMore || loadMoreLockRef.current) {
      return;
    }

    if (hasMore && nextCursor) {
      loadMoreLockRef.current = true;
      const arg = { ...FEED_LIST_ARG, cursor: nextCursor };
      const req =
        tab === 'following'
          ? fetchMoreFollowing(arg)
          : tab === 'mine'
            ? fetchMoreMine(arg)
            : tab === 'saved'
              ? fetchMoreSaved(arg)
              : fetchMoreExplore(arg);
      Promise.resolve(req).finally(() => {
        loadMoreLockRef.current = false;
      });
      return;
    }

    // Explore-only client cycle (+ soft freshness). Never replaces the scrolled RTK cache.
    if (tab !== 'explore') return;

    loadMoreLockRef.current = true;
    advanceExploreCycle();
    requestAnimationFrame(() => {
      loadMoreLockRef.current = false;
    });
  }, [
    hasMore,
    nextCursor,
    isInitialLoading,
    isFetchingMore,
    tab,
    fetchMoreExplore,
    fetchMoreFollowing,
    fetchMoreMine,
    fetchMoreSaved,
    advanceExploreCycle,
  ]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { root: null, rootMargin: '240px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const onSelectTab = (next) => {
    const meta = TABS.find((item) => item.id === next);
    if (meta?.requiresAuth && !isAuthenticated) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setTab(next);
  };

  const onRetry = () => {
    active.refetch?.();
  };

  const emptyCopy =
    tab === 'following'
      ? 'No posts from people you follow yet.'
      : tab === 'mine'
        ? 'You haven’t posted yet.'
        : tab === 'saved'
          ? 'No saved posts yet.'
          : 'No posts yet — be the first.';

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <section className={`relative bg-black ${className}`} data-feed-region data-feed-stuck={isStuck ? '1' : '0'}>
      {/* In-flow sentinel (Shop/Scorecard pattern) — marks the sticky threshold under the navbar. */}
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      <div
        className={`sticky -mx-4 px-4 transition-colors duration-200 ${
          isStuck ? 'border-b border-white/10 bg-black' : 'border-b border-transparent bg-transparent'
        }`}
        style={{ top: NAVBAR_OFFSET_CSS, zIndex: STICKY_TABS_Z }}
      >
        <div className="flex items-center gap-2 pb-2">
          <FeedTabs tabs={TABS} activeId={tab} onChange={onSelectTab} />
          <Link
            to={composeDestination(undefined, true)}
            className="bg-brand text-ink flex size-9 shrink-0 items-center justify-center rounded-full shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-transform active:scale-95"
            aria-label="Create post"
            title="Create post"
          >
            <PlusIcon className="size-4" />
          </Link>
        </div>
      </div>

      <ComposerTrigger />

      <div className="-mx-4 flex flex-col gap-0.5 bg-black pb-8">
        <FeedReelsWidget reels={stripReels} />

        {isError && (
          <div className="flex flex-col items-center gap-3 py-6">
            <p className="text-center text-[14px] text-red-400">Couldn’t load the feed.</p>
            <button
              type="button"
              onClick={onRetry}
              className="bg-surface-raised rounded-full px-4 py-2 text-[13px] font-semibold text-white"
            >
              Retry
            </button>
          </div>
        )}

        {!isError && items.length === 0 && !isInitialLoading && (
          <p className="text-muted py-8 text-center text-[14px]">{emptyCopy}</p>
        )}

        {!isError && timelineRows.length > 0 ? (
          <div ref={timelineRef} className="relative w-full" style={{ height: `${virtualizer.getTotalSize()}px` }}>
            {virtualItems.map((virtualRow) => {
              const row = timelineRows[virtualRow.index];
              if (!row) return null;

              return (
                <div
                  key={row.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full"
                  style={{
                    transform: `translateY(${virtualRow.start - scrollMargin}px)`,
                  }}
                >
                  <TimelineRow row={row} onSuggestedFollowed={onSuggestedFollowed} />
                </div>
              );
            })}
          </div>
        ) : null}

        {isInitialLoading ? (
          <div className="flex items-center justify-center py-16" role="status" aria-label="Loading feed">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-white/70" aria-hidden />
          </div>
        ) : null}

        <div ref={loadMoreRef} className="h-8" aria-hidden />
        {isFetchingMore ? (
          <div className="flex items-center justify-center py-4" role="status" aria-label="Loading more">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-white/70" aria-hidden />
          </div>
        ) : null}
      </div>
    </section>
  );
}
