'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import CategoryGamesSlider from '@/dynamic-components/template13/components/CategoryGamesSlider/CategoryGamesSlider';
import LazyImage from '@/dynamic-components/template13/components/LazyImage/LazyImage';
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
      key: 'sexy_ae',
      id: '997',
      provider: 'sexy_ae',
      name: 'SEXYBCRT',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SexyBrct-up-5.webp',
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
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/micro-gaming-5.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '5095',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/crypto-in-poker-5.webp',
      isLive: true,
    },
  ];

  // Determine which providers to display based on query parameter
  const { providers, pageTitle, pageAltText } = useMemo(() => {
    switch (category) {
      case 'table':
        return {
          providers: tableGameProviders,
          pageTitle: t('table_games'),
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
      <div className="relative z-10 pt-6">
        {/* Header */}
        <motion.div
          className="relative z-20 mb-6 w-full overflow-visible"
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
            className="relative z-20 flex flex-wrap items-center gap-2 px-2 py-2 md:flex-nowrap md:justify-between md:gap-3 md:px-3 md:py-3"
            style={{
              border: '1px solid #00374A',
              borderRadius: '5px',
              background: 'transparent',
            }}
          >
            {/* Left Side: Back Button + Title */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Back Button */}
              <button
                onClick={() => router.push('/')}
                className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-[5px] transition-colors hover:opacity-80 sm:h-[36px] sm:w-[36px] md:h-[40px] md:w-[40px]"
                style={{ backgroundColor: '#20C5FE' }}
                aria-label="Go to home"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#FFFFFF"
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
                {pageTitle}
              </h3>
            </div>

            {/* Right Side: Search + Category Dropdown */}
            <div className="relative z-30 flex w-full flex-1 items-center gap-2 md:w-auto md:flex-initial md:gap-3">
              {/* Search */}
              <div
                className="flex h-[32px] flex-1 items-center gap-2 px-2 sm:h-[36px] sm:px-3 md:h-[40px] md:w-[220px] md:flex-none"
                style={{
                  border: '1px solid #00374A',
                  borderRadius: '5px',
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
                    stroke="#20C5FE"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Category Dropdown */}
              <div className="relative z-30 flex-shrink-0">
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
                  <SelectTrigger className="relative flex h-[32px] min-w-[90px] items-center justify-between rounded-[5px] border border-[#00374A] bg-transparent px-2 pr-7 text-[10px] text-white shadow-none focus:border-[#20C5FE] focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[36px] sm:min-w-[110px] sm:px-2.5 sm:pr-8 sm:text-xs md:h-[40px] md:min-w-[160px] md:px-3 md:text-sm [&_svg]:text-[#20C5FE]">
                    <SelectValue
                      placeholder="Select Category"
                      className={category ? 'text-white' : 'text-[#FFFFFF66]'}
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[100] max-h-[200px] w-full border-[#00374A] bg-[#001724]"
                    side="bottom"
                    align="start"
                  >
                    <SelectItem
                      value="slots"
                      className="text-white capitalize hover:bg-[#20C5FE]"
                    >
                      {t('slots') || 'Slots'}
                    </SelectItem>
                    <SelectItem
                      value="arcade"
                      className="text-white capitalize hover:bg-[#20C5FE]"
                    >
                      {t('arcade') || 'Arcade'}
                    </SelectItem>
                    <SelectItem
                      value="hybrid"
                      className="text-white capitalize hover:bg-[#20C5FE]"
                    >
                      {t('hybrid_games') || 'Hybrid Games'}
                    </SelectItem>
                    <SelectItem
                      value="live"
                      className="text-white capitalize hover:bg-[#20C5FE]"
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
                      className="text-white capitalize hover:bg-[#20C5FE]"
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
        </motion.div>

        {/* Live Casino Providers Grid */}
        {filteredProviders.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div
              className="rounded-[5px] border px-8 py-6 text-center"
              style={{
                borderColor: '#00374A',
                background: 'transparent',
              }}
            >
              <p className="text-xl font-semibold text-[#20C5FE] md:text-2xl">
                {t('coming_soon')}
              </p>
            </div>
          </div>
        ) : (
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
