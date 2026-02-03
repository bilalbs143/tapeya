'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template11/components/LazyImage/LazyImage';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';

function LiveCasinoPage() {
  const { handlePlayGame, isLaunching } = useGameLaunch();
  const { t, currentLocale } = useTranslations();
  const dispatch = useDispatch();

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
      id: '478',
      provider: 'evolution',
      name: 'Evolution',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution-11.webp',
      isLive: true,
    },
    {
      key: 'pragmatic_casino',
      id: '1523',
      provider: 'pragmatic_casino',
      name: 'Pragmatic',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/pragmatic-11.webp',
      isLive: true,
    },
    {
      key: 'AGIN',
      id: '1584',
      provider: 'AGIN',
      name: 'Asia Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/as-11.webp',
      isLive: true,
    },
    {
      key: 'cq9_casino',
      id: '1685',
      provider: 'cq9_casino',
      name: 'CQ9',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cq9-11.webp',
      isLive: true,
    },
    {
      key: 'MICRO_Casino',
      id: '',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/microgaming-11.webp',
      isLive: false,
    },
    {
      key: 'VOTA',
      id: '1781',
      provider: 'VOTA',
      name: 'VOTA',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vota-11.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '1753',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos-11.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '1768',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute-11.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '1714',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo-11.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/poker-11.webp',
      isLive: false,
    },
    {
      key: 'allbet',
      id: '',
      provider: 'allbet',
      name: 'Allbet',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/allbet-11.webp',
      isLive: false,
    },
    {
      key: 'cream_gaming',
      id: '',
      provider: 'cream_gaming',
      name: 'Cream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/dream-gaming-11.webp',
      isLive: false,
    },
    {
      key: 'mt',
      id: '',
      provider: 'mt',
      name: 'Mt',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mt-game-11.webp',
      isLive: false,
    },
    {
      key: 'oriental_game',
      id: '',
      provider: 'oriental_game',
      name: 'Oriental Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/oriental-11.webp',
      isLive: false,
    },
    {
      key: 'sa_game',
      id: '',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game-11.webp',
      isLive: false,
    },
    {
      key: 'sexy',
      id: '',
      provider: 'sexy',
      name: 'Sexy',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-gaming-11.webp',
      isLive: false,
    },
    {
      key: 'bet_game',
      id: '',
      provider: 'bet_game',
      name: 'Bet Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/bet-game-11.webp',
      isLive: false,
    },
    {
      key: 'gameplay_interactive',
      id: '',
      provider: 'gameplay_interactive',
      name: 'Gameplay Interactive',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/interactive-11.webp',
      isLive: false,
    },
    {
      key: 'playtech',
      id: '',
      provider: 'playtech',
      name: 'Playtech',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/playtech-11.webp',
      isLive: false,
    },
    {
      key: 'skywind',
      id: '',
      provider: 'skywind',
      name: 'Skywind',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/skywind-11.webp',
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

  const filteredProviders = useMemo(() => {
    if (!searchQuery) return liveCasinoProviders;
    const q = searchQuery.toLowerCase();
    return liveCasinoProviders.filter((p) =>
      [p.name, p.provider].some((v) => (v || '').toLowerCase().includes(q)),
    );
  }, [liveCasinoProviders, searchQuery]);

  return (
    <div className="text-white">
      {/* Live Casino Hero Banner - Same structure as Slot Providers */}
      <section
        className="relative mx-auto w-full overflow-hidden px-2 md:mt-4 md:px-6"
        aria-label="Live Casino Banner"
      >
        {/* Desktop Background Image - Hidden on mobile */}
        <div className="relative hidden w-full md:block">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-top-banner-11.webp"
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
                  {/* CASINO label */}
                  <div className="mb-2 text-[20px] font-bold tracking-[6.4px] text-[#DFA336] uppercase">
                    CASINO
                  </div>
                  {/* Main Title */}
                  <h1
                    className="!text-[30px] leading-tight tracking-wide text-white lg:!text-[55px]"
                    style={{
                      fontFamily: 'var(--font-king-town)',
                    }}
                  >
                    THE GOLD STANDARD OF CASINOS
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Background Image - Only visible on mobile */}
        <div className="relative mt-4 block w-full md:hidden">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-top-banner-mob-11.webp"
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
                  {/* CASINO label */}
                  <div className="mb-2 text-[20px] tracking-[6.4px] text-[#DFA336] uppercase">
                    CASINO
                  </div>
                  {/* Main Title */}
                  <h1
                    className="!text-[20px] leading-tight font-semibold tracking-wide text-white uppercase sm:!text-[24px]"
                    style={{
                      fontFamily: 'var(--font-king-town)',
                    }}
                  >
                    THE GOLD STANDARD OF CASINOS
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-2 pt-8 md:px-0">
        {/* Search Container */}
        <div className="mb-6 w-full">
          <div
            className="flex items-center rounded-[4px] border px-3 md:px-6"
            style={{
              border: '1px solid rgba(254, 168, 3, 0.30)',
              background: '#121212',
            }}
          >
            {/* Title */}
            <div className="flex items-center pr-3 md:pr-6">
              <h3
                className="py-3 text-[10px] tracking-wide uppercase md:py-4 md:text-[16px]"
                style={{
                  color: '#FFFFFF',
                }}
              >
                <span className="font-king-town md:hidden">
                  {t('providers')}
                </span>
                <span className="font-king-town hidden md:inline">
                  {t('casino_providers')}
                </span>
              </h3>
            </div>

            {/* Separator */}
            <div
              className="w-px self-stretch"
              style={{
                backgroundColor: '#593F0E',
              }}
            />

            {/* Search */}
            <div className="flex flex-1 items-center gap-2 pl-3 md:pl-4">
              <input
                type="text"
                placeholder={t('search_providers')}
                className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 md:h-[23px] md:w-[23px]"
                viewBox="0 0 23 23"
                fill="none"
              >
                <path
                  d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                  stroke="#DFA336"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Live Casino Providers Grid */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredProviders.map((provider) => (
            <div
              key={provider.key}
              className={`w-full ${
                !provider.isLive ? 'cursor-not-allowed' : ''
              }`}
            >
              <div
                onClick={() => handleCasinoClick(provider)}
                className={`group relative w-full cursor-pointer overflow-hidden bg-transparent transition-all duration-300 ${
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
                    <div className="absolute inset-0 z-20 bg-[#FEA8034D] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      type="button"
                      className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-[#5E4413] bg-black transition-colors hover:border-[#5E4413] disabled:opacity-50 sm:h-16 sm:w-16"
                      style={{
                        backgroundColor: '#000000',
                        borderColor: '#5E4413',
                      }}
                      disabled={isLaunching(provider.id)}
                    >
                      {isLaunching(provider.id) ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#5E4413] border-t-transparent" />
                      ) : (
                        <svg
                          className="h-4 w-4 text-[#5E4413] sm:h-6 sm:w-6"
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
              </div>

              {/* Provider Name - Below Card */}
              <div className="mt-2 text-center">
                <span
                  className="text-sm text-white uppercase sm:text-base md:text-[24px]"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  {provider.name}
                </span>
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
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-11.webp"
                alt={t('home_page_banner')}
                className="hidden h-auto w-full object-cover md:block"
              />

              {/* Mobile Banner - Only visible on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-mob-11.webp"
                alt={t('home_page_banner')}
                className="block h-auto w-full object-cover md:hidden"
              />

              {/* Text Overlay - Top center on mobile, right side on desktop */}
              <div className="absolute inset-0 flex items-start justify-center pt-4 pr-0 md:items-center md:justify-end md:pt-0 md:pr-32">
                <div className="text-left">
                  {/* TAP. SPIN. WIN. */}
                  <div className="mb-2 text-[16px] font-bold text-[#DFA336] uppercase md:text-[18px] lg:text-[20px]">
                    TAP. SPIN. WIN.
                  </div>

                  {/* LUXURY. LUCK. AND LIMITLESS WINS */}
                  <div
                    className="text-[22px] text-white md:text-[30px] lg:text-[50px]"
                    style={{
                      fontFamily: 'var(--font-king-town)',
                    }}
                  >
                    LUXURY. LUCK.
                    <br />
                    AND LIMITLESS WINS
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
