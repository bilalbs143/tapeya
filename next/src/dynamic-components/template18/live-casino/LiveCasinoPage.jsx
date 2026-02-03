'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template18/components/LazyImage/LazyImage';
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
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Evolution-18.webp',
      isLive: true,
    },
    {
      key: 'pragmatic_casino',
      id: '1523',
      provider: 'pragmatic_casino',
      name: 'Pragmatic',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Pragmatic-Play-18.webp',
      isLive: true,
    },
    {
      key: 'AGIN',
      id: '1584',
      provider: 'AGIN',
      name: 'Asia Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Asia-Gaming-18.webp',
      isLive: true,
    },
    {
      key: 'cq9_casino',
      id: '1685',
      provider: 'cq9_casino',
      name: 'CQ9',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/CQ9-Gaming-18.webp',
      isLive: true,
    },
    {
      key: 'MICRO_Casino',
      id: '',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Microgaming-18.webp',
      isLive: false,
    },
    {
      key: 'VOTA',
      id: '1781',
      provider: 'VOTA',
      name: 'VOTA',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Vota-18.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '1753',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Seven-Mojos-18.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '1768',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Absolut-Live-18.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '1714',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Vivo-18.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/CryptoInPoker-18.webp',
      isLive: false,
    },
    {
      key: 'allbet',
      id: '',
      provider: 'allbet',
      name: 'Allbet',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/AllBet-18.webp',
      isLive: false,
    },
    {
      key: 'cream_gaming',
      id: '',
      provider: 'cream_gaming',
      name: 'Cream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/DreamGaming-18.webp',
      isLive: false,
    },
    {
      key: 'mt',
      id: '',
      provider: 'mt',
      name: 'Mt',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/MTGame-18.webp',
      isLive: false,
    },
    {
      key: 'oriental_game',
      id: '',
      provider: 'oriental_game',
      name: 'Oriental Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Oriental-Game-18.webp',
      isLive: false,
    },
    {
      key: 'sa_game',
      id: '',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SAGaming-18.webp',
      isLive: false,
    },
    {
      key: 'sexy',
      id: '',
      provider: 'sexy',
      name: 'Sexy',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SexyGaming-18.webp',
      isLive: false,
    },
    {
      key: 'bet_game',
      id: '',
      provider: 'bet_game',
      name: 'Bet Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Bet-Games-18.webp',
      isLive: false,
    },
    {
      key: 'gameplay_interactive',
      id: '',
      provider: 'gameplay_interactive',
      name: 'Gameplay Interactive',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/GameplayInt-18.webp',
      isLive: false,
    },
    {
      key: 'playtech',
      id: '',
      provider: 'playtech',
      name: 'Playtech',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Playtech-18.webp',
      isLive: false,
    },
    {
      key: 'skywind',
      id: '',
      provider: 'skywind',
      name: 'Skywind',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SkywindGroup-18.webp',
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
      {/* Live Casino Hero Section - Grid Structure */}
      <section
        className="relative mx-auto w-full max-w-[1580px] px-4 py-4 md:px-6 md:py-6"
        aria-label="Live Casino Hero"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
          {/* Main Banner - Left 9 Cols */}
          <div className="group relative overflow-hidden rounded-[14px] border border-[#FFB7034D] md:col-span-9">
            <div className="relative h-[450px] w-full md:h-[400px]">
              {/* Desktop Image */}
              <div className="hidden md:block">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Casino+BN.png"
                  alt="Main Banner"
                  fill
                  className="object-cover transition-transform duration-700"
                  priority
                />
              </div>
              {/* Mobile Image */}
              <div className="block md:hidden">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Casino-Bn-Mobl-18.png"
                  alt="Main Banner Mobile"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Content Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col md:justify-center justify-start p-6 md:p-12">
                <div className="mb-2 text-[12px] font-bold tracking-[0.2em] text-[#DFA336] uppercase md:text-[14px]">
                  CASINO
                </div>
                <h1
                  className="md:mb-8 mb-4 text-[24px] leading-tight font-bold text-white uppercase md:text-[42px]"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  YOUR CASINO, <br /> ANYTIME, ANYWHERE
                </h1>
                <button className="flex w-fit items-center gap-2 rounded-lg bg-[#FFB703] px-4 py-2 md:px-6 md:py-3 text-[14px] font-bold text-white transition-opacity hover:opacity-90">
                  PLAY NOW
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* App Download Box - Right 3 Cols */}
          <div className="relative mx-auto flex h-[169px] w-[370px] flex-col justify-between overflow-hidden rounded-[14px] border border-[#FFB7034D] p-4 md:col-span-3 md:mx-0 md:h-auto md:min-h-[300px] md:w-auto md:p-6">
            {/* Background Texture/Image Overlay */}
            <div className="absolute inset-0">
              {/* Desktop Image */}
              <div className="absolute inset-0 hidden opacity-40 md:block">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Download-App-Section-18.png"
                  alt="App Interface"
                  fill
                  className="object-cover object-right-top"
                />
              </div>
              {/* Mobile Image */}
              <div className="absolute inset-0 block md:hidden">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Download+Mob.png"
                  alt="App Interface Mobile"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            <div className="relative z-10 px-2 md:px-0">
              <h2
                className="text-[20px] leading-tight font-bold text-white uppercase md:text-[28px]"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                GET OUR <br className="hidden md:block" /> APP
              </h2>
            </div>

            <div className="relative z-10 flex flex-col items-start justify-center gap-2 md:gap-4">
              <div className="rounded-lg  bg-transparent p-1">
                <div className="h-[60px] w-[60px] rounded-md bg-white p-1 md:h-[120px] md:w-[120px]">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/QR.png"
                    alt="QR Code"
                    width={100}
                    height={100}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
              <p className="max-w-[150px] text-left text-[10px] font-bold tracking-widest text-[#FFB703] uppercase md:max-w-none md:text-[12px]">
                DOWNLOAD FOR BETTER EXPERIENCE
              </p>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 pt-1 md:px-0">
        {/* Search Bar matching Image Structure */}
        <div className="mb-6 w-full">
          <div
            className="flex items-center rounded-[5px] px-3 md:rounded-[10px] md:px-6"
            style={{
              border: '1px solid #FFB7034D',
              background: '#14213D',
            }}
          >
            {/* Title with border separator */}
            <div
              className="flex items-center pr-3 md:pr-6"
              style={{
                borderRight: '1px solid #FFB7034D',
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
                  stroke="#FFB703"
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
              className={`w-full ${!provider.isLive ? 'cursor-not-allowed' : ''
              }`}
            >
              <div
                onClick={() => handleCasinoClick(provider)}
                className={`group relative w-full cursor-pointer overflow-hidden bg-transparent transition-all duration-300 ${!provider.isLive ? 'cursor-not-allowed' : ''
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
                    <div className="absolute inset-0 z-20 bg-[linear-gradient(0deg,rgba(9,28,36,0.8)_15%,rgba(35,107,138,0)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </div>

                {/* Play Button Overlay */}
                <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <button
                      type="button"
                      className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 border-[#5E4413] bg-black transition-colors hover:border-[#5E4413] disabled:opacity-50 sm:h-16 sm:w-16"
                      style={{
                        backgroundColor: '#14213DCC',
                        borderColor: '#FFB703',
                      }}
                      disabled={isLaunching(provider.id)}
                    >
                      {isLaunching(provider.id) ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#5E4413] border-t-transparent" />
                      ) : (
                        <svg
                          className="h-4 w-4 text-[#FFB703] sm:h-6 sm:w-6"
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
