'use client';

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ProviderSlider from '@/dynamic-components/template21/components/ProviderSlider/ProviderSlider';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllProvider } from '@/website/websiteAction.js';

function ArcadeGamesSlider() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const { allProvidersData } = useSelector((state) => state.website);

  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  // Base URL
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

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

  // Arcade Providers data (same as SlotProvidersPage)
  const arcadeProviders = useMemo(
    () => [
      {
        key: 'jdb_arcade',
        id: getProviderId('jdb_arcade'),
        icon: 'sp-22-3-up.webp',
        logo: 'JDPGaming.png',
        name: 'JDP Gaming',
        isLive: true,
      },
      {
        key: 'jili_arcade',
        id: getProviderId('jili_arcade'),
        icon: 'sp-23-3-up.webp',
        logo: 'JiliGames.png',
        name: 'Jili Games',
        isLive: true,
      },
      {
        key: 'hacksaw_arcade',
        id: getProviderId('hacksaw_arcade'),
        icon: 'sp-20-3-up.webp',
        logo: 'Hacksaw.png',
        name: 'Hacksaw',
        isLive: true,
      },
      {
        key: 'oriental',
        id: getProviderId('oriental'),
        icon: 'sp-17-3-New.webp',
        logo: 'Oriental.png',
        name: 'Oriental Game',
        isLive: true,
      },
      {
        key: 'VOTA',
        id: getProviderId('VOTA'),
        icon: 'sp-16-3-New.webp',
        logo: 'Vota.png',
        name: 'VOTA',
        isLive: true,
      },
      {
        key: 'color',
        id: getProviderId('color'),
        icon: 'sp-19-3-New.webp',
        logo: 'color Gaming.png',
        name: 'Color Gaming',
        isLive: true,
      },
      {
        key: 'fc_arcade',
        id: getProviderId('fc_arcade'),
        icon: 'sp-21-3-New.webp',
        logo: 'fc_arcade.png',
        name: 'FC Arcade',
        isLive: true,
      },
    ],
    [allProvidersData],
  );

  return (
    <ProviderSlider
      providers={arcadeProviders}
      title={t('arcade_games', 'Arcade Games')}
      iconSrc="https://d3emlo5tm9es2f.cloudfront.net/next/icons/arcade-games-3.png"
      loading={false}
      perPageDesktop={6}
      perPageMobile={3}
      gap="24"
      autoplay={true}
      autoplayInterval={4000}
      pauseOnHover={true}
      autoplayDirection="next"
      showNavigation={true}
      providerType="arcade"
      baseUrl={baseUrl}
    />
  );
}

export default ArcadeGamesSlider;
