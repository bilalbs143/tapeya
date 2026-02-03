'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import SlotCategories from '@/dynamic-components/template21/components/SlotCategories/SlotCategories';
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

export default function SlotsPage({ categoryOverride }) {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = categoryOverride ?? searchParams.get('category') ?? 'slots'; // categoryOverride for embedded (e.g. dashboard); else URL
  const isDashboardHome = pathname?.startsWith?.('/dashboard/home');

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

  // Arcade providers - matches exactly with SlotProvidersPage (with logos for provider bar)
  const arcadeProviders = useMemo(
    () => [
      {
        key: 'jdb_arcade',
        id: getProviderId('jdb_arcade'),
        logo: `${baseUrl}/logos/JDPGaming.png`,
        name: 'JDP Gaming',
        isLive: true,
      },
      {
        key: 'hacksaw_arcade',
        id: getProviderId('hacksaw_arcade'),
        logo: `${baseUrl}/logos/Hacksaw.png`,
        name: 'Hacksaw',
        isLive: true,
      },
      {
        key: 'oriental',
        id: getProviderId('oriental'),
        logo: `${baseUrl}/logos/Oriental.png`,
        name: 'Oriental Game',
        isLive: true,
      },
      {
        key: 'fc_arcade',
        id: getProviderId('fc_arcade'),
        logo: `${baseUrl}/logos/fc_arcade.png`,
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

  // Auto-select "All Games" on mount - always pre-select on initial load
  useEffect(() => {
    if (allProviders.length > 0 && isInitialLoad) {
      const allGamesProvider = allProviders.find((p) => p.isAllGames);
      if (allGamesProvider) {
        dispatch(setSelectedProviderId('all'));
        setIsInitialLoad(false);
      }
    }
  }, [allProviders, isInitialLoad, dispatch]);

  // Select provider from URL (e.g. from Categories hover link: ?category=slots&provider=pragmatic_slot)
  const appliedUrlProviderRef = React.useRef(false);
  useEffect(() => {
    const providerKey = searchParams.get('provider');
    if (!providerKey || allProviders.length === 0 || appliedUrlProviderRef.current) return;
    const provider = allProviders.find(
      (p) => p.key === providerKey || (p.key && p.key.toLowerCase() === providerKey.toLowerCase()),
    );
    if (provider && provider.id) {
      appliedUrlProviderRef.current = true;
      dispatch(setSelectedProviderId(provider.id));
      setIsInitialLoad(false);
    }
  }, [allProviders, searchParams, dispatch]);

  // Get current provider name and logo for banner and title
  const currentProvider = useMemo(() => {
    if (selectedProviderId && allProviders.length > 0) {
      // Try to find provider by ID or key (handle both string and number comparison)
      const provider = allProviders.find(
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
  }, [selectedProviderId, allProvidersData, allProviders, t]);

  const currentProviderName = currentProvider.name;
  const currentProviderLogo = currentProvider.logo;

  // Handle filter selection (toggle filter on/off)
  const handleFilterClick = (filterKey) => {
    setSelectedFilter(selectedFilter === filterKey ? null : filterKey);
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
    const totalItems = allProviders.length;
    const itemsPerRow = 5;
    const fullRows = Math.floor(totalItems / itemsPerRow);
    const itemsInLastRow = totalItems % itemsPerRow;
    
    // If this is the last row and it's not full
    if (itemsInLastRow > 0 && index >= fullRows * itemsPerRow) {
      const positionInLastRow = index - (fullRows * itemsPerRow);
      // Distribute columns evenly: divide 5 columns among itemsInLastRow items
      // Use floor for most items, add remainder to first items
      const baseSpan = Math.floor(itemsPerRow / itemsInLastRow);
      const remainder = itemsPerRow % itemsInLastRow;
      // First 'remainder' items get one extra column
      return positionInLastRow < remainder ? baseSpan + 1 : baseSpan;
    }
    return 1; // Normal span for full rows
  };

  return (
    <>
      <div className={`relative min-h-screen ${isDashboardHome ? 'bg-transparent' : 'bg-[#402f04]'}`}>
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt="Lines Pattern"
            className="h-full w-full object-cover"
          />
        </div>

        <div className="container mx-auto py-6">
          {/* Category Dropdown - hidden per design */}
          <div className="mb-4 w-full flex justify-end hidden">
            <UiSelect
              value={category}
              onValueChange={(val) => {
                if (val === 'live' || val === 'table') {
                  router.push(`/live-casino?q=${val}`);
                } else {
                  router.push(`/slots?category=${val}`);
                }
              }}
            >
              <SelectTrigger
                className="relative flex h-[36px] w-[140px] items-center justify-between rounded-[4px] border border-[rgba(0,0,0,0.6)] px-3 pr-8 text-sm font-semibold text-white shadow-none focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[40px] sm:w-[160px] md:w-[180px] [&_svg]:text-white"
                style={{
                  backgroundImage: 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
                  textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
                }}
              >
                <SelectValue
                  placeholder="Select Category"
                  className={category ? 'text-white' : 'text-white/70'}
                />
              </SelectTrigger>
              <SelectContent
                className="z-50 max-h-[200px] w-full rounded-[4px] border border-[rgba(0,0,0,0.6)] bg-[#191b1d]"
                side="bottom"
                align="end"
              >
                <SelectItem
                  value="slots"
                  className="cursor-pointer text-white capitalize focus:bg-[#313539] focus:text-white data-[highlighted]:bg-[#313539] data-[highlighted]:text-white"
                >
                  {t('slots') || 'Slot'}
                </SelectItem>
                <SelectItem
                  value="arcade"
                  className="cursor-pointer text-white capitalize focus:bg-[#313539] focus:text-white data-[highlighted]:bg-[#313539] data-[highlighted]:text-white"
                >
                  {t('arcade') || 'Arcade'}
                </SelectItem>
                <SelectItem
                  value="hybrid"
                  className="cursor-pointer text-white capitalize focus:bg-[#313539] focus:text-white data-[highlighted]:bg-[#313539] data-[highlighted]:text-white"
                >
                  {t('hybrid_games') || 'Hybrid'}
                </SelectItem>
                <SelectItem
                  value="table"
                  className="cursor-pointer text-white capitalize focus:bg-[#313539] focus:text-white data-[highlighted]:bg-[#313539] data-[highlighted]:text-white"
                >
                  {t('table_games') || 'Table Games'}
                </SelectItem>
                <SelectItem
                  value="live"
                  className="cursor-pointer text-white capitalize focus:bg-[#313539] focus:text-white data-[highlighted]:bg-[#313539] data-[highlighted]:text-white"
                >
                  {t('casino') || 'Live Casino'}
                </SelectItem>
              </SelectContent>
            </UiSelect>
          </div>

          {/* Provider Buttons - Replaced slider with button grid */}
          {allProviders.length > 0 && (
            <div className="mb-6 w-full">
              <div className="flex flex-wrap sm:flex-wrap">
                {allProviders.map((provider, index) => {
                  const isActive = selectedProviderId === provider.id ||
                  (provider.isAllGames && selectedProviderId === 'all');
                  return (
                    <button
                      key={provider.id || provider.key}
                      type="button"
                      onClick={() => handleProviderClick(provider)}
                      className="flex h-auto min-h-[50px] cursor-pointer items-center gap-2 justify-center text-white transition-all rounded-[4px] ml-[2px] mb-[2px] group flex-1 min-w-[calc(50%-4px)] sm:flex-initial sm:min-w-0"
                      style={{
                        backgroundImage: isActive 
                      ? 'linear-gradient(#020202, #101112 40%, #191b1d)'
                      : 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
                        border: '1px solid rgba(0, 0, 0, 0.6)',
                        textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
                        padding: '10px 15px',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundImage = 'linear-gradient(#020202, #101112 40%, #191b1d)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundImage = 'linear-gradient(#484e55, #3a3f44 60%, #313539)';
                        }
                      }}
                    >
                      {provider.isAllGames || failedLogos.has(provider.id) ? (
                    <span className="text-center font-semibold text-white text-[13px] sm:text-[16px]">
                      {provider.name}
                    </span>
                  ) : provider.logo ? (
                    <>
                      <img
                        src={provider.logo}
                        alt={provider.name || t('game_provider')}
                        className="h-auto max-h-4 w-auto max-w-[40px] sm:max-h-6 sm:max-w-[60px] object-contain flex-shrink-0"
                        onError={() => {
                          setFailedLogos((prev) =>
                            new Set(prev).add(provider.id),
                          );
                        }}
                        loading="lazy"
                      />
                      <span className="text-center font-semibold text-white whitespace-nowrap text-[13px] sm:text-[16px]">
                        {provider.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-center font-semibold text-white text-[13px] sm:text-[16px]">
                      {provider.name}
                    </span>
                  )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Header Bar with Categories and Search */}
          {allProviders.length > 0 && (
            <div className="mb-6 w-full">
              <div className="flex flex-col gap-3 rounded-lg py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                {/* Left Side: Filter Buttons */}
                <div className="flex flex-wrap sm:flex-nowrap">
                  {/* Popular */}
                  <button
                    type="button"
                    onClick={() => handleFilterClick('popular')}
                    className="flex items-center justify-center text-white text-[13px] sm:text-[14px] transition-all rounded-[4px] ml-[2px] mb-[2px] group"
                    style={{
                      backgroundImage: selectedFilter === 'popular'
                      ? 'linear-gradient(#020202, #101112 40%, #191b1d)'
                      : 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
                      border: '1px solid rgba(0, 0, 0, 0.6)',
                      textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
                      padding: '10px 15px',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFilter !== 'popular') {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(#020202, #101112 40%, #191b1d)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFilter !== 'popular') {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(#484e55, #3a3f44 60%, #313539)';
                      }
                    }}
                  >
                    {t('popular') || 'Popular'}
                  </button>
                  {/* New */}
                  <button
                    type="button"
                    onClick={() => handleFilterClick('new')}
                    className="flex items-center justify-center text-white text-[13px] sm:text-[14px] transition-all rounded-[4px] ml-[2px] mb-[2px] group"
                    style={{
                      backgroundImage: selectedFilter === 'new'
                      ? 'linear-gradient(#020202, #101112 40%, #191b1d)'
                      : 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
                      border: '1px solid rgba(0, 0, 0, 0.6)',
                      textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
                      padding: '10px 15px',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFilter !== 'new') {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(#020202, #101112 40%, #191b1d)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFilter !== 'new') {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(#484e55, #3a3f44 60%, #313539)';
                      }
                    }}
                  >
                    {t('new') || 'New'}
                  </button>
                  {/* Big Win */}
                  <button
                    type="button"
                    onClick={() => handleFilterClick('big_win')}
                    className="flex items-center justify-center text-white text-[13px] sm:text-[14px] transition-all rounded-[4px] ml-[2px] mb-[2px] group"
                    style={{
                      backgroundImage: selectedFilter === 'big_win'
                      ? 'linear-gradient(#020202, #101112 40%, #191b1d)'
                      : 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
                      border: '1px solid rgba(0, 0, 0, 0.6)',
                      textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
                      padding: '10px 15px',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFilter !== 'big_win') {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(#020202, #101112 40%, #191b1d)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFilter !== 'big_win') {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(#484e55, #3a3f44 60%, #313539)';
                      }
                    }}
                  >
                    {t('big_win') || 'Big Win'}
                  </button>
                  {/* Hot Games */}
                  <button
                    type="button"
                    onClick={() => handleFilterClick('hot')}
                    className="flex items-center justify-center text-white text-[13px] sm:text-[14px] transition-all rounded-[4px] ml-[2px] mb-[2px] group"
                    style={{
                      backgroundImage: selectedFilter === 'hot'
                      ? 'linear-gradient(#020202, #101112 40%, #191b1d)'
                      : 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
                      border: '1px solid rgba(0, 0, 0, 0.6)',
                      textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
                      padding: '10px 15px',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedFilter !== 'hot') {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(#020202, #101112 40%, #191b1d)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedFilter !== 'hot') {
                        e.currentTarget.style.backgroundImage = 'linear-gradient(#484e55, #3a3f44 60%, #313539)';
                      }
                    }}
                  >
                    {t('hot_games') || 'Hot Games'}
                  </button>
                </div>

                {/* Right Side: Search */}
                <div className="flex h-8 w-full items-center sm:h-9 sm:w-auto sm:flex-shrink-0">
                  <input
                    type="text"
                    placeholder={t('search_game') || 'Search Game'}
                    className="h-full flex-1 rounded-l-lg bg-white px-3 text-sm text-black outline-none placeholder:text-[#888888]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="button"
                    className="flex h-full items-center justify-center rounded-r-lg px-3 text-white shadow-none transition-opacity hover:opacity-90"
                    style={{
                      backgroundImage: 'linear-gradient(#f17a77, #ee5f5b 60%, #ec4d49)',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="flex-shrink-0"
                    >
                      <path
                        d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Show games if providers exist, otherwise show Coming Soon */}
        {allProviders.length > 0 ? (
          <SlotCategories gameFilter={gameFilter} />
        ) : (
          <div className="container mx-auto px-4 py-20">
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
          </div>
        )}
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
