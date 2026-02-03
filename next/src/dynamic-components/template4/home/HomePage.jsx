'use client';

import React from 'react';

import Categories from '@/dynamic-components/template4/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template4/components/HeroSection/HeroSection';
import NewGames from '@/dynamic-components/template4/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template4/components/PopularGames/PopularGames';
import ServiceAdvantages from '@/dynamic-components/template4/components/ServiceAdvantages/ServiceAdvantages';
import TopGames from '@/dynamic-components/template4/components/TopGames/TopGames';
import TopWinners from '@/dynamic-components/template4/components/TopWinners/TopWinners';
import { useTranslations } from '@/hooks/useTranslations';

function HomePage() {
  const { t } = useTranslations();

  return (
    <div className="relative min-h-screen text-white">
      {/* Content Container */}
      <div className="relative z-10">
        <HeroSection />

        {/* Pattern Background Section - Categories to ServiceAdvantages */}
        <div className="relative">
          {/* Pattern Background Overlay - Only for this section */}
          <div
            className="pointer-events-none absolute inset-0 h-full w-full"
            style={{
              zIndex: 0,
              backgroundColor: '#060D0D', // Fallback background color
              backgroundImage:
                'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-pattern-4.webp)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
              opacity: 1,
            }}
          />

          {/* Content with higher z-index */}
          <div className="relative z-10">
            <Categories />
            <PopularGames />
            <TopGames />
            <NewGames />
            <TopWinners />
            <ServiceAdvantages />
          </div>
        </div>

        {/* Statistics Section */}
        {/* <Statistics /> */}
      </div>
    </div>
  );
}

export default HomePage;
