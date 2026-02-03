'use client';

import React from 'react';

import Announcement from '@/dynamic-components/template6/components/Announcement/Announcement';
import Categories from '@/dynamic-components/template6/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template6/components/HeroSection/HeroSection';
import NewGames from '@/dynamic-components/template6/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template6/components/PopularGames/PopularGames';
import Statistics from '@/dynamic-components/template6/components/Statistics/Statistics';
import TopCasinoProvider from '@/dynamic-components/template6/components/TopCasinoProvider/TopCasinoProvider';
import TopGames from '@/dynamic-components/template6/components/TopGames/TopGames';
import TopProviders from '@/dynamic-components/template6/components/TopProviders/TopProviders';
import TopSlotProvider from '@/dynamic-components/template6/components/TopSlotProvider/TopSlotProvider';
import { useTranslations } from '@/hooks/useTranslations';

function HomePage() {
  const { t } = useTranslations();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white">
      {/* Content Container */}
      <div className="relative z-10 w-full">
        <HeroSection />

        {/* Content with higher z-index */}
        <div className="relative z-10 w-full">
          <Categories />
          <Announcement />
          <NewGames />
          <PopularGames />
          <TopGames />
          <TopCasinoProvider />
          <TopSlotProvider />
        </div>
        <Statistics />
      </div>
    </div>
  );
}

export default HomePage;
