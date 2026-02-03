'use client';

import React from 'react';

import Categories from '@/dynamic-components/template12/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template12/components/HeroSection/HeroSection';
import SubNavbar from '@/dynamic-components/template12/components/Navbar/SubNavbar';
import NewGames from '@/dynamic-components/template12/components/NewGames/NewGames';
import PopularGames from '@/dynamic-components/template12/components/PopularGames/PopularGames';
import ServiceAdvantages from '@/dynamic-components/template12/components/ServiceAdvantages/ServiceAdvantages';
import TopGames from '@/dynamic-components/template12/components/TopGames/TopGames';
import TopWinners from '@/dynamic-components/template12/components/TopWinners/TopWinners';
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
      <SubNavbar />
      {/* Categories - Mobile only (desktop shows in layout after Navbar) */}
      <div className="block md:hidden">
        <Categories />
      </div>

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
