'use client';

import Image from 'next/image';
import React from 'react';
import { useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template11/components/GameProviders/GameProviders';
import LazyImage from '@/dynamic-components/template11/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template11/components/SlotCategories/SlotCategories';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';

export default function SlotsPage() {
  const { t } = useTranslations();
  const { selectedProviderId, allProvidersData } = useSelector(
    (state) => state.website,
  );

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt="Lines Pattern"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Slot Detail Hero Banner - Same structure as Slot Providers */}
        <section
          className="relative mx-auto w-full overflow-hidden px-2 md:mt-4 md:px-6"
          aria-label="Slot Detail Banner"
        >
          {/* Desktop Background Image - Hidden on mobile */}
          <div className="relative hidden w-full md:block">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-11.webp"
              alt="Slot Detail Background"
              width={1920}
              height={400}
              className="h-auto w-full object-contain"
              priority
            />

            {/* Desktop Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-start">
              <div className="container mx-auto px-4">
                <div className="w-full max-w-2xl">
                  {/* Headline and Subheadline (left aligned) */}
                  <div className="text-left">
                    {/* SLOTS label */}
                    <div className="mb-2 text-[20px] font-bold tracking-[6.4px] text-[#DFA336] uppercase">
                      SLOTS
                    </div>
                    {/* Main Title */}
                    <h1
                      className="!text-[30px] leading-tight tracking-wide text-white lg:!text-[55px]"
                      style={{
                        fontFamily: 'var(--font-king-town)',
                      }}
                    >
                      SPIN LIKE ROYALTY.
                      <br />
                      WIN LIKE A LEGEND.
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Background Image - Only visible on mobile */}
          <div className="relative block w-full md:hidden">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-mob-11.webp"
              alt="Slot Detail Background Mobile"
              width={1920}
              height={400}
              className="h-auto w-full object-contain"
              priority
            />

            {/* Mobile Content Overlay */}
            <div className="absolute inset-0 flex items-start justify-center pt-8">
              <div className="container mx-auto px-4">
                <div className="w-full text-center">
                  {/* Headline and Subheadline (center aligned) */}
                  <div className="text-center">
                    {/* SLOTS label */}
                    <div className="mb-2 text-[20px] tracking-[6.4px] text-[#DFA336] uppercase">
                      SLOTS
                    </div>
                    {/* Main Title */}
                    <h1
                      className="!text-[20px] leading-tight font-semibold tracking-wide text-white uppercase sm:!text-[24px]"
                      style={{
                        fontFamily: 'var(--font-king-town)',
                      }}
                    >
                      SPIN LIKE ROYALTY.
                      <br />
                      WIN LIKE A LEGEND.
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Header - match trending games symmetry */}
          <div className="w-full">
            <div className="flex items-center justify-between gap-3 px-0 py-0">
              <div className="relative flex flex-1 items-center justify-center gap-4">
                {/* Left line segment */}
                <div
                  className="h-[1px] flex-1"
                  style={{
                    backgroundColor: '#5E4413',
                  }}
                />
                {/* Title centered with spacing */}
                <h3
                  className="shrink-0 px-4 text-[24px] font-semibold tracking-wide text-white uppercase md:text-[32px]"
                  style={{
                    fontFamily: 'var(--font-king-town)',
                  }}
                >
                  {selectedProviderId
                    ? getProviderNameById(
                      selectedProviderId,
                      allProvidersData,
                    ) || t('slot_games')
                    : t('slot_games')}
                </h3>
                {/* Right line segment */}
                <div
                  className="h-[1px] flex-1"
                  style={{
                    backgroundColor: '#5E4413',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <SlotCategories />
        {/* Bottom Curved Pattern above footer (positioned, no layout shift) */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-[420px]"
          aria-hidden
        >
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/curved-pattern.svg"
            alt="Curved Pattern"
            className="h-full w-full object-cover opacity-30"
          />
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-0">
        <div className="container mx-auto px-0 pt-8 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-11.png"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-11.png"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
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
    </>
  );
}
