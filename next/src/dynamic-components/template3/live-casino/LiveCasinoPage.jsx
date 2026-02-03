'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template3/components/LazyImage/LazyImage';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';

function LiveCasinoPage() {
  const { handlePlayGame, isLaunching } = useGameLaunch();
  const { t, currentLocale } = useTranslations();
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(false);

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
      id: '1896',
      provider: 'evolution',
      name: 'Evolution',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution3-up.webp',
      isLive: true,
    },
    {
      key: 'pragmatic_casino',
      id: '1523',
      provider: 'pragmatic_casino',
      name: 'Pragmatic',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/pragmatic3-up.webp',
      isLive: true,
    },
    {
      key: 'AGIN',
      id: '989',
      provider: 'AGIN',
      name: 'Asia Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/as3-up.webp',
      isLive: true,
    },
    {
      key: 'cq9_casino',
      id: '1685',
      provider: 'cq9_casino',
      name: 'CQ9',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/co93-up.webp',
      isLive: true,
    },
    {
      key: 'MICRO_Casino',
      id: '',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/microgaming3-up.webp',
      isLive: false,
    },
    {
      key: 'VOTA',
      id: '5280',
      provider: 'VOTA',
      name: 'VOTA',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vota3-up.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '5251',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos3-up.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '5225',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute3-up.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '5283',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo3-up.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/poker3-up.webp',
      isLive: false,
    },
    {
      key: 'allbet',
      id: '',
      provider: 'allbet',
      name: 'Allbet',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/albet3-up.webp',
      isLive: false,
    },
    {
      key: 'cream_gaming',
      id: '',
      provider: 'cream_gaming',
      name: 'Cream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cream-gaming3-up.webp',
      isLive: false,
    },
    {
      key: 'mt',
      id: '',
      provider: 'mt',
      name: 'Mt',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mt-game3-up.webp',
      isLive: false,
    },
    {
      key: 'oriental_game',
      id: '',
      provider: 'oriental_game',
      name: 'Oriental Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/oriental-game3-up.webp',
      isLive: false,
    },
    {
      key: 'sa_game',
      id: '',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game3-up.webp',
      isLive: false,
    },
    {
      key: 'sexy',
      id: '',
      provider: 'sexy',
      name: 'Sexy',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-game3-up.webp',
      isLive: false,
    },
    {
      key: 'bet_game',
      id: '',
      provider: 'bet_game',
      name: 'Bet Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/bet-game3-up.webp',
      isLive: false,
    },
    {
      key: 'gameplay_interactive',
      id: '',
      provider: 'gameplay_interactive',
      name: 'Gameplay Interactive',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/interactive-game3-up.webp',
      isLive: false,
    },
    {
      key: 'playtech',
      id: '',
      provider: 'playtech',
      name: 'Playtech',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/playtech3-up.webp',
      isLive: false,
    },
    {
      key: 'skywind',
      id: '',
      provider: 'skywind',
      name: 'Skywind',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/skywind3-up.webp',
      isLive: false,
    },
    {
      key: 'agin',
      id: '',
      provider: 'agin',
      name: 'Agin',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/agin3.webp',
      isLive: false,
    },
    {
      key: 'dowinn',
      id: '',
      provider: 'dowinn',
      name: 'DowInn',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/dowinn3.webp',
      isLive: false,
    },
    {
      key: 'sexy_ae',
      id: '',
      provider: 'sexy_ae',
      name: 'Sexy Ae',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-ae3.webp',
      isLive: false,
    },
    {
      key: 'tom_horn',
      id: '',
      provider: 'tom_horn',
      name: 'Tom Horn',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/tomhorn3.webp',
      isLive: false,
    },
  ];

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
        {/* Header with gradient border */}
        <div className="mb-6 w-full">
          <div className="flex items-center gap-3 rounded-[10px] border border-[#E8D25E] px-0 py-0 md:px-2 md:py-1">
            <div className="flex w-full items-center gap-3 rounded-lg bg-black px-4 py-3">
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/new-games-3.png"
                alt="Casino Providers"
                width={50}
                height={50}
                className="object-contain"
              />
              <h3
                className="text-[22px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('live_casino_providers')}
              </h3>
            </div>
          </div>
        </div>

        {/* Live Casino Providers Grid */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {liveCasinoProviders.map((provider) => (
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

        {/* Bottom Banner */}
        <div className="my-16">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-bottom-banner-3-new.webp"
              alt={t('live_casino_bottom_banner')}
              width={1920}
              height={400}
              className="hidden h-auto w-full object-cover md:block"
              sizes="100vw"
              priority={false}
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-bottom-banner-3-new-mob.webp"
              alt={t('live_casino_bottom_banner')}
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
