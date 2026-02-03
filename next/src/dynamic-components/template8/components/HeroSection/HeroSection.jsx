'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();
  const [subTextLetterSpacing, setSubTextLetterSpacing] = useState('2px');

  // Update sub text letter spacing based on screen size
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const updateLetterSpacing = () => {
      if (window.innerWidth < 768) {
        setSubTextLetterSpacing('2px');
      } else {
        setSubTextLetterSpacing('5px');
      }
    };
    updateLetterSpacing();
    window.addEventListener('resize', updateLetterSpacing);
    return () => window.removeEventListener('resize', updateLetterSpacing);
  }, []);

  return (
    <section
      className="relative mx-auto w-full overflow-hidden"
      aria-label={t('hero_section')}
    >
      <div className="relative min-h-[200px] w-full overflow-hidden">
        {/* Desktop Banner - Hidden on mobile (<=768px) */}
        <div className="relative hidden w-full md:block">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-8.webp"
            alt={t('hero_banner_alt')}
            width={1920}
            height={600}
            className="block h-auto w-full rounded-[5px] object-cover"
            priority
          />
        </div>

        {/* Mobile Banner - Only visible on mobile (<=768px) */}
        <div className="relative block w-full md:hidden">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-8.webp"
            alt={t('hero_banner_alt')}
            width={1920}
            height={600}
            className="block h-auto w-full rounded-[5px] object-cover"
            priority
          />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 sm:pt-6 md:mt-6 md:items-center md:justify-start md:pt-0 md:pl-16">
          <div className="w-auto max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-none">
            <div className="flex flex-col items-start">
              {/* UNLOCK THE LEGEND. ONE CHIP AT A TIME. */}
              <h2 className="font-bring-race text-left text-[18px] leading-tight tracking-[1px] text-white uppercase sm:text-[18px] md:text-lg lg:text-[30px] xl:text-[40px] 2xl:text-[50px]">
                {t('unlock_the_legend')}
                <br />
                {t('one_chip_at_a_time')}
              </h2>

              {/* Dive into our in-house Slots fantasy */}
              <p
                className="text-left text-[12px] font-bold text-[#636363] sm:text-xs md:text-[12px] lg:text-[14px]"
                style={{
                  letterSpacing: subTextLetterSpacing,
                }}
              >
                {t('slots_fantasy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
