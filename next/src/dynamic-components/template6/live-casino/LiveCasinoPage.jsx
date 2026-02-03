'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template6/components/LazyImage/LazyImage';
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
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution-6.webp',
      isLive: true,
    },
    {
      key: 'pragmatic_casino',
      id: '1523',
      provider: 'pragmatic_casino',
      name: 'Pragmatic',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/pragmatic-6.webp',
      isLive: true,
    },
    {
      key: 'AGIN',
      id: '1584',
      provider: 'AGIN',
      name: 'Asia Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/asia-gaming-6.webp',
      isLive: true,
    },
    {
      key: 'cq9_casino',
      id: '1685',
      provider: 'cq9_casino',
      name: 'CQ9',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cq9-6.webp',
      isLive: true,
    },
    {
      key: 'MICRO_Casino',
      id: '',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/micro-gaming-6.webp',
      isLive: false,
    },
    {
      key: 'VOTA',
      id: '1781',
      provider: 'VOTA',
      name: 'VOTA',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vota-6.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '1753',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/seven-mojos-6.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '1768',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute-live-6.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '1714',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo-6.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/crypto-in-poker-6.webp',
      isLive: false,
    },
    {
      key: 'allbet',
      id: '',
      provider: 'allbet',
      name: 'Allbet',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/allbet-6.webp',
      isLive: false,
    },
    {
      key: 'cream_gaming',
      id: '',
      provider: 'cream_gaming',
      name: 'Cream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/dream-gaming-6.webp',
      isLive: false,
    },
    {
      key: 'mt',
      id: '',
      provider: 'mt',
      name: 'Mt',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mt-game-6.webp',
      isLive: false,
    },
    {
      key: 'oriental_game',
      id: '',
      provider: 'oriental_game',
      name: 'Oriental Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/oriental-gaming-6.webp',
      isLive: false,
    },
    {
      key: 'sa_game',
      id: '',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game-6.webp',
      isLive: false,
    },
    {
      key: 'sexy',
      id: '',
      provider: 'sexy',
      name: 'Sexy',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-gaming-6.webp',
      isLive: false,
    },
    {
      key: 'bet_game',
      id: '',
      provider: 'bet_game',
      name: 'Bet Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/bet-games-6.webp',
      isLive: false,
    },
    {
      key: 'gameplay_interactive',
      id: '',
      provider: 'gameplay_interactive',
      name: 'Gameplay Interactive',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/gameplay-interactive-6.webp',
      isLive: false,
    },
    {
      key: 'playtech',
      id: '',
      provider: 'playtech',
      name: 'Playtech',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/playtech-6.webp',
      isLive: false,
    },
    {
      key: 'skywind',
      id: '',
      provider: 'skywind',
      name: 'Skywind',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/skywind-group-6.webp',
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
        <div className="relative overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-top-banner-6.webp"
            alt={t('live_casino_background_alt')}
            width={1920}
            height={600}
            className="hidden h-auto w-full rounded-[5px] object-cover md:block"
            priority
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-top-banner-mob-6.webp"
            alt={t('live_casino_mobile_background_alt')}
            width={1920}
            height={600}
            className="block h-auto w-full rounded-[5px] object-cover md:hidden"
            priority
          />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-start justify-center px-4 pt-6 md:items-center md:justify-start md:px-6 md:pt-0 md:pl-12">
            <div className="mt-0 flex flex-col items-center md:mt-6 md:items-start">
              {/* CASINO Label with SVG */}
              <div style={{ transform: 'rotate(-3.075deg)' }}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="94"
                  height="45"
                  viewBox="0 0 94 45"
                  fill="none"
                >
                  <g filter="url(#filter0_d_80_752)">
                    <path
                      d="M6.54904 9.06407L87.0804 4.61847L86.9782 30.728L6.46572 35.8541L6.54904 9.06407Z"
                      fill="#F45E2A"
                    />
                  </g>
                  <defs>
                    <filter
                      id="filter0_d_80_752"
                      x="-3.19481e-05"
                      y="3.33786e-06"
                      width="93.5465"
                      height="44.1673"
                      filterUnits="userSpaceOnUse"
                      colorInterpolationFilters="sRGB"
                    >
                      <feFlood floodOpacity="0" result="BackgroundImageFix" />
                      <feColorMatrix
                        in="SourceAlpha"
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                        result="hardAlpha"
                      />
                      <feOffset dy="1.84739" />
                      <feGaussianBlur stdDeviation="3.23293" />
                      <feComposite in2="hardAlpha" operator="out" />
                      <feColorMatrix
                        type="matrix"
                        values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                      />
                      <feBlend
                        mode="normal"
                        in2="BackgroundImageFix"
                        result="effect1_dropShadow_80_752"
                      />
                      <feBlend
                        mode="normal"
                        in="SourceGraphic"
                        in2="effect1_dropShadow_80_752"
                        result="shape"
                      />
                    </filter>
                  </defs>
                  <foreignObject
                    x="6"
                    y="9"
                    width="81"
                    height="27"
                    xmlns="http://www.w3.org/1999/xhtml"
                  >
                    <div className="flex h-full w-full items-center justify-center">
                      <span
                        className="text-sm font-bold text-white uppercase md:text-base"
                        style={{ transform: 'rotate(-3.075deg)' }}
                      >
                        {t('casino')}
                      </span>
                    </div>
                  </foreignObject>
                </svg>
              </div>

              {/* Main Headline */}
              <h1 className="font-rammetto-one text-center text-[24px] leading-tight text-white md:text-left md:text-[30px] lg:text-[25px]">
                {t('live_casino_headline_line_1')}
                <br />
                {t('live_casino_headline_line_2')}
              </h1>

              {/* PLAY NOW CTA */}
              <button className="pt-2 text-center text-base font-bold text-[#F45E2A] underline md:text-left md:text-[14px] lg:text-[16px]">
                {t('play_now')}
              </button>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto pt-6">
        {/* Header */}
        <div className="mb-6 w-full">
          <div
            className="flex items-center justify-between gap-3 px-3 py-3 md:px-6 md:py-3"
            style={{
              border: '1px solid rgba(251, 99, 33, 0.30)',
              borderRadius: '5px',
              background: 'transparent',
            }}
          >
            <div className="flex items-center gap-3">
              <h3
                className="text-[14px] font-semibold tracking-wide text-white uppercase md:text-[22px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('live_casino_providers')}
              </h3>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-2 px-3 py-2"
                style={{
                  border: '1px solid #D61324',
                  borderRadius: '5px',
                  background: 'transparent',
                }}
              >
                <input
                  type="text"
                  placeholder={t('search_providers')}
                  className="max-w-[110px] bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF] md:max-w-[220px]"
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
                    stroke="#D61324"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
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
                className="relative flex w-full flex-col overflow-hidden rounded-[5px] transition-all duration-300"
                style={{
                  border: '1px solid rgba(251, 99, 33, 0.30)',
                  borderRadius: '5px',
                  padding: '12px',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#101010';
                  e.currentTarget.style.borderColor = '#D61324';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'rgba(251, 99, 33, 0.30)';
                }}
              >
                {/* Background image layer */}
                <div className="relative bg-transparent">
                  <div className="relative flex items-center justify-center">
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
                      style={{ backgroundColor: 'rgba(251, 99, 33, 0.3)' }}
                    />

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <button
                          type="button"
                          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 bg-black transition-colors disabled:opacity-50 sm:h-16 sm:w-16"
                          style={{
                            backgroundColor: '#000000',
                            borderColor: '#D61324',
                          }}
                          disabled={isLaunching(provider.id)}
                        >
                          {isLaunching(provider.id) ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#D61324] border-t-transparent" />
                          ) : (
                            <svg
                              className="h-4 w-4 sm:h-6 sm:w-6"
                              fill="#D61324"
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
          <div className="container mx-auto px-0 pt-8 sm:px-0">
            <div className="relative overflow-hidden">
              {/* Desktop Banner - Hidden on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-subbanner-6.webp"
                alt={t('home_page_banner')}
                className="hidden h-auto w-full object-cover md:block"
              />

              {/* Mobile Banner - Only visible on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-subbanner-mob-6.webp"
                alt={t('home_page_banner')}
                className="block h-auto w-full object-cover md:hidden"
              />

              {/* Text Overlay - Center aligned on mobile, left and center aligned on desktop */}
              <div className="absolute inset-0 flex items-start justify-center px-4 pt-8 md:items-center md:justify-start md:pt-0 md:pl-12">
                <div className="text-center md:text-left">
                  <h2 className="mb-2 text-[24px] leading-tight font-bold text-white uppercase md:mb-4 md:text-[32px] lg:text-[40px]">
                    {(() => {
                      const text = t(
                        'ready_to_take_casino_experience_to_next_level',
                      );
                      const lines = text.split('\n');
                      return lines.map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < lines.length - 1 && <br />}
                        </React.Fragment>
                      ));
                    })()}
                  </h2>
                  <button className="text-base font-semibold text-[#FB6321] underline md:text-lg">
                    {t('play_now')}
                  </button>
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
