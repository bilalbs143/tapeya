'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template8/components/GameProviders/GameProviders';
import LazyImage from '@/dynamic-components/template8/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template8/components/SlotCategories/SlotCategories';
import { formatProviderName, getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllGames, fetchAllProvider } from '@/website/websiteAction';
import { setSelectedProviderId } from '@/website/websiteSlice';

export default function SlotsPage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const { selectedProviderId, allProvidersData, allGamesData } = useSelector(
    (state) => state.website,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [providerSearchQuery, setProviderSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [subTextLetterSpacing, setSubTextLetterSpacing] = useState('2px');
  // Store the initial full games data for accurate provider counts
  const [fullGamesDataForCounts, setFullGamesDataForCounts] = useState(null);

  // Fetch providers on mount
  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  // Fetch all slot games to calculate provider counts (only once on mount)
  useEffect(() => {
    const fetchFullGames = async () => {
      const params = {
        page: 1,
        perPage: 1000, // Fetch a large number to get all games
        filter: { is_slot_game: true },
      };
      await dispatch(fetchAllGames(params));
    };
    fetchFullGames();
  }, [dispatch]);

  // Store the initial full games data when it's first loaded (before any filtering)
  // This ensures provider counts are calculated from all games, not just the filtered/paginated subset
  useEffect(() => {
    if (
      allGamesData &&
      allGamesData.data &&
      Array.isArray(allGamesData.data) &&
      !fullGamesDataForCounts
    ) {
      // Store the initial dataset if it has a substantial number of games (likely the full dataset)
      // Check if it has meta.total indicating it's a full dataset, or has many games
      const hasManyGames = allGamesData.data.length >= 100;
      const hasTotalMeta =
        allGamesData.meta &&
        allGamesData.meta.total &&
        allGamesData.meta.total >= 100;

      if (hasManyGames || hasTotalMeta) {
        setFullGamesDataForCounts(allGamesData);
      }
    }
  }, [allGamesData, fullGamesDataForCounts]);

  // Provider logo mapping (same as GameProviders)
  const providesNames = {
    pragmatic_slot:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-6-5.png',
    thebighit: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/bighit-5.png',
    MICRO_Slot: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-21-5.png',
    booongo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/boongo-6.png',
    PLAYNGO: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-17-5.png',
    habanero: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-9-5.png',
    TOMHORN_SLOT:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tomhorm-6.png',
    cq9: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-18-5-1.png',
    gtf: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gtf-6.png',
    spade: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-7-5.png',
    yellowbat:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/yellowbet-6.png',
    advantplay: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-10-5.png',
    askmeslot: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/askme-6.png',
    bgaming: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/bgaming-6.png',
    gpk7mj: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/mojos-6.png',
    booming: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-15-5.png',
    spinomenal:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/spinomenal-6.png',
    dbgame: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/db-gaming-6.png',
    live22: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/live22-6.png',
    cg: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/CG-6.png',
    thunderkick:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/thunderkirk-6.png',
  };

  // Get provider logo by name
  const getProviderLogo = (providerName) => {
    if (!providerName) return null;

    // Try exact match first
    const normalizedName = providerName.toLowerCase().trim();
    const exactKey = Object.keys(providesNames).find(
      (key) => key.toLowerCase() === normalizedName,
    );
    if (exactKey) return providesNames[exactKey];

    // Try with underscores replaced by spaces
    const withSpaces = normalizedName.replace(/_/g, ' ');
    const spaceKey = Object.keys(providesNames).find(
      (key) => key.toLowerCase().replace(/_/g, ' ') === withSpaces,
    );
    if (spaceKey) return providesNames[spaceKey];

    // Try with spaces replaced by underscores
    const withUnderscores = normalizedName.replace(/\s+/g, '_');
    const underscoreKey = Object.keys(providesNames).find(
      (key) => key.toLowerCase() === withUnderscores,
    );
    if (underscoreKey) return providesNames[underscoreKey];

    return null;
  };

  // Calculate game counts per provider from full games data (not filtered/paginated data)
  const providerGameCounts = useMemo(() => {
    // Use fullGamesDataForCounts if available, otherwise fallback to allGamesData
    const gamesDataToUse = fullGamesDataForCounts || allGamesData;

    if (
      !gamesDataToUse ||
      !gamesDataToUse.data ||
      !Array.isArray(gamesDataToUse.data)
    ) {
      return {};
    }

    const counts = {};
    gamesDataToUse.data.forEach((game) => {
      // Try provider_id first
      if (game.provider_id) {
        counts[game.provider_id] = (counts[game.provider_id] || 0) + 1;
      } else if (game.provider && allProvidersData) {
        // If no provider_id, try to match by provider name
        const provider = allProvidersData.find((p) => p.name === game.provider);
        if (provider && provider.id) {
          counts[provider.id] = (counts[provider.id] || 0) + 1;
        }
      }
    });

    return counts;
  }, [fullGamesDataForCounts, allGamesData, allProvidersData]);

  // Create providers list with "All Games" option
  // This list is sorted once based on game counts and maintains its order even when a provider is selected
  const providersList = useMemo(() => {
    // Get total games count from fullGamesDataForCounts or allGamesData meta.total
    const gamesDataToUse = fullGamesDataForCounts || allGamesData;
    const totalGames =
      gamesDataToUse?.meta?.total || gamesDataToUse?.data?.length || 0;

    if (!allProvidersData || !Array.isArray(allProvidersData)) {
      return [{ id: null, name: t('all_games'), gameCount: totalGames }];
    }

    const providers = [
      { id: null, name: t('all_games'), gameCount: totalGames },
    ];

    // Add all providers from API with calculated game counts
    const providerList = [];
    allProvidersData.forEach((provider) => {
      const gameCount =
        providerGameCounts[provider.id] ||
        provider.game_count ||
        provider.total_games ||
        provider.games_count ||
        provider.count ||
        0;

      providerList.push({
        id: provider.id,
        name: provider.name,
        gameCount,
      });
    });

    // Sort providers by game count (descending - highest first)
    // Only sort if we have game counts data (from fullGamesDataForCounts)
    // This ensures the sort order is stable and doesn't change when a provider is selected
    if (fullGamesDataForCounts || Object.keys(providerGameCounts).length > 0) {
      providerList.sort((a, b) => b.gameCount - a.gameCount);
    }

    // Add sorted providers to the list (after "All Games")
    providers.push(...providerList);

    return providers;
  }, [
    allProvidersData,
    providerGameCounts,
    fullGamesDataForCounts,
    allGamesData,
    t,
  ]);

  // Filter providers based on search (maintains original sort order)
  const filteredProviders = useMemo(() => {
    if (!providerSearchQuery) return providersList;
    const q = providerSearchQuery.toLowerCase();
    const filtered = providersList.filter((p) =>
      p.name.toLowerCase().includes(q),
    );

    // Maintain the original sort order from providersList (already sorted by game count)
    // No need to re-sort here as providersList is already sorted
    return filtered;
  }, [providersList, providerSearchQuery]);

  // Handle provider selection
  const handleProviderSelect = (providerId) => {
    dispatch(setSelectedProviderId(providerId));
  };

  // Get selected provider info
  const selectedProvider = useMemo(() => {
    if (!selectedProviderId || !allProvidersData) return null;
    return allProvidersData.find((p) => p.id === selectedProviderId);
  }, [selectedProviderId, allProvidersData]);

  // Update sub text letter spacing based on screen size
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateLetterSpacing = () => {
      if (window.innerWidth < 768) {
        setSubTextLetterSpacing('2px');
      } else {
        setSubTextLetterSpacing('5px');
      }
    };
    updateLetterSpacing();
    window.addEventListener('resize', updateLetterSpacing);
    return () => window.removeEventListener('resize', updateLetterSpacing);
  }, []);

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt={t('lines_pattern')}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Slot Detail Hero Banner */}
        <section
          className="relative mx-auto w-full overflow-hidden"
          aria-label={t('hero_section')}
        >
          <div className="relative min-h-[200px] w-full overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <div className="relative hidden w-full md:block">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-8.webp"
                alt={t('hero_banner_alt')}
                width={1920}
                height={600}
                className="block h-auto w-full rounded-[5px] object-cover"
                priority
              />
            </div>

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <div className="relative block w-full md:hidden">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-mob-8.webp"
                alt={t('hero_banner_alt')}
                width={1920}
                height={600}
                className="block h-auto w-full rounded-[5px] object-cover"
                priority
              />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 sm:pt-6 md:mt-6 md:items-center md:justify-start md:pt-0 md:pl-16">
              <div className="w-auto max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-none">
                <div className="flex flex-col items-start">
                  {/* YOUR JACKPOT JOURNEY STARTS HERE. */}
                  <h2 className="font-bring-race text-left text-[18px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-lg lg:text-[30px] xl:text-[40px] 2xl:text-[50px]">
                    {t('your_jackpot')}
                    <br />
                    {t('journey_starts_here')}
                  </h2>

                  {/* Dive into our in-house Slots fantasy */}
                  <p
                    className="text-left text-[12px] font-bold text-[#636363] sm:text-xs md:text-[12px] lg:text-[14px]"
                    style={{
                      letterSpacing: subTextLetterSpacing,
                    }}
                  >
                    {t('slots_fantasy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-6">
          {/* GameProviders Component - Mobile Only */}
          <div className="block lg:hidden">
            <GameProviders />
          </div>

          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left Sidebar - Providers List - Desktop Only */}
            <div
              className="flex hidden w-full flex-shrink-0 flex-col self-start rounded-[5px] pt-0 lg:block lg:w-[280px]"
              style={{
                border: '1px solid rgba(45, 250, 26, 0.30)',
                backgroundColor: '#0A1414',
              }}
            >
              {/* Search Providers */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder={t('search_providers') || 'Search Providers'}
                  className="w-full bg-transparent px-6 py-4 text-sm text-white outline-none placeholder:text-[#9CA3AF]"
                  style={{
                    borderBottom: '1px solid rgba(45, 250, 26, 0.30)',
                  }}
                  value={providerSearchQuery}
                  onChange={(e) => setProviderSearchQuery(e.target.value)}
                />
                <div className="absolute right-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                      stroke="#2DFA1A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 14L11.1 11.1"
                      stroke="#2DFA1A"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>

              {/* Slot Providers Title */}
              <h3 className="mt-4 mb-4 px-6 text-base font-bold text-white">
                {t('slot_providers') || 'Slot Providers'}
              </h3>

              {/* Providers List */}
              <div
                className="hide-scrollbar space-y-2 px-4"
                style={{
                  scrollbarWidth: 'none', // Firefox
                  msOverflowStyle: 'none', // IE and Edge
                }}
              >
                {filteredProviders.map((provider) => {
                  const isSelected =
                    (provider.id === null && selectedProviderId === null) ||
                    provider.id === selectedProviderId;

                  return (
                    <div
                      key={provider.id || 'all'}
                      onClick={() => handleProviderSelect(provider.id)}
                      className={`flex cursor-pointer items-center justify-between rounded-[5px] px-3 py-2 text-sm transition-colors ${
                        isSelected
                          ? 'text-[#2DFA1A]'
                          : 'text-white hover:text-[#2DFA1A]'
                      }`}
                    >
                      <span>
                        {provider.id === null
                          ? provider.name
                          : formatProviderName(provider.name)}
                      </span>
                      <span className="ml-2 text-white">
                        ({provider.gameCount || 0})
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar Bottom Image */}
              <div className="mt-4 px-4">
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-sidebar-bottom-img-8.webp"
                  alt="Sidebar decoration"
                  className="h-auto w-full rounded-[5px]"
                />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {/* Header */}
              <div className="mb-6 w-full">
                <div className="mt-4 flex flex-col gap-4 md:mt-0 md:flex-row md:items-center md:justify-between">
                  {/* Left: Provider Name */}
                  <div className="mb-2 md:mb-0">
                    <h3 className="font-bring-race text-lg tracking-wide text-white uppercase md:text-xl">
                      {selectedProviderId && allProvidersData
                        ? getProviderNameById(
                          selectedProviderId,
                          allProvidersData,
                        ) || t('slots')
                        : t('slots')}
                    </h3>
                  </div>

                  {/* Right: Search Bar and Provider Logo */}
                  <div className="flex flex-1 items-center gap-3 md:justify-end">
                    {/* Search Bar */}
                    <div
                      className="relative flex w-full items-center rounded-[5px] px-3 md:w-auto md:max-w-[500px] md:min-w-[300px]"
                      style={{
                        height: '56px',
                        border: '1px solid rgba(45, 250, 26, 0.30)',
                        backgroundColor: '#0A1414',
                      }}
                    >
                      <input
                        type="text"
                        placeholder={t('search_game')}
                        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF]"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
                          stroke="#2DFA1A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 14L11.1 11.1"
                          stroke="#2DFA1A"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>

                    {/* Provider Logo Container - Hidden on Mobile */}
                    {selectedProvider && (
                      <div
                        className="hidden items-center justify-center rounded-[5px] px-4 md:flex"
                        style={{
                          height: '56px',
                          border: '1px solid rgba(45, 250, 26, 0.30)',
                          backgroundColor: '#0A1414',
                        }}
                      >
                        {getProviderLogo(selectedProvider.name) ? (
                          <LazyImage
                            src={getProviderLogo(selectedProvider.name)}
                            alt={selectedProvider.name}
                            width={120}
                            height={40}
                            className="h-8 w-auto object-contain sm:h-10"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-white">
                            {selectedProvider.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Game Cards */}
              <SlotCategories searchQuery={searchQuery} />
            </div>
          </div>
        </div>
        {/* Bottom Curved Pattern above footer (positioned, no layout shift) */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-[420px]"
          aria-hidden
        >
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/curved-pattern.svg"
            alt={t('curved_pattern_alt')}
            className="h-full w-full object-cover opacity-30"
          />
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-0">
        <div className="px-0 pt-8 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-8.webp"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-8.webp"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
            />

            {/* Text Overlay - Top-center on mobile, right aligned on desktop */}
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-8 sm:pt-6 md:items-center md:justify-end md:pt-6 md:pr-20 md:pl-6 lg:pt-0 lg:pl-20">
              <div className="w-auto max-w-[calc(100%-2rem)] text-left sm:max-w-[calc(100%-3rem)] md:max-w-none">
                <div className="flex flex-col items-start">
                  <h2 className="!lg:text-[35px] font-bring-race text-[18px] leading-tight tracking-[1px] text-white uppercase sm:text-[18px] md:text-[30px] xl:text-[40px]">
                    {t('the_gods_play_dice')}
                    <br />
                    {t('so_do_we')}
                  </h2>
                  {/* Dive into our in-house Casino fantasy */}
                  <p
                    className="text-left text-[12px] font-bold text-[#636363] sm:text-xs md:text-[12px] lg:text-[14px]"
                    style={{
                      letterSpacing: subTextLetterSpacing,
                    }}
                  >
                    {t('dive_into_our_in_house_casino_fantasy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
