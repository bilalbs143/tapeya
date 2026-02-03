'use client';

import React, { useMemo } from 'react';

import ProviderSlider from '@/dynamic-components/template13/components/ProviderSlider/ProviderSlider';
import { useTranslations } from '@/hooks/useTranslations';

// Live casino providers data (same as LiveCasinoPage - Template 13 backgrounds)
const liveCasinoProviders = [
  {
    key: 'evolution',
    id: '1382',
    provider: 'evolution',
    name: 'Evolution',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution-5.webp',
    isLive: true,
  },
  {
    key: 'TOMHORN_7Mojos',
    id: '5238',
    provider: 'TOMHORN_7Mojos',
    name: '7 Mojos',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/seven-mojos-5.webp',
    isLive: true,
  },
  {
    key: 'TOMHORN_AbsoluteLive',
    id: '5215',
    provider: 'TOMHORN_AbsoluteLive',
    name: 'Absolute Live',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute-live-5.webp',
    isLive: true,
  },
  {
    key: 'TOMHORN_VIVO',
    id: '5256',
    provider: 'TOMHORN_VIVO',
    name: 'Vivo',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo-5.webp',
    isLive: true,
  },
  {
    key: 'dream_gaming',
    id: '1356',
    provider: 'dream_gaming',
    name: 'Dream Gaming',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/dream-gaming-5.webp',
    isLive: true,
  },
  {
    key: 'sa_game',
    id: '5096',
    provider: 'sa_game',
    name: 'Sa Game',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game-5.webp',
    isLive: true,
  },
  {
    key: 'agin',
    id: '904',
    provider: 'agin',
    name: 'Agin',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/AGIN-up-5.webp',
    isLive: true,
  },
  {
    key: 'dowinn',
    id: '1355',
    provider: 'dowinn',
    name: 'DowInn',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/DOWINN-up-5.webp',
    isLive: true,
  },
  {
    key: 'sexy_ae',
    id: '997',
    provider: 'sexy_ae',
    name: 'SEXYBCRT',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SexyBrct-up-5.webp',
    isLive: true,
  },
];

function LiveCasinoSlider() {
  const { t } = useTranslations();

  return (
    <ProviderSlider
      providers={liveCasinoProviders}
      title={t('live_casino', 'Live Casino')}
      iconSrc="https://d3emlo5tm9es2f.cloudfront.net/next/icons/live-casino-3.png"
      loading={false}
      perPageDesktop={5}
      perPageMobile={2}
      gap="24"
      autoplay={true}
      autoplayInterval={4000}
      pauseOnHover={true}
      autoplayDirection="next"
      showNavigation={true}
      providerType="live"
    />
  );
}

export default LiveCasinoSlider;
