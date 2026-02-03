'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SlotCategories from '@/dynamic-components/template17/components/SlotCategories/SlotCategories';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Check if screen is desktop (lg and above)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(min-width: 1024px)').matches);
    };
    checkDesktop();
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    mediaQuery.addEventListener('change', checkDesktop);
    return () => mediaQuery.removeEventListener('change', checkDesktop);
  }, []);

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

  // Slot providers - matches template14 (SlotProvidersPage): same keys, same getProviderId lookup by name
  const slotProviders = useMemo(() => {
    const providers = [
      {
        key: 'pragmatic_slot',
        id: getProviderId('Pragmatic Play'),
        logo: `${baseUrl}/logos/pragmatic-play.png`,
        name: 'Pragmatic Play',
        isLive: true,
      },
      {
        key: 'Micro',
        id: getProviderId('Micro'),
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
      {
        key: 'hacksaw_slot',
        id: getProviderId('hacksaw_slot'),
        logo: `${baseUrl}/logos/Hacksaw.png`,
        name: 'Hacksaw',
        isLive: true,
      },
      {
        key: 'jdb_arcade',
        id: getProviderId('jdb_arcade'),
        logo: `${baseUrl}/logos/JDPGaming.png`,
        name: 'JDP Gaming',
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

  // Arcade providers - matches template14: jdb_arcade, hacksaw_arcade, oriental only
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

  // Calculate column spans for last row items on desktop (5 columns)
  const getColumnSpan = (index) => {
    const totalItems = slotProviders.length;
    const itemsPerRow = 5;
    const fullRows = Math.floor(totalItems / itemsPerRow);
    const itemsInLastRow = totalItems % itemsPerRow;
    
    // If this is the last row and it's not full
    if (itemsInLastRow > 0 && index >= fullRows * itemsPerRow) {
      const positionInLastRow = index - (fullRows * itemsPerRow);
      // Distribute columns evenly: divide 5 columns among itemsInLastRow items
      // Use floor for most items, add remainder to last items (rightmost buttons get expanded)
      const baseSpan = Math.floor(itemsPerRow / itemsInLastRow);
      const remainder = itemsPerRow % itemsInLastRow;
      // Last 'remainder' items get one extra column
      return positionInLastRow >= (itemsInLastRow - remainder) ? baseSpan + 1 : baseSpan;
    }
    return 1; // Normal span for full rows
  };

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

        <div className="container mx-auto px-4 md:px-0 py-8">
          {/* Provider Buttons - Replaced slider with button grid */}
          <div className="mb-6 w-full">
            <div 
              className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 md:gap-2 lg:grid-cols-5 lg:gap-2"
            >
              {slotProviders.map((provider, index) => {
                const columnSpan = getColumnSpan(index);
                const isLastRow = (slotProviders.length % 5) > 0 && index >= Math.floor(slotProviders.length / 5) * 5;
                return (
                  <button
                    key={provider.id || provider.key}
                    type="button"
                    onClick={() => handleProviderClick(provider)}
                    style={isLastRow && isDesktop ? { gridColumn: `span ${columnSpan}` } : {}}
                    className={`flex h-auto min-h-[50px] w-full cursor-pointer items-center justify-center rounded-[5px] border bg-[#111] transition-all duration-200 hover:opacity-90 active:scale-95 ${
                    selectedProviderId === provider.id ||
                    (provider.isAllGames && selectedProviderId === 'all')
                      ? 'border-2 border-[#E8D25E] bg-[#2a2a1a] p-2 shadow-[0_0_15px_0_rgba(232,210,94,0.5)_inset,0_0_20px_0_rgba(232,210,94,0.3)] scale-[1.02]'
                      : 'border border-[#e8d25e24] p-2 hover:border-[#E8D25E]/50'
                    }`}
                  >
                    {provider.isAllGames || failedLogos.has(provider.id) ? (
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
                  </button>
                );
              })}
            </div>
          </div>

          {/* Header Bar with Categories and Search */}
          <div className="mb-6 w-full">
            <div className="flex flex-col gap-2 rounded-lg py-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {/* Left Side: Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2 overflow-x-auto sm:flex-nowrap">
                {/* Popular */}
                <button
                  type="button"
                  onClick={() => handleFilterClick('popular')}
                  className={`min-w-[80px] whitespace-nowrap rounded-[5px] border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 ${
                    selectedFilter === 'popular'
                      ? 'border-2 border-[#E8D25E] bg-[#2a2a1a] text-[#E8D25E] shadow-[0_0_10px_0_rgba(232,210,94,0.3)_inset,0_0_15px_0_rgba(232,210,94,0.2)]'
                      : 'border border-[#e8d25e24] bg-[#111] text-white hover:border-[#E8D25E]/50'
                  }`}
                >
                  {t('popular') || 'Popular'}
                </button>
                {/* New */}
                <button
                  type="button"
                  onClick={() => handleFilterClick('new')}
                  className={`min-w-[80px] whitespace-nowrap rounded-[5px] border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 ${
                    selectedFilter === 'new'
                      ? 'border-2 border-[#E8D25E] bg-[#2a2a1a] text-[#E8D25E] shadow-[0_0_10px_0_rgba(232,210,94,0.3)_inset,0_0_15px_0_rgba(232,210,94,0.2)]'
                      : 'border border-[#e8d25e24] bg-[#111] text-white hover:border-[#E8D25E]/50'
                  }`}
                >
                  {t('new') || 'New'}
                </button>
                {/* Big Win */}
                <button
                  type="button"
                  onClick={() => handleFilterClick('big_win')}
                  className={`min-w-[80px] whitespace-nowrap rounded-[5px] border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 ${
                    selectedFilter === 'big_win'
                      ? 'border-2 border-[#E8D25E] bg-[#2a2a1a] text-[#E8D25E] shadow-[0_0_10px_0_rgba(232,210,94,0.3)_inset,0_0_15px_0_rgba(232,210,94,0.2)]'
                      : 'border border-[#e8d25e24] bg-[#111] text-white hover:border-[#E8D25E]/50'
                  }`}
                >
                  {t('big_win') || 'Big Win'}
                </button>
                {/* Hot Games */}
                <button
                  type="button"
                  onClick={() => handleFilterClick('hot')}
                  className={`min-w-[80px] whitespace-nowrap rounded-[5px] border px-3 py-1.5 text-[12px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-95 ${
                    selectedFilter === 'hot'
                      ? 'border-2 border-[#E8D25E] bg-[#2a2a1a] text-[#E8D25E] shadow-[0_0_10px_0_rgba(232,210,94,0.3)_inset,0_0_15px_0_rgba(232,210,94,0.2)]'
                      : 'border border-[#e8d25e24] bg-[#111] text-white hover:border-[#E8D25E]/50'
                  }`}
                >
                  {t('hot_games') || 'Hot Games'}
                </button>
              </div>

              {/* Right Side: Search (height matches filter buttons: py-1.5) */}
              <div
                className="flex w-full items-center gap-2 rounded-[5px] border border-[#E8D25E] bg-transparent px-3 py-1.5 sm:w-auto sm:min-w-[140px] sm:flex-shrink-0 md:min-w-[180px]"
              >
                <input
                  type="text"
                  placeholder={t('search') || 'Search'}
                  className="w-full min-w-0 flex-1 bg-transparent text-[12px] text-white outline-none placeholder:text-white"
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
