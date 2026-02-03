'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template7/components/LazyImage/LazyImage';
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
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution-7.webp',
      isLive: true,
    },
    {
      key: 'pragmatic_casino',
      id: '1523',
      provider: 'pragmatic_casino',
      name: 'Pragmatic',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/pragmatic-7.webp',
      isLive: true,
    },
    {
      key: 'AGIN',
      id: '1584',
      provider: 'AGIN',
      name: 'Asia Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/asia-gaming-7.webp',
      isLive: true,
    },
    {
      key: 'cq9_casino',
      id: '1685',
      provider: 'cq9_casino',
      name: 'CQ9',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cq9-7.webp',
      isLive: true,
    },
    {
      key: 'MICRO_Casino',
      id: '',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/micro-gaming-7.webp',
      isLive: false,
    },
    {
      key: 'VOTA',
      id: '1781',
      provider: 'VOTA',
      name: 'VOTA',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vota-7.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '1753',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/seven-mojos-7.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '1768',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute-live-7.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '1714',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo-7.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/crypto-in-poker-7.webp',
      isLive: false,
    },
    {
      key: 'allbet',
      id: '',
      provider: 'allbet',
      name: 'Allbet',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/allbet-7.webp',
      isLive: false,
    },
    {
      key: 'cream_gaming',
      id: '',
      provider: 'cream_gaming',
      name: 'Cream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/dream-gaming-7.webp',
      isLive: false,
    },
    {
      key: 'mt',
      id: '',
      provider: 'mt',
      name: 'Mt',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mt-game-7.webp',
      isLive: false,
    },
    {
      key: 'oriental_game',
      id: '',
      provider: 'oriental_game',
      name: 'Oriental Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/oriental-gaming-7.webp',
      isLive: false,
    },
    {
      key: 'sa_game',
      id: '',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game-7.webp',
      isLive: false,
    },
    {
      key: 'sexy',
      id: '',
      provider: 'sexy',
      name: 'Sexy',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-gaming-7.webp',
      isLive: false,
    },
    {
      key: 'bet_game',
      id: '',
      provider: 'bet_game',
      name: 'Bet Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/bet-games-7.webp',
      isLive: false,
    },
    {
      key: 'gameplay_interactive',
      id: '',
      provider: 'gameplay_interactive',
      name: 'Gameplay Interactive',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/gameplay-interactive-7.webp',
      isLive: false,
    },
    {
      key: 'playtech',
      id: '',
      provider: 'playtech',
      name: 'Playtech',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/playtech-7.webp',
      isLive: false,
    },
    {
      key: 'skywind',
      id: '',
      provider: 'skywind',
      name: 'Skywind',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/skywind-group-7.webp',
      isLive: false,
    },
    {
      key: 'agin',
      id: '',
      provider: 'agin',
      name: 'Agin',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Agin-7.webp',
      isLive: false,
    },
    {
      key: 'dowinn',
      id: '',
      provider: 'dowinn',
      name: 'DowInn',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Dowinn-7.webp',
      isLive: false,
    },
    {
      key: 'sexy_ae',
      id: '',
      provider: 'sexy_ae',
      name: 'Sexy Ae',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SexyBrct-7.webp',
      isLive: false,
    },
    {
      key: 'tomhorn',
      id: '',
      provider: 'tomhorn',
      name: 'Tomhorn',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Tomhorn-7.webp',
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
      {/* Live Casino Hero Banner */}
      <section
        className="relative mx-auto w-full overflow-hidden"
        aria-label={t('live_casino_banner')}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ minHeight: '200px' }}
        >
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <div className="relative hidden w-full md:block">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-top-banner-up-7.webp"
              alt={t('live_casino_background_alt')}
              width={1920}
              height={600}
              className="w-full rounded-[5px] object-cover"
              style={{ height: 'auto', display: 'block' }}
              priority
            />
          </div>

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <div className="relative block w-full md:hidden">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-top-banner-mob-7.webp"
              alt={t('live_casino_mobile_background_alt')}
              width={1920}
              height={600}
              className="w-full rounded-[5px] object-cover"
              style={{ height: 'auto', display: 'block' }}
              priority
            />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-10 mt-0 flex items-start pt-8 pl-8 sm:pt-6 sm:pl-6 md:mt-6 md:items-center md:pt-0 md:pl-12">
            <div className="w-auto max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-none">
              <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-3">
                {/* CASINO Badge */}
                <div
                  className="rounded px-3 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-4 lg:py-2"
                  style={{
                    border: '1px solid rgba(51, 19, 105, 0.70)',
                    backgroundColor: 'rgba(24, 14, 58, 0.5)',
                  }}
                >
                  <span className="inline-block text-[12px] font-bold whitespace-nowrap text-white uppercase sm:text-[12px] md:text-[12px] lg:text-[14px] xl:text-[16px]">
                    {t('casino')}
                  </span>
                </div>

                {/* DOUBLE THE BETS, */}
                <h2
                  className="font-bring-race text-left text-[18px] leading-tight break-words text-white sm:text-[18px] md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl"
                  style={{ letterSpacing: '1px' }}
                >
                  {t('double_the_bets')}
                </h2>

                {/* TRIPLE THE FUN */}
                <h2
                  className="font-bring-race text-left text-[18px] leading-tight break-words text-white sm:text-[18px] md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl"
                  style={{ letterSpacing: '1px' }}
                >
                  {t('triple_the_fun')}
                </h2>

                {/* Dive into our in-house Slots fantasy */}
                <p className="text-left text-[12px] text-white sm:text-xs md:text-sm lg:text-base">
                  {t('slots_fantasy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="pt-6">
        {/* Header */}
        <div className="mb-6 w-full">
          <div
            className="flex items-center rounded-[5px] px-3 md:rounded-[10px] md:px-6"
            style={{
              border: '1px solid #7351FF',
              background: '#1E1451',
            }}
          >
            {/* Title with border separator */}
            <div
              className="flex items-center pr-3 md:pr-6"
              style={{
                borderRight: '1px solid #7351FF',
              }}
            >
              <h3 className="font-bring-race py-3 text-[10px] tracking-wide text-white uppercase md:py-4 md:text-[16px]">
                <span className="font-bring-race md:hidden">
                  {t('providers')}
                </span>
                <span className="font-bring-race hidden md:inline">
                  {t('casino_providers')}
                </span>
              </h3>
            </div>

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
                width="23"
                height="23"
                viewBox="0 0 23 23"
                fill="none"
              >
                <path
                  d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                  stroke="#7351FF"
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
              className={`group flex w-full cursor-pointer flex-col transition-all duration-300 ${
                !provider.isLive ? 'cursor-not-allowed' : ''
              }`}
            >
              {/* Card with border and padding */}
              <div
                onClick={() => handleCasinoClick(provider)}
                className="relative flex w-full flex-col overflow-hidden transition-all duration-300"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#D61324';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(251, 99, 33, 0.30)';
                }}
              >
                {/* Background image layer */}
                <div className="relative bg-transparent">
                  <div className="relative flex items-center justify-center overflow-hidden rounded-[5px]">
                    <LazyImage
                      src={provider.background}
                      alt={t('provider_background', {
                        provider: provider.name,
                      })}
                      width={300}
                      height={225}
                      className="h-auto w-full object-contain"
                      quality={85}
                    />
                    {/* Hover Overlay - Only on Image */}
                    <div
                      className="absolute inset-0 z-20 opacity-0 backdrop-blur-[5px] transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        backgroundColor: 'rgba(62, 29, 136, 0.3)',
                      }}
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <button
                          type="button"
                          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 bg-black transition-colors disabled:opacity-50 sm:h-16 sm:w-16"
                          style={{
                            backgroundColor: '#000000',
                            borderColor: '#EE7AF4',
                          }}
                          disabled={isLaunching(provider.id)}
                        >
                          {isLaunching(provider.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#EE7AF4] border-t-transparent" />
                          ) : (
                            <svg
                              className="h-4 w-4 sm:h-6 sm:w-6"
                              fill="#EE7AF4"
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
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        clipPath:
                          'polygon(0px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 0px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px), 0% 15px)',
                      }}
                    >
                      <div className="absolute top-2 right-2 h-8 w-8 rounded-full border border-purple-400" />
                      <div className="absolute bottom-2 left-2 h-6 w-6 rounded-full border border-purple-400" />
                      <div className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Provider Name - Inside the border container */}
                <div className="relative z-10 mt-2 text-center">
                  <span className="text-sm font-bold text-white uppercase sm:text-base">
                    {provider.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-0">
          <div className="px-0 pt-8 sm:px-0">
            <div className="relative overflow-hidden">
              {/* Desktop Banner - Hidden on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-7.webp"
                alt={t('home_page_banner')}
                className="hidden h-auto w-full object-cover md:block"
              />

              {/* Mobile Banner - Only visible on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-7.webp"
                alt={t('home_page_banner')}
                className="block h-auto w-full object-cover md:hidden"
              />

              {/* Text Overlay - Right aligned on desktop, left aligned on mobile (matching top banner) */}
              <div className="absolute inset-0 z-10 flex items-start justify-start pt-8 pr-0 pl-8 md:items-center md:justify-end md:pt-6 md:pr-20 md:pl-6 lg:pt-0 lg:pl-20">
                <div className="w-auto max-w-[calc(100%-2rem)] text-left sm:max-w-[calc(100%-3rem)] md:max-w-none">
                  <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-3">
                    <h2
                      className="!lg:text-[35px] font-bring-race text-[18px] leading-tight text-white uppercase sm:text-[18px] md:text-[30px] xl:text-[40px]"
                      style={{ letterSpacing: '1px' }}
                    >
                      {t('where_millionaires')}
                      <br />
                      {(() => {
                        const text = t('millionaires_made');
                        const parts = text.split('MILLIONAIRES');
                        return parts.length > 1 ? (
                          <>
                            MILLIONAIRES
                            <br />
                            {parts[1].trim()}
                          </>
                        ) : (
                          text
                        );
                      })()}
                    </h2>
                    {/* <button className="angled-button angled-button-pink mt-2 px-6 py-3 md:mt-0 md:px-8 md:py-4">
                      <div className="angled-button-inner">
                        <span className="angled-button-text px-4 py-2 md:px-6 md:py-3">
                          {t('enter_the_realm_now')}
                        </span>
                      </div>
                    </button> */}
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
