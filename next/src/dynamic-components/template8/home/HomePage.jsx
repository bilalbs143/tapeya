'use client';

import React, { useEffect, useState } from 'react';

import Announcement from '@/dynamic-components/template8/components/Announcement/Announcement';
import Categories from '@/dynamic-components/template8/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template8/components/HeroSection/HeroSection';
import NewGames from '@/dynamic-components/template8/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template8/components/PopularGames/PopularGames';
import Statistics from '@/dynamic-components/template8/components/Statistics/Statistics';
import TopGames from '@/dynamic-components/template8/components/TopGames/TopGames';
import { useTranslations } from '@/hooks/useTranslations';

function HomePage() {
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
    <div className="relative min-h-screen w-full overflow-x-hidden text-white">
      {/* Content Container */}
      <div className="relative z-10 w-full">
        <HeroSection />
        <Announcement />

        {/* Content with higher z-index */}
        <div className="relative z-10 w-full">
          <Categories />
          <NewGames />
          <PopularGames />
          <TopGames />
          <Statistics />
        </div>

        {/* Bottom Banner */}
        <div className="mt-0">
          <div className="px-0 pt-8 sm:px-0">
            <div className="relative overflow-hidden">
              {/* Desktop Banner - Hidden on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-8.webp"
                alt={t('home_page_banner')}
                className="hidden h-auto w-full object-cover md:block"
              />

              {/* Mobile Banner - Only visible on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-mob-8.webp"
                alt={t('home_page_banner')}
                className="block h-auto w-full object-cover md:hidden"
              />

              {/* Text Overlay - Top-center on mobile, right aligned on desktop */}
              <div className="absolute inset-0 z-10 flex items-start justify-center pt-8 sm:pt-6 md:items-center md:justify-end md:pt-6 md:pr-20 md:pl-6 lg:pt-0 lg:pl-20">
                <div className="w-auto max-w-[calc(100%-2rem)] text-left sm:max-w-[calc(100%-3rem)] md:max-w-none">
                  <div className="flex flex-col items-start">
                    <h2 className="!lg:text-[35px] font-bring-race text-[18px] leading-tight tracking-[1px] text-white uppercase sm:text-[18px] md:text-[30px] xl:text-[40px]">
                      {t('balance_your_luck')}
                      <br />
                      {t('elevate_your_game')}
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
