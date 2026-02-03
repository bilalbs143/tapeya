'use client';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();

  return (
    <section
      className="relative mx-auto w-full overflow-hidden"
      aria-label={t('hero_section')}
    >
      <div className="mt-0">
        <div className="px-0 pt-8 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-9.webp"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-9.webp"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
            />

            {/* Text Overlay - Top-center on mobile, left aligned on desktop */}
            <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 sm:pt-6 md:mt-6 md:items-center md:justify-start md:pt-0 md:pl-16">
              <div className="w-auto max-w-[calc(100%-2rem)] text-left sm:max-w-[calc(100%-3rem)] md:max-w-none">
                <div className="flex flex-col items-start gap-2 md:gap-3">
                  {/* SPIN THE WHEEL OF DESTINY. */}
                  <h3
                    className="text-left text-[14px] font-bold uppercase sm:text-base md:text-lg lg:text-xl"
                    style={{
                      color: '#DBB42C',
                    }}
                  >
                    {t('spin_the_wheel_of_destiny')}
                  </h3>

                  {/* SPIN THE MYTH. WIN THE MOMENT. */}
                  <h2 className="font-cravend text-left text-[20px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-lg lg:text-[25px] xl:text-[30px] 2xl:text-[40px]">
                    {t('spin_the_myth')}
                    <br />
                    {t('win_the_moment')}
                  </h2>

                  {/* PLAY NOW Button */}
                  <button
                    type="button"
                    className="mt-2 rounded-[5px] bg-[#9D4EDD] px-5 py-2 text-sm font-bold text-white uppercase transition-all duration-200 hover:bg-[#8B3EC7] active:scale-95 sm:px-6 sm:py-2 sm:text-base"
                    style={{
                      boxShadow:
                        'inset 0 0 0 2px #DBB42C, 0 4px 14px 0 rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    PLAY NOW
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
