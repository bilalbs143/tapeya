'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template22/components/LazyImage/LazyImage';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { fetchAllProvider } from '@/website/websiteAction';
import { setSelectedProviderId } from '@/website/websiteSlice';

function LiveCasinoPage({ categoryOverride }) {
  const { handlePlayGame, isLaunching } = useGameLaunch();
  const { t, currentLocale } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = categoryOverride ?? searchParams.get('q') ?? 'live'; // categoryOverride for embedded (e.g. dashboard); else URL

  const { allProvidersData, selectedProviderId } = useSelector(
    (state) => state.website,
  );

  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCasinoProvider, setSelectedCasinoProvider] = useState(null);
  const [failedLogos, setFailedLogos] = useState(new Set());
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [shuffledProviders, setShuffledProviders] = useState(null);
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
  const tableGameProviders = useMemo(() => [
    {
      key: 'MICRO_Casino_Table',
      id: '4393',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      logo: `${baseUrl}/logos/microgaming.png`,
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/microgaming3-up.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '5095',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      logo: `${baseUrl}/logos/crypto-poker-white.png`,
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/poker3-up.webp',
      isLive: true,
    },
  ], [baseUrl]);

  // Determine which providers to display based on query parameter
  const { providers, pageTitle, pageAltText } = useMemo(() => {
    // "All Providers" option
    const allProvidersOption = {
      key: 'all',
      id: 'all',
      name: t('all_casino_providers', 'All Casino Providers'),
      logo: null,
      isAllProviders: true,
    };

    switch (category) {
      case 'table':
        return {
          providers: [
            { ...allProvidersOption, name: t('all_table_games') || 'All Table Games' },
            ...tableGameProviders,
          ],
          pageTitle: t('table_games', 'Table Games'),
          pageAltText: 'Table Games Providers',
        };
      case 'live':
      default:
        return {
          providers: [allProvidersOption, ...liveCasinoProviders],
          pageTitle: t('live_casino_providers'),
          pageAltText: 'Live Casino Providers',
        };
    }
  }, [category, liveCasinoProviders, tableGameProviders, t]);

  // Handle filter selection - toggle filter on/off and shuffle providers
  const handleFilterClick = (filterKey) => {
    const newFilter = selectedFilter === filterKey ? null : filterKey;
    setSelectedFilter(newFilter);
    
    if (newFilter) {
      // Shuffle providers array using Fisher-Yates shuffle algorithm
      const shuffled = [...providers];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setShuffledProviders(shuffled);
    } else {
      // Reset to original order when filter is cleared
      setShuffledProviders(null);
    }
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
    setSelectedFilter(null);
  }, [category]);

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
    if (providers.length > 0 && !selectedProviderId && (category === 'live' || category === 'table')) {
      // Default to "All Casino Providers" or "All Table Games"
      dispatch(setSelectedProviderId('all'));
      setSelectedCasinoProvider(null);
    }
  }, [providers, selectedProviderId, category, dispatch]);

  // Select provider from URL (e.g. from Categories hover link: ?q=live&provider=evolution)
  const appliedUrlProviderRef = React.useRef(false);
  useEffect(() => {
    const providerKey = searchParams.get('provider');
    if (!providerKey || providers.length === 0 || appliedUrlProviderRef.current) return;
    const provider = providers.find(
      (p) =>
        (p.key && p.key === providerKey) ||
        (p.provider && p.provider.toLowerCase() === providerKey.toLowerCase()),
    );
    if (provider && !provider.isAllProviders) {
      appliedUrlProviderRef.current = true;
      setSelectedCasinoProvider(provider);
      dispatch(setSelectedProviderId(provider.id));
    }
  }, [providers, searchParams, dispatch]);

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

  // Calculate column spans for last row items on desktop (5 columns)
  const getColumnSpan = (index, totalItems) => {
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
    <div className="text-white bg-transparent">
      <div className="container mx-auto py-6">
        {/* Category Dropdown - hidden per design */}
        <div className="mb-4 w-full flex justify-end pt-6 hidden">
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

        {/* Provider Buttons - Same as slot page */}
        {(category === 'live' || category === 'table') && (
          <div className="mb-6 w-full">
            <div className="flex flex-wrap sm:flex-wrap">
              {filteredProviders.map((provider, index) => {
                const isActive = (provider.isAllProviders && selectedProviderId === 'all') ||
                  (!provider.isAllProviders && selectedProviderId === provider.id);
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
                    {provider.isAllProviders || failedLogos.has(provider.id) ? (
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

        {/* Casino Provider Card or Grid */}
        {(category === 'live' || category === 'table') && selectedCasinoProvider && selectedProviderId !== 'all' ? (
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
                  <div className="absolute inset-0 z-20 bg-[rgba(236,77,73,0.55)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] text-white shadow-none transition-transform disabled:opacity-50 sm:h-12 sm:w-12"
                    disabled={isLaunching(selectedCasinoProvider.id)}
                  >
                    {isLaunching(selectedCasinoProvider.id) ? (
                      <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#ec4d49] border-t-transparent bg-transparent" />
                    ) : (
                      <svg
                        className="h-3 w-3 sm:h-4 sm:w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
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
                    background:
                      'linear-gradient(#f17a77,#ee5f5b 60%,#ec4d49)',
                    color: '#ffffff',
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
                          <div className="absolute inset-0 z-20 bg-[rgba(236,77,73,0.55)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                      </div>

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <button
                            type="button"
                            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] text-white shadow-none transition-transform disabled:opacity-50 sm:h-16 sm:w-16"
                            disabled={isLaunching(provider.id)}
                          >
                            {isLaunching(provider.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#ec4d49] border-t-transparent bg-transparent" />
                          ) : (
                            <svg
                              className="h-4 w-4 sm:h-6 sm:w-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
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
                            background:
                            'linear-gradient(#f17a77,#ee5f5b 60%,#ec4d49)',
                            color: '#ffffff',
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
