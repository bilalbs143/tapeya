/**
 * Reels
 *
 * Explore / Following / My Videos / Saved tabs with vertical snap scroll.
 * Routes: /reels , /reels/:reelId (shared deep link)
 *
 * Coding guidelines: docs/Coding guidelines.md (§2 selectors)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';

import { AppSubpageBackButton } from '@/components/AppSubpageHeader';
import { OpenInAppBanner } from '@/components/deepLinks/OpenInAppBanner';
import { buildCycledReelRows } from '@/features/reels/buildCycledReelRows';
import { isInPlayerWindow } from '@/features/reels/reelPlayerWindow';
import { setReelsFocusMode } from '@/features/reels/reelsFocusModeStore';
import { useReelPrefetch } from '@/features/reels/useReelPrefetch';
import { useReelProcessingChannel } from '@/features/reels/useReelProcessingChannel';
import { useCatalogCycle } from '@/hooks/useCatalogCycle';
import { NAVBAR_HERO_CONTROL_OFFSET } from '@/lib/constants/layout';
import { buildReelSharePath } from '@/lib/share';
import { REELS_LIST_ARG } from '@/store/api/postEngagementCache';
import {
  useGetFollowingReelsQuery,
  useGetMyReelsQuery,
  useGetReelQuery,
  useGetReelsFeedQuery,
  useGetSavedReelsQuery,
  useLazyGetFollowingReelsQuery,
  useLazyGetMyReelsQuery,
  useLazyGetReelsFeedQuery,
  useLazyGetSavedReelsQuery,
  useLazyPeekReelsFeedQuery,
} from '@/store/api/reelsApi';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/selectors';

import ReelItem from './ReelItem';

const EMPTY_LIST = Object.freeze([]);

const TAB_EXPLORE = 'explore';
const TAB_FOLLOWING = 'following';
const TAB_MY_VIDEOS = 'my-videos';
const TAB_SAVED = 'saved';

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

function MyVideosIcon({ className = '' }) {
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
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
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

const REELS_TABS = [
  { id: TAB_EXPLORE, label: 'Explore', shortLabel: 'Explore', Icon: ExploreIcon, requiresAuth: false },
  { id: TAB_FOLLOWING, label: 'Following', shortLabel: 'Following', Icon: FollowingIcon, requiresAuth: true },
  { id: TAB_MY_VIDEOS, label: 'My Videos', shortLabel: 'Mine', Icon: MyVideosIcon, requiresAuth: true },
  { id: TAB_SAVED, label: 'Saved', shortLabel: 'Saved', Icon: SavedIcon, requiresAuth: true },
];

function UploadIcon({ className = '' }) {
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
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

export default function Reels() {
  const navigate = useNavigate();
  const location = useLocation();
  const { reelId: reelIdParam } = useParams();
  const deepReelId = reelIdParam && /^\d+$/.test(reelIdParam) ? Number(reelIdParam) : null;
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  useReelProcessingChannel();

  useEffect(() => {
    return () => setReelsFocusMode(false);
  }, []);

  const initialTab = [TAB_MY_VIDEOS, TAB_FOLLOWING, TAB_SAVED].includes(location.state?.tab) ? location.state.tab : TAB_EXPLORE;
  const [activeTab, setActiveTab] = useState(!isAuthenticated && initialTab !== TAB_EXPLORE ? TAB_EXPLORE : initialTab);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const deepReelQuery = useGetReelQuery(deepReelId, { skip: !deepReelId });
  const exploreQuery = useGetReelsFeedQuery({ perPage: 10 }, { skip: activeTab !== TAB_EXPLORE });
  const followingQuery = useGetFollowingReelsQuery({ perPage: 10 }, { skip: activeTab !== TAB_FOLLOWING || !isAuthenticated });
  const mineQuery = useGetMyReelsQuery({ perPage: 10 }, { skip: activeTab !== TAB_MY_VIDEOS || !isAuthenticated });
  const savedQuery = useGetSavedReelsQuery({ perPage: 10 }, { skip: activeTab !== TAB_SAVED || !isAuthenticated });
  const [fetchMoreExplore] = useLazyGetReelsFeedQuery();
  const [peekReelsFeed] = useLazyPeekReelsFeedQuery();
  const [fetchMoreFollowing] = useLazyGetFollowingReelsQuery();
  const [fetchMoreMine] = useLazyGetMyReelsQuery();
  const [fetchMoreSaved] = useLazyGetSavedReelsQuery();
  const loadMoreLockRef = useRef(false);

  const selectTab = useCallback(
    (tabId) => {
      const tab = REELS_TABS.find((item) => item.id === tabId);
      if (tab?.requiresAuth && !isAuthenticated) {
        navigate('/login', { state: { from: location } });
        return;
      }
      setActiveTab(tabId);
    },
    [isAuthenticated, location, navigate],
  );

  const activeQuery =
    activeTab === TAB_EXPLORE
      ? exploreQuery
      : activeTab === TAB_FOLLOWING
        ? followingQuery
        : activeTab === TAB_SAVED
          ? savedQuery
          : mineQuery;

  const baseReels = useMemo(() => {
    const playable = (activeQuery.data?.items ?? []).filter((item) => item.status !== 'uploading');
    if (activeTab !== TAB_EXPLORE || !deepReelId) return playable;

    const deep = deepReelQuery.currentData ?? playable.find((item) => Number(item.id) === deepReelId) ?? null;
    // Wait for the deep-linked reel — don't flash explore[0] (wrong video).
    if (!deep) return [];

    return [deep, ...playable.filter((item) => Number(item.id) !== Number(deep.id))];
  }, [activeQuery.data?.items, activeTab, deepReelId, deepReelQuery.currentData]);

  const nextCursor = activeQuery.data?.nextCursor ?? null;
  const hasMore = Boolean(activeQuery.data?.hasMore);
  const isFetchingPage = activeQuery.isFetching;
  const isInitialLoading =
    activeQuery.isLoading || (Boolean(deepReelId) && baseReels.length === 0 && !deepReelQuery.isError);

  const peekPage = useCallback(
    () => peekReelsFeed(REELS_LIST_ARG, false).unwrap(),
    [peekReelsFeed],
  );

  const {
    displayCycles,
    freshItems,
    freshFromCycle,
    advance: advanceExploreCycle,
  } = useCatalogCycle({
    enabled: activeTab === TAB_EXPLORE,
    items: activeTab === TAB_EXPLORE ? baseReels : EMPTY_LIST,
    hasMore: activeTab === TAB_EXPLORE ? hasMore : true,
    peekPage,
  });

  const reelRows = useMemo(() => {
    if (activeTab !== TAB_EXPLORE) {
      return baseReels.map((reel) => ({ key: `reel-${reel.id}`, reel }));
    }
    return buildCycledReelRows({
      reels: baseReels,
      cycles: displayCycles,
      freshItems,
      freshFromCycle,
    });
  }, [activeTab, baseReels, displayCycles, freshItems, freshFromCycle]);

  const reels = useMemo(() => reelRows.map((row) => row.reel), [reelRows]);

  useReelPrefetch(reels, activeIndex);

  useEffect(() => {
    if (deepReelId) setActiveTab(TAB_EXPLORE);
  }, [deepReelId]);

  useEffect(() => {
    setActiveIndex(0);
    if (containerRef.current) containerRef.current.scrollTop = 0;
  }, [activeTab, deepReelId]);

  const loadMore = useCallback(() => {
    if (loadMoreLockRef.current) return;

    if (hasMore && nextCursor) {
      if (isFetchingPage || isInitialLoading) return;
      loadMoreLockRef.current = true;
      const arg = { ...REELS_LIST_ARG, cursor: nextCursor };
      const req =
        activeTab === TAB_EXPLORE
          ? fetchMoreExplore(arg)
          : activeTab === TAB_FOLLOWING
            ? fetchMoreFollowing(arg)
            : activeTab === TAB_SAVED
              ? fetchMoreSaved(arg)
              : fetchMoreMine(arg);
      Promise.resolve(req).finally(() => {
        loadMoreLockRef.current = false;
      });
      return;
    }

    // Explore-only client cycle (+ soft freshness). Never replaces the scrolled RTK cache.
    if (activeTab !== TAB_EXPLORE) return;

    loadMoreLockRef.current = true;
    advanceExploreCycle();
    requestAnimationFrame(() => {
      loadMoreLockRef.current = false;
    });
  }, [
    activeTab,
    advanceExploreCycle,
    fetchMoreExplore,
    fetchMoreFollowing,
    fetchMoreMine,
    fetchMoreSaved,
    hasMore,
    isFetchingPage,
    isInitialLoading,
    nextCursor,
  ]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    const index = Math.round(scrollTop / clientHeight);
    setActiveIndex(index);

    if (scrollHeight - scrollTop - clientHeight < clientHeight * 1.5) {
      loadMore();
    }
  }, [loadMore]);

  const emptyCopy =
    deepReelId && deepReelQuery.isError
      ? 'This reel is unavailable.'
      : activeTab === TAB_EXPLORE
        ? 'No reels to explore yet.'
        : activeTab === TAB_FOLLOWING
          ? 'No reels from people you follow yet.'
          : activeTab === TAB_SAVED
            ? 'No saved reels yet.'
            : 'You have not uploaded any reels yet.';

  return (
    <div className="fixed inset-0 z-30 bg-black lg:left-[280px]">
      <div className="lg:border-surface-border relative h-full w-full lg:mx-auto lg:max-w-[430px] lg:border-x">
        <div className="pointer-events-none absolute inset-x-0 z-10 px-3" style={{ top: NAVBAR_HERO_CONTROL_OFFSET }}>
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="shrink-0">
              <AppSubpageBackButton onClick={() => navigate(-1)} aria-label="Go Back" />
            </div>

            <nav className="min-w-0 flex-1" aria-label="Reels feeds">
              <div className="flex items-center gap-0.5 rounded-full border border-white/12 bg-black/55 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
                {REELS_TABS.map(({ id, label, shortLabel, Icon }) => {
                  const active = activeTab === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => selectTab(id)}
                      aria-current={active ? 'page' : undefined}
                      aria-label={label}
                      title={label}
                      className={`flex items-center justify-center gap-1.5 rounded-full text-[12px] font-semibold tracking-wide transition-all duration-200 ${
                        active
                          ? 'bg-brand text-ink min-w-0 flex-1 px-3 py-2 shadow-sm'
                          : 'size-9 shrink-0 text-white/65 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="size-4 shrink-0" />
                      {active ? <span className="truncate">{shortLabel}</span> : null}
                    </button>
                  );
                })}
              </div>
            </nav>

            <Link
              to="/reels/upload"
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/12 bg-black/55 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-colors hover:bg-white/10"
              aria-label="Upload Reel"
              title="Upload Reel"
            >
              <UploadIcon className="size-4" />
            </Link>
          </div>
        </div>

        {deepReelId ? <OpenInAppBanner path={buildReelSharePath(deepReelId)} /> : null}

        <div
          key={deepReelId ?? 'explore'}
          ref={containerRef}
          onScroll={handleScroll}
          className="h-full w-full [scroll-snap-type:y_mandatory] overflow-y-scroll [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reelRows.length === 0 && !isInitialLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-sm font-medium text-white">{emptyCopy}</p>
              {activeTab === TAB_MY_VIDEOS ? (
                <button type="button" onClick={() => navigate('/reels/upload')} className="text-brand text-sm font-semibold">
                  Upload Your First Reel
                </button>
              ) : null}
            </div>
          ) : null}

          {reelRows.map((row, index) => (
            <ReelItem
              key={row.key}
              reel={row.reel}
              isActive={index === activeIndex}
              inPlayerWindow={isInPlayerWindow(index, activeIndex)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
