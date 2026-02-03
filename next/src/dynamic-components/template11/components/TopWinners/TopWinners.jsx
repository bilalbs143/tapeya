'use client';

import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

const HomeBottomBanner = () => {
  const { t } = useTranslations();

  return (
    <div className="mt-0">
      <div className="container mx-auto px-0 pt-8 sm:px-0">
        <div className="relative overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-11.webp"
            alt={t('home_page_banner')}
            className="hidden h-auto w-full object-cover md:block"
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-mob-11.webp"
            alt={t('home_page_banner')}
            className="block h-auto w-full object-cover px-2 md:hidden"
          />

          {/* Text Overlay - Top center on mobile, right side on desktop */}
          <div className="absolute inset-0 flex items-start justify-center pt-4 pr-0 md:items-center md:justify-end md:pt-0 md:pr-32">
            <div className="text-left">
              {/* TAP. SPIN. WIN. */}
              <div className="mb-2 text-[16px] font-bold text-[#DFA336] uppercase md:text-[18px] lg:text-[20px]">
                TAP. SPIN. WIN.
              </div>

              {/* LUXURY. LUCK. AND LIMITLESS WINS */}
              <div
                className="text-[22px] text-white md:text-[30px] lg:text-[50px]"
                style={{
                  fontFamily: 'var(--font-king-town)',
                }}
              >
                LUXURY. LUCK.
                <br />
                AND LIMITLESS WINS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeBottomBanner;
