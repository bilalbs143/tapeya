'use client';
import Image from 'next/image';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();

  const desktopBannerUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-7.webp';
  const mobileBannerUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-7.webp';

  return (
    <section className="relative mx-auto w-full" aria-label={t('hero_section')}>
      <div className="">
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
            <div className="absolute top-1/2 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
              <div className="flex flex-col items-center gap-4">
                {/* SPIN NOW | WIN */}
                <div
                  className="rounded px-4 py-2 md:px-6 md:py-2"
                  style={{
                    border: '1px solid rgba(51, 19, 105, 0.70)',
                    backgroundColor: 'rgba(24, 14, 58, 0.5)',
                  }}
                >
                  <span className="inline-block text-[16px] font-bold whitespace-nowrap text-white uppercase md:text-[20px]">
                    {t('spin_now_win')}
                  </span>
                </div>

                {/* One Spin can */}
                <h2
                  className="font-bring-race text-center text-xl leading-tight text-white md:text-2xl lg:text-2xl xl:text-3xl"
                  style={{ letterSpacing: '2px' }}
                >
                  {t('one_spin_can')}
                </h2>

                {/* change the game */}
                <h2
                  className="font-bring-race text-center text-xl leading-tight text-white md:text-2xl lg:text-2xl xl:text-3xl"
                  style={{ letterSpacing: '2px' }}
                >
                  {t('change_the_game')}
                </h2>

                {/* ENTER THE REALM NOW */}
                {/* <button className="angled-button angled-button-pink mt-2 px-6 py-3 md:px-8 md:py-4">
                  <div className="angled-button-inner">
                    <span className="angled-button-text px-6 py-3 text-sm md:text-base">
                      {t('enter_the_realm_now')}
                    </span>
                  </div>
                </button> */}
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
            <div className="absolute top-1/2 right-4 z-10 w-auto max-w-[calc(100%-2rem)] -translate-y-1/2">
              <div className="flex flex-col items-start gap-2 md:items-end md:gap-3">
                {/* SPIN NOW | WIN */}
                <div
                  className="rounded px-2.5 py-1"
                  style={{
                    border: '1px solid rgba(51, 19, 105, 0.70)',
                    backgroundColor: 'rgba(24, 14, 58, 0.5)',
                  }}
                >
                  <span className="inline-block text-[11px] font-bold whitespace-nowrap text-white uppercase">
                    {t('spin_now_win')}
                  </span>
                </div>

                {/* One Spin can */}
                <h2
                  className="font-bring-race text-right text-[10px] leading-tight text-white"
                  style={{ letterSpacing: '1px' }}
                >
                  {t('one_spin_can')}
                </h2>

                {/* change the game */}
                <h2
                  className="font-bring-race text-right text-[10px] leading-tight text-white"
                  style={{ letterSpacing: '1px' }}
                >
                  {t('change_the_game')}
                </h2>

                {/* ENTER THE REALM NOW */}
                {/* <button className="angled-button angled-button-pink mt-1 px-6 py-3 md:px-8 md:py-4">
                  <div className="angled-button-inner">
                    <span className="angled-button-text px-3 py-2 md:px-6 md:py-3">
                      {t('enter_the_realm_now')}
                    </span>
                  </div>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
