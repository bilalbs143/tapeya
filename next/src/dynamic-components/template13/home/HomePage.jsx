'use client';

import React from 'react';

import Announcement from '@/dynamic-components/template13/components/Announcement/Announcement';
import Categories from '@/dynamic-components/template13/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template13/components/HeroSection/HeroSection';
import NewGames from '@/dynamic-components/template13/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template13/components/PopularGames/PopularGames';
import Statistics from '@/dynamic-components/template13/components/Statistics/Statistics';
import TopGames from '@/dynamic-components/template13/components/TopGames/TopGames';
import TopProviders from '@/dynamic-components/template13/components/TopProviders/TopProviders';
import TopWinners from '@/dynamic-components/template13/components/TopWinners/TopWinners';
import { useTranslations } from '@/hooks/useTranslations';

function HomePage() {
  const { t } = useTranslations();

  return (
    <div className="scrollbar-hide relative min-h-screen w-full overflow-x-hidden overflow-y-auto text-white">
      {/* Content Container */}
      <div className="relative z-10 w-full max-w-full overflow-hidden">
        <HeroSection />

        {/* Content with higher z-index */}
        <div className="relative z-10 w-full overflow-hidden">
          <Categories />
          <Announcement />
          <NewGames />
          <PopularGames />
          <TopGames />
          <TopProviders />
        </div>
        <Statistics />
        <TopWinners />
      </div>
    </div>
  );
}

export default HomePage;
