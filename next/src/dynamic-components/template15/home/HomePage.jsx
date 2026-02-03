'use client';

import React from 'react';

import Categories from '@/dynamic-components/template15/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template15/components/HeroSection/HeroSection';
import SubNavbar from '@/dynamic-components/template15/components/Navbar/SubNavbar';
import NewGames from '@/dynamic-components/template15/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template15/components/PopularGames/PopularGames';
import ServiceAdvantages from '@/dynamic-components/template15/components/ServiceAdvantages/ServiceAdvantages';
import TopGames from '@/dynamic-components/template15/components/TopGames/TopGames';
import TopWinners from '@/dynamic-components/template15/components/TopWinners/TopWinners';
import { useTranslations } from '@/hooks/useTranslations';

function HomePage() {
  const { t } = useTranslations();

  return (
    <div className="relative min-h-screen text-white">
      {/* Content Container */}
      <div className="relative z-10">
        <HeroSection />

        {/* Content Section - Categories to ServiceAdvantages */}
        <div className="relative">
          <Categories />
          <PopularGames />
          <TopGames />
          <NewGames />
          <TopWinners />
          <ServiceAdvantages />
        </div>

        {/* Statistics Section */}
        {/* <Statistics /> */}
      </div>
    </div>
  );
}

export default HomePage;
