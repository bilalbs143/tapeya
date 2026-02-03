'use client';
import Image from 'next/image';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();

  const backgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-banner-bg-4-up.webp';
  const mobileBackgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/homepage-banner-4-mob.webp';
  const girlUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hero-girl-banner-4.webp';
  const casinoGameUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hero-casino-game-3.webp';

  return (
    <section
      className="relative mx-auto w-full overflow-hidden px-2 md:px-6"
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
                <h1
                  className="!text-[30px] leading-tight font-semibold tracking-wide text-white uppercase lg:!text-[55px]"
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

                <div className="mt-4 flex items-center justify-start gap-2 sm:mt-6">
                  {/* Diamond Icon */}
                  <div className="flex h-6 w-6 items-center justify-center sm:h-7 sm:w-7">
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
                      alt={t('hero_girl')}
                      width={480}
                      height={500}
                      className="h-auto"
                      priority
                    />
                  </div>
                  <p
                    className="text-sm font-semibold text-white sm:text-base md:text-lg lg:text-xl"
                    style={{ fontFamily: 'var(--font-alatsi)' }}
                  >
                    {t('master_the_mechanics_rule_the_table')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Background Image - Only visible on mobile */}
      <div className="relative block w-full md:hidden">
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
                <h1
                  className="!text-[24px] leading-tight font-semibold tracking-wide text-white uppercase"
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

                <div className="mt-4 flex items-center justify-center gap-2 sm:mt-6">
                  {/* Diamond Icon */}
                  <div className="flex h-6 w-6 items-center justify-center sm:h-7 sm:w-7">
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
                      alt={t('hero_girl')}
                      width={480}
                      height={500}
                      className="h-auto"
                      priority
                    />
                  </div>
                  <p
                    className="text-sm font-semibold text-white sm:text-base"
                    style={{ fontFamily: 'var(--font-alatsi)' }}
                  >
                    {t('master_the_mechanics_rule_the_table')}
                  </p>
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
