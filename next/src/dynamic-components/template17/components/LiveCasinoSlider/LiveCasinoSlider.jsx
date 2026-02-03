'use client';

import React, { useMemo } from 'react';

import ProviderSlider from '@/dynamic-components/template17/components/ProviderSlider/ProviderSlider';
import { useTranslations } from '@/hooks/useTranslations';

// Live casino providers - matches template14 ids/keys; template17 background images
const liveCasinoProviders = [
  {
    key: 'evolution',
    id: '1883',
    provider: 'evolution',
    name: 'Evolution',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution3-up.webp',
    isLive: true,
  },
  {
    key: 'TOMHORN_7Mojos',
    id: '5174',
    provider: 'TOMHORN_7Mojos',
    name: '7 Mojos',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos3-up.webp',
    isLive: true,
  },
  {
    key: 'TOMHORN_AbsoluteLive',
    id: '5148',
    provider: 'TOMHORN_AbsoluteLive',
    name: 'Absolute Live',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute3-up.webp',
    isLive: true,
  },
  {
    key: 'TOMHORN_VIVO',
    id: '5192',
    provider: 'TOMHORN_VIVO',
    name: 'Vivo',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo3-up.webp',
    isLive: true,
  },
  {
    key: 'dream',
    id: '1857',
    provider: 'dream',
    name: 'Dream Gaming',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cream-gaming3-up.webp',
    isLive: true,
  },
  {
    key: 'sa',
    id: '5031',
    provider: 'sa',
    name: 'Sa Game',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game3-up.webp',
    isLive: true,
  },
  {
    key: 'agin',
    id: '1301',
    provider: 'agin',
    name: 'Agin',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/agin3.webp',
    isLive: true,
  },
  {
    key: 'SEXYBCRT',
    id: '1421',
    provider: 'SEXYBCRT',
    name: 'SEXYBCRT',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-ae3.webp',
    isLive: true,
  },
  {
    key: 'cq9_casino',
    id: '1856',
    provider: 'cq9_casino',
    name: 'CQ9',
    background:
      'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cq93-up.webp',
    isLive: true,
  },
];

function LiveCasinoSlider() {
  const { t } = useTranslations();

  return (
    <ProviderSlider
      providers={liveCasinoProviders}
      title={t('live_casino', 'Live Casino')}
      iconSrc="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-icon-3.svg"
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
