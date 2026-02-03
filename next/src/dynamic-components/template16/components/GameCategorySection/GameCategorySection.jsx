'use client';

import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import GameCard from '@/dynamic-components/template16/components/GameCard/GameCard';
import LazyImage from '@/dynamic-components/template16/components/LazyImage/LazyImage';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';
import { fetchAllGames, fetchAllProvider } from '@/website/websiteAction';
import { setSelectedProviderId } from '@/website/websiteSlice';

const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/';

function GameCategorySection() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const { handlePlayGame, isLaunching } = useGameLaunch();

  // Embla carousel for provider slider
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentPerPage, setCurrentPerPage] = useState(7);
  const [slideWidth, setSlideWidth] = useState('calc((100% - 96px) / 7)');

  // Local state
  const [selectedCategory, setSelectedCategory] = useState('slots');
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [accumulatedGames, setAccumulatedGames] = useState([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [failedLogos, setFailedLogos] = useState(new Set());
  const [selectedCasinoProvider, setSelectedCasinoProvider] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0);

  // Redux state
  const { allGamesData, allGamesLoader, allProvidersData, selectedProviderId } =
    useSelector((state) => state.website);

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

  // Update accumulated games when new data arrives and preserve scroll
  useEffect(() => {
    const restoreScroll = () => {
      if (savedScrollPosition > 0) {
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
          window.scrollTo({
            top: savedScrollPosition,
            behavior: 'instant',
          });
        }, 0);
      }
    };

    if (games.length > 0) {
      if (currentPage === 1) {
        setAccumulatedGames(games);
        restoreScroll();
      } else {
        setAccumulatedGames((prev) => {
          const existingIds = new Set(prev.map((g) => g.id));
          const newGames = games.filter((g) => !existingIds.has(g.id));
          return [...prev, ...newGames];
        });
        restoreScroll();
      }
    } else if (currentPage === 1) {
      setAccumulatedGames([]);
      restoreScroll();
    }
  }, [games, currentPage, savedScrollPosition]);

  // Fetch all providers on mount
  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  // Detect mobile viewport
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const updateIsMobile = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    try {
      mq.addEventListener('change', updateIsMobile);
      return () => mq.removeEventListener('change', updateIsMobile);
    } catch (_) {
      mq.addListener(updateIsMobile);
      return () => mq.removeListener(updateIsMobile);
    }
  }, []);

  // Function to get provider ID from API data by matching key
  const getProviderId = useCallback(
    (providerKey) => {
      if (!allProvidersData || !Array.isArray(allProvidersData)) {
        return null;
      }

      const matchingProvider = allProvidersData.find(
        (apiProvider) =>
          apiProvider.name.toLowerCase() === providerKey.toLowerCase(),
      );

      return matchingProvider ? matchingProvider.id : null;
    },
    [allProvidersData],
  );

  // Category definitions - All categories except Promotions and Home
  // Slots and Casino at the top
  const categories = useMemo(
    () => [
      {
        key: 'slots',
        icon: 'Slots-3.svg',
        translationKey: 'slots',
        fallback: 'Slots',
        filter: { is_slot_game: true },
      },
      {
        key: 'casino',
        icon: 'Casino-4.svg',
        translationKey: 'casino',
        fallback: 'Casino',
        filter: { is_live_game: true },
      },
      {
        key: 'crash',
        icon: 'Crash-9.svg',
        translationKey: 'crash_game',
        fallback: 'Crash',
        filter: { is_crash_game: true },
      },
      {
        key: 'sports',
        icon: 'Sports-5.svg',
        translationKey: 'sports',
        fallback: 'Sports',
        filter: { is_sport_game: true },
      },
      {
        key: 'fishing',
        icon: 'Fishing-6.svg',
        translationKey: 'fishing',
        fallback: 'Fishing',
        filter: { is_fishing_game: true },
      },
      {
        key: 'other',
        icon: 'Other-7.svg',
        translationKey: 'other',
        fallback: 'Other',
        filter: { is_other_game: true },
      },
      {
        key: 'togel',
        icon: 'Togel-8.svg',
        translationKey: 'togel',
        fallback: 'Togel',
        filter: { is_togel_game: true },
      },
      {
        key: 'hot',
        icon: 'Hot-2.svg',
        translationKey: 'hot_games',
        fallback: 'Hot Games',
        filter: { is_hot: true },
      },
      {
        key: 'bonus',
        icon: 'Bonus-11.svg',
        translationKey: 'bonus',
        fallback: 'Bonus',
        filter: { is_bonus: true },
      },
      {
        key: 'more',
        icon: 'more-12.svg',
        translationKey: 'more',
        fallback: 'More',
        filter: {},
      },
    ],
    [],
  );

  // Base URL for logos (same as SlotProvidersPage)
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  // Slot providers - Complete list from SlotProvidersPage (same order and data)
  const slotProvidersData = useMemo(
    () => [
      {
        key: 'pragmatic_slot',
        id: getProviderId('pragmatic_slot'),
        logo: `${baseUrl}/logos/pragmatic-play.png`,
        name: 'Pragmatic play',
      },
      {
        key: 'MICRO_Slot',
        id: getProviderId('MICRO_Slot'),
        logo: `${baseUrl}/logos/microgaming.png`,
        name: 'Microgaming',
      },
      {
        key: 'booongo',
        id: getProviderId('booongo'),
        logo: `${baseUrl}/logos/bongo.png`,
        name: 'Booongo',
      },
      {
        key: 'PLAYNGO',
        id: getProviderId('PLAYNGO'),
        logo: `${baseUrl}/logos/Play n Go.png`,
        name: 'Play n Go',
      },
      {
        key: 'habanero',
        id: getProviderId('habanero'),
        logo: `${baseUrl}/logos/habanero_white 3.png`,
        name: 'Habanero',
      },
      {
        key: 'TOMHORN_SLOT',
        id: getProviderId('TOMHORN_SLOT'),
        logo: `${baseUrl}/logos/tomhorn.png`,
        name: 'Tom Horn Gaming',
      },
      {
        key: 'cq9',
        id: getProviderId('cq9'),
        logo: `${baseUrl}/logos/cq9.png`,
        name: 'CQ9',
      },
      {
        key: 'PGSoft',
        id: getProviderId('PGSoft'),
        logo: `${baseUrl}/logos/Pocketsoft Games.png`,
        name: 'Pocket Soft Gaming',
      },
      {
        key: 'redtiger',
        id: getProviderId('redtiger'),
        logo: `${baseUrl}/logos/Red Tiger.png`,
        name: 'Red Tiger',
      },
      {
        key: 'netent',
        id: getProviderId('netent'),
        logo: `${baseUrl}/logos/netent.png`,
        name: 'NetEnt',
      },
      {
        key: 'evoplay',
        id: getProviderId('evoplay'),
        logo: `${baseUrl}/logos/evoplay.png`,
        name: 'Evoplay',
      },
      {
        key: 'nlc',
        id: getProviderId('nlc'),
        logo: `${baseUrl}/logos/nlc.png`,
        name: 'NLC',
      },
      {
        key: 'btg',
        id: getProviderId('btg'),
        logo: `${baseUrl}/logos/BTG_Logo.png`,
        name: 'Big Time Gaming',
      },
    ],
    [getProviderId, baseUrl],
  );

  // Casino providers - Same as Live Casino page (with logos)
  const casinoProvidersData = useMemo(() => {
    // Fallback IDs from Live Casino page (in case API doesn't have them)
    const fallbackIds = {
      evolution: '1382',
      TOMHORN_7Mojos: '5238',
      TOMHORN_AbsoluteLive: '5215',
      TOMHORN_VIVO: '5256',
      dream_gaming: '1356',
      sa_game: '5096',
      agin: '904',
      sexy_ae: '997',
    };

    // Logo filenames matching the image
    const logoFilenames = {
      evolution: 'Evolution-16.png',
      TOMHORN_7Mojos: '7mojos-16.png',
      TOMHORN_AbsoluteLive: 'Absolute-16.png',
      TOMHORN_VIVO: 'vivo-16.png',
      dream_gaming: 'Dreamgaming-16.png',
      sa_game: 'sagaming-16.png',
      agin: 'AsiaGaming-16.png',
      sexy_ae: 'SexyGaming-16.png',
    };

    // Background images from Live Casino page
    const backgrounds = {
      evolution:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution3-up.webp',
      TOMHORN_7Mojos:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos3-up.webp',
      TOMHORN_AbsoluteLive:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute3-up.webp',
      TOMHORN_VIVO:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo3-up.webp',
      dream_gaming:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cream-gaming3-up.webp',
      sa_game:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game3-up.webp',
      agin: 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/agin3.webp',
      sexy_ae:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-ae3.webp',
    };

    return [
      {
        key: 'evolution',
        id: getProviderId('evolution') || fallbackIds.evolution,
        name: 'Evolution',
        provider: 'evolution',
        logo: `${baseUrl}/logos/${logoFilenames.evolution}`,
        background: backgrounds.evolution,
        isLive: true,
      },
      {
        key: 'TOMHORN_7Mojos',
        id: getProviderId('TOMHORN_7Mojos') || fallbackIds.TOMHORN_7Mojos,
        name: '7 Mojos',
        provider: 'TOMHORN_7Mojos',
        logo: `${baseUrl}/logos/${logoFilenames.TOMHORN_7Mojos}`,
        background: backgrounds.TOMHORN_7Mojos,
        isLive: true,
      },
      {
        key: 'TOMHORN_AbsoluteLive',
        id:
          getProviderId('TOMHORN_AbsoluteLive') ||
          fallbackIds.TOMHORN_AbsoluteLive,
        name: 'Absolute Live',
        provider: 'TOMHORN_AbsoluteLive',
        logo: `${baseUrl}/logos/${logoFilenames.TOMHORN_AbsoluteLive}`,
        background: backgrounds.TOMHORN_AbsoluteLive,
        isLive: true,
      },
      {
        key: 'TOMHORN_VIVO',
        id: getProviderId('TOMHORN_VIVO') || fallbackIds.TOMHORN_VIVO,
        name: 'Vivo',
        provider: 'TOMHORN_VIVO',
        logo: `${baseUrl}/logos/${logoFilenames.TOMHORN_VIVO}`,
        background: backgrounds.TOMHORN_VIVO,
        isLive: true,
      },
      {
        key: 'agin',
        id: getProviderId('agin') || fallbackIds.agin,
        name: 'Agin',
        provider: 'agin',
        logo: `${baseUrl}/logos/${logoFilenames.agin}`,
        background: backgrounds.agin,
        isLive: true,
      },
      {
        key: 'dream_gaming',
        id: getProviderId('dream') || fallbackIds.dream_gaming,
        name: 'Dream Gaming',
        provider: 'dream_gaming',
        logo: `${baseUrl}/logos/${logoFilenames.dream_gaming}`,
        background: backgrounds.dream_gaming,
        isLive: true,
      },
      {
        key: 'sa_game',
        id: getProviderId('sa') || fallbackIds.sa_game,
        name: 'Sa Game',
        provider: 'sa_game',
        logo: `${baseUrl}/logos/${logoFilenames.sa_game}`,
        background: backgrounds.sa_game,
        isLive: true,
      },
      {
        key: 'sexy_ae',
        id: getProviderId('SEXYBCRT') || fallbackIds.sexy_ae,
        name: 'SEXYBCRT',
        provider: 'sexy_ae',
        logo: `${baseUrl}/logos/${logoFilenames.sexy_ae}`,
        background: backgrounds.sexy_ae,
        isLive: true,
      },
    ];
  }, [getProviderId, baseUrl]);

  // Create dynamic providers array based on selected category
  const providers = useMemo(() => {
    if (!allProvidersData || !Array.isArray(allProvidersData)) {
      return [];
    }

    // Return providers based on category
    if (selectedCategory === 'slots') {
      // Filter out providers with null IDs (not available in API)
      const validSlotProviders = slotProvidersData.filter(
        (provider) => provider.id !== null,
      );
      // Add "All Games" option at the beginning
      return [
        {
          key: 'all',
          id: 'all',
          name: t('all_games', 'All Games'),
          logo: null,
          isAllGames: true,
        },
        ...validSlotProviders,
      ];
    } else if (selectedCategory === 'casino') {
      // Show all casino providers (they have fallback IDs, so all should be available)
      return casinoProvidersData;
    }

    return [];
  }, [
    allProvidersData,
    selectedCategory,
    slotProvidersData,
    casinoProvidersData,
    t,
  ]);

  // Get current category filter
  const currentCategoryFilter = useMemo(() => {
    const category = categories.find((cat) => cat.key === selectedCategory);
    return category?.filter || {};
  }, [selectedCategory, categories]);

  // Auto-select first provider on mount or category change
  // For casino category, pre-select Evolution
  // For slots category, pre-select "All Games"
  useEffect(() => {
    // For slots category, ensure "All Games" is selected if not already selected
    if (selectedCategory === 'slots' && selectedProviderId !== 'all') {
      if (providers.length > 0) {
        const allGamesProvider = providers.find((p) => p.isAllGames);
        if (allGamesProvider && (isInitialLoad || !selectedProviderId)) {
          dispatch(setSelectedProviderId('all'));
          setIsInitialLoad(false);
          return;
        }
      }
    }

    // For casino category, auto-select Evolution
    if (
      selectedCategory === 'casino' &&
      providers.length > 0 &&
      (isInitialLoad || !selectedProviderId)
    ) {
      const evolutionProvider = providers.find(
        (p) => p.key === 'evolution' || p.name?.toLowerCase() === 'evolution',
      );
      if (evolutionProvider) {
        dispatch(setSelectedProviderId(evolutionProvider.id));
        setSelectedCasinoProvider(evolutionProvider);
        setIsInitialLoad(false);
      }
    }
  }, [
    providers,
    isInitialLoad,
    selectedProviderId,
    selectedCategory,
    dispatch,
  ]);

  // Load games based on category and provider
  const loadGames = useCallback(
    async (page = 1) => {
      // Don't load if no provider is selected
      if (!selectedProviderId) {
        return;
      }

      try {
        const filterParams = { ...currentCategoryFilter };

        // For casino category, filter by is_live_game: true and provider if selected
        if (selectedCategory === 'casino') {
          filterParams.is_live_game = true;
          // Only add provider filter if a specific provider is selected (not for all)
          if (selectedProviderId && selectedProviderId !== 'all') {
            filterParams.provider_id = selectedProviderId;
          }
        } else {
          // For slots category, only add provider filter if not "All Games"
          if (selectedProviderId !== 'all') {
            filterParams.provider_id = selectedProviderId;
          }
        }

        const params = { page, perPage: 60, filter: filterParams };
        await dispatch(fetchAllGames(params));
      } catch (_) {
        toast.error(t('failed_to_load_games'));
      }
    },
    [dispatch, currentCategoryFilter, selectedProviderId, selectedCategory, t],
  );

  // Load more games
  const loadMore = useCallback(async () => {
    if (hasMore && !allGamesLoader && !isLoadingMore) {
      setIsLoadingMore(true);
      // Save scroll position before loading more
      const scrollBeforeLoad = window.scrollY;
      await loadGames(currentPage + 1);
      setIsLoadingMore(false);
      // Maintain scroll position after loading more
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollBeforeLoad);
      });
    }
  }, [hasMore, allGamesLoader, isLoadingMore, currentPage, loadGames]);

  // Initial load when category or provider changes - preserve scroll position
  useEffect(() => {
    // Save current scroll before loading
    if (selectedProviderId) {
      setSavedScrollPosition(window.scrollY);
    }
    loadGames(1);
  }, [loadGames, selectedProviderId]);

  // Handle category selection
  const handleCategoryClick = (categoryKey) => {
    // Save current scroll position
    setSavedScrollPosition(window.scrollY);
    
    setSelectedCategory(categoryKey);
    setSelectedCasinoProvider(null); // Reset casino provider card

    // If switching to slots, select "All Games" immediately
    if (categoryKey === 'slots') {
      dispatch(setSelectedProviderId('all'));
    } else {
      // For other categories, reset provider
      dispatch(setSelectedProviderId(null));
      setIsInitialLoad(true); // Trigger auto-select for new category
    }
  };

  // Handle provider selection
  const handleProviderClick = (provider) => {
    // Save current scroll position
    setSavedScrollPosition(window.scrollY);
    
    if (selectedCategory === 'casino') {
      // For casino, show provider card instead of games
      setSelectedCasinoProvider(provider);
      dispatch(setSelectedProviderId(provider.id));
    } else {
      // For slots, show games
      // Handle "All Games" option
      if (provider.isAllGames) {
        dispatch(setSelectedProviderId('all'));
      } else {
        dispatch(setSelectedProviderId(provider.id));
      }
      setSelectedCasinoProvider(null);
    }
  };

  // Handle casino provider card click
  const handleCasinoClick = (provider) => {
    if (!provider.isLive || !provider.id) {
      toast.info(t('coming_soon'));
      return;
    }

    // On mobile screens, open modal
    if (isMobile) {
      const selectedGame = {
        id: provider.id,
        provider: provider.provider,
        name: provider.name,
        image: provider.background,
      };
      dispatch(setSelectedGame(selectedGame));
      dispatch(openModal('launchGame'));
      return;
    }

    // On larger screens, launch directly
    handlePlayGame(provider.id);
  };

  // Embla carousel controls
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Responsive perPage calculation and slide width
  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      const gap = 8; // 8px gap between cards (reduced spacing)

      if (width >= 1536) {
        setCurrentPerPage(7);
        setSlideWidth(`calc((100% - ${gap * 6}px) / 7)`);
      } else if (width >= 1280) {
        setCurrentPerPage(6);
        setSlideWidth(`calc((100% - ${gap * 5}px) / 6)`);
      } else if (width >= 1024) {
        setCurrentPerPage(5);
        setSlideWidth(`calc((100% - ${gap * 4}px) / 5)`);
      } else if (width >= 768) {
        setCurrentPerPage(4);
        setSlideWidth(`calc((100% - ${gap * 3}px) / 4)`);
      } else if (width >= 640) {
        setCurrentPerPage(3);
        setSlideWidth(`calc((100% - ${gap * 2}px) / 3)`);
      } else {
        // Mobile: show 2 providers per view
        setCurrentPerPage(2);
        setSlideWidth(`calc((100% - ${gap}px) / 2)`);
      }
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  };

  const handleNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  };

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, []);

  return (
    <section className="container mx-auto overflow-x-hidden px-4 py-8 md:px-0 md:py-10">
      <div className="max-w-full">
        {/* Provider Bar - Separate on Top */}
        <div className="relative mb-4 w-full rounded-[10px] border border-[#E8D25E]/30 bg-[#111] sm:mb-6">
          <div className="relative h-full">
            <div className="pr-8 pl-8 sm:pr-10 sm:pl-10 md:pr-12 md:pl-12 lg:pr-14 lg:pl-14">
              <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex" style={{ touchAction: 'pan-y pinch-zoom' }}>
                  {providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="mr-2 flex-shrink-0"
                      style={{
                        width: slideWidth,
                        minWidth: slideWidth,
                        maxWidth: slideWidth,
                      }}
                    >
                      <div
                        className={`flex h-auto min-h-[50px] cursor-pointer items-center justify-center transition-all duration-200 ${
                          selectedProviderId === provider.id ||
                          (provider.isAllGames && selectedProviderId === 'all')
                            ? 'rounded-lg border border-[#E8D25E] bg-[#1a1a1a] p-2 shadow-[0_0_10px_0_rgba(232,210,94,0.3)_inset]'
                            : 'bg-transparent p-0'
                        }`}
                        onClick={() => handleProviderClick(provider)}
                      >
                        {provider.isAllGames || failedLogos.has(provider.id) ? (
                          <span className="text-center text-xs font-semibold text-white sm:text-sm" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {provider.name}
                          </span>
                        ) : provider.logo ? (
                          <img
                            src={provider.logo}
                            alt={provider.name || t('game_provider')}
                            className="h-auto max-h-8 w-auto max-w-full object-contain"
                            style={{ maxWidth: '100%', height: 'auto' }}
                            onError={() => {
                              setFailedLogos((prev) =>
                                new Set(prev).add(provider.id),
                              );
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-center text-xs font-semibold text-white sm:text-sm" style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {provider.name}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation buttons */}
            {providers.length > currentPerPage && (
              <>
                <button
                  aria-label={t('previous_providers')}
                  className={`absolute top-0 bottom-0 left-0 z-20 flex w-8 items-center justify-center rounded-l-[10px] transition-opacity duration-200 sm:w-10 ${
                    canScrollPrev
                      ? 'cursor-pointer bg-[#E8D25E] opacity-100 hover:opacity-80 active:opacity-60'
                      : 'cursor-not-allowed bg-gray-400 opacity-50'
                  }`}
                  onClick={handlePrev}
                  disabled={!canScrollPrev}
                >
                  <svg
                    className="h-4 w-4 text-black sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                <button
                  aria-label={t('next_providers')}
                  className={`absolute top-0 right-0 bottom-0 z-20 flex w-8 items-center justify-center rounded-r-[10px] transition-opacity duration-200 sm:w-10 ${
                    canScrollNext
                      ? 'cursor-pointer bg-[#E8D25E] opacity-100 hover:opacity-80 active:opacity-60'
                      : 'cursor-not-allowed bg-gray-400 opacity-50'
                  }`}
                  onClick={handleNext}
                  disabled={!canScrollNext}
                >
                  <svg
                    className="h-4 w-4 text-black sm:h-5 sm:w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Category Sidebar and Games Grid - In One Grid Layout */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-[180px_1fr] xl:grid-cols-[220px_1fr]">
          {/* Left Sidebar - All Categories except Promotions */}
          <div className="w-full overflow-hidden">
            <div className="category-grid-mobile lg:flex lg:flex-col lg:flex-nowrap rounded-[10px] border border-[#E8D25E]/30 bg-[#111111] p-2 sm:gap-3 sm:p-3 lg:gap-3 lg:p-4" style={{ width: '100%', boxSizing: 'border-box' }}>
              {categories.map((category, index) => {
                const translated = t(category.translationKey);
                const rawLabel = translated && translated !== category.translationKey ? translated : category.fallback;
                // Capitalize: first letter uppercase, rest lowercase
                const categoryLabel = rawLabel ? rawLabel.charAt(0).toUpperCase() + rawLabel.slice(1).toLowerCase() : rawLabel;
                // Enable only slots and casino categories
                const isEnabled = category.key === 'slots' || category.key === 'casino';
                
                return (
                  <button
                    key={category.key}
                    onClick={() => {
                      if (isEnabled) {
                        handleCategoryClick(category.key);
                      }
                    }}
                    disabled={!isEnabled}
                    className={`category-button-item flex items-center gap-2 rounded-[7px] bg-[#E8D25E]/[0.09] px-2 py-2 transition-all duration-200 sm:gap-2 sm:px-3 sm:py-2 lg:w-full lg:gap-3 lg:px-4 lg:py-3 ${
                      selectedCategory === category.key
                        ? 'border border-[#E8D25E] shadow-[0_0_10px_0_rgba(232,210,94,0.3)_inset]'
                        : ''
                    } ${
                      !isEnabled
                        ? 'cursor-not-allowed opacity-40'
                        : 'cursor-pointer'
                    }`}
                    style={{
                      minWidth: 'fit-content',
                      flexShrink: 0,
                    }}
                  >
                    <LazyImage
                      src={`${BASE_ICON_URL}${category.icon}`}
                      alt={categoryLabel}
                      width={38}
                      height={38}
                      className={`h-6 w-6 flex-shrink-0 object-contain sm:h-7 sm:w-7 lg:h-9 lg:w-9 ${
                        !isEnabled ? 'opacity-40' : ''
                      }`}
                    />
                    <span className={`whitespace-nowrap text-xs font-bold sm:text-sm lg:text-base ${
                      !isEnabled ? 'text-white/40' : 'text-white'
                    }`}>
                      {categoryLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Content Area - Games Grid */}
          <div className="min-w-0 overflow-x-hidden">
            {/* Games Grid Container */}
            <div className="rounded-[10px] border border-[#E8D25E]/30 bg-[#111111] p-4">
              {/* Show Casino Provider Card (Lobby) for Casino Category */}
              {selectedCategory === 'casino' && selectedCasinoProvider && (
                <div className="mb-6">
                  <div
                    onClick={() => handleCasinoClick(selectedCasinoProvider)}
                    className={`group relative aspect-[4/3] w-full max-w-[250px] cursor-pointer overflow-hidden rounded-[10px] bg-transparent transition-all duration-300 sm:max-w-[280px] md:max-w-[300px] ${
                      !selectedCasinoProvider.isLive ? 'cursor-not-allowed' : ''
                    }`}
                  >
                    {/* Background image layer */}
                    <div className="absolute inset-0 bg-transparent">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LazyImage
                          src={selectedCasinoProvider.background}
                          alt={`${selectedCasinoProvider.name} background`}
                          fill
                          sizes="(min-width:1280px) 300px, (min-width:1024px) 280px, (min-width:768px) 250px, 250px"
                          className="object-cover object-top"
                          quality={85}
                        />
                        {/* Hover Overlay - Only on Image */}
                        <div className="absolute inset-0 z-20 bg-[#6d6936c9] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </div>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <button
                          type="button"
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-2 border-[#E8D25E] bg-black transition-colors hover:border-[#FFF788] disabled:opacity-50 sm:h-12 sm:w-12"
                          style={{
                            backgroundColor: '#000000',
                            borderColor: '#E8D25E',
                          }}
                          disabled={isLaunching(selectedCasinoProvider.id)}
                        >
                          {isLaunching(selectedCasinoProvider.id) ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#E8D25E] border-t-transparent" />
                          ) : (
                            <svg
                              className="h-3 w-3 sm:h-4 sm:w-4"
                              fill={`url(#playButtonGradient-${selectedCasinoProvider.id})`}
                              viewBox="0 0 20 20"
                            >
                              <defs>
                                <linearGradient
                                  id={`playButtonGradient-${selectedCasinoProvider.id}`}
                                  x1="0%"
                                  y1="0%"
                                  x2="100%"
                                  y2="100%"
                                >
                                  <stop offset="0%" stopColor="#FFF788" />
                                  <stop offset="50%" stopColor="#D3AF37" />
                                  <stop offset="100%" stopColor="#FFF788" />
                                </linearGradient>
                              </defs>
                              <path
                                fillRule="evenodd"
                                d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-2 right-2 h-8 w-8 rounded-full border border-purple-400" />
                      <div className="absolute bottom-2 left-2 h-6 w-6 rounded-full border border-purple-400" />
                      <div className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-purple-400" />
                    </div>

                    {/* Provider Name - Bottom Right */}
                    <div className="pointer-events-none absolute right-0 bottom-0">
                      <div
                        className="max-w-[100px] min-w-[100px] truncate px-2 py-1 text-center text-[10px] font-semibold text-black uppercase sm:max-w-[120px] sm:min-w-[110px] sm:px-3 sm:text-[11px] md:max-w-[140px] md:min-w-[130px] md:text-[12px]"
                        style={{
                          borderRadius: '14px 0 6px 0',
                          background: '#E8D25E',
                        }}
                      >
                        {selectedCasinoProvider.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Games Grid - Show for both Slots and Casino categories */}
              {accumulatedGames.length > 0 && (
                <div
                  className={
                    selectedCategory === 'casino' && selectedCasinoProvider
                      ? 'mt-6'
                      : ''
                  }
                >
                  {selectedCategory === 'casino' && selectedCasinoProvider && (
                    <h3 className="mb-4 text-lg font-bold text-white sm:text-xl">
                      {t('games', 'Games')}
                    </h3>
                  )}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
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
              )}

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

              {/* Action Buttons - Show for both slots and casino categories */}
              {(selectedCategory === 'slots' ||
                (selectedCategory === 'casino' && selectedCasinoProvider)) && (
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
              )}

              {/* Initial Loading State - Show for both categories */}
              {(selectedCategory === 'slots' ||
                (selectedCategory === 'casino' && selectedCasinoProvider)) &&
                currentPage === 1 &&
                allGamesLoader &&
                accumulatedGames.length === 0 &&
                selectedProviderId && (
                <div className="py-16">
                  <div className="flex flex-col items-center space-y-4">
                    <CommonLoader size="xl" border="border-[#D3AF37]" />
                    <p className="text-lg text-white/70">
                      {t('loading_games_message')}
                    </p>
                  </div>
                </div>
              )}

              {/* No Games Available - Only show for slots category (not for casino when lobby is shown) */}
              {selectedCategory === 'slots' &&
                accumulatedGames.length === 0 &&
                !allGamesLoader &&
                currentPage === 1 &&
                selectedProviderId && (
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
                    <p className="text-sm text-white/50">
                      {t(
                        'provider_has_no_games',
                        'This provider has no games available at the moment',
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* No Provider Selected - Show for both categories */}
              {((selectedCategory === 'slots' &&
                !selectedProviderId &&
                selectedProviderId !== 'all') ||
                (selectedCategory === 'casino' && !selectedCasinoProvider)) &&
                providers.length > 0 && (
                <div className="py-16 text-center">
                  <div className="mx-auto max-w-md">
                    <p className="text-lg text-white/70">
                      {t(
                        'select_provider',
                        'Please select a provider to view games',
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default GameCategorySection;
