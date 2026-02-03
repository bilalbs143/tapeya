'use client';

import React from 'react';

import Categories from '@/dynamic-components/template3/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template3/components/HeroSection/HeroSection';
import NewGames from '@/dynamic-components/template3/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template3/components/PopularGames/PopularGames';
import ServiceAdvantages from '@/dynamic-components/template3/components/ServiceAdvantages/ServiceAdvantages';
import TopGames from '@/dynamic-components/template3/components/TopGames/TopGames';
import TopWinners from '@/dynamic-components/template3/components/TopWinners/TopWinners';
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
      <HeroSection />
      <Categories />

      <PopularGames />

      <TopGames />

      <NewGames />

      <TopWinners />

      <ServiceAdvantages />

      {/* Statistics Section */}
      {/* <Statistics /> */}
    </div>
  );
}

export default HomePage;
