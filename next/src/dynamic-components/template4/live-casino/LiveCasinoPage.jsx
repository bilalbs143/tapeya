'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template4/components/LazyImage/LazyImage';
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
      id: '478',
      provider: 'evolution',
      name: 'Evolution',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution-4.webp',
      isLive: true,
    },
    {
      key: 'pragmatic_casino',
      id: '1523',
      provider: 'pragmatic_casino',
      name: 'Pragmatic',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/pragmatic-4.webp',
      isLive: true,
    },
    {
      key: 'AGIN',
      id: '1584',
      provider: 'AGIN',
      name: 'Asia Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/as-4.webp',
      isLive: true,
    },
    {
      key: 'cq9_casino',
      id: '1685',
      provider: 'cq9_casino',
      name: 'CQ9',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cq9-4.webp',
      isLive: true,
    },
    {
      key: 'MICRO_Casino',
      id: '',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/microgaming-4.webp',
      isLive: false,
    },
    {
      key: 'VOTA',
      id: '1781',
      provider: 'VOTA',
      name: 'VOTA',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vota-4.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '1753',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos-4.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '1768',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute-4.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '1714',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo-4.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/poker-4.webp',
      isLive: false,
    },
    {
      key: 'allbet',
      id: '',
      provider: 'allbet',
      name: 'Allbet',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/allbet-4.webp',
      isLive: false,
    },
    {
      key: 'cream_gaming',
      id: '',
      provider: 'cream_gaming',
      name: 'Cream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/dream-gaming-4.webp',
      isLive: false,
    },
    {
      key: 'mt',
      id: '',
      provider: 'mt',
      name: 'Mt',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mt-game-4.webp',
      isLive: false,
    },
    {
      key: 'oriental_game',
      id: '',
      provider: 'oriental_game',
      name: 'Oriental Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/oriental-4.webp',
      isLive: false,
    },
    {
      key: 'sa_game',
      id: '',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game-4.webp',
      isLive: false,
    },
    {
      key: 'sexy',
      id: '',
      provider: 'sexy',
      name: 'Sexy',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-gaming-4.webp',
      isLive: false,
    },
    {
      key: 'bet_game',
      id: '',
      provider: 'bet_game',
      name: 'Bet Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/bet-game4.webp',
      isLive: false,
    },
    {
      key: 'gameplay_interactive',
      id: '',
      provider: 'gameplay_interactive',
      name: 'Gameplay Interactive',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/interactive-4.webp',
      isLive: false,
    },
    {
      key: 'playtech',
      id: '',
      provider: 'playtech',
      name: 'Playtech',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/playtech-4.webp',
      isLive: false,
    },
    {
      key: 'skywind',
      id: '',
      provider: 'skywind',
      name: 'Skywind',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/skywind-4.webp',
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
      {/* Live Casino Hero Banner - Same structure as Slot Providers */}
      <section
        className="relative mx-auto w-full overflow-hidden px-2 md:px-6"
        aria-label="Live Casino Banner"
      >
        {/* Desktop Background Image - Hidden on mobile */}
        <div className="relative hidden w-full md:block">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-banner-4-desktop.webp"
            alt="Live Casino Background"
            width={1920}
            height={400}
            className="h-auto w-full object-contain"
            priority
          />

          {/* Desktop Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-start">
            <div className="container mx-auto px-4">
              <div className="w-full max-w-2xl">
                {/* Headline and Subheadline (left aligned) */}
                <div className="text-left">
                  <h1
                    className="!text-[30px] leading-tight font-semibold tracking-wide text-white uppercase lg:!text-[55px]"
                    style={{
                      fontFamily: 'var(--font-alatsi)',
                      WebkitTextStroke: '0px transparent',
                      textStroke: '0px transparent',
                    }}
                  >
                    {t('your_next_big')}
                    <br />
                    {t('win_is_loading')}
                  </h1>
                  <div className="flex items-center justify-start gap-2 sm:mt-6">
                    {/* Diamond Icon */}
                    <div className="flex h-6 w-6 items-center justify-center sm:h-7 sm:w-7">
                      <Image
                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
                        alt={t('hero_girl')}
                        width={480}
                        height={500}
                        className="h-auto"
                        priority
                      />
                    </div>
                    <p
                      className="text-[20px] font-semibold text-transparent text-white sm:text-base md:text-lg lg:text-xl"
                      style={{ fontFamily: 'var(--font-alatsi)' }}
                    >
                      {t('your_jackpot_journey_begins_here')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Background Image - Only visible on mobile */}
        <div className="relative block w-full md:hidden">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-banner-4.webp"
            alt="Live Casino Background Mobile"
            width={1920}
            height={400}
            className="h-auto w-full object-contain"
            priority
          />

          {/* Mobile Content Overlay */}
          <div className="absolute inset-0 flex items-start justify-center pt-8">
            <div className="container mx-auto px-4">
              <div className="w-full text-center">
                {/* Headline and Subheadline (center aligned) */}
                <div className="text-center">
                  <h1
                    className="!text-[24px] leading-tight font-semibold tracking-wide text-transparent text-white uppercase"
                    style={{
                      fontFamily: 'var(--font-alatsi)',
                      WebkitTextStroke: '0px transparent',
                      textStroke: '0px transparent',
                    }}
                  >
                    {t('your_next_big')}
                    <br />
                    {t('win_is_loading')}
                  </h1>

                  <p
                    className="mt-4 text-sm font-semibold text-transparent text-white sm:text-base"
                    style={{ fontFamily: 'var(--font-alatsi)' }}
                  >
                    {t('your_jackpot_journey_begins_here')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-2 pt-8 md:px-0">
        {/* Header - match slot detail header style */}
        <div className="mb-6 w-full">
          <div className="flex items-center justify-between gap-3 px-0 py-0">
            <div className="flex flex-1 items-center gap-3 pl-0">
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
                alt="Casino Providers"
                width={40}
                height={40}
                className="object-contain"
              />
              <h3
                className="text-[22px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('live_casino_providers')}
              </h3>
              {/* Responsive divider line to the right of title */}
              <div className="mx-2 h-[2px] flex-1 bg-[#5AB25A]" />
            </div>
          </div>
        </div>

        {/* Live Casino Providers Grid */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {liveCasinoProviders.map((provider) => (
            <div
              key={provider.key}
              onClick={() => handleCasinoClick(provider)}
              className={`group relative w-full cursor-pointer overflow-hidden rounded-[10px] bg-transparent transition-all duration-300 ${
                !provider.isLive ? 'cursor-not-allowed' : ''
              }`}
            >
              {/* Background image layer */}
              <div className="relative bg-transparent">
                <div className="flex items-center justify-center">
                  <LazyImage
                    src={provider.background}
                    alt={`${provider.name} background`}
                    width={300}
                    height={225}
                    className="h-auto w-full object-contain"
                    quality={85}
                  />
                  {/* Hover Overlay - Only on Image */}
                  <div className="absolute inset-0 z-20 bg-[#55BC55B3] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-[#03c72c4d] bg-black transition-colors hover:border-[#03c72c4d] disabled:opacity-50 sm:h-16 sm:w-16"
                    style={{
                      backgroundColor: '#000000',
                      borderColor: '#03c72c4d',
                    }}
                    disabled={isLaunching(provider.id)}
                  >
                    {isLaunching(provider.id) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#03c72c4d] border-t-transparent" />
                    ) : (
                      <svg
                        className="h-4 w-4 text-[#03c72c4d] sm:h-6 sm:w-6"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
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

              {/* Provider Name - Bottom Center */}
              <div className="pointer-events-none absolute bottom-0 left-1/2 w-[100%] -translate-x-1/2 text-center">
                <div className="px-3 py-2">
                  <span className="text-sm font-bold text-white uppercase drop-shadow-lg sm:text-base md:text-[24px]">
                    {provider.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-0">
          <div className="container mx-auto px-0 pt-8 sm:px-0">
            <div className="relative overflow-hidden">
              {/* Desktop Banner - Hidden on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-4.webp"
                alt={t('home_page_banner')}
                className="hidden h-auto w-full object-cover md:block"
              />

              {/* Mobile Banner - Only visible on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-4.webp"
                alt={t('home_page_banner')}
                className="block h-auto w-full object-cover md:hidden"
              />

              {/* Text Overlay - Top center on mobile, right side on desktop */}
              <div className="absolute inset-0 flex items-start justify-center pt-4 pr-0 md:items-center md:justify-end md:pt-0 md:pr-16">
                <div className="text-center font-['Montserrat']">
                  {/* LUCK IS JUST A SPIN AWAY */}
                  <div className="mb-2 text-[22px] font-black text-white uppercase drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] md:text-[30px] lg:text-[50px]">
                    {t('luck_is_just_a_spin_away')}
                  </div>

                  {/* TRY YOUR LUCK NOW with SVG wrapper */}
                  <div className="relative mb-2">
                    <div className="relative">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1033"
                        height="151"
                        viewBox="0 0 1033 151"
                        fill="none"
                        className="h-12 w-full md:h-16 lg:h-20"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M76.5 0H998.5L957 151H34.5L76.5 0Z"
                          fill="url(#paint0_linear_388_512)"
                          fillOpacity="0.7"
                        />
                        <path
                          d="M44 0H69.5L27.2614 151H0L44 0Z"
                          fill="#5AB25A"
                        />
                        <path
                          d="M1007.5 0H1033L990.761 151H963.5L1007.5 0Z"
                          fill="#5AB25A"
                        />
                        <defs>
                          <linearGradient
                            id="paint0_linear_388_512"
                            x1="-35.6091"
                            y1="-6.86363"
                            x2="13.8558"
                            y2="326.752"
                            gradientUnits="userSpaceOnUse"
                          >
                            <stop stopColor="#5AB25A" />
                            <stop offset="0.433806" stopColor="#55BC55" />
                            <stop offset="0.898108" stopColor="#139113" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* TRY YOUR LUCK NOW text - centered */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-[25px] font-black text-white uppercase drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] md:text-[35px] lg:text-[50px]">
                          {t('try_your_luck_now')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Try Now */}
                  <div className="text-center text-[14px] font-normal tracking-[8px] text-white md:text-[16px] lg:text-[18px]">
                    {t('try_now')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveCasinoPage;
