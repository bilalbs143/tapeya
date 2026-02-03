'use client';

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ProviderSlider from '@/dynamic-components/template21/components/ProviderSlider/ProviderSlider';
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

  // Slot Providers data (same as SlotProvidersPage)
  const slotProviders = useMemo(() => {
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

    return [
      {
        key: 'pragmatic_slot',
        id: getProviderId('pragmatic_slot'),
        icon: 'sp-2-3-up.webp',
        logo: 'pragmatic-play.png',
        name: 'Pragmatic play',
        isLive: true,
      },
      {
        key: 'MICRO_Slot',
        id: getProviderId('MICRO_Slot'),
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
        key: 'jdb',
        id: getProviderId('jdb'),
        icon: 'sp-22-3-up.webp',
        logo: 'JDPGaming.png',
        name: 'JDP Gaming',
        isLive: true,
      },
      {
        key: 'jili',
        id: getProviderId('jili'),
        icon: 'sp-23-3-up.webp',
        logo: 'JiliGames.png',
        name: 'Jili Games',
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
        key: 'evoplay',
        id: getProviderId('evoplay'),
        icon: 'sp-18-3-up.webp',
        logo: 'evoplay.png',
        name: 'Evoplay',
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
        key: 'kagaming',
        id: getProviderId('kagaming'),
        icon: 'sp-2-3-New.webp',
        logo: 'kgames.png',
        name: 'KGAME',
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
    ];
  }, [allProvidersData]);

  // Arcade Providers data (same as SlotProvidersPage)
  const arcadeProviders = useMemo(() => {
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
