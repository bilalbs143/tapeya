'use client';

import React from 'react';

import Categories from '@/dynamic-components/template17/components/Categories/Categories';
import HeroSection from '@/dynamic-components/template17/components/HeroSection/HeroSection';
import SubNavbar from '@/dynamic-components/template17/components/Navbar/SubNavbar';
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
      {/* SubNavbar - Only on home page, mobile only */}
      <div className="block md:hidden">
        <SubNavbar />
      </div>
      {/* Categories - Mobile only (desktop shows in layout after Navbar) */}
      <div className="block md:hidden">
        <Categories />
      </div>

      {/* Statistics Section */}
      {/* <Statistics /> */}
    </div>
  );
}

export default HomePage;
