'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SlotCategories from '@/dynamic-components/template16/components/SlotCategories/SlotCategories';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { fetchAllProvider } from '@/website/websiteAction.js';
import { setSelectedProviderId } from '@/website/websiteSlice.js';

export default function SlotsPage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'slots'; // Track category from where user came

  const { selectedProviderId, allProvidersData } = useSelector(
    (state) => state.website,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [failedLogos, setFailedLogos] = useState(new Set());
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentPerPage, setCurrentPerPage] = useState(7);
  const [slideWidth, setSlideWidth] = useState('calc((100% - 96px) / 7)');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('popular');

  // Embla carousel for provider slider
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: false,
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });

  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  // Function to get provider ID from API data by matching key
  const getProviderId = (providerKey) => {
    if (!allProvidersData || !Array.isArray(allProvidersData)) {
      return null;
    }

    const matchingProvider = allProvidersData.find(
      (apiProvider) =>
        apiProvider.name.toLowerCase() === providerKey.toLowerCase(),
    );

    return matchingProvider ? matchingProvider.id : null;
  };

  // Base URL for logos
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  // Slot providers - matches exactly with SlotProvidersPage and GameCategorySection
  const slotProviders = useMemo(() => {
    const providers = [
      {
        key: 'pragmatic_slot',
        id: getProviderId('pragmatic_slot'),
        logo: `${baseUrl}/logos/pragmatic-play.png`,
        name: 'Pragmatic play',
        isLive: true,
      },
      {
        key: 'MICRO_Slot',
        id: getProviderId('MICRO_Slot'),
        logo: `${baseUrl}/logos/microgaming.png`,
        name: 'Microgaming',
        isLive: true,
      },
      {
        key: 'booongo',
        id: getProviderId('booongo'),
        logo: `${baseUrl}/logos/bongo.png`,
        name: 'Booongo',
        isLive: true,
      },
      {
        key: 'PLAYNGO',
        id: getProviderId('PLAYNGO'),
        logo: `${baseUrl}/logos/Play n Go.png`,
        name: 'Play n Go',
        isLive: true,
      },
      {
        key: 'habanero',
        id: getProviderId('habanero'),
        logo: `${baseUrl}/logos/habanero_white 3.png`,
        name: 'Habanero',
        isLive: true,
      },
      {
        key: 'TOMHORN_SLOT',
        id: getProviderId('TOMHORN_SLOT'),
        logo: `${baseUrl}/logos/tomhorn.png`,
        name: 'Tom Horn Gaming',
        isLive: true,
      },
      {
        key: 'cq9',
        id: getProviderId('cq9'),
        logo: `${baseUrl}/logos/cq9.png`,
        name: 'CQ9',
        isLive: true,
      },
      {
        key: 'PGSoft',
        id: getProviderId('PGSoft'),
        logo: `${baseUrl}/logos/Pocketsoft Games.png`,
        name: 'Pocket Soft Gaming',
        isLive: true,
      },
      {
        key: 'redtiger',
        id: getProviderId('redtiger'),
        logo: `${baseUrl}/logos/Red Tiger.png`,
        name: 'Red Tiger',
        isLive: true,
      },
      {
        key: 'netent',
        id: getProviderId('netent'),
        logo: `${baseUrl}/logos/netent.png`,
        name: 'NetEnt',
        isLive: true,
      },
      {
        key: 'evoplay',
        id: getProviderId('evoplay'),
        logo: `${baseUrl}/logos/evoplay.png`,
        name: 'Evoplay',
        isLive: true,
      },
      {
        key: 'nlc',
        id: getProviderId('nlc'),
        logo: `${baseUrl}/logos/nlc.png`,
        name: 'NLC',
        isLive: true,
      },
      {
        key: 'btg',
        id: getProviderId('btg'),
        logo: `${baseUrl}/logos/BTG_Logo.png`,
        name: 'Big Time Gaming',
        isLive: true,
      },
    ];

    // Add "All Games" option at the beginning
    return [
      {
        key: 'all',
        id: 'all',
        name: t('all_games', 'All Games'),
        logo: null,
        isAllGames: true,
      },
      ...providers.filter((provider) => provider.id !== null),
    ];
  }, [allProvidersData, t]);

  // Arcade providers - matches exactly with SlotProvidersPage
  const arcadeProviders = useMemo(
    () => [
      {
        key: 'jdb_arcade',
        id: getProviderId('jdb_arcade'),
        name: 'JDP Gaming',
        isLive: true,
      },
      {
        key: 'hacksaw_arcade',
        id: getProviderId('hacksaw_arcade'),
        name: 'Hacksaw',
        isLive: true,
      },
      {
        key: 'oriental',
        id: getProviderId('oriental'),
        name: 'Oriental Game',
        isLive: true,
      },
      {
        key: 'fc_arcade',
        id: getProviderId('fc_arcade'),
        name: 'FC Arcade',
        isLive: true,
      },
    ],
    [allProvidersData],
  );

  // Hybrid providers - matches exactly with SlotProvidersPage (empty for now)
  const hybridProviders = useMemo(() => [], [allProvidersData]);

  // Filter providers based on category from URL
  const allProviders = useMemo(() => {
    let categoryProviders = [];

    // Select providers based on category
    if (category === 'arcade') {
      categoryProviders = arcadeProviders;
    } else if (category === 'hybrid') {
      categoryProviders = hybridProviders;
    } else {
      // Default to slots category
      categoryProviders = slotProviders;
    }

    // Remove duplicates based on ID (if available) or key, and keep all providers
    // This ensures we show exactly the same providers as SlotProvidersPage
    const uniqueProviders = categoryProviders.filter(
      (provider, index, self) => {
        // Use ID for comparison if available, otherwise use key
        const identifier = provider.id || provider.key;
        return (
          identifier &&
          index === self.findIndex((p) => (p.id || p.key) === identifier)
        );
      },
    );
    return uniqueProviders;
  }, [slotProviders, arcadeProviders, hybridProviders, category]);

  // Handle back navigation to slot providers with category preservation
  const handleBackClick = () => {
    router.push(`/slot-providers?q=${category}`);
  };

  // Handle provider selection
  const handleProviderChange = (providerId) => {
    if (providerId) {
      // Convert to number if it's a string number
      const numericId = isNaN(Number(providerId))
        ? providerId
        : Number(providerId);
      dispatch(setSelectedProviderId(numericId));
    }
  };

  // Handle provider click from provider bar
  const handleProviderClick = (provider) => {
    if (provider.isAllGames) {
      dispatch(setSelectedProviderId('all'));
    } else if (provider.id) {
      dispatch(setSelectedProviderId(provider.id));
    }
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

  // Auto-select "All Games" on mount - always pre-select on initial load
  useEffect(() => {
    if (slotProviders.length > 0 && isInitialLoad) {
      const allGamesProvider = slotProviders.find((p) => p.isAllGames);
      if (allGamesProvider) {
        dispatch(setSelectedProviderId('all'));
        setIsInitialLoad(false);
      }
    }
  }, [slotProviders, isInitialLoad, dispatch]);

  // Get current provider name and logo for banner and title
  const currentProvider = useMemo(() => {
    if (selectedProviderId && slotProviders.length > 0) {
      // Try to find provider by ID or key (handle both string and number comparison)
      const provider = slotProviders.find(
        (p) =>
          p.id === selectedProviderId ||
          String(p.id) === String(selectedProviderId) ||
          (p.isAllGames && selectedProviderId === 'all'),
      );

      if (provider) {
        return provider;
      }

      // Fallback to API data (only if selectedProviderId is a number/ID)
      if (!isNaN(Number(selectedProviderId))) {
        const apiProviderName = getProviderNameById(
          selectedProviderId,
          allProvidersData,
        );
        return { name: apiProviderName || t('slot_games'), logo: null };
      }
      return { name: t('slot_games'), logo: null };
    }
    return { name: t('slot_games'), logo: null };
  }, [selectedProviderId, allProvidersData, slotProviders, t]);

  const currentProviderName = currentProvider.name;
  const currentProviderLogo = currentProvider.logo;

  // Handle filter selection
  const handleFilterClick = (filterKey) => {
    setSelectedFilter(filterKey);
  };

  // Get filter params based on selected filter
  const gameFilter = useMemo(() => {
    switch (selectedFilter) {
      case 'popular':
        return { is_trending: true };
      case 'new':
        return { is_new: true };
      case 'big_win':
        return { is_big_win: true };
      case 'hot':
        return { is_hot: true };
      default:
        return null;
    }
  }, [selectedFilter]);

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt="Lines Pattern"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Top Banner with Provider Logo */}
        <section className="relative w-full overflow-hidden">
          {/* Desktop Banner Image - Hidden on mobile */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-16.webp"
            alt={t('slot_banner')}
            className="hidden w-full md:block"
          />

          {/* Mobile Banner Image - Only visible on mobile */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-mob-16.webp"
            alt={t('slot_banner')}
            className="block w-full md:hidden"
          />

          {/* Provider Logo - Right Side */}
          {currentProviderLogo &&
            selectedProviderId !== 'all' &&
            !failedLogos.has(selectedProviderId) && (
            <div className="absolute top-1/2 right-8 -translate-y-1/2 md:right-12 lg:right-24">
              <img
                src={currentProviderLogo}
                alt={currentProviderName || t('game_provider')}
                className="h-auto max-h-12 w-auto max-w-[120px] object-contain sm:max-h-16 sm:max-w-[150px] md:max-h-20 md:max-w-[180px]"
                onError={() => {
                  setFailedLogos((prev) =>
                    new Set(prev).add(selectedProviderId),
                  );
                }}
                loading="lazy"
              />
            </div>
          )}
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Provider Bar - Same as GameCategorySection */}
          <div className="relative mb-6 w-full rounded-[10px] border border-[#E8D25E]/30 bg-[#111]">
            <div className="relative h-full">
              <div className="pr-8 pl-8 sm:pr-10 sm:pl-10 md:pr-12 md:pl-12 lg:pr-14 lg:pl-14">
                <div className="overflow-hidden" ref={emblaRef}>
                  <div className="flex">
                    {slotProviders.map((provider) => (
                      <div
                        key={provider.id || provider.key}
                        className="mr-2 min-w-0 flex-shrink-0"
                        style={{
                          width: slideWidth,
                        }}
                      >
                        <div
                          className={`flex h-auto min-h-[50px] cursor-pointer items-center justify-center transition-all duration-200 ${
                            selectedProviderId === provider.id ||
                            (provider.isAllGames &&
                              selectedProviderId === 'all')
                              ? 'rounded-lg border border-[#E8D25E] bg-[#1a1a1a] p-2 shadow-[0_0_10px_0_rgba(232,210,94,0.3)_inset]'
                              : 'bg-transparent p-0'
                          }`}
                          onClick={() => handleProviderClick(provider)}
                        >
                          {provider.isAllGames ||
                          failedLogos.has(provider.id) ? (
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
              {slotProviders.length > currentPerPage && (
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

          {/* Header Bar with Categories and Search - Same as Live Casino */}
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
                  className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors hover:opacity-80 sm:px-3 sm:py-2 sm:text-sm md:px-4 md:text-base"
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
                  className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors hover:opacity-80 sm:px-3 sm:py-2 sm:text-sm md:px-4 md:text-base"
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
                  className="px-2 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors hover:opacity-80 sm:px-3 sm:py-2 sm:text-sm md:px-4 md:text-base"
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
        </div>

        <SlotCategories gameFilter={gameFilter} />
        {/* Bottom Curved Pattern above footer (positioned, no layout shift) */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-[420px]"
          aria-hidden
        >
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/curved-pattern.svg"
            alt="Curved Pattern"
            className="h-full w-full object-cover opacity-30"
          />
        </div>
      </div>
    </>
  );
}
