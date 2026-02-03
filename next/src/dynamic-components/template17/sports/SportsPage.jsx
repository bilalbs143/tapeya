'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template17/components/LazyImage/LazyImage';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';
import { fetchAllProvider } from '@/website/websiteAction.js';
import { setSelectedProviderId } from '@/website/websiteSlice.js';

const BASE_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next';

// Sports providers – exact match with Template13 (same list, thumbnails, logos)
const SPORTS_PROVIDERS = [
  { key: 'sports-1', name: 'SBO Sportsbook', icon: 'Sports-1-17.png', logo: 'SBOBET.png', background: `${BASE_URL}/icons/Sports-1-17.png`, isLive: false },
  { key: 'sports-2', name: 'SBO Sportsbook Wap', icon: 'Sports-2-5-up.png', logo: 'SBOBET-wap.png', background: `${BASE_URL}/icons/Sports-2-17.png`, isLive: false },
  { key: 'sports-3', name: 'Saba Sports', icon: 'Sports-3-5-up.png', logo: 'SABA-SPORTS.png', background: `${BASE_URL}/icons/Sports-3-17.png`, isLive: false },
  { key: 'sports-4', name: 'AFB Sports', icon: 'Sports-4-5-up.png', logo: 'AFB.png', background: `${BASE_URL}/icons/Sports-4-17.png`, isLive: false },
  { key: 'sports-5', name: 'BTI Sports', icon: 'Sports-5-5-up.png', logo: 'BTI-SPORTS.png', background: `${BASE_URL}/icons/Sports-5-17.png`, isLive: false },
  { key: 'sports-6', name: 'Panda Sports', icon: 'Sports-6-5-up.png', logo: 'PANDA-SPORTS.png', background: `${BASE_URL}/icons/Sports-6-17.png`, isLive: false },
  { key: 'sports-7', name: 'Lucky Sports', icon: 'Sports-7-5-up.png', logo: 'LUCKY-SPORTS.png', background: `${BASE_URL}/icons/Sports-7-17.png`, isLive: false },
  { key: 'sports-8', name: 'AP Gaming', icon: 'Sports-8-5-up.png', logo: 'ap-gaming.png', background: `${BASE_URL}/icons/Sports-9-17.png`, isLive: false },
];

const VIRTUAL_SPORTS_PROVIDERS = [
  { key: 'virtual-sports-1', name: 'SBO Virtual Sports', icon: 'VSports-1-5-up.png', logo: 'SBOBET-vs.png', background: `${BASE_URL}/icons/VSports-1-17.png`, isLive: false },
];

export default function SportsPage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();

  const { selectedProviderId, allProvidersData } = useSelector(
    (state) => state.website,
  );
  const { isAuth } = useSelector((state) => state.auth);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [failedLogos, setFailedLogos] = useState(new Set());

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

  // Function to get provider ID from API data by matching key/name (for selection state)
  const getProviderId = (providerKey) => {
    if (!allProvidersData || !Array.isArray(allProvidersData)) return null;
    const match = allProvidersData.find(
      (p) => p.name && p.name.toLowerCase() === providerKey.toLowerCase(),
    );
    return match ? match.id : null;
  };

  // Regular Sports providers – same as Template13, with id resolved from API when available
  const regularSportsProviders = useMemo(() => {
    return SPORTS_PROVIDERS.map((p) => ({
      ...p,
      id: getProviderId(p.key) ?? getProviderId(p.name?.replace(/\s+/g, '_').toLowerCase()) ?? p.key,
    }));
  }, [allProvidersData]);

  // Virtual Sports providers – same as Template13
  const virtualSportsProviders = useMemo(() => {
    return VIRTUAL_SPORTS_PROVIDERS.map((p) => ({
      ...p,
      id: getProviderId(p.key) ?? p.key,
    }));
  }, [allProvidersData]);

  // Combined providers for "All Games" selection (for banner/selection state)
  const allSportsProviders = useMemo(() => {
    return [
      {
        key: 'all',
        id: 'all',
        name: t('all_games', 'All Games'),
        logo: null,
        background: null,
        isAllGames: true,
      },
      ...regularSportsProviders,
      ...virtualSportsProviders,
    ];
  }, [regularSportsProviders, virtualSportsProviders, t]);

  // Sports-only row: All Games + regular sports providers (for filter bar)
  const sportsFilterProviders = useMemo(() => {
    return [
      {
        key: 'all',
        id: 'all',
        name: t('all_games', 'All Games'),
        logo: null,
        background: null,
        isAllGames: true,
      },
      ...regularSportsProviders,
    ];
  }, [regularSportsProviders, t]);

  // Filtered sports thumbnails: show all when "All Games", else only the selected provider
  const filteredSportsThumbnails = useMemo(() => {
    if (!selectedProviderId || selectedProviderId === 'all') {
      return regularSportsProviders;
    }
    const isVirtual = virtualSportsProviders.some(
      (p) => p.id === selectedProviderId || p.key === selectedProviderId,
    );
    if (isVirtual) return [];
    return regularSportsProviders.filter(
      (p) => p.id === selectedProviderId || p.key === selectedProviderId,
    );
  }, [selectedProviderId, regularSportsProviders, virtualSportsProviders]);

  // Filtered virtual sports thumbnails: show all when "All Games", else only the selected provider
  const filteredVirtualSportsThumbnails = useMemo(() => {
    if (!selectedProviderId || selectedProviderId === 'all') {
      return virtualSportsProviders;
    }
    const isSports = regularSportsProviders.some(
      (p) => p.id === selectedProviderId || p.key === selectedProviderId,
    );
    if (isSports) return [];
    return virtualSportsProviders.filter(
      (p) => p.id === selectedProviderId || p.key === selectedProviderId,
    );
  }, [selectedProviderId, regularSportsProviders, virtualSportsProviders]);

  // All thumbnails in one list: Sports + Virtual Sports (for single grid)
  const filteredAllThumbnails = useMemo(() => {
    return [...filteredSportsThumbnails, ...filteredVirtualSportsThumbnails];
  }, [filteredSportsThumbnails, filteredVirtualSportsThumbnails]);

  // Calculate column spans for last row items on desktop (5 columns) – last buttons expanded
  const getColumnSpan = (index, totalItems) => {
    const itemsPerRow = 5;
    const fullRows = Math.floor(totalItems / itemsPerRow);
    const itemsInLastRow = totalItems % itemsPerRow;
    if (itemsInLastRow > 0 && index >= fullRows * itemsPerRow) {
      const positionInLastRow = index - (fullRows * itemsPerRow);
      const baseSpan = Math.floor(itemsPerRow / itemsInLastRow);
      const remainder = itemsPerRow % itemsInLastRow;
      return positionInLastRow >= (itemsInLastRow - remainder) ? baseSpan + 1 : baseSpan;
    }
    return 1;
  };

  // Handle provider click from provider bar (filter selection only)
  const handleProviderClick = (provider) => {
    if (provider.isAllGames) {
      dispatch(setSelectedProviderId('all'));
    } else if (provider.id) {
      dispatch(setSelectedProviderId(provider.id));
    }
  };

  // Handle sports provider thumbnail click: open login if not logged in, else show "games coming soon" toast
  const handleThumbnailClick = (provider) => {
    if (!isAuth) {
      dispatch(openModal('login'));
      return;
    }
    toast.info(t('games_coming_soon', 'Games are coming soon'));
  };

  // Auto-select "All Games" on mount - always pre-select on initial load
  useEffect(() => {
    if (allSportsProviders.length > 0 && isInitialLoad) {
      const allGamesProvider = allSportsProviders.find((p) => p.isAllGames);
      if (allGamesProvider) {
        dispatch(setSelectedProviderId('all'));
        setIsInitialLoad(false);
      }
    }
  }, [allSportsProviders, isInitialLoad, dispatch]);

  // Get current provider name and logo for banner and title
  const currentProvider = useMemo(() => {
    if (selectedProviderId && allSportsProviders.length > 0) {
      const provider = allSportsProviders.find(
        (p) =>
          p.id === selectedProviderId ||
          p.key === selectedProviderId ||
          String(p.id) === String(selectedProviderId) ||
          (p.isAllGames && selectedProviderId === 'all'),
      );
      if (provider) return provider;
      if (!isNaN(Number(selectedProviderId))) {
        const apiProviderName = getProviderNameById(
          selectedProviderId,
          allProvidersData,
        );
        return { name: apiProviderName || t('sports'), logo: null };
      }
      return { name: t('sports'), logo: null };
    }
    return { name: t('sports'), logo: null };
  }, [selectedProviderId, allProvidersData, allSportsProviders, t]);

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
          {/* Provider filter: Sports (All Games + sports providers) */}
          <div className="mb-4 w-full">
            <p className="mb-2 text-sm font-medium text-[#E8D25E]">
              {t('sports') || 'Sports'}
            </p>
            <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 md:gap-2 lg:grid-cols-5 lg:gap-2">
              {sportsFilterProviders.map((provider, index) => {
                const columnSpan = getColumnSpan(index, sportsFilterProviders.length);
                const isLastRow = (sportsFilterProviders.length % 5) > 0 && index >= Math.floor(sportsFilterProviders.length / 5) * 5;
                return (
                  <button
                    key={provider.id ?? provider.key}
                    type="button"
                    onClick={() => handleProviderClick(provider)}
                    style={isLastRow && isDesktop ? { gridColumn: `span ${columnSpan}` } : {}}
                    className={`flex h-auto min-h-[50px] w-full cursor-pointer items-center justify-center rounded-[5px] border bg-[#111] p-2 transition-all duration-200 hover:opacity-90 active:scale-95 ${
                    (provider.isAllGames && selectedProviderId === 'all') ||
                    (!provider.isAllGames && (selectedProviderId === provider.id || selectedProviderId === provider.key))
                      ? 'border-2 border-[#E8D25E] bg-[#2a2a1a] shadow-[0_0_15px_0_rgba(232,210,94,0.5)_inset,0_0_20px_0_rgba(232,210,94,0.3)] scale-[1.02]'
                      : 'border border-[#e8d25e24] hover:border-[#E8D25E]/50'
                    }`}
                  >
                    {provider.isAllGames || !provider.logo || failedLogos.has(provider.id) || failedLogos.has(provider.key) ? (
                    <span className="text-center text-xs font-semibold text-white sm:text-sm">
                      {provider.name}
                    </span>
                  ) : (
                    <img
                      src={`${BASE_URL}/logos/${provider.logo}`}
                      alt={provider.name || t('sports_provider')}
                      className="h-auto max-h-8 w-auto max-w-[100px] object-contain"
                      onError={() => {
                        setFailedLogos((prev) =>
                          new Set(prev).add(provider.id ?? provider.key),
                        );
                      }}
                      loading="lazy"
                    />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider filter: Virtual Sports (separate row with label) */}
          {virtualSportsProviders.length > 0 && (
            <div className="mb-6 w-full">
              <p className="mb-2 text-sm font-medium text-[#E8D25E]">
                {t('virtual_sports') || 'Virtual Sports'}
              </p>
              <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-2 md:grid-cols-4 md:gap-2 lg:grid-cols-5 lg:gap-2">
                {virtualSportsProviders.map((provider) => (
                  <button
                    key={provider.id ?? provider.key}
                    type="button"
                    onClick={() => handleProviderClick(provider)}
                    className={`flex h-auto min-h-[50px] w-full cursor-pointer items-center justify-center rounded-[5px] border bg-[#111] p-2 transition-all duration-200 hover:opacity-90 active:scale-95 ${
                      selectedProviderId === provider.id || selectedProviderId === provider.key
                        ? 'border-2 border-[#E8D25E] bg-[#2a2a1a] shadow-[0_0_15px_0_rgba(232,210,94,0.5)_inset,0_0_20px_0_rgba(232,210,94,0.3)] scale-[1.02]'
                        : 'border border-[#e8d25e24] hover:border-[#E8D25E]/50'
                    }`}
                  >
                    {!provider.logo || failedLogos.has(provider.id) || failedLogos.has(provider.key) ? (
                      <span className="text-center text-xs font-semibold text-white sm:text-sm">
                        {provider.name}
                      </span>
                    ) : (
                      <img
                        src={`${BASE_URL}/logos/${provider.logo}`}
                        alt={provider.name || t('sports_provider')}
                        className="h-auto max-h-8 w-auto max-w-[100px] object-contain"
                        onError={() => {
                          setFailedLogos((prev) =>
                            new Set(prev).add(provider.id ?? provider.key),
                          );
                        }}
                        loading="lazy"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Sports Games section – title + provider thumbnails (no border, no coming-soon text) */}
        <div className="container mx-auto px-4 md:px-0 pb-8 md:pb-10">
          <h2 className="mb-6 text-xl font-semibold text-[#E8D25E] md:text-2xl">
            Sports Games
          </h2>

          {/* Sports + Virtual Sports provider thumbnails (single grid, filtered by selected provider) */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {filteredAllThumbnails.map((provider) => (
              <button
                key={provider.key}
                type="button"
                onClick={() => handleThumbnailClick(provider)}
                className="group relative flex w-full flex-col overflow-hidden rounded-[5px] bg-black/20 shadow-sm transition-all duration-300 hover:opacity-95 active:scale-[0.98]"
              >
                <div className="relative w-full bg-transparent">
                  <div className="flex items-center justify-center">
                    <LazyImage
                      src={provider.background}
                      alt={provider.name}
                      width={200}
                      height={150}
                      className="h-auto w-full rounded-none object-contain transition-transform duration-300"
                      quality={85}
                      unoptimized
                    />
                  </div>
                  <div className="absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/50 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[4px]">
                    <div className="relative h-10 w-28 bg-transparent sm:h-12 sm:w-32">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LazyImage
                          src={`${BASE_URL}/logos/${provider.logo}`}
                          alt={`${provider.name} logo`}
                          fill
                          sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                          className="object-contain"
                          quality={90}
                        />
                      </div>
                    </div>
                    <span className="rounded-[5px] border-2 border-[#E8D25E] bg-[#111] px-4 py-1.5 text-xs font-semibold text-white">
                      {t('play', 'PLAY')}
                    </span>
                  </div>
                </div>
                <p className="mt-2 px-1 text-center text-xs font-medium text-white sm:text-sm">
                  {provider.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Curved Pattern above footer */}
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
