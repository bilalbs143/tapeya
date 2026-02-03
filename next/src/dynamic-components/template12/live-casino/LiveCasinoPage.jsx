'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import CategoryGamesSlider from '@/dynamic-components/template12/components/CategoryGamesSlider/CategoryGamesSlider';
import LazyImage from '@/dynamic-components/template12/components/LazyImage/LazyImage';
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

function LiveCasinoPage() {
  const { handlePlayGame, isLaunching } = useGameLaunch();
  const { t, currentLocale } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('q') || 'live'; // Default to 'live'

  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // Live casino providers data (ordered per requested sequence)
  const liveCasinoProviders = [
    {
      key: 'evolution',
      id: '1382',
      provider: 'evolution',
      name: 'Evolution',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution3-up.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '5238',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos3-up.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '5215',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute3-up.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '5256',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo3-up.webp',
      isLive: true,
    },
    {
      key: 'dream_gaming',
      id: '1356',
      provider: 'dream_gaming',
      name: 'Dream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cream-gaming3-up.webp',
      isLive: true,
    },

    {
      key: 'sa_game',
      id: '5096',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game3-up.webp',
      isLive: true,
    },
    {
      key: 'agin',
      id: '904',
      provider: 'agin',
      name: 'Agin',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/agin3.webp',
      isLive: true,
    },
    {
      key: 'sexy_ae',
      id: '997',
      provider: 'sexy_ae',
      name: 'SEXYBCRT',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-ae3.webp',
      isLive: true,
    },
  ];

  // Table game providers data
  const tableGameProviders = [
    {
      key: 'MICRO_Casino_Table',
      id: '4393',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/microgaming3-up.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '5095',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/poker3-up.webp',
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
        return {
          providers: liveCasinoProviders,
          pageTitle: t('live_casino_providers'),
          pageAltText: 'Live Casino Providers',
        };
    }
  }, [category, liveCasinoProviders, tableGameProviders, t]);

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

  const filteredProviders = useMemo(() => {
    if (!searchQuery) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter((p) =>
      [p.name, p.provider].some((v) => (v || '').toLowerCase().includes(q)),
    );
  }, [providers, searchQuery]);

  return (
    <div className="text-white">
      {/* Live Casino Banner */}
      <section
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        aria-label="Live Casino Banner"
        style={{
          backgroundImage:
            'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-hero-banner-3.webp)',
        }}
      >
        {/* Casino Background Elements */}
        <div className="absolute inset-0 opacity-20">
          {/* Roulette Wheel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
            <div className="h-32 w-32 rounded-full border-4 border-yellow-400 opacity-30 md:h-48 md:w-48 lg:h-64 lg:w-64" />
          </div>
          {/* Dice */}
          <div className="absolute top-10 right-10 h-8 w-8 rounded bg-red-600 opacity-40" />
          <div className="absolute bottom-10 left-10 h-6 w-6 rounded bg-red-600 opacity-40" />
          {/* Poker Chips */}
          <div className="absolute right-5 bottom-5 h-3 w-12 rounded-full bg-yellow-600 opacity-30" />
          <div className="absolute top-20 left-20 h-2 w-10 rounded-full bg-yellow-600 opacity-30" />
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 pt-8 md:pt-12 lg:pt-16">
          {/* Mobile Layout: Text first, then girls */}
          <div className="flex flex-col md:hidden">
            {/* Text Section */}
            <div className="mb-8 text-center">
              <h1
                className="bg-[#E8D25E] bg-clip-text !text-[30px] leading-tight font-semibold tracking-wide text-transparent uppercase lg:!text-[60px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('luck_favors_the_bold_bet_like_you_mean_it')}
              </h1>
              <p className="mt-4 bg-[#E8D25E] bg-clip-text text-sm font-[var(--font-alatsi)] font-semibold text-transparent sm:mt-6 sm:text-base md:text-lg lg:text-xl">
                {t('every_chip_tells_a_story_make_yours_legendary')}
              </p>
            </div>

            {/* Girls Section */}
            <div className="flex justify-center gap-4">
              <div className="flex-shrink-0">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-page-girl-left3.webp"
                  alt="Casino Girl Left"
                  width={200}
                  height={300}
                  className="h-auto w-[180px] object-contain"
                  priority
                />
              </div>
              <div className="flex-shrink-0">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-page-girl-right3.webp"
                  alt="Casino Girl Right"
                  width={200}
                  height={300}
                  className="h-auto w-[200px] object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Desktop Layout: Girls at ends, text in center */}
          <div className="hidden min-h-[400px] items-center md:flex lg:min-h-[500px]">
            {/* Left Girl */}
            <div className="flex-shrink-0">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-page-girl-left3.webp"
                alt="Casino Girl Left"
                width={300}
                height={450}
                className="h-auto w-[350px] object-contain lg:w-[300px] xl:w-[300px]"
                priority
              />
            </div>

            {/* Center Text */}
            <div className="flex flex-1 items-center justify-center px-8">
              <div className="text-center">
                <h1
                  className="bg-[#E8D25E] bg-clip-text !text-[30px] leading-tight font-semibold tracking-wide text-transparent uppercase lg:!text-[60px]"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {t('luck_favors_the_bold_bet_like_you_mean_it')}
                </h1>
                <p className="mt-4 bg-[#E8D25E] bg-clip-text text-sm font-[var(--font-alatsi)] font-semibold text-transparent sm:mt-6 sm:text-base md:text-lg lg:text-xl">
                  {t('every_chip_tells_a_story_make_yours_legendary')}
                </p>
              </div>
            </div>

            {/* Right Girl */}
            <div className="flex-shrink-0">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-page-girl-right3.webp"
                alt="Casino Girl Right"
                width={300}
                height={450}
                className="h-auto w-[350px] object-contain lg:w-[350px] xl:w-[330px]"
                priority
              />
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button, Title, Search, and Category Dropdown */}
        <div className="mb-6 w-full">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E8D25E] px-2 py-2 md:flex-nowrap md:justify-between md:gap-3 md:px-3 md:py-3">
            {/* Left Side: Back Button + Title */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Back Button */}
              <button
                onClick={() => router.push('/')}
                className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:opacity-80 sm:h-[36px] sm:w-[36px] md:h-[40px] md:w-[40px]"
                style={{ backgroundColor: '#E8D25E' }}
                aria-label="Go to home"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="md:h-6 md:w-6"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Title */}
              <h3
                className="flex-shrink-0 text-[12px] font-semibold tracking-wide whitespace-nowrap text-white uppercase md:text-[22px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {/* Mobile: Show shorter title */}
                <span className="block md:hidden">
                  {category === 'table'
                    ? t('table_games', 'Table Games')
                    : t('live_casino', 'Live Casino')}
                </span>
                {/* Desktop: Show full title */}
                <span className="hidden md:block">{pageTitle}</span>
              </h3>
            </div>

            {/* Right Side: Search + Category Dropdown */}
            <div className="relative flex w-full flex-1 items-center gap-2 md:w-auto md:flex-initial md:gap-3">
              {/* Search */}
              <div
                className="flex h-[32px] flex-1 items-center gap-2 px-2 sm:h-[36px] sm:px-3 md:h-[40px] md:w-[190px] md:flex-none"
                style={{
                  border: '1px solid #E8D25E',
                  borderRadius: '8px',
                  background: 'transparent',
                }}
              >
                <input
                  type="text"
                  placeholder={t('search_providers')}
                  className="w-full min-w-0 bg-transparent text-[10px] text-white outline-none placeholder:text-[#9CA3AF] sm:text-xs md:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 23 23"
                  fill="none"
                  className="flex-shrink-0 sm:h-[20px] sm:w-[20px] md:h-[23px] md:w-[23px]"
                >
                  <path
                    d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                    stroke="#E8D25E"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Category Dropdown */}
              <div className="relative flex-shrink-0">
                <UiSelect
                  value={category}
                  onValueChange={(val) => {
                    if (
                      val === 'slots' ||
                      val === 'arcade' ||
                      val === 'hybrid'
                    ) {
                      router.push(`/slot-providers?q=${val}`);
                    } else {
                      router.push(`/live-casino?q=${val}`);
                    }
                  }}
                >
                  <SelectTrigger className="relative flex h-[32px] min-w-[90px] items-center justify-between rounded-lg border border-[#E8D25E] bg-transparent px-2 pr-7 text-[10px] text-white shadow-none focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[36px] sm:min-w-[110px] sm:px-2.5 sm:pr-8 sm:text-xs md:h-[40px] md:min-w-[160px] md:px-3 md:text-sm [&_svg]:text-[#E8D25E]">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-50 max-h-[200px] w-full border-[#E8D25E] bg-[#1a1a1a]"
                    side="bottom"
                    align="start"
                  >
                    <SelectItem
                      value="slots"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      {t('slots') || 'Slots'}
                    </SelectItem>
                    <SelectItem
                      value="arcade"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      {t('arcade') || 'Arcade'}
                    </SelectItem>
                    <SelectItem
                      value="hybrid"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      {t('hybrid_games') || 'Hybrid Games'}
                    </SelectItem>
                    <SelectItem
                      value="live"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      <span className="block capitalize md:hidden">
                        {t('casino') || 'Casino'}
                      </span>
                      <span className="hidden capitalize md:block">
                        {t('live_casino') || 'Live Casino'}
                      </span>
                    </SelectItem>
                    <SelectItem
                      value="table"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      <span className="block capitalize md:hidden">
                        {t('table_games') || 'Table Game'}
                      </span>
                      <span className="hidden capitalize md:block">
                        {t('table_games') || 'Table Games'}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </UiSelect>
              </div>
            </div>
          </div>
        </div>

        {/* Casino Providers Grid */}
        {filteredProviders.length === 0 ? (
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
        ) : (
          <div className="grid w-full grid-cols-2 gap-4 lg:grid-cols-5">
            {filteredProviders.map((provider) => (
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
                    {/* <span className="px-2 text-center text-xs font-semibold text-black sm:text-sm">
                    {isLaunching(provider.id) ? t('launching') : 'PLAY'}
                  </span> */}
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
        )}
        {/* Category-based Games Slider - Always shows Slot providers on Live Casino page */}
        <div className="container mx-auto py-8">
          <CategoryGamesSlider category="arcade" />
        </div>

        {/* Category-based Games Slider - Always shows Arcade providers on Live Casino page */}
        <div className="container mx-auto py-8">
          <CategoryGamesSlider category="slots" />
        </div>
        {/* Bottom Banner */}
        <div className="my-16">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-bottom-banner-3-new.webp"
              alt={
                category === 'table'
                  ? t('table_games_bottom_banner', 'Table Games Banner')
                  : t('live_casino_bottom_banner')
              }
              width={1920}
              height={400}
              className="hidden h-auto w-full object-cover md:block"
              sizes="100vw"
              priority={false}
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-bottom-banner-3-new-mob.webp"
              alt={
                category === 'table'
                  ? t('table_games_bottom_banner', 'Table Games Banner')
                  : t('live_casino_bottom_banner')
              }
              width={1920}
              height={400}
              className="block h-auto w-full object-cover md:hidden"
              sizes="100vw"
              priority={false}
            />

            {/* Text Overlay - Top centered on mobile, left aligned on desktop */}
            <div className="absolute inset-0 flex items-start justify-center pt-12 md:items-center md:justify-start md:pt-0">
              {/* eslint-disable-next-line react/no-unknown-property */}
              <style jsx>{`
                .banner-text {
                  font-family: var(--font-alatsi);
                }
              `}</style>
              <h1 className="banner-text bg-[#E8D25E] bg-clip-text px-4 text-center leading-tight font-semibold tracking-wide text-transparent uppercase md:px-16 md:text-left">
                <div className="text-center !text-[22px] md:text-left md:!text-[30px] lg:!text-[50px]">
                  {t('luck_is_just_a_spin_away')}
                </div>
                <div className="mt-1 text-center !text-[22px] md:mt-2 md:text-left md:!text-[30px] lg:!text-[50px]">
                  {t('try_your_luck_now')}
                </div>
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveCasinoPage;
