'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template17/components/LazyImage/LazyImage';
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
  const [selectedCasinoProvider, setSelectedCasinoProvider] = useState(null);
  const [failedLogos, setFailedLogos] = useState(new Set());
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

  // Live casino providers - matches template14: same ids, provider keys, and order
  const liveCasinoProviders = useMemo(() => {
    const fallbackIds = {
      evolution: '1883',
      TOMHORN_7Mojos: '5174',
      TOMHORN_AbsoluteLive: '5148',
      TOMHORN_VIVO: '5192',
      dream: '1857',
      sa: '5031',
      agin: '1301',
      SEXYBCRT: '1421',
      cq9_casino: '1856',
    };

    const logoFilenames = {
      evolution: 'Evolution-16.png',
      TOMHORN_7Mojos: '7mojos-16.png',
      TOMHORN_AbsoluteLive: 'Absolute-16.png',
      TOMHORN_VIVO: 'vivo-16.png',
      dream: 'Dreamgaming-16.png',
      sa: 'sagaming-16.png',
      agin: 'AsiaGaming-16.png',
      SEXYBCRT: 'SexyGaming-16.png',
      cq9_casino: 'cq9.png',
    };

    // Template17 background images (keep template17 assets)
    const backgrounds = {
      evolution:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution3-up.webp',
      TOMHORN_7Mojos:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos3-up.webp',
      TOMHORN_AbsoluteLive:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute3-up.webp',
      TOMHORN_VIVO:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo3-up.webp',
      dream:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cream-gaming3-up.webp',
      sa:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game3-up.webp',
      agin:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/agin3.webp',
      SEXYBCRT:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-ae3.webp',
      cq9_casino:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cq93-up.webp',
    };

    return [
      {
        key: 'evolution',
        id: getProviderId('evolution') || fallbackIds.evolution,
        provider: 'evolution',
        name: 'Evolution',
        logo: `${baseUrl}/logos/${logoFilenames.evolution}`,
        background: backgrounds.evolution,
        isLive: true,
      },
      {
        key: 'TOMHORN_7Mojos',
        id: getProviderId('TOMHORN_7Mojos') || fallbackIds.TOMHORN_7Mojos,
        provider: 'TOMHORN_7Mojos',
        name: '7 Mojos',
        logo: `${baseUrl}/logos/${logoFilenames.TOMHORN_7Mojos}`,
        background: backgrounds.TOMHORN_7Mojos,
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
        background: backgrounds.TOMHORN_AbsoluteLive,
        isLive: true,
      },
      {
        key: 'TOMHORN_VIVO',
        id: getProviderId('TOMHORN_VIVO') || fallbackIds.TOMHORN_VIVO,
        provider: 'TOMHORN_VIVO',
        name: 'Vivo',
        logo: `${baseUrl}/logos/${logoFilenames.TOMHORN_VIVO}`,
        background: backgrounds.TOMHORN_VIVO,
        isLive: true,
      },
      {
        key: 'dream',
        id: getProviderId('dream') || fallbackIds.dream,
        provider: 'dream',
        name: 'Dream Gaming',
        logo: `${baseUrl}/logos/${logoFilenames.dream}`,
        background: backgrounds.dream,
        isLive: true,
      },
      {
        key: 'sa',
        id: getProviderId('sa') || fallbackIds.sa,
        provider: 'sa',
        name: 'Sa Game',
        logo: `${baseUrl}/logos/${logoFilenames.sa}`,
        background: backgrounds.sa,
        isLive: true,
      },
      {
        key: 'agin',
        id: getProviderId('agin') || fallbackIds.agin,
        provider: 'agin',
        name: 'Agin',
        logo: `${baseUrl}/logos/${logoFilenames.agin}`,
        background: backgrounds.agin,
        isLive: true,
      },
      {
        key: 'SEXYBCRT',
        id: getProviderId('SEXYBCRT') || fallbackIds.SEXYBCRT,
        provider: 'SEXYBCRT',
        name: 'SEXYBCRT',
        logo: `${baseUrl}/logos/${logoFilenames.SEXYBCRT}`,
        background: backgrounds.SEXYBCRT,
        isLive: true,
      },
      {
        key: 'cq9_casino',
        id: getProviderId('cq9_casino') || fallbackIds.cq9_casino,
        provider: 'cq9_casino',
        name: 'CQ9',
        logo: `${baseUrl}/logos/${logoFilenames.cq9_casino}`,
        background: backgrounds.cq9_casino,
        isLive: true,
      },
    ];
  }, [getProviderId, baseUrl]);

  // Table game providers - matches template14: Micro LIVE only (template17 background)
  const tableGameProviders = [
    {
      key: 'Micro LIVE',
      id: '4393',
      provider: 'Micro LIVE',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/microgaming3-up.webp',
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

  const filteredProviders = providers;

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

  // Calculate column spans for last row items on desktop (5 columns)
  const getColumnSpan = (index, totalItems) => {
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
    <div className="text-white">
      <div className="container mx-auto px-4 py-8 md:px-0">
        {/* Provider Buttons - Grid layout same as slot page */}
        {category === 'live' && (
          <div className="mb-6 w-full">
            <div 
              className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 md:gap-2 lg:grid-cols-5 lg:gap-2"
            >
              {filteredProviders.map((provider, index) => {
                const columnSpan = getColumnSpan(index, filteredProviders.length);
                const isLastRow = (filteredProviders.length % 5) > 0 && index >= Math.floor(filteredProviders.length / 5) * 5;
                return (
                  <button
                    key={provider.id || provider.key}
                    type="button"
                    onClick={() => handleProviderClick(provider)}
                    style={isLastRow && isDesktop ? { gridColumn: `span ${columnSpan}` } : {}}
                    className={`flex h-auto min-h-[50px] w-full cursor-pointer items-center justify-center rounded-[5px] border bg-[#111] transition-all duration-200 hover:opacity-90 active:scale-95 ${
                    (provider.isAllProviders && selectedProviderId === 'all') ||
                    (!provider.isAllProviders && selectedProviderId === provider.id)
                      ? 'border-2 border-[#E8D25E] bg-[#2a2a1a] p-2 shadow-[0_0_15px_0_rgba(232,210,94,0.5)_inset,0_0_20px_0_rgba(232,210,94,0.3)] scale-[1.02]'
                      : 'border border-[#e8d25e24] p-2 hover:border-[#E8D25E]/50'
                    }`}
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
                  </button>
                );
              })}
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
