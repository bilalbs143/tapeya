'use client';

import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

const HomeBottomBanner = () => {
  const { t } = useTranslations();

  return (
    <div className="mt-0">
      <div className="container mx-auto px-0 pt-8 pb-10 sm:px-0">
        <div className="relative overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-14.png"
            alt={t('home_page_banner')}
            className="hidden h-auto w-full object-cover md:block"
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-mob-14.png"
            alt={t('home_page_banner')}
            className="block h-auto w-full object-cover px-2 md:hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default HomeBottomBanner;
