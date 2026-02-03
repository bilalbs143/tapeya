'use client';

import React from 'react';

import Announcement from '@/dynamic-components/template14/components/Announcement/Announcement';
import Categories from '@/dynamic-components/template14/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template14/components/HeroSection/HeroSection';
import NewGames from '@/dynamic-components/template14/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template14/components/PopularGames/PopularGames';
import Statistics from '@/dynamic-components/template14/components/Statistics/Statistics';
import TopGames from '@/dynamic-components/template14/components/TopGames/TopGames';
import { useTranslations } from '@/hooks/useTranslations';

function HomePage() {
  const { t } = useTranslations();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white">
      {/* Content Container */}
      <div className="relative z-10 w-full">
        <HeroSection />
        <Announcement />

        {/* Content with higher z-index */}
        <div
          className="template14-home-content-bg relative z-10 w-full"
          style={{
            backgroundImage:
              'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-mid-bg-7.webp)',
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
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-7.webp"
                alt={t('home_page_banner')}
                className="hidden h-auto w-full object-cover md:block"
              />

              {/* Mobile Banner - Only visible on mobile (<=768px) */}
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-mob-7.webp"
                alt={t('home_page_banner')}
                className="block h-auto w-full object-cover md:hidden"
              />

              {/* Text Overlay - Right aligned on desktop, left aligned on mobile (matching top banner) */}
              <div className="absolute inset-0 z-10 flex items-start justify-start pt-8 pr-0 pl-8 md:items-center md:pt-6 md:pr-20 md:pl-6 lg:pt-0 lg:pl-20">
                <div className="mt-0 w-auto max-w-[calc(100%-2rem)] text-left sm:max-w-[calc(100%-3rem)] md:mt-10 md:max-w-none">
                  <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-3">
                    <h2
                      className="!lg:text-[35px] font-bring-race text-[18px] leading-tight text-white uppercase sm:text-[18px] md:text-[30px] xl:text-[40px]"
                      style={{ letterSpacing: '1px' }}
                    >
                      <span className="font-bring-race block uppercase">
                        {t('win_more').split(' ')[0]}
                      </span>
                      <span className="font-bring-race block uppercase">
                        {t('win_more').split(' ').slice(1).join(' ')}
                      </span>
                    </h2>
                    <p
                      className="text-sm text-white sm:text-base md:text-lg"
                      style={{ fontFamily: 'sans-serif' }}
                    >
                      {t('luck_ritual_tagline')}
                    </p>
                    {/* <button className="angled-button angled-button-pink mt-2 px-6 py-3 md:mt-10 md:px-8 md:py-4">
                      <div className="angled-button-inner">
                        <span className="angled-button-text px-4 py-2 md:px-6 md:py-3">
                          {t('enter_the_realm_now')}
                        </span>
                      </div>
                    </button> */}
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
