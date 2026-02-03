'use client';

import React, { useEffect, useState } from 'react';

import Announcement from '@/dynamic-components/template10/components/Announcement/Announcement';
import Categories from '@/dynamic-components/template10/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template10/components/HeroSection/HeroSection';
import NewGames from '@/dynamic-components/template10/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template10/components/PopularGames/PopularGames';
import Statistics from '@/dynamic-components/template10/components/Statistics/Statistics';
import TopGames from '@/dynamic-components/template10/components/TopGames/TopGames';
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
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-10.webp"
                alt={t('home_page_banner')}
                className="hidden h-auto w-full object-cover md:block"
              />

              {/* Mobile Banner - Only visible on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-mob-10.webp"
                alt={t('home_page_banner')}
                className="block h-auto w-full object-cover md:hidden"
              />

              {/* Text Overlay - Top on mobile, centered on desktop */}
              <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 sm:pt-6 md:mt-10 md:items-center md:pt-0">
                <div className="w-auto max-w-[calc(100%-2rem)] text-center sm:max-w-[calc(100%-3rem)] md:max-w-none">
                  <div className="flex flex-col items-center">
                    {/* JACKPOTS AREN'T FOUND-THEY'RE FORGED. */}
                    <h2 className="font-spy-agency text-center text-[20px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-lg lg:text-[20px] xl:text-[22px] 2xl:text-[27px]">
                      {t('jackpots_arent_found')}
                      <br />
                      {t('theyre_forged')}
                    </h2>
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
