'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template22/components/LazyImage/LazyImage';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';
import { fetchAllProvider } from '@/website/websiteAction.js';
import { setSelectedProviderId } from '@/website/websiteSlice.js';

const BASE_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next';

// Sports providers – exact match with Template17 (same list, thumbnails, logos)
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
  const searchParams = useSearchParams();

  const { selectedProviderId, allProvidersData } = useSelector(
    (state) => state.website,
  );
  const { isAuth } = useSelector((state) => state.auth);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [failedLogos, setFailedLogos] = useState(new Set());

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

  const getProviderId = (providerKey) => {
    if (!allProvidersData || !Array.isArray(allProvidersData)) return null;
    const match = allProvidersData.find(
      (p) => p.name && p.name.toLowerCase() === providerKey.toLowerCase(),
    );
    return match ? match.id : null;
  };

  const regularSportsProviders = useMemo(() => {
    return SPORTS_PROVIDERS.map((p) => ({
      ...p,
      id: getProviderId(p.key) ?? getProviderId(p.name?.replace(/\s+/g, '_').toLowerCase()) ?? p.key,
    }));
  }, [allProvidersData]);

  const virtualSportsProviders = useMemo(() => {
    return VIRTUAL_SPORTS_PROVIDERS.map((p) => ({
      ...p,
      id: getProviderId(p.key) ?? p.key,
    }));
  }, [allProvidersData]);

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

  const filteredAllThumbnails = useMemo(() => {
    return [...filteredSportsThumbnails, ...filteredVirtualSportsThumbnails];
  }, [filteredSportsThumbnails, filteredVirtualSportsThumbnails]);

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

  const handleProviderClick = (provider) => {
    if (provider.isAllGames) {
      dispatch(setSelectedProviderId('all'));
    } else if (provider.id) {
      dispatch(setSelectedProviderId(provider.id));
    }
  };

  const handleThumbnailClick = (provider) => {
    if (!isAuth) {
      dispatch(openModal('login'));
      return;
    }
    toast.info(t('games_coming_soon', 'Games are coming soon'));
  };

  useEffect(() => {
    if (allSportsProviders.length > 0 && isInitialLoad) {
      const allGamesProvider = allSportsProviders.find((p) => p.isAllGames);
      if (allGamesProvider) {
        dispatch(setSelectedProviderId('all'));
        setIsInitialLoad(false);
      }
    }
  }, [allSportsProviders, isInitialLoad, dispatch]);

  // Select provider from URL (e.g. from Categories hover link: ?provider=sports-1)
  const appliedUrlProviderRef = React.useRef(false);
  useEffect(() => {
    const providerKey = searchParams.get('provider');
    if (!providerKey || allSportsProviders.length === 0 || appliedUrlProviderRef.current) return;
    const provider = allSportsProviders.find(
      (p) => p.key === providerKey || (p.key && p.key.toLowerCase() === providerKey.toLowerCase()),
    );
    if (provider && (provider.id || provider.key)) {
      appliedUrlProviderRef.current = true;
      dispatch(setSelectedProviderId(provider.id ?? provider.key));
      setIsInitialLoad(false);
    }
  }, [allSportsProviders, searchParams, dispatch]);

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
          {/* Provider filter: Sports – Template21 button style (same as SlotsPage) */}
          <div className="mb-6 w-full">
            <p className="mb-2 text-sm font-semibold text-white">
              {t('sports') || 'Sports'}
            </p>
            <div className="flex flex-wrap sm:flex-wrap">
              {sportsFilterProviders.map((provider, index) => {
                const isActive = (provider.isAllGames && selectedProviderId === 'all') ||
                  (!provider.isAllGames && (selectedProviderId === provider.id || selectedProviderId === provider.key));
                return (
                  <button
                    key={provider.id ?? provider.key}
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
                    {provider.isAllGames || !provider.logo || failedLogos.has(provider.id) || failedLogos.has(provider.key) ? (
                      <span className="text-center font-semibold text-white text-[13px] sm:text-[16px]">
                        {provider.name}
                      </span>
                    ) : (
                      <>
                        <img
                          src={`${BASE_URL}/logos/${provider.logo}`}
                          alt={provider.name || t('sports_provider')}
                          className="h-auto max-h-4 w-auto max-w-[40px] sm:max-h-6 sm:max-w-[60px] object-contain flex-shrink-0"
                          onError={() => {
                            setFailedLogos((prev) =>
                              new Set(prev).add(provider.id ?? provider.key),
                            );
                          }}
                          loading="lazy"
                        />
                        <span className="text-center font-semibold text-white whitespace-nowrap text-[13px] sm:text-[16px]">
                          {provider.name}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Virtual Sports provider filter – Template21 button style */}
          {virtualSportsProviders.length > 0 && (
            <div className="mb-6 w-full">
              <p className="mb-2 text-sm font-semibold text-white">
                {t('virtual_sports') || 'Virtual Sports'}
              </p>
              <div className="flex flex-wrap sm:flex-wrap">
                {virtualSportsProviders.map((provider) => {
                  const isActive = selectedProviderId === provider.id || selectedProviderId === provider.key;
                  return (
                    <button
                      key={provider.id ?? provider.key}
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
                      {!provider.logo || failedLogos.has(provider.id) || failedLogos.has(provider.key) ? (
                        <span className="text-center font-semibold text-white text-[13px] sm:text-[16px]">
                          {provider.name}
                        </span>
                      ) : (
                        <>
                          <img
                            src={`${BASE_URL}/logos/${provider.logo}`}
                            alt={provider.name || t('sports_provider')}
                            className="h-auto max-h-4 w-auto max-w-[40px] sm:max-h-6 sm:max-w-[60px] object-contain flex-shrink-0"
                            onError={() => {
                              setFailedLogos((prev) =>
                                new Set(prev).add(provider.id ?? provider.key),
                              );
                            }}
                            loading="lazy"
                          />
                          <span className="text-center font-semibold text-white whitespace-nowrap text-[13px] sm:text-[16px]">
                            {provider.name}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sports Games section – Template21 layout and red gradient accent */}
        <div className="container mx-auto px-4 md:px-0 pb-8 md:pb-10">
          <h2 className="mb-6 text-xl font-semibold text-white md:text-2xl">
            {t('sports_games', 'Sports Games')}
          </h2>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {filteredAllThumbnails.map((provider) => (
              <button
                key={provider.key}
                type="button"
                onClick={() => handleThumbnailClick(provider)}
                className="group relative flex w-full flex-col overflow-hidden bg-black/20 shadow-sm transition-all duration-300 hover:opacity-95 active:scale-[0.98]"
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
                    />
                  </div>
                  <div className="absolute inset-0 z-20 bg-[rgba(236,77,73,0.55)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
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
                    <span
                      className="rounded-[5px] px-4 py-1.5 text-xs font-semibold text-white"
                      style={{
                        backgroundImage: 'linear-gradient(#f17a77, #ee5f5b 60%, #ec4d49)',
                      }}
                    >
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
