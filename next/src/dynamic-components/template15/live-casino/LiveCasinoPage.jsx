'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template15/components/LazyImage/LazyImage';
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
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Evolution-12.webp',
      isLive: true,
    },
    {
      key: 'pragmatic_casino',
      id: '1523',
      provider: 'pragmatic_casino',
      name: 'Pragmatic',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Pragmatic-Play-12.webp',
      isLive: true,
    },
    {
      key: 'AGIN',
      id: '1584',
      provider: 'AGIN',
      name: 'Asia Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Asia-Gaming-12.webp',
      isLive: true,
    },
    {
      key: 'cq9_casino',
      id: '1685',
      provider: 'cq9_casino',
      name: 'CQ9',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/CQ9-12.webp',
      isLive: true,
    },
    {
      key: 'MICRO_Casino',
      id: '',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Microgaming-12.webp',
      isLive: false,
    },
    {
      key: 'VOTA',
      id: '1781',
      provider: 'VOTA',
      name: 'VOTA',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/VOTA-12.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '1753',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Seven-Mojos-12.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '1768',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Absolute-Live-12.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '1714',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Vivo-12.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/+Poker-12.webp',
      isLive: false,
    },
    {
      key: 'allbet',
      id: '',
      provider: 'allbet',
      name: 'Allbet',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Allbet-12.webp',
      isLive: false,
    },
    {
      key: 'cream_gaming',
      id: '',
      provider: 'cream_gaming',
      name: 'Cream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/DreamGaming-12.webp',
      isLive: false,
    },
    {
      key: 'mt',
      id: '',
      provider: 'mt',
      name: 'Mt',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/MT-Game-12.webp',
      isLive: false,
    },
    {
      key: 'oriental_game',
      id: '',
      provider: 'oriental_game',
      name: 'Oriental Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Oriental-Game-12.webp',
      isLive: false,
    },
    {
      key: 'sa_game',
      id: '',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SA-Gaming-12.webp',
      isLive: false,
    },
    {
      key: 'sexy',
      id: '',
      provider: 'sexy',
      name: 'Sexy',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Sexy-Gaming-12.webp',
      isLive: false,
    },
    {
      key: 'bet_game',
      id: '',
      provider: 'bet_game',
      name: 'Bet Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Bet-Games-12.webp',
      isLive: false,
    },
    {
      key: 'gameplay_interactive',
      id: '',
      provider: 'gameplay_interactive',
      name: 'Gameplay Interactive',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Gameplay-Int-12.webp',
      isLive: false,
    },
    {
      key: 'playtech',
      id: '',
      provider: 'playtech',
      name: 'Playtech',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Playtech-12.webp',
      isLive: false,
    },
    {
      key: 'skywind',
      id: '',
      provider: 'skywind',
      name: 'Skywind',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Skywind-Group-12.webp',
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
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/CasinoDesktopBanner-12.webp"
            alt="Live Casino Background"
            width={1920}
            height={400}
            className="h-auto w-full object-contain"
            priority
          />

          {/* Desktop Content Overlay */}
          <div className="absolute inset-0 z-10 flex items-end justify-end px-4 pb-32 sm:px-8 md:px-16 lg:px-32 lg:pb-20 xl:px-40">
            <div className="w-full max-w-[520px] text-left">
              <div className="mb-2 text-[14px] font-bold tracking-[6.4px] text-[#DFA336] uppercase sm:text-[16px] md:text-[18px] lg:text-[20px]">
                CASINO
              </div>

              <h1
                className="text-[28px] leading-tight tracking-wide text-white sm:text-[36px] md:text-[40px] lg:text-[55px]"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                CASINO POWER <br /> IN YOUR POCKET
              </h1>
            </div>
          </div>
        </div>

        {/* Mobile Background Image - Only visible on mobile */}
        <div className="relative mt-4 block w-full md:hidden">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/CasinoMobBanner-12.webp"
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
                    CASINO POWER <br /> IN YOUR POCKET
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-2 pt-8 md:px-0">
        {/* Search Container */}
        <div className="mb-2 flex w-full flex-row items-center justify-between gap-2 md:mb-5 md:gap-4">
          <div className="flex shrink-0 items-center">
            <h3
              className="text-[16px] font-normal tracking-wide text-[#CBBC91] uppercase sm:text-[20px] md:text-[24px]"
              style={{
                fontFamily: 'var(--font-king-town)',
              }}
            >
              {t('casino_providers')}
            </h3>
          </div>

          <div
            className="mb-2 flex w-[200px] items-center rounded-full border px-3 py-2.5 md:mb-4 md:w-[270px] md:px-4 md:py-3"
            style={{
              border: '1px solid #CBBC9121',
              backgroundColor: '#151517',
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4 shrink-0 md:mr-3 md:h-[24px] md:w-[24px]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                stroke="#CBBC91"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <input
              type="text"
              placeholder="Search Casino Providers..."
              className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#8B8B8B] md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
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
                    <div className="absolute inset-0 z-20 bg-[#0F5045] opacity-0 transition-opacity duration-300 group-hover:opacity-70" />
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
                        borderColor: '#CBBC91',
                      }}
                      disabled={isLaunching(provider.id)}
                    >
                      {isLaunching(provider.id) ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#5E4413] border-t-transparent" />
                      ) : (
                        <svg
                          className="h-4 w-4 text-[#CBBC91] sm:h-6 sm:w-6"
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
      </div>
    </div>
  );
}

export default LiveCasinoPage;
