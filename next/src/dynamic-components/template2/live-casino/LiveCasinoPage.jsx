'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template2/components/LazyImage/LazyImage';
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
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution2.webp',
      isLive: true,
    },
    {
      key: 'pragmatic_casino',
      id: '1523',
      provider: 'pragmatic_casino',
      name: 'Pragmatic',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/pragmatic2.webp',
      isLive: true,
    },
    {
      key: 'AGIN',
      id: '1584',
      provider: 'AGIN',
      name: 'Asia Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/ag2.webp',
      isLive: true,
    },
    {
      key: 'cq9_casino',
      id: '1685',
      provider: 'cq9_casino',
      name: 'CQ9',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/co92.webp',
      isLive: true,
    },
    {
      key: 'MICRO_Casino',
      id: '',
      provider: 'MICRO_Casino',
      name: 'Microgaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/microgaming2.webp',
      isLive: false,
    },
    {
      key: 'VOTA',
      id: '1781',
      provider: 'VOTA',
      name: 'VOTA',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vota2.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_7Mojos',
      id: '1753',
      provider: 'TOMHORN_7Mojos',
      name: '7 Mojos',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos2.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_AbsoluteLive',
      id: '1768',
      provider: 'TOMHORN_AbsoluteLive',
      name: 'Absolute Live',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/tom-horn2.webp',
      isLive: true,
    },
    {
      key: 'TOMHORN_VIVO',
      id: '1714',
      provider: 'TOMHORN_VIVO',
      name: 'Vivo',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo2.webp',
      isLive: true,
    },
    {
      key: 'crypto_poker',
      id: '',
      provider: 'crypto_poker',
      name: 'Crypto in poker',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/poker.webp',
      isLive: false,
    },
    {
      key: 'allbet',
      id: '',
      provider: 'allbet',
      name: 'Allbet',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/all-bet.webp',
      isLive: false,
    },
    {
      key: 'cream_gaming',
      id: '',
      provider: 'cream_gaming',
      name: 'Cream Gaming',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/dream.webp',
      isLive: false,
    },
    {
      key: 'mt',
      id: '',
      provider: 'mt',
      name: 'Mt',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mt-game.webp',
      isLive: false,
    },
    {
      key: 'oriental_game',
      id: '',
      provider: 'oriental_game',
      name: 'Oriental Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/oriental-game.webp',
      isLive: false,
    },
    {
      key: 'sa_game',
      id: '',
      provider: 'sa_game',
      name: 'Sa Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-game.webp',
      isLive: false,
    },
    {
      key: 'sexy',
      id: '',
      provider: 'sexy',
      name: 'Sexy',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sexy-game.webp',
      isLive: false,
    },
    {
      key: 'bet_game',
      id: '',
      provider: 'bet_game',
      name: 'Bet Game',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/bet-game.webp',
      isLive: false,
    },
    {
      key: 'gameplay_interactive',
      id: '',
      provider: 'gameplay_interactive',
      name: 'Gameplay Interactive',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/iteractive-game.webp',
      isLive: false,
    },
    {
      key: 'playtech',
      id: '',
      provider: 'playtech',
      name: 'Playtech',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/playtech.webp',
      isLive: false,
    },
    {
      key: 'skywind',
      id: '',
      provider: 'skywind',
      name: 'Skywind',
      background:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/skywind.webp',
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
      {/* Home-style Hero Banner */}
      <section
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        aria-label={t('hero_section')}
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0, 0, 0, 0.19) 50%, rgba(0, 0, 0, 0.77) 100%), url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casinoSlider.webp)',
        }}
      >
        <div className="container mx-auto flex w-full items-center pt-6 sm:pt-8 lg:pt-10">
          <div className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-2 lg:gap-10">
            {/* Left: Girl image */}
            <div className="order-2 flex justify-center md:order-1 md:justify-start">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-girl.webp"
                alt={t('hero_girl')}
                width={480}
                height={500}
                className="h-auto w-[400px] max-w-full object-contain sm:w-[400px] md:w-[400px] lg:w-[500px] xl:w-[700px]"
                sizes="(min-width: 1280px) 480px, (min-width: 1024px) 420px, (min-width: 768px) 360px, (min-width: 640px) 280px, 220px"
                priority
              />
            </div>

            {/* Right: Headline and CTA */}
            <div className="order-1 text-center md:order-2 md:text-left">
              {(() => {
                const texts = {
                  en: {
                    lines: ['ENTER THE', 'NEON REALM', 'OF RICHES'],
                  },
                  id: {
                    lines: ['MASUKI', 'DUNIA NEON', 'YANG KAYA'],
                  },
                  ko: {
                    lines: ['네온의', '부의 영역으로', '들어오라'],
                  },
                };
                const locale = ['en', 'id', 'ko'].includes(currentLocale)
                  ? currentLocale
                  : 'en';
                const { lines } = texts[locale];
                return (
                  <h1
                    className="!text-[30px] leading-tight font-normal tracking-wide text-white uppercase lg:!text-[50px]"
                    style={{ fontFamily: 'var(--font-airstrike)' }}
                  >
                    {lines[0]}
                    <br className="hidden sm:block" />
                    {lines[1]}
                    <br className="hidden sm:block" />
                    {lines[2]}
                  </h1>
                );
              })()}

              <div className="mt-4 sm:mt-6">
                <button
                  type="button"
                  className="inline-block px-6 py-2 text-sm font-semibold tracking-[0.5em] text-white uppercase shadow-md sm:px-10 sm:py-3 sm:text-base"
                  style={{
                    backgroundImage:
                      'linear-gradient(90deg, #bf62d882 0%, #ff00376e 100%)',
                    clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)',
                  }}
                >
                  {t('take_your_chance')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2 sm:mb-8 sm:gap-3">
          <h2 className="text-lg leading-tight font-extrabold text-white sm:text-xl md:text-2xl">
            {t('live_casino_providers')}
          </h2>
        </div>

        {/* Live Casino Providers Grid */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {liveCasinoProviders.map((provider) => (
            <div
              key={provider.key}
              onClick={() => handleCasinoClick(provider)}
              className={`group relative h-[120px] w-full cursor-pointer overflow-hidden rounded-[10px] bg-[#0B0F2A] transition-all duration-300 hover:shadow-[0_0_10px_0_#6AA5FF_inset] sm:h-[150px] md:h-[180px] lg:h-[170px] xl:h-[180px] ${
                !provider.isLive
                  ? 'cursor-not-allowed'
                  : 'hover:border hover:border-[#6AA5FF]'
              }`}
            >
              {/* Background image layer */}
              <div className="absolute inset-0 bg-[#0B0F2A]">
                <div className="absolute inset-0 flex items-center justify-center">
                  <LazyImage
                    src={provider.background}
                    alt={`${provider.name} background`}
                    fill
                    sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                    className="object-cover object-center"
                    quality={85}
                  />
                </div>
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-colors duration-300 group-hover:bg-black/60">
                <div className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    type="button"
                    className={`rounded-md px-5 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110 ${
                      isLaunching(provider.id) ? 'bg-gray-500' : 'bg-[#6AA5FF]'
                    }`}
                    disabled={isLaunching(provider.id)}
                  >
                    {isLaunching(provider.id) ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        {t('launching')}
                      </div>
                    ) : (
                      'PLAY'
                    )}
                  </button>
                </div>
              </div>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-2 h-8 w-8 rounded-full border border-purple-400" />
                <div className="absolute bottom-2 left-2 h-6 w-6 rounded-full border border-purple-400" />
                <div className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-purple-400" />
              </div>

              {/* Provider Name (same styling as slot-provider cards) */}
              <div className="pointer-events-none absolute bottom-3 left-1/2 w-[92%] -translate-x-1/2 transform text-center">
                <div
                  className="text-sm leading-tight font-normal text-white uppercase sm:text-base md:text-lg lg:text-base xl:text-lg"
                  style={{
                    fontFamily: 'var(--font-airstrike)',
                    textShadow:
                      '0 2px 4px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)',
                  }}
                >
                  {provider.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        {/* <div className="my-16">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-bottom-banner.webp"
            alt={t('live_casino_bottom_banner')}
            width={1920}
            height={400}
            className="h-auto w-full rounded-xl object-cover"
            sizes="100vw"
            priority={false}
          />
        </div> */}
      </div>
    </div>
  );
}

export default LiveCasinoPage;
