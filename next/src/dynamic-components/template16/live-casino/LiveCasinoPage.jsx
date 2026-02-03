'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template16/components/LazyImage/LazyImage';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';
import { fetchAllProvider } from '@/website/websiteAction';
import { setSelectedProviderId } from '@/website/websiteSlice';

function LiveCasinoPage() {
  const { handlePlayGame, isLaunching } = useGameLaunch();
  const { t, currentLocale } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('q') || 'live'; // Default to 'live'

  const { allProvidersData, selectedProviderId } = useSelector(
    (state) => state.website,
  );

  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCasinoProvider, setSelectedCasinoProvider] = useState(null);
  const [failedLogos, setFailedLogos] = useState(new Set());
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentPerPage, setCurrentPerPage] = useState(7);
  const [slideWidth, setSlideWidth] = useState('calc((100% - 96px) / 7)');
  const [selectedFilter, setSelectedFilter] = useState('popular');
  const [shuffledProviders, setShuffledProviders] = useState(null);

  // Embla carousel for provider slider
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });

  // Fetch all providers on mount
  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

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

  // Detect mobile viewport to swap provider thumbnails to PNG variants
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(max-width: 640px)');
    const updateIsMobile = (e) => setIsMobile(e.matches);
    // Set initial state
    setIsMobile(mq.matches);
    // Subscribe to changes
    try {
      mq.addEventListener('change', updateIsMobile);
      return () => mq.removeEventListener('change', updateIsMobile);
    } catch (_) {
      // Safari fallback
      mq.addListener(updateIsMobile);
      return () => mq.removeListener(updateIsMobile);
    }
  }, []);

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
      const gap = 8; // 8px gap between cards

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

  // Base URL for logos
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  // Live casino providers data (ordered per requested sequence) - with logos for provider bar
  const liveCasinoProviders = useMemo(() => {
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

    return [
      {
        key: 'evolution',
        id: getProviderId('evolution') || fallbackIds.evolution,
        provider: 'evolution',
        name: 'Evolution',
        logo: `${baseUrl}/logos/${logoFilenames.evolution}`,
        background:
          'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution3-up.webp',
        isLive: true,
      },
      {
        key: 'TOMHORN_7Mojos',
        id: getProviderId('TOMHORN_7Mojos') || fallbackIds.TOMHORN_7Mojos,
        provider: 'TOMHORN_7Mojos',
        name: '7 Mojos',
        logo: `${baseUrl}/logos/${logoFilenames.TOMHORN_7Mojos}`,
        background:
          'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos3-up.webp',
        isLive: true,
      },
      {
        key: 'TOMHORN_AbsoluteLive',
        id:
          getProviderId('TOMHORN_AbsoluteLive') ||
          fallbackIds.TOMHORN_AbsoluteLive,
        provider: 'TOMHORN_AbsoluteLive',
        name: 'Absolute Live',
        logo: `${baseUrl}/logos/${logoFilenames.TOMHORN_AbsoluteLive}`,
        background:
          'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute3-up.webp',
        isLive: true,
      },
      {
        key: 'TOMHORN_VIVO',
        id: getProviderId('TOMHORN_VIVO') || fallbackIds.TOMHORN_VIVO,
        provider: 'TOMHORN_VIVO',
        name: 'Vivo',
        logo: `${baseUrl}/logos/${logoFilenames.TOMHORN_VIVO}`,
        background:
          'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo3-up.webp',
        isLive: true,
      },
      {
        key: 'dream_gaming',
        id: getProviderId('dream_gaming') || fallbackIds.dream_gaming,
        provider: 'dream_gaming',
        name: 'Dream Gaming',
        logo: `${baseUrl}/logos/${logoFilenames.dream_gaming}`,
        background:
          'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cream-gaming3-up.webp',
        isLive: true,
      },
      {
        key: 'sa_game',
        id: getProviderId('sa_game') || fallbackIds.sa_game,
        provider: 'sa_game',
        name: 'Sa Game',
        logo: `${baseUrl}/logos/${logoFilenames.sa_game}`,
        background:
          'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game3-up.webp',
        isLive: true,
      },
      {
        key: 'agin',
        id: getProviderId('agin') || fallbackIds.agin,
        provider: 'agin',
        name: 'Agin',
        logo: `${baseUrl}/logos/${logoFilenames.agin}`,
        background:
          'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/agin3.webp',
        isLive: true,
      },
      {
        key: 'sexy_ae',
        id: getProviderId('sexy_ae') || fallbackIds.sexy_ae,
        provider: 'sexy_ae',
        name: 'SEXYBCRT',
        logo: `${baseUrl}/logos/${logoFilenames.sexy_ae}`,
        background:
          'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-ae3.webp',
        isLive: true,
      },
    ];
  }, [getProviderId, baseUrl]);

  // Table game providers data
  const tableGameProviders = [
    {
      key: 'MICRO_Casino_Table',
      id: '4393',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/microgaming3-up.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '5095',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/poker3-up.webp',
      isLive: true,
    },
  ];

  // Determine which providers to display based on query parameter
  const { providers, pageTitle, pageAltText } = useMemo(() => {
    switch (category) {
      case 'table':
        return {
          providers: tableGameProviders,
          pageTitle: t('table_games', 'Table Games'),
          pageAltText: 'Table Games Providers',
        };
      case 'live':
      default:
        // Add "All Casino Providers" option at the beginning
        const allProvidersOption = {
          key: 'all',
          id: 'all',
          name: t('all_casino_providers', 'All Casino Providers'),
          logo: null,
          isAllProviders: true,
        };
        return {
          providers: [allProvidersOption, ...liveCasinoProviders],
          pageTitle: t('live_casino_providers'),
          pageAltText: 'Live Casino Providers',
        };
    }
  }, [category, liveCasinoProviders, tableGameProviders, t]);

  // Handle filter selection - shuffle providers
  const handleFilterClick = (filterKey) => {
    setSelectedFilter(filterKey);
    // Shuffle providers array using Fisher-Yates shuffle algorithm
    const shuffled = [...providers];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setShuffledProviders(shuffled);
  };

  const filteredProviders = useMemo(() => {
    let result = shuffledProviders || providers;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        [p.name, p.provider].some((v) => (v || '').toLowerCase().includes(q)),
      );
    }
    
    return result;
  }, [providers, shuffledProviders, searchQuery]);

  // Reset shuffled providers when category/providers change
  useEffect(() => {
    setShuffledProviders(null);
    setSelectedFilter('popular');
  }, [category]);

  // Reinitialize carousel when filtered providers change
  useEffect(() => {
    if (emblaApi && filteredProviders.length > 0) {
      emblaApi.reInit();
    }
  }, [emblaApi, filteredProviders]);

  // Handle provider selection from provider bar
  const handleProviderClick = (provider) => {
    if (provider.isAllProviders) {
      // Show all providers
      setSelectedCasinoProvider(null);
      dispatch(setSelectedProviderId('all'));
    } else {
      setSelectedCasinoProvider(provider);
      dispatch(setSelectedProviderId(provider.id));
    }
  };

  // Auto-select "All Casino Providers" on mount
  useEffect(() => {
    if (providers.length > 0 && !selectedProviderId && category === 'live') {
      // Default to "All Casino Providers"
      dispatch(setSelectedProviderId('all'));
      setSelectedCasinoProvider(null);
    }
  }, [providers, selectedProviderId, category, dispatch]);

  const handleCasinoClick = (provider) => {
    // Check if provider is live
    if (!provider.isLive || !provider.id) {
      toast.info(t('coming_soon'));
      return;
    }

    // On mobile screens, open modal like Slots page
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

  return (
    <div className="text-white">
      <div className="container mx-auto px-4 py-8 md:px-0">
        {/* Header Bar with Categories and Search */}
        <div className="mb-6 w-full">
          <div className="flex flex-col gap-3 rounded-lg py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Left Side: Categories with Vertical Separators */}
            <div className="flex flex-wrap items-center gap-0 overflow-x-auto sm:flex-nowrap">
              {/* Popular */}
              <button
                type="button"
                onClick={() => handleFilterClick('popular')}
                className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors hover:opacity-80 sm:px-3 sm:py-2 sm:text-sm md:px-4 md:text-base"
                style={{ color: selectedFilter === 'popular' ? '#E8D25E' : '#FFFFFF' }}
              >
                {t('popular') || 'Popular'}
              </button>
              {/* Vertical Separator */}
              <div
                className="h-5 w-px sm:h-6"
                style={{ backgroundColor: '#E8D25E4D' }}
              />
              {/* New */}
              <button
                type="button"
                onClick={() => handleFilterClick('new')}
                className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:opacity-80 sm:px-3 sm:py-2 sm:text-sm md:px-4 md:text-base"
                style={{ color: selectedFilter === 'new' ? '#E8D25E' : '#FFFFFF' }}
              >
                {t('new') || 'New'}
              </button>
              {/* Vertical Separator */}
              <div
                className="h-5 w-px sm:h-6"
                style={{ backgroundColor: '#E8D25E4D' }}
              />
              {/* Big Win */}
              <button
                type="button"
                onClick={() => handleFilterClick('big_win')}
                className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:opacity-80 sm:px-3 sm:py-2 sm:text-sm md:px-4 md:text-base"
                style={{ color: selectedFilter === 'big_win' ? '#E8D25E' : '#FFFFFF' }}
              >
                {t('big_win') || 'Big Win'}
              </button>
              {/* Vertical Separator */}
              <div
                className="h-5 w-px sm:h-6"
                style={{ backgroundColor: '#E8D25E4D' }}
              />
              {/* Hot Games */}
              <button
                type="button"
                onClick={() => handleFilterClick('hot')}
                className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap text-white transition-colors hover:opacity-80 sm:px-3 sm:py-2 sm:text-sm md:px-4 md:text-base"
                style={{ color: selectedFilter === 'hot' ? '#E8D25E' : '#FFFFFF' }}
              >
                {t('hot_games') || 'Hot Games'}
              </button>
            </div>

            {/* Right Side: Search */}
            <div
              className="flex h-9 w-full items-center gap-2 rounded-lg px-2.5 sm:h-10 sm:w-auto sm:min-w-[140px] sm:flex-shrink-0 sm:px-3 md:min-w-[180px]"
              style={{
                border: '1px solid #E8D25E',
                backgroundColor: 'transparent',
              }}
            >
              <input
                type="text"
                placeholder={t('search') || 'Search'}
                className="w-full min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                className="flex-shrink-0 sm:h-5 sm:w-5"
              >
                <path
                  d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                  stroke="#E8D25E"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Provider Bar - Same as GameCategorySection */}
        {category === 'live' && (
          <div className="relative mb-6 w-full rounded-[10px] border border-[#E8D25E]/30 bg-[#111]">
            <div className="relative h-full">
              <div className="pr-8 pl-8 sm:pr-10 sm:pl-10 md:pr-12 md:pl-12 lg:pr-14 lg:pl-14">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {filteredProviders.map((provider) => (
                      <div
                        key={provider.id || provider.key}
                        className="mr-2 min-w-0 flex-shrink-0"
                        style={{
                          width: slideWidth,
                        }}
                      >
                        <div
                          className={`flex h-auto min-h-[50px] cursor-pointer items-center justify-center transition-all duration-200 ${
                            (provider.isAllProviders && selectedProviderId === 'all') ||
                            (!provider.isAllProviders && selectedProviderId === provider.id)
                              ? 'rounded-lg border border-[#E8D25E] bg-[#1a1a1a] p-2 shadow-[0_0_10px_0_rgba(232,210,94,0.3)_inset]'
                              : 'bg-transparent p-0'
                          }`}
                          onClick={() => handleProviderClick(provider)}
                        >
                          {provider.isAllProviders || failedLogos.has(provider.id) ? (
                            <span className="text-center text-xs font-semibold text-white sm:text-sm">
                              {provider.name}
                            </span>
                          ) : provider.logo ? (
                            <img
                              src={provider.logo}
                              alt={provider.name || t('game_provider')}
                              className="h-auto max-h-8 w-auto max-w-[100px] object-contain"
                              onError={() => {
                                setFailedLogos((prev) =>
                                  new Set(prev).add(provider.id),
                                );
                              }}
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-center text-xs font-semibold text-white sm:text-sm">
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
              {filteredProviders.length > currentPerPage && (
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
        )}

        {/* Casino Provider Card or Grid */}
        {category === 'live' && selectedCasinoProvider && selectedProviderId !== 'all' ? (
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
        ) : (
          /* Casino Providers Grid - Show when "All Casino Providers" is selected or no provider selected */
          <>
            {(() => {
              // Filter out the "All Casino Providers" option when displaying the grid
              const providersToShow = filteredProviders.filter(
                (p) => !p.isAllProviders,
              );
              
              if (providersToShow.length === 0) {
                return (
                  <div className="flex min-h-[400px] items-center justify-center">
                    <div
                      className="rounded-lg border px-8 py-6 text-center"
                      style={{
                        borderColor: 'rgba(211, 175, 55, 0.28)',
                        background: 'transparent',
                      }}
                    >
                      <p className="text-xl font-semibold text-[#E8D25E] md:text-2xl">
                        {t('coming_soon')}
                      </p>
                    </div>
                  </div>
                );
              }
              
              return (
                <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-5">
                  {providersToShow.map((provider) => (
                    <div
                      key={provider.key}
                      onClick={() => handleCasinoClick(provider)}
                      className={`group relative aspect-[4/3] w-full cursor-pointer overflow-hidden rounded-[10px] bg-transparent transition-all duration-300 ${
                      !provider.isLive ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      {/* Background image layer */}
                      <div className="absolute inset-0 bg-transparent">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <LazyImage
                            src={provider.background}
                            alt={`${provider.name} background`}
                            fill
                            sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
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
                            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-[#E8D25E] bg-black transition-colors hover:border-[#FFF788] disabled:opacity-50 sm:h-16 sm:w-16"
                            style={{
                              backgroundColor: '#000000',
                              borderColor: '#E8D25E',
                            }}
                            disabled={isLaunching(provider.id)}
                          >
                            {isLaunching(provider.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#E8D25E] border-t-transparent" />
                          ) : (
                            <svg
                              className="h-4 w-4 sm:h-6 sm:w-6"
                              fill="url(#playButtonGradient)"
                              viewBox="0 0 20 20"
                            >
                              <defs>
                                <linearGradient
                                  id="playButtonGradient"
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
                          className="max-w-[120px] min-w-[120px] truncate px-3 py-1 text-center text-[12px] font-semibold text-black uppercase md:max-w-[170px] md:min-w-[150px] md:text-[14px]"
                          style={{
                            borderRadius: '14px 0 6px 0',
                            background: '#E8D25E',
                          }}
                        >
                          {provider.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}

export default LiveCasinoPage;
