'use client';
import Image from 'next/image';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();

  const backgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-banner-bg.webp';
  const girlUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hero-girl-banner.webp';

  return (
    <section
      className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
      aria-label={t('hero_section')}
      style={{
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0, 0, 0, 0.45) 50%, rgba(0,0,0,1) 100%), url(${backgroundUrl})`,
      }}
    >
      {/* Content */}
      <div className="container mx-auto flex w-full items-center pt-6 sm:pt-8 lg:pt-10">
        <div className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-2 lg:gap-10">
          {/* Left: Girl image */}
          <div className="order-2 flex justify-center md:order-1 md:justify-start">
            <Image
              src={girlUrl}
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
            <h1
              className="!text-[30px] leading-tight font-normal tracking-wide text-white uppercase lg:!text-[50px]"
              style={{ fontFamily: 'var(--font-airstrike)' }}
            >
              {t('a_single_spin')}
              <br className="hidden sm:block" />
              {t('can_change')}
              <br className="hidden sm:block" />
              {t('your_life')}
            </h1>

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
  );
}

export default HeroSection;
