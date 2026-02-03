'use client';

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ProviderSlider from '@/dynamic-components/template17/components/ProviderSlider/ProviderSlider';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllProvider } from '@/website/websiteAction.js';

function CategoryGamesSlider({ category }) {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const { allProvidersData } = useSelector((state) => state.website);

  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  // Base URL
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  // Slot Providers data - matches template14 (same keys and getProviderId lookup by name)
  const slotProviders = useMemo(() => {
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

    return [
      {
        key: 'pragmatic_slot',
        id: getProviderId('Pragmatic Play'),
        icon: 'sp-2-3-up.webp',
        logo: 'pragmatic-play.png',
        name: 'Pragmatic Play',
        isLive: true,
      },
      {
        key: 'Micro',
        id: getProviderId('Micro'),
        icon: 'sp-4-3-up.webp',
        logo: 'microgaming.png',
        name: 'Microgaming',
        isLive: true,
      },
      {
        key: 'booongo',
        id: getProviderId('booongo'),
        icon: 'sp-5-3-up.webp',
        logo: 'bongo.png',
        name: 'Booongo',
        isLive: true,
      },
      {
        key: 'PLAYNGO',
        id: getProviderId('PLAYNGO'),
        icon: 'sp-6-3-up.webp',
        logo: 'Play n Go.png',
        name: 'Play n Go',
        isLive: true,
      },
      {
        key: 'habanero',
        id: getProviderId('habanero'),
        icon: 'sp-7-3-up.webp',
        logo: 'habanero_white 3.png',
        name: 'Habanero',
        isLive: true,
      },
      {
        key: 'TOMHORN_SLOT',
        id: getProviderId('TOMHORN_SLOT'),
        icon: 'sp-8-3-up.webp',
        logo: 'tomhorn.png',
        name: 'Tom Horn Gaming',
        isLive: true,
      },
      {
        key: 'cq9',
        id: getProviderId('cq9'),
        icon: 'sp-9-3-up.webp',
        logo: 'cq9.png',
        name: 'CQ9',
        isLive: true,
      },
      {
        key: 'PGSoft',
        id: getProviderId('PGSoft'),
        icon: 'sp-10-3-up.webp',
        logo: 'Pocketsoft Games.png',
        name: 'Pocket Soft Gaming',
        isLive: true,
      },
      {
        key: 'redtiger',
        id: getProviderId('redtiger'),
        icon: 'sp-39-3-up.webp',
        logo: 'Red Tiger.png',
        name: 'Red Tiger',
        isLive: true,
      },
      {
        key: 'netent',
        id: getProviderId('netent'),
        icon: 'sp-28-3-up.webp',
        logo: 'netent.png',
        name: 'NetEnt',
        isLive: true,
      },
      {
        key: 'nlc',
        id: getProviderId('nlc'),
        icon: 'sp-1-3-New.webp',
        logo: 'nlc.png',
        name: 'NLC',
        isLive: true,
      },
      {
        key: 'btg',
        id: getProviderId('btg'),
        icon: 'sp-14-3-up.webp',
        logo: 'BTG_Logo.png',
        name: 'Big Time Gaming',
        isLive: true,
      },
      {
        key: 'hacksaw_slot',
        id: getProviderId('hacksaw_slot'),
        icon: 'sp-20-3-up.webp',
        logo: 'Hacksaw.png',
        name: 'Hacksaw',
        isLive: true,
      },
      {
        key: 'jdb_arcade',
        id: getProviderId('jdb_arcade'),
        icon: 'sp-22-3-up.webp',
        logo: 'JDPGaming.png',
        name: 'JDP Gaming',
        isLive: true,
      },
    ];
  }, [allProvidersData]);

  // Arcade Providers data - matches template14: jdb_arcade, hacksaw_arcade, oriental only
  const arcadeProviders = useMemo(() => {
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

    return [
      {
        key: 'jdb_arcade',
        id: getProviderId('jdb_arcade'),
        icon: 'sp-22-3-up.webp',
        logo: 'JDPGaming.png',
        name: 'JDP Gaming',
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
    ];
  }, [allProvidersData]);

  // Determine which providers to show based on category
  const getProviders = () => {
    switch (category) {
      case 'arcade':
        // When Arcade is selected, show Slot providers
        return slotProviders;
      case 'slots':
        // When Slots is selected, show Arcade providers
        return arcadeProviders;
      case 'hybrid':
        // When Hybrid is selected, show Slot providers
        return slotProviders;
      default:
        // Default: show Arcade providers
        return arcadeProviders;
    }
  };

  // Get title based on category
  const getTitle = () => {
    switch (category) {
      case 'arcade':
        return t('slot_games', 'Slot Games');
      case 'slots':
        return `${t('arcade', 'Arcade')} ${t('games', 'Games')}`;
      case 'hybrid':
        return t('slot_games', 'Slot Games');
      default:
        return `${t('arcade', 'Arcade')} ${t('games', 'Games')}`;
    }
  };

  const providers = getProviders();
  const loading = !allProvidersData || allProvidersData.length === 0;

  // Determine providerType based on category
  // Slot providers use "arcade" type (same styling as arcade providers on slot providers page)
  // Arcade providers also use "arcade" type
  const providerType = category === 'slots' ? 'arcade' : 'arcade';

  return (
    <ProviderSlider
      providers={providers}
      title={getTitle()}
      iconSrc="https://d3emlo5tm9es2f.cloudfront.net/next/icons/trending-games-3.png"
      loading={loading}
      perPageDesktop={5}
      perPageMobile={2}
      gap="24"
      autoplay={true}
      autoplayInterval={4000}
      pauseOnHover={true}
      autoplayDirection="prev"
      showNavigation={true}
      providerType={providerType}
      baseUrl={baseUrl}
    />
  );
}

export default CategoryGamesSlider;
