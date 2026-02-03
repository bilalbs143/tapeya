'use client';

import React, { useEffect, useState } from 'react';

import Announcement from '@/dynamic-components/template9/components/Announcement/Announcement';
import Categories from '@/dynamic-components/template9/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template9/components/HeroSection/HeroSection';
import NewGames from '@/dynamic-components/template9/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template9/components/PopularGames/PopularGames';
import Statistics from '@/dynamic-components/template9/components/Statistics/Statistics';
import TopGames from '@/dynamic-components/template9/components/TopGames/TopGames';
import TopWinners from '@/dynamic-components/template9/components/TopWinners/TopWinners';
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
        <TopWinners />
        <HeroSection />
        <Announcement />

        {/* Content with higher z-index */}
        <div
          className="relative z-10 w-full"
          style={{
            backgroundImage:
              'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-page-mid-bg-9.webp)',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'contain',
          }}
        >
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
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-9.webp"
                alt={t('home_page_banner')}
                className="hidden h-auto w-full object-cover md:block"
              />

              {/* Mobile Banner - Only visible on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-mob-9.webp"
                alt={t('home_page_banner')}
                className="block h-auto w-full object-cover md:hidden"
              />

              {/* Text Overlay - Top-center on mobile, left aligned on desktop */}
              <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 sm:pt-6 md:mt-6 md:items-center md:justify-start md:pt-0 md:pl-16">
                <div className="w-auto max-w-[calc(100%-2rem)] text-left sm:max-w-[calc(100%-3rem)] md:max-w-none">
                  <div className="flex flex-col items-start gap-2 md:gap-3">
                    {/* GET THE APP */}
                    <h3
                      className="text-left text-[14px] font-bold uppercase sm:text-base md:text-lg lg:text-xl"
                      style={{
                        color: '#DBB42C',
                      }}
                    >
                      {t('get_the_app').toUpperCase()}
                    </h3>

                    {/* REVOLUTIONIZE THE CASINO EXPERIENCE */}
                    <h2 className="font-cravend text-left text-[20px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-lg lg:text-[25px] xl:text-[30px] 2xl:text-[40px]">
                      {t('revolutionize')}
                      <br />
                      {t('the_casino_experience')}
                    </h2>

                    {/* Get App Button */}
                    <button
                      type="button"
                      className="mt-2 rounded-[5px] bg-[#9D4EDD] px-5 py-2 text-sm font-bold text-white uppercase transition-all duration-200 hover:bg-[#8B3EC7] active:scale-95 sm:px-6 sm:py-2 sm:text-base"
                      style={{
                        border: '1px solid rgba(157, 78, 221, 0.50)',
                      }}
                    >
                      Get App
                    </button>
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
