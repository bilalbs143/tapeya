'use client';
import Image from 'next/image';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();

  const desktopBannerUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-6.png';
  const mobileBannerUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-6.png';

  return (
    <section className="relative mx-auto w-full" aria-label={t('hero_section')}>
      <div className="container mx-auto">
        <div className="relative w-full">
          {/* Desktop Banner */}
          <div className="relative hidden md:block">
            <Image
              src={desktopBannerUrl}
              alt={t('hero_banner_alt')}
              width={1920}
              height={1080}
              className="h-auto w-full"
              priority
            />
            {/* Text Overlay */}
            <div className="absolute top-1/2 left-1/2 z-10 -translate-x-[calc(50%+100px)] -translate-y-1/2">
              <div className="flex flex-col gap-0">
                {/* SPIN NOW | WIN with orange background */}
                <div className="relative inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="105"
                    viewBox="0 0 320 105"
                    fill="none"
                    className="h-auto w-auto"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <filter
                        id="filter0_d_140_1664"
                        x="0"
                        y="0"
                        width="361.425"
                        height="104.168"
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
                        <feOffset dy="4" />
                        <feGaussianBlur stdDeviation="7" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                        />
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow_140_1664"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect1_dropShadow_140_1664"
                          result="shape"
                        />
                      </filter>
                    </defs>
                    <g filter="url(#filter0_d_140_1664)">
                      <path
                        d="M17.12 28.0035L307.425 10L304.298 66.689L14 86.1677L17.12 28.0035Z"
                        fill="#F45E2A"
                      />
                    </g>
                    {/* Text and Icon Group */}
                    <g transform="rotate(-3.40 160 50)">
                      <foreignObject
                        x="50"
                        y="25"
                        width="240"
                        height="50"
                        xmlns="http://www.w3.org/1999/xhtml"
                      >
                        <span className="inline-block text-[16px] font-bold whitespace-nowrap text-white uppercase md:text-[30px]">
                          {t('spin_now_win')}
                        </span>
                      </foreignObject>
                    </g>
                  </svg>
                </div>

                {/* Shuffle The Deck, */}
                <h2
                  className="font-rammetto-one -mt-2 text-xl leading-tight text-white md:-mt-4 md:text-2xl lg:text-2xl xl:text-3xl"
                  style={{
                    transform: 'rotate(-3.94deg)',
                    letterSpacing: '2px',
                  }}
                >
                  {t('shuffle_the_deck')}
                </h2>

                {/* Deal Your Destiny. */}
                <h2
                  className="font-rammetto-one text-xl leading-tight text-white md:text-2xl lg:text-2xl xl:text-3xl"
                  style={{
                    transform: 'rotate(-3.94deg)',
                    letterSpacing: '2px',
                  }}
                >
                  {t('deal_your_destiny')}
                </h2>

                {/* PLAY NOW */}
                <div className="flex justify-center">
                  <button
                    className="w-fit pt-2 text-center text-lg font-bold text-[#FB6321] underline transition-colors duration-200 hover:text-[#FB6321]/80 md:text-xl lg:text-[16px]"
                    style={{ transform: 'rotate(-3.94deg)' }}
                  >
                    {t('play_now')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Banner */}
          <div className="relative block md:hidden">
            <Image
              src={mobileBannerUrl}
              alt={t('hero_banner_alt')}
              width={600}
              height={1200}
              className="h-auto w-full"
              priority
            />
            {/* Mobile Text Overlay */}
            <div className="absolute top-8 left-1/2 z-10 w-full -translate-x-1/2">
              <div className="flex flex-col items-center gap-0">
                {/* SPIN NOW | WIN with orange background */}
                <div className="relative inline-block">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="80"
                    viewBox="0 0 240 80"
                    fill="none"
                    className="h-auto w-auto"
                    preserveAspectRatio="xMidYMid meet"
                  >
                    <defs>
                      <filter
                        id="filter0_d_140_1664_mobile"
                        x="0"
                        y="0"
                        width="240"
                        height="80"
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
                        <feOffset dy="3" />
                        <feGaussianBlur stdDeviation="5" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                        />
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow_140_1664_mobile"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect1_dropShadow_140_1664_mobile"
                          result="shape"
                        />
                      </filter>
                    </defs>
                    <g filter="url(#filter0_d_140_1664_mobile)">
                      <path
                        d="M12.84 21.003L227.425 7.5L225.224 50.017L10.5 64.626L12.84 21.003Z"
                        fill="#F45E2A"
                      />
                    </g>
                    {/* Text and Icon Group */}
                    <g transform="rotate(-3.40 120 40)">
                      <foreignObject
                        x="30"
                        y="18"
                        width="180"
                        height="40"
                        xmlns="http://www.w3.org/1999/xhtml"
                      >
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="pb-1 text-center text-[20px] font-bold whitespace-nowrap text-white uppercase">
                            {t('spin_now_win')}
                          </span>
                        </div>
                      </foreignObject>
                    </g>
                  </svg>
                </div>

                {/* Shuffle The Deck, */}
                <h2
                  className="font-rammetto-one -mt-2 text-center text-[25px] leading-tight text-white"
                  style={{
                    transform: 'rotate(-3.94deg)',
                    letterSpacing: '2px',
                  }}
                >
                  {t('shuffle_the_deck')}
                </h2>

                {/* Deal Your Destiny. */}
                <h2
                  className="font-rammetto-one text-center text-[25px] leading-tight text-white"
                  style={{
                    transform: 'rotate(-3.94deg)',
                    letterSpacing: '2px',
                  }}
                >
                  {t('deal_your_destiny')}
                </h2>

                {/* PLAY NOW */}
                <div className="flex justify-center">
                  <button
                    className="w-fit pt-2 text-center text-sm font-bold text-[#FB6321] underline transition-colors duration-200 hover:text-[#FB6321]/80"
                    style={{ transform: 'rotate(-3.94deg)' }}
                  >
                    {t('play_now')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
