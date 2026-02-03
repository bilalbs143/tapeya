'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template15/components/GameProviders/GameProviders';
import LazyImage from '@/dynamic-components/template15/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template15/components/SlotCategories/SlotCategories';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';

export default function SlotsPage() {
  const { t } = useTranslations();
  const { selectedProviderId, allProvidersData } = useSelector(
    (state) => state.website,
  );
  const [searchQuery, setSearchQuery] = useState('');

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
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SlotDesktopBanner-12.webp"
              alt="Slot Providers Background"
              width={1920}
              height={400}
              className="h-full w-full object-cover"
              priority
            />

            {/* Desktop Content Overlay */}
            <div className="absolute inset-0 z-10 flex items-end justify-end px-4 pb-32 sm:px-8 md:px-16 lg:px-32 lg:pb-20 xl:px-40">
              <div className="w-full max-w-[520px] text-left">
                <div className="mb-2 text-[14px] font-bold tracking-[6.4px] text-[#DFA336] uppercase sm:text-[16px] md:text-[18px] lg:text-[20px]">
                  SLOTS
                </div>

                <h1
                  className="text-[28px] leading-tight tracking-wide text-white sm:text-[36px] md:text-[40px] lg:text-[55px]"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  SLOTS POWER <br /> IN YOUR POCKET
                </h1>
              </div>
            </div>
          </div>

          {/* Mobile Background Image - Only visible on mobile */}
          <div className="relative mt-4 block w-full md:hidden">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/SlotMobBanner-12.webp"
              alt="Slot Providers Background Mobile"
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
                      SLOTS POWER <br /> IN YOUR POCKET
                    </h1>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-2 pt-8 md:px-0">
          {/* Search Container */}
          <div className="mb-2 flex w-full flex-row items-center justify-between gap-2 md:mb-5 md:gap-4">
            <div className="flex shrink-0 items-center">
              <h3
                className="text-[16px] font-normal tracking-wide text-[#CBBC91] uppercase sm:text-[20px] md:text-[24px]"
                style={{
                  fontFamily: 'var(--font-king-town)',
                }}
              >
                {selectedProviderId
                  ? getProviderNameById(selectedProviderId, allProvidersData) ||
                    t('slot_games')
                  : t('slot_games')}
              </h3>
            </div>

            <div
              className="mb-2 flex w-[200px] items-center rounded-full border px-3 py-3 md:mb-4 md:w-[270px] md:px-4 md:py-3"
              style={{
                border: '1px solid #CBBC9121',
                backgroundColor: '#151517',
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4 shrink-0 md:mr-3 md:h-[24px] md:w-[24px]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                  stroke="#CBBC91"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                type="text"
                placeholder="Search Slot Providers..."
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#8B8B8B] md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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
    </>
  );
}
