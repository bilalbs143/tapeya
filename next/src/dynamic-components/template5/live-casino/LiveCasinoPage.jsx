'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template5/components/LazyImage/LazyImage';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';

function LiveCasinoPage() {
  const { handlePlayGame, isLaunching } = useGameLaunch();
  const { t, currentLocale } = useTranslations();
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  // Trigger animation after component mounts
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution-5.webp',
      isLive: true,
    },
    {
      key: 'pragmatic_casino',
      id: '1523',
      provider: 'pragmatic_casino',
      name: 'Pragmatic',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/pragmatic-5.webp',
      isLive: true,
    },
    {
      key: 'AGIN',
      id: '1584',
      provider: 'AGIN',
      name: 'Asia Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/asia-gaming-5.webp',
      isLive: true,
    },
    {
      key: 'cq9_casino',
      id: '1685',
      provider: 'cq9_casino',
      name: 'CQ9',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/cq9-5.webp',
      isLive: true,
    },
    {
      key: 'MICRO_Casino',
      id: '',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/micro-gaming-5.webp',
      isLive: false,
    },
    {
      key: 'VOTA',
      id: '1781',
      provider: 'VOTA',
      name: 'VOTA',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vota-5.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '1753',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/seven-mojos-5.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '1768',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/absolute-live-5.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '1714',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo-5.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/crypto-in-poker-5.webp',
      isLive: false,
    },
    {
      key: 'allbet',
      id: '',
      provider: 'allbet',
      name: 'Allbet',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/allbet-5.webp',
      isLive: false,
    },
    {
      key: 'cream_gaming',
      id: '',
      provider: 'cream_gaming',
      name: 'Cream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/dream-gaming-5.webp',
      isLive: false,
    },
    {
      key: 'mt',
      id: '',
      provider: 'mt',
      name: 'Mt',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mt-game-5.webp',
      isLive: false,
    },
    {
      key: 'oriental_game',
      id: '',
      provider: 'oriental_game',
      name: 'Oriental Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/oriental-game-5.webp',
      isLive: false,
    },
    {
      key: 'sa_game',
      id: '',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game-5.webp',
      isLive: false,
    },
    {
      key: 'sexy',
      id: '',
      provider: 'sexy',
      name: 'Sexy',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-gaming-5.webp',
      isLive: false,
    },
    {
      key: 'bet_game',
      id: '',
      provider: 'bet_game',
      name: 'Bet Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/bet-games-5.webp',
      isLive: false,
    },
    {
      key: 'gameplay_interactive',
      id: '',
      provider: 'gameplay_interactive',
      name: 'Gameplay Interactive',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/gameplay-interactive-5.webp',
      isLive: false,
    },
    {
      key: 'playtech',
      id: '',
      provider: 'playtech',
      name: 'Playtech',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/playtech-5.webp',
      isLive: false,
    },
    {
      key: 'skywind',
      id: '',
      provider: 'skywind',
      name: 'Skywind',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/skywind-group-5.webp',
      isLive: false,
    },
    {
      key: 'agin',
      id: '',
      provider: 'agin',
      name: 'Agin',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/AGIN-up-5.webp',
      isLive: false,
    },
    {
      key: 'dowinn',
      id: '',
      provider: 'dowinn',
      name: 'DowInn',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/DOWINN-up-5.webp',
      isLive: false,
    },
    {
      key: 'sexy_ae',
      id: '',
      provider: 'sexy_ae',
      name: 'Sexy Ae',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SexyBrct-up-5.webp',
      isLive: false,
    },
    {
      key: 'tomhorn',
      id: '',
      provider: 'tomhorn',
      name: 'Tomhorn',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Tomhorn-up-5.webp',
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
      <motion.section
        className="relative mx-auto w-full overflow-hidden"
        aria-label="Live Casino Banner"
        initial={{ opacity: 0, y: 20 }}
        animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.1,
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        <div
          className="relative w-full rounded-[5px]"
          style={{ border: '1px solid #00374A' }}
        >
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-banner-5-up.webp"
            alt="Live Casino Background"
            width={1920}
            height={600}
            className="hidden w-full rounded-[5px] md:block"
            style={{ height: 'auto' }}
            priority
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-banner-mob-5-up.webp"
            alt="Live Casino Background Mobile"
            width={1920}
            height={600}
            className="block w-full rounded-[5px] md:hidden"
            style={{ height: 'auto' }}
            priority
          />

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 rounded-[3px]"
            style={{
              background:
                'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 1) 100%)',
            }}
          />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-start px-4 md:px-6">
            <div className="w-full max-w-2xl text-left">
              <h1
                className="text-[20px] leading-tight font-bold tracking-wide text-white uppercase md:text-[35px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('casinos')}
              </h1>
              <p
                className="mt-2 text-[12px] text-white/70 md:text-[16px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('every_chip_tells_a_story_make_yours_legendary')}
              </p>
            </div>
          </div>
        </div>
      </motion.section>
      <div className="pt-6">
        {/* Header */}
        <motion.div
          className="mb-6 w-full"
          initial={{ opacity: 0, y: -10 }}
          animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2,
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          <div
            className="flex items-center justify-between gap-3 px-3 py-3 md:px-6 md:py-3"
            style={{
              border: '1px solid #00374A',
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
                  border: '1px solid #00374A',
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
                    stroke="#20C5FE"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live Casino Providers Grid */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredProviders.map((provider, index) => (
            <motion.div
              key={provider.key}
              onClick={() => handleCasinoClick(provider)}
              className={`group relative w-full cursor-pointer overflow-hidden rounded-[5px] bg-transparent transition-all duration-300 ${
                !provider.isLive ? 'cursor-not-allowed' : ''
              }`}
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
                delay: index * 0.04,
              }}
              style={{ willChange: 'opacity, transform' }}
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
                  <div className="absolute inset-0 z-20 bg-[#20c5fe73] opacity-0 backdrop-blur-[5px] transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 bg-black transition-colors disabled:opacity-50 sm:h-16 sm:w-16"
                    style={{
                      backgroundColor: '#000000',
                      borderColor: '#20C5FE',
                    }}
                    disabled={isLaunching(provider.id)}
                  >
                    {isLaunching(provider.id) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#20C5FE] border-t-transparent" />
                    ) : (
                      <svg
                        className="h-4 w-4 sm:h-6 sm:w-6"
                        fill="#20C5FE"
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
              {/* <div className="pointer-events-none absolute bottom-0 left-1/2 w-[100%] -translate-x-1/2 text-center">
                <div className="px-3 py-2">
                  <span className="text-sm font-bold text-white uppercase drop-shadow-lg sm:text-base md:text-[24px]">
                    {provider.name}
                  </span>
                </div>
              </div> */}
            </motion.div>
          ))}
        </div>

        {/* Bottom Banner */}
        <motion.div
          className="mt-0"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 0.7,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          <div className="px-0 pt-8 sm:px-0">
            <div className="relative overflow-hidden">
              {/* Desktop Banner - Hidden on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-subbanner-5-up-2.webp"
                alt={t('home_page_banner')}
                className="hidden h-auto w-full object-cover md:block"
              />

              {/* Mobile Banner - Only visible on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-subbanner-mob-5-up-2.webp"
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
                  <button className="text-base font-semibold text-white underline md:text-lg">
                    {t('play_now')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default LiveCasinoPage;
