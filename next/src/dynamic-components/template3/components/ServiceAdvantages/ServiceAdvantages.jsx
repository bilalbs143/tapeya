'use client';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function ServiceAdvantages() {
  const { t } = useTranslations();

  return (
    <section className="relative mt-8 mb-12 px-2 sm:px-4">
      <div className="container mx-auto">
        <div className="relative overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/homepage-banner-3-new.webp"
            alt={t('home_page_banner')}
            className="hidden h-auto w-full object-cover md:block"
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/homepage-banner-3-new-mob.webp"
            alt={t('home_page_banner')}
            className="block h-auto w-full object-cover md:hidden"
          />

          {/* Text Overlay - Top centered on mobile, left aligned on desktop */}
          <div className="absolute inset-0 flex items-start justify-center pt-12 md:items-center md:justify-start md:pt-0">
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx>{`
              .banner-text {
                font-family: var(--font-alatsi);
              }
            `}</style>
            <h1 className="banner-text bg-[#E8D25E] bg-clip-text px-4 text-center leading-tight font-semibold tracking-wide text-transparent uppercase md:px-16 md:text-left">
              <div className="text-center !text-[22px] md:text-left md:!text-[30px] lg:!text-[50px]">
                {t('your_vip_pass')}
              </div>
              <div className="mt-1 text-center !text-[22px] md:mt-2 md:text-left md:!text-[20px] lg:!text-[50px]">
                {t('to_the_ultimate')}
              </div>
              <div className="mt-1 text-center !text-[22px] md:mt-2 md:text-left md:!text-[30px] lg:!text-[50px]">
                {t('casino_experience')}
              </div>
            </h1>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceAdvantages;
