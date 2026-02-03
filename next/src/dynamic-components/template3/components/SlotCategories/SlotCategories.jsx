'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import GameCard from '@/dynamic-components/template3/components/GameCard/GameCard';
import LazyImage from '@/dynamic-components/template3/components/LazyImage/LazyImage';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllGames } from '@/website/websiteAction';

function SlotCategories() {
  const dispatch = useDispatch();
  const { t } = useTranslations();

  const { allGamesData, allGamesLoader, selectedProviderId, allProvidersData } =
    useSelector((state) => state.website);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [accumulatedGames, setAccumulatedGames] = useState([]);

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

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  const loadMore = useCallback(async () => {
    if (hasMore && !allGamesLoader && !isLoadingMore) {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;

      try {
        const filterParams = { is_slot_game: true };

        // Add provider filter if selected
        if (selectedProviderId) {
          filterParams.provider_id = selectedProviderId;
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
    selectedProviderId,
    dispatch,
    t,
  ]);

  // Initial load when provider changes
  useEffect(() => {
    const filterParams = { is_slot_game: true };

    if (selectedProviderId) {
      filterParams.provider_id = selectedProviderId;
    }

    const params = { page: 1, perPage: 60, filter: filterParams };
    dispatch(fetchAllGames(params)).catch((_) => {
      toast.error(t('failed_to_load_games'));
    });
  }, [dispatch, t, selectedProviderId]);

  return (
    <section className="py-8 md:py-10">
      <div className="container mx-auto px-4">
        {/* Games Grid */}
        {accumulatedGames.length > 0 ? (
          <div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-5 xl:grid-cols-6">
              {accumulatedGames.map((game, index) => (
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
              border="border-[#D3AF37]"
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
              className="inline-flex transform cursor-pointer items-center justify-center rounded-[10px] bg-[#E8D25E] px-8 py-3 font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all hover:scale-105 hover:bg-[#D3AF37]/90 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {allGamesLoader || isLoadingMore ? (
                <CommonLoader
                  size="sm"
                  border="border-[#E8D25E]"
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
              className="inline-flex transform cursor-pointer items-center justify-center rounded-[10px] border-2 border-[#E8D25E] bg-[#D3AF37]/10 px-6 py-3 font-semibold text-[#D3AF37] transition-all hover:scale-105 hover:bg-[#D3AF37]/20 active:scale-95"
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
              <CommonLoader size="xl" border="border-[#D3AF37]" />
              <p className="text-lg text-white/70">
                {t('loading_games_message')}
              </p>
            </div>
          </div>
        )}

        {/* No Games Available */}
        {accumulatedGames.length === 0 &&
          !allGamesLoader &&
          currentPage === 1 &&
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
                className="btn-hover-fill rounded-full bg-[#D3AF37] px-4 py-2 text-white"
                data-hover={t('reload_games')}
              >
                {t('reload_games')}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default SlotCategories;
