'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import LazyImage from '@/dynamic-components/template1/components/LazyImage/LazyImage.jsx';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';

function LiveCasinoPage() {
  const { handlePlayGame, isLaunching } = useGameLaunch();
  const { t } = useTranslations();
  const dispatch = useDispatch();

  const [isMobile, setIsMobile] = useState(false);

  const bannerImage =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/koko-casino-1.webp';

  const subBannerImage =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/koko-casino-sub.webp';

  // Get banner text from translations
  const bannerText = {
    mainText: [t('casino_banner_line_1'), t('casino_banner_line_2')],
    subText: t('casino_banner_sub_text'),
  };

  // Get sub banner text from translations
  const subBannerText = {
    mainText: [
      t('casino_sub_banner_line_1'),
      t('casino_sub_banner_line_2'),
      t('casino_sub_banner_line_3'),
    ],
    buttonText: t('casino_sub_banner_button_text'),
    bottomText: t('casino_sub_banner_bottom_text'),
  };

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
      id: '478',
      provider: 'evolution',
      provideText: 'Evolution',
    },
    {
      id: '1523',
      provider: 'pragmatic_casino',
      provideText: 'Pragmatic',
    },
    {
      id: '1584',
      provider: 'AGIN',
      provideText: 'Asia Gaming',
    },
    {
      id: '1685',
      provider: 'cq9_casino',
      provideText: 'CQ9',
    },
    {
      id: '',
      provider: 'MICRO_Casino',
      provideText: 'Microgaming',
    },
    {
      id: '1781',
      provider: 'VOTA',
      provideText: 'VOTA',
    },
    {
      id: '1753',
      provider: 'TOMHORN_7Mojos',
      provideText: '7 Mojos',
    },
    {
      id: '1768',
      provider: 'TOMHORN_AbsoluteLive',
      provideText: 'Absolute Live',
    },
    {
      id: '1714',
      provider: 'TOMHORN_VIVO',
      provideText: 'Vivo',
    },
  ];

  // Background images aligned with the provider order above
  const providerBackgrounds = [
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/evolution.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/pragmatic.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/ag.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/co9.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/microgaming.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vota.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mojos.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/tom-horn.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/vivo.webp',
  ];

  // Derive mobile variants; use PNG for most, but AG has only ag1.webp
  const providerBackgroundsMobile = providerBackgrounds.map((src) => {
    if (src.includes('/ag.webp')) {
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/ag1.webp';
    }
    return src.replace(/\.webp$/, '1.png');
  });

  const handleCasinoClick = (provider, index) => {
    // On mobile screens, open modal like Slots page (even if id is missing)
    if (isMobile) {
      const image =
        (isMobile
          ? providerBackgroundsMobile[index]
          : providerBackgrounds[index]) || null;
      const selectedGame = {
        id: provider.id,
        provider: provider.provider,
        name: provider.provideText,
        image,
      };
      dispatch(setSelectedGame(selectedGame));
      dispatch(openModal('launchGame'));
      return;
    }

    // On larger screens, launch directly
    if (provider.id) {
      handlePlayGame(provider.id);
    }
  };

  return (
    <div className="text-white">
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt={t('lines_pattern')}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Single Banner with Text Overlay */}
        <section className="relative">
          <div className="relative overflow-hidden">
            <div className="relative">
              <Image
                src={bannerImage}
                alt={t('casino_banner')}
                width={1920}
                height={700}
                className="h-auto max-h-[250px] min-h-[130px] w-full max-w-full object-contain object-center sm:max-h-[100%]"
                priority
                sizes="100vw"
                quality={95}
              />
              {/* Text Overlay */}
              <div className="absolute inset-0 z-10 flex flex-col items-start justify-center pl-8 sm:pl-16 md:pl-24 lg:pl-32">
                <div className="max-w-[45%] px-2 text-left sm:max-w-[50%] sm:px-4 md:px-6 lg:px-8">
                  <h1
                    className="mb-2 text-[18px] text-white italic sm:mb-4 sm:text-[40px] md:text-[60px] lg:text-[80px]"
                    style={{
                      textShadow: '2px 10px 6px #370089',
                      fontWeight: 'bold',
                      lineHeight: '1.1',
                    }}
                  >
                    {bannerText.mainText.map((line, lineIndex) => (
                      <React.Fragment key={lineIndex}>
                        {line}
                        {lineIndex < bannerText.mainText.length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </h1>
                  <p className="text-[8px] font-bold text-white italic sm:text-lg md:text-xl">
                    {bannerText.subText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2 sm:mb-8 sm:gap-3">
          <h2 className="bg-gradient-to-r from-cyan-300 via-blue-100 via-purple-200 to-purple-700 bg-clip-text text-lg leading-tight font-extrabold text-transparent sm:text-xl md:text-2xl">
            {t('live_casino_providers')}
          </h2>
        </div>

        {/* Live Casino Providers Grid */}
        <div className="grid w-full grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {liveCasinoProviders.map((provider, index) => (
            <div
              key={provider.provider}
              onClick={() => handleCasinoClick(provider, index)}
              className={`group relative h-[150px] w-full cursor-pointer overflow-hidden rounded-lg border border-purple-500/20 transition-all duration-300 hover:shadow-[0_0_10px_0_#FC7E09_inset] sm:h-[200px] md:h-[265px] ${
                !provider.id ? 'cursor-not-allowed' : 'hover:border-[#FC7E09]'
              }`}
            >
              {/* Background image layer that scales on hover */}
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-105"
                style={{
                  backgroundImage: `url(${(isMobile ? providerBackgroundsMobile[index] : providerBackgrounds[index]) || ''})`,
                }}
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-transparent transition-colors duration-300 group-hover:bg-black/60">
                <div className="flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full sm:h-10 sm:w-10 ${
                      isLaunching(provider.id) ? 'bg-gray-500' : 'bg-orange-500'
                    }`}
                  >
                    {isLaunching(provider.id) ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent sm:h-5 sm:w-5" />
                    ) : (
                      <svg
                        className="h-3 w-3 text-white sm:h-4 sm:w-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="px-1 text-center text-xs font-semibold text-white">
                    {isLaunching(provider.id)
                      ? t('launching')
                      : provider.provideText}
                  </span>
                </div>
              </div>

              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-2 right-2 h-8 w-8 rounded-full border border-purple-400" />
                <div className="absolute bottom-2 left-2 h-6 w-6 rounded-full border border-purple-400" />
                <div className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-purple-400" />
              </div>
            </div>
          ))}
        </div>

        {/*<LazyImage*/}
        {/*  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/CasinoSubBanner.webp"*/}
        {/*  alt={t('money')}*/}
        {/*  width={1920}*/}
        {/*  height={700}*/}
        {/*  className="h-full w-full object-contain object-center pt-10"*/}
        {/*/>*/}

        {/* Sub Banner with Text Overlay */}
        <section className="relative mt-8">
          <div className="relative overflow-hidden">
            <div className="relative">
              <Image
                src={subBannerImage}
                alt={t('casino_sub_banner')}
                width={1920}
                height={700}
                className="h-auto max-h-[250px] min-h-[130px] w-full max-w-full object-contain object-center sm:max-h-[100%]"
                priority={false}
                sizes="100vw"
                quality={95}
              />
              {/* Text Overlay - Right Aligned */}
              <div className="absolute inset-0 z-10 flex flex-col items-end justify-center pr-8 sm:pr-16 md:pr-24 lg:pr-32">
                <div className="max-w-[45%] px-2 text-center sm:max-w-[50%] sm:px-4 md:px-6 lg:px-8">
                  <h1
                    className="mb-2 text-[12px] italic sm:mb-4 sm:text-[20px] md:text-[25px] lg:text-[25px]"
                    style={{
                      color: '#FFFFFFCC',
                      fontWeight: 'bold',
                      lineHeight: '1.1',
                    }}
                  >
                    {subBannerText.mainText.join(' ')}
                  </h1>

                  {/* SVG Button */}
                  <div className="mt-4 mb-2 w-full max-w-[885px]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="885"
                      height="130"
                      viewBox="0 0 885 130"
                      fill="none"
                      className="h-auto w-full"
                    >
                      <path
                        d="M65.5398 0H855.443L819.889 129.366H29.5573L65.5398 0Z"
                        fill="url(#paint0_linear_405_618)"
                        fillOpacity="0.7"
                      />
                      <path
                        d="M37.696 2.18119e-05H59.5426L23.3556 129.366H0L37.696 2.18119e-05Z"
                        fill="url(#paint1_linear_405_618)"
                      />
                      <path
                        d="M863.153 0H885L848.813 129.366H825.457L863.153 0Z"
                        fill="url(#paint2_linear_405_618)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear_405_618"
                          x1="-64.3637"
                          y1="-5.88027"
                          x2="-24.7062"
                          y2="280.734"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#51A2FF" />
                          <stop offset="0.433806" stopColor="#1C398E" />
                          <stop offset="0.898108" stopColor="#51A2FF" />
                        </linearGradient>
                        <linearGradient
                          id="paint1_linear_405_618"
                          x1="825.457"
                          y1="64.683"
                          x2="885"
                          y2="64.683"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#FF6900" />
                          <stop offset="1" stopColor="#983F00" />
                        </linearGradient>
                        <linearGradient
                          id="paint2_linear_405_618"
                          x1="825.457"
                          y1="64.683"
                          x2="885"
                          y2="64.683"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stopColor="#FF6900" />
                          <stop offset="1" stopColor="#983F00" />
                        </linearGradient>
                      </defs>
                      <foreignObject
                        x="75"
                        y="0"
                        width="770"
                        height="130"
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          xmlns="http://www.w3.org/1999/xhtml"
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 30px',
                            boxSizing: 'border-box',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: 'Arial, sans-serif',
                              fontSize: 'clamp(12px, 10vw, 45px)',
                              fontWeight: 'bold',
                              fontStyle: 'italic',
                              color: 'white',
                              textAlign: 'center',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              display: 'block',
                              width: '100%',
                              maxWidth: '100%',
                            }}
                          >
                            {subBannerText.buttonText}
                          </span>
                        </div>
                      </foreignObject>
                    </svg>
                  </div>

                  {/* Bottom Text */}
                  <p className="text-[10px] font-bold text-[#FFFFFFCC] italic sm:text-lg md:text-xl">
                    {subBannerText.bottomText}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LiveCasinoPage;
