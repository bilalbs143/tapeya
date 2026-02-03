'use client';

import React from 'react';

import Categories from '@/dynamic-components/template1/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template1/components/HeroSection/HeroSection';
import NewGames from '@/dynamic-components/template1/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template1/components/PopularGames/PopularGames';
import ServiceAdvantages from '@/dynamic-components/template1/components/ServiceAdvantages/ServiceAdvantages';
import TopGames from '@/dynamic-components/template1/components/TopGames/TopGames';
import TopWinners from '@/dynamic-components/template1/components/TopWinners/TopWinners';
import { useTranslations } from '@/hooks/useTranslations';

function HomePage() {
  const { t } = useTranslations();

  return (
    <div className="relative text-white">
      {/* Lines Pattern Background */}
      <div className="pointer-events-none absolute right-0 -bottom-[15%] left-0 -z-10">
        <img
          src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
          alt={t('lines_pattern')}
          className="h-full w-full object-contain"
        />
      </div>

      <Categories />

      <HeroSection />

      <TopWinners />

      <PopularGames />

      <TopGames />

      <NewGames />

      <ServiceAdvantages />

      {/* Statistics Section */}
      {/* <Statistics /> */}
    </div>
  );
}

export default HomePage;
