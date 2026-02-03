'use client';

import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ProviderSlider from '@/dynamic-components/template14/components/ProviderSlider/ProviderSlider';
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
        id: getProviderId('Pragmatic Play'),
        icon: 'sp-2-7.webp',
        logo: 'pragmatic-play.png',
        name: 'Pragmatic Play',
        isLive: true,
      },
      {
        key: 'Micro',
        id: getProviderId('Micro'),
        icon: 'sp-4-7.webp',
        logo: 'microgaming.png',
        name: 'Microgaming',
        isLive: true,
      },
      {
        key: 'booongo',
        id: getProviderId('booongo'),
        icon: 'sp-5-7.webp',
        logo: 'bongo.png',
        name: 'Booongo',
        isLive: true,
      },
      {
        key: 'PLAYNGO',
        id: getProviderId('PLAYNGO'),
        icon: 'sp-6-7.webp',
        logo: 'Play n Go.png',
        name: 'Play n Go',
        isLive: true,
      },
      {
        key: 'habanero',
        id: getProviderId('habanero'),
        icon: 'sp-7-7.webp',
        logo: 'habanero_white 3.png',
        name: 'Habanero',
        isLive: true,
      },
      {
        key: 'TOMHORN_SLOT',
        id: getProviderId('TOMHORN_SLOT'),
        icon: 'sp-8-7.webp',
        logo: 'tomhorn.png',
        name: 'Tom Horn Gaming',
        isLive: true,
      },
      {
        key: 'cq9',
        id: getProviderId('cq9'),
        icon: 'sp-9-7.webp',
        logo: 'cq9.png',
        name: 'CQ9',
        isLive: true,
      },
      {
        key: 'PGSoft',
        id: getProviderId('PGSoft'),
        icon: 'sp-10-7.webp',
        logo: 'Pocketsoft Games.png',
        name: 'Pocket Soft Gaming',
        isLive: true,
      },
      {
        key: 'redtiger',
        id: getProviderId('redtiger'),
        icon: 'sp-39-7.webp',
        logo: 'Red Tiger.png',
        name: 'Red Tiger',
        isLive: true,
      },
      {
        key: 'netent',
        id: getProviderId('netent'),
        icon: 'sp-28-7.webp',
        logo: 'netent.png',
        name: 'NetEnt',
        isLive: true,
      },
      {
        key: 'nlc',
        id: getProviderId('nlc'),
        icon: 'sp-1-7-new.webp',
        logo: 'nlc.png',
        name: 'NLC',
        isLive: true,
      },
      {
        key: 'btg',
        id: getProviderId('btg'),
        icon: 'sp-14-7.webp',
        logo: 'BTG_Logo.png',
        name: 'Big Time Gaming',
        isLive: true,
      },
      {
        key: 'hacksaw_slot',
        id: getProviderId('hacksaw_slot'),
        icon: 'sp-20-7.webp',
        logo: 'Hacksaw.png',
        name: 'Hacksaw',
        isLive: true,
      },
      {
        key: 'jdb_arcade',
        id: getProviderId('jdb_arcade'),
        icon: 'sp-23-7.webp',
        logo: 'JDPGaming.png',
        name: 'JDP Gaming',
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
        icon: 'sp-23-7.webp',
        logo: 'JDPGaming.png',
        name: 'JDP Gaming',
        isLive: true,
      },
      {
        key: 'hacksaw_arcade',
        id: getProviderId('hacksaw_arcade'),
        icon: 'sp-20-7.webp',
        logo: 'Hacksaw.png',
        name: 'Hacksaw',
        isLive: true,
      },
      {
        key: 'oriental',
        id: getProviderId('oriental'),
        icon: 'sp-21-7-new.webp',
        logo: 'Oriental.png',
        name: 'Oriental Game',
        isLive: true,
      },
    ];
    return [];
  }, [allProvidersData]);

  // Determine which providers to show based on category
  const getProviders = () => {
    switch (category) {
      case 'arcade':
        return arcadeProviders;
      case 'slots':
        return slotProviders;
      case 'hybrid':
        return [];
      default:
        return arcadeProviders;
    }
  };

  // Get title based on category
  const getTitle = () => {
    switch (category) {
      case 'arcade':
        return t('arcade');
      case 'slots':
        return `${t('slot_games')}`;
      case 'hybrid':
        return t('hybrid_games');
      default:
        return `${t('arcade')} ${t('games')}`;
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
