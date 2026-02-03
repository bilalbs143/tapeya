'use client';

import React from 'react';

import Categories from '@/dynamic-components/template16/components/Categories/Categories';
import Contact from '@/dynamic-components/template16/components/Contact/Contact';
import EasySteps from '@/dynamic-components/template16/components/EasySteps/EasySteps';
import GameCategorySection from '@/dynamic-components/template16/components/GameCategorySection/GameCategorySection';
import HeroSection from '@/dynamic-components/template16/components/HeroSection/HeroSection';
import Jackpot from '@/dynamic-components/template16/components/Jackpot/Jackpot';
import SubNavbar from '@/dynamic-components/template16/components/Navbar/SubNavbar';
import PopularGames from '@/dynamic-components/template16/components/PopularGames/PopularGames';
import Service from '@/dynamic-components/template16/components/Service/Service';
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
      <Jackpot />
      {/* Categories - Mobile only (desktop shows in layout after Navbar) */}
      <div className="block md:hidden">
        <Categories />
      </div>

      {/* Game Category Section with Provider Filtering */}
      <GameCategorySection />

      <PopularGames />

      <EasySteps />

      <Service />

      <Contact />

      {/* Statistics Section */}
      {/* <Statistics /> */}
    </div>
  );
}

export default HomePage;
