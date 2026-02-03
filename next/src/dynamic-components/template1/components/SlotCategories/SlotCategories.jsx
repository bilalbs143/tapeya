'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import GameCard from '@/dynamic-components/template1/components/GameCard/GameCard';
import LazyImage from '@/dynamic-components/template1/components/LazyImage/LazyImage.jsx';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllGames } from '@/website/websiteAction';
import { setSelectedProviderId } from '@/website/websiteSlice';

function SlotCategories() {
  const dispatch = useDispatch();
  const { t } = useTranslations();

  const FILTER_OPTIONS = useMemo(
    () => [
      { key: 'all', label: t('filter_all'), filter: null },
      {
        key: 'top',
        label: t('filter_top'),
        filter: { 'filter[is_recommended]': true },
      },
      {
        key: 'new',
        label: t('filter_new'),
        filter: { 'filter[is_new]': true },
      },
      {
        key: 'featured',
        label: t('filter_featured'),
        filter: { 'filter[is_trending]': true },
      },
    ],
    [t],
  );
  const { allGamesData, allGamesLoader, selectedProviderId } = useSelector(
    (state) => state.website,
  );

  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [accumulatedGames, setAccumulatedGames] = useState([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Extract games and pagination info from Redux state
  const { games, hasMore, currentPage } = useMemo(() => {
    if (!allGamesData || !allGamesData.data) {
      return { games: [], hasMore: false, currentPage: 1 };
    }

    const games = allGamesData.data || [];
    const meta = allGamesData.meta || {};

    return {
      games,
      hasMore: meta.current_page < meta.last_page,
      currentPage: meta.current_page || 1,
    };
  }, [allGamesData]);

  // Update accumulated games when new data arrives
  useEffect(() => {
    if (games.length > 0) {
      if (currentPage === 1) {
        // Reset for first page
        setAccumulatedGames(games);
      } else {
        // Append for subsequent pages
        setAccumulatedGames((prev) => {
          const existingIds = new Set(prev.map((g) => g.id));
          const newGames = games.filter((g) => !existingIds.has(g.id));
          return [...prev, ...newGames];
        });
      }
    } else if (currentPage === 1) {
      // Clear if no games on first page
      setAccumulatedGames([]);
    }
  }, [games, currentPage]);

  const filteredGames = accumulatedGames;

  const loadMore = useCallback(async () => {
    if (hasMore && !allGamesLoader && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      try {
        const currentFilter = FILTER_OPTIONS.find(
          (option) => option.key === activeFilter,
        );
        let filterParams = { is_slot_game: true };
        if (currentFilter?.filter) {
          filterParams = { ...currentFilter.filter, is_slot_game: true };
        }

        // Add provider filter if selected
        if (selectedProviderId) {
          filterParams.provider_id = selectedProviderId;
        }

        // Add search query to filter params if search query exists
        if (debouncedSearchQuery) {
          filterParams.name = debouncedSearchQuery;
        }

        const params = { page: nextPage, perPage: 60, filter: filterParams };

        await dispatch(fetchAllGames(params));
      } catch (_) {
        toast.error(t('failed_to_load_games'));
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [
    hasMore,
    allGamesLoader,
    isLoadingMore,
    currentPage,
    activeFilter,
    selectedProviderId,
    dispatch,
    t,
    FILTER_OPTIONS,
    debouncedSearchQuery,
  ]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  // Initial load when filters change
  useEffect(() => {
    const currentFilter = FILTER_OPTIONS.find(
      (option) => option.key === activeFilter,
    );
    let filterParams = { is_slot_game: true };
    if (currentFilter?.filter) {
      filterParams = { ...currentFilter.filter, is_slot_game: true };
    }

    // Add provider filter if selected
    if (selectedProviderId) {
      filterParams.provider_id = selectedProviderId;
    }

    // Add search query to filter params if search query exists
    if (debouncedSearchQuery) {
      filterParams.name = debouncedSearchQuery;
    }

    const params = { page: 1, perPage: 60, filter: filterParams };
    dispatch(fetchAllGames(params)).catch((_) => {
      toast.error(t('failed_to_load_games'));
    });
  }, [
    dispatch,
    t,
    debouncedSearchQuery,
    activeFilter,
    selectedProviderId,
    FILTER_OPTIONS,
  ]);

  const handleFilterChange = useCallback((filterKey) => {
    setActiveFilter(filterKey);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilter('all');
    setSearchQuery('');
    dispatch(setSelectedProviderId(null));
  }, [dispatch]);

  return (
    <section className="py-4 md:py-10">
      <div className="container mx-auto px-4">
        {/* Search and Filter Header */}
        <div className="mb-4 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
          <div className="md:max-w-1xl w-full max-w-xl">
            <div className="relative w-full">
              <div className="pointer-events-none absolute top-1/2 left-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-white/70 md:h-10 md:w-10">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    d="M21 21l-3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx="10"
                    cy="10"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>
              <span className="pointer-events-none absolute top-1/2 left-16 h-6 w-px -translate-y-1/2 bg-[#F25307] md:left-[3.25rem] md:h-7" />
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder={t('search_game_placeholder')}
                className="h-12 w-full rounded-full border-2 border-white/40 bg-transparent pr-5 pl-15 text-base text-white placeholder-white/60 outline-none focus:border-white/60 md:h-14"
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="grid w-full grid-cols-4 gap-3 md:flex md:flex-nowrap md:gap-4 md:overflow-visible">
              {FILTER_OPTIONS.map((option) => {
                const isActive = activeFilter === option.key;
                const base =
                  'inline-flex justify-center items-center w-full md:w-auto rounded-[60px] text-xs sm:text-sm md:text-sm font-semibold transition-colors duration-200 py-[10px] md:py-[12px] px-2 sm:px-4 md:px-[70px] cursor-pointer';
                return (
                  <button
                    key={option.key}
                    onClick={() => handleFilterChange(option.key)}
                    aria-pressed={isActive}
                    className={
                      isActive
                        ? `${base} btn-hover-fill border-2 border-[#FC7E09] bg-[#FC7E09] text-white`
                        : `${base} btn-hover-outline border-2 border-[#FC7E09] bg-transparent text-white/90`
                    }
                    data-hover={option.label}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(debouncedSearchQuery ||
          activeFilter !== 'all' ||
          selectedProviderId) && (
          <div className="mt-6 mb-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-white/60">{t('active_filters')}:</span>
              {activeFilter !== 'all' && (
                <span className="inline-flex cursor-pointer items-center rounded-full bg-[#FC7E09] px-3 py-1 text-xs text-white">
                  {
                    FILTER_OPTIONS.find((opt) => opt.key === activeFilter)
                      ?.label
                  }
                  <button
                    onClick={() => handleFilterChange('all')}
                    className="-mt-0.5 ml-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-xs leading-none hover:bg-white/20"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedProviderId && (
                <span className="inline-flex cursor-pointer items-center rounded-full bg-[#FC7E09] px-3 py-1 text-xs text-white">
                  {t('provider_filter')}
                  <button
                    onClick={() => dispatch(setSelectedProviderId(null))}
                    className="-mt-0.5 ml-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-xs leading-none hover:bg-white/20"
                  >
                    ×
                  </button>
                </span>
              )}
              {debouncedSearchQuery && (
                <span className="inline-flex items-center rounded-full bg-[#FC7E09] px-3 py-1 text-xs text-white">
                  &#34;{debouncedSearchQuery}&#34;
                  <button
                    onClick={() => setSearchQuery('')}
                    className="-mt-0.5 ml-2 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-xs leading-none hover:bg-white/20"
                  >
                    ×
                  </button>
                </span>
              )}
              {(debouncedSearchQuery ||
                activeFilter !== 'all' ||
                selectedProviderId) && (
                <button
                  onClick={clearAllFilters}
                  className="btn-hover-outline inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs text-white"
                >
                  {t('clear_all')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="mt-[35px]">
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
              {filteredGames.map((game, index) => (
                <GameCard
                  key={`${game.id}-${index}`}
                  game={game}
                  index={index}
                  className="h-full"
                  imageClassName="h-[165px] md:h-[220px] w-full"
                />
              ))}
            </div>
          </div>
        ) : null}

        {/* Loading Indicator */}
        {allGamesLoader && accumulatedGames.length > 0 && (
          <div className="py-6">
            <CommonLoader
              size="md"
              border="border-[#FC7E09]"
              className="w-full"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col items-center justify-center gap-4">
          {hasMore && (
            <button
              onClick={loadMore}
              disabled={allGamesLoader || isLoadingMore}
              className="inline-flex transform cursor-pointer items-center justify-center rounded-full bg-[#FC7E09] px-8 py-3 font-semibold text-white transition-all hover:scale-105 hover:bg-[#FC7E09]/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {allGamesLoader || isLoadingMore ? (
                <CommonLoader
                  size="sm"
                  border="border-[#FC7E09]"
                  className="text-white"
                />
              ) : (
                <>
                  {t('load_more_games')}
                  <svg
                    className="ml-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </>
              )}
            </button>
          )}

          {accumulatedGames.length > 60 && (
            <button
              onClick={scrollToTop}
              className="inline-flex transform cursor-pointer items-center justify-center rounded-full border-2 border-[#FC7E09] bg-[#FC7E09]/10 px-6 py-3 font-semibold text-[#FC7E09] transition-all hover:scale-105 hover:bg-[#FC7E09]/20 active:scale-95"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
              {t('back_to_top')}
            </button>
          )}
        </div>

        {/* Initial Loading State */}
        {currentPage === 1 &&
          allGamesLoader &&
          accumulatedGames.length === 0 && (
          <div className="py-16">
            <div className="flex flex-col items-center space-y-4">
              <CommonLoader size="xl" border="border-[#FC7E09]" />
              <p className="text-lg text-white/70">
                {t('loading_games_message')}
              </p>
            </div>
          </div>
        )}

        {/* No Search Results */}
        {filteredGames.length === 0 &&
          !allGamesLoader &&
          (debouncedSearchQuery ||
            activeFilter !== 'all' ||
            selectedProviderId) && (
          <div className="py-8 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <svg
                  className="h-8 w-8 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-3.5-3.5"
                  />
                </svg>
              </div>
              <p className="mb-2 text-lg text-white/70">
                {t('no_games_found')}
              </p>
              <p className="mb-4 text-sm text-white/50">
                {t('try_adjusting_search_or_filters')}
              </p>
              <button
                onClick={clearAllFilters}
                className="btn-hover-fill rounded-full bg-[#FC7E09] px-4 py-2 text-white"
                data-hover={t('clear_filters')}
              >
                {t('clear_filters')}
              </button>
            </div>
          </div>
        )}

        {/* No Games Available */}
        {accumulatedGames.length === 0 &&
          !allGamesLoader &&
          currentPage === 1 &&
          !debouncedSearchQuery &&
          activeFilter === 'all' &&
          !selectedProviderId && (
          <div className="py-8 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <svg
                  className="h-8 w-8 text-white/40"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="mb-2 text-lg text-white/70">
                {t('no_games_available')}
              </p>
              <p className="mb-4 text-sm text-white/50">
                {t('games_should_load_automatically')}
              </p>
              <button
                onClick={() =>
                  dispatch(
                    fetchAllGames({
                      page: 1,
                      perPage: 60,
                      filter: { is_slot_game: true },
                    }),
                  )
                }
                className="btn-hover-fill rounded-full bg-[#FC7E09] px-4 py-2 text-white"
                data-hover={t('reload_games')}
              >
                {t('reload_games')}
              </button>
            </div>
          </div>
        )}

        {/*<LazyImage*/}
        {/*  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SlotSubBanner.webp"*/}
        {/*  alt={t('money')}*/}
        {/*  width={1920}*/}
        {/*  height={700}*/}
        {/*  className="h-full w-full object-contain object-center pt-4"*/}
        {/*/>*/}
      </div>
    </section>
  );
}

export default SlotCategories;
