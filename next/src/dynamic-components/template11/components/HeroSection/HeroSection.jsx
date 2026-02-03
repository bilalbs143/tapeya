'use client';
import Image from 'next/image';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();

  const backgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Banner-Desktop-11.png';
  const mobileBackgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Banner-Mob-11.png';
  const girlUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hero-girl-banner-4.webp';
  const casinoGameUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hero-casino-game-3.webp';

  return (
    <section
      className="relative mx-auto w-full overflow-hidden px-2 md:mt-2 md:px-6"
      aria-label={t('hero_section')}
    >
      {/* Desktop Background Image - Hidden on mobile */}
      <div className="relative hidden w-full md:block">
        <Image
          src={backgroundUrl}
          alt="Hero Background"
          width={1920}
          height={400}
          className="h-auto w-full object-contain"
          priority
        />

        {/* Desktop Content Overlay */}
        <div className="absolute inset-0 flex items-center justify-start">
          <div className="container mx-auto px-4">
            <div className="w-full max-w-2xl">
              {/* Headline and Subheadline (left aligned) */}
              <div className="text-left">
                {/* CASINO label */}
                <div className="mb-2 text-[20px] font-bold tracking-[6.4px] text-[#DFA336] uppercase">
                  THE CASINO GLAM
                </div>
                {/* Main Title */}
                <h1
                  className="!text-[30px] leading-tight tracking-wide text-white lg:!text-[55px]"
                  style={{
                    fontFamily: 'var(--font-king-town)',
                  }}
                >
                  Where Every Spin Tells a Story
                </h1>
                {/* PLAY NOW Button */}
                <button
                  type="button"
                  className="mt-2 rounded-[5px] bg-[#DFA336] px-5 py-2 text-sm font-bold text-white uppercase transition-all duration-200 hover:bg-[#DFA336] active:scale-95 sm:px-6 sm:py-2 sm:text-base"
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

      {/* Mobile Background Image - Only visible on mobile */}
      <div className="relative mt-4 block w-full md:hidden">
        <Image
          src={mobileBackgroundUrl}
          alt="Hero Background Mobile"
          width={1920}
          height={400}
          className="h-auto w-full object-contain"
          priority
        />

        {/* Mobile Content Overlay */}
        <div className="absolute inset-0 flex items-start justify-center pt-8">
          <div className="container mx-auto px-4">
            <div className="w-full text-center">
              {/* Headline and Subheadline (center aligned) */}
              <div className="text-center">
                {/* CASINO label */}
                <div className="mb-2 text-[20px] tracking-[6.4px] text-[#DFA336] uppercase">
                  THE CASINO GLAM
                </div>
                {/* Main Title */}
                <h1
                  className="!text-[20px] leading-tight font-semibold tracking-wide text-white uppercase sm:!text-[24px]"
                  style={{
                    fontFamily: 'var(--font-king-town)',
                  }}
                >
                  Where Every Spin Tells a Story
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
