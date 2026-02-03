'use client';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();

  const backgroundUrlDesktop =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-banner-bg-3-up.webp';
  const backgroundUrlMobile =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-banner-bg-mob-3-up.webp';

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label={t('hero_section')}
      style={{ minHeight: '650px' }}
    >
      {/* Desktop Background */}
      <div
        className="absolute inset-0 hidden md:block"
        style={{
          backgroundImage: `url(${backgroundUrlDesktop})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* Mobile Background */}
      <div
        className="absolute inset-0 block md:hidden"
        style={{
          backgroundImage: `url(${backgroundUrlMobile})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container mx-auto flex h-full min-h-[600px] w-full items-start justify-center py-6 sm:py-8 md:items-center md:justify-start lg:py-10">
        <div className="w-full">
          {/* Headline and Subheadline (center on mobile, left on desktop) */}
          <div className="text-center md:text-left">
            <h1
              className="bg-[#E8D25E] bg-clip-text !text-[30px] leading-tight font-semibold tracking-wide text-transparent uppercase lg:!text-[55px]"
              style={{
                fontFamily: 'var(--font-alatsi)',
                WebkitTextStroke: '0px transparent',
                textStroke: '0px transparent',
              }}
            >
              {t('elevate_your_game')}
              <br />
              {t('chase_the_jackpot')}
            </h1>

            <p
              className="mt-4 bg-[#E8D25E] bg-clip-text text-sm font-semibold text-transparent sm:mt-6 sm:text-base md:text-lg lg:text-xl"
              style={{ fontFamily: 'var(--font-alatsi)' }}
            >
              {t('master_the_mechanics_rule_the_table')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
