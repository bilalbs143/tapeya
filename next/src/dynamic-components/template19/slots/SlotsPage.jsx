'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template19/components/GameProviders/GameProviders';
import LazyImage from '@/dynamic-components/template19/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template19/components/SlotCategories/SlotCategories';
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
          className="relative mx-auto w-full overflow-hidden"
          aria-label="Slot Detail Banner"
        >
          {/* Desktop Background Image - Hidden on mobile */}
          <div className="relative hidden w-full md:block">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot+Banner.png"
              alt="Slot Providers Background"
              width={1920}
              height={400}
              className="h-full w-full object-cover"
              priority
            />
          </div>

          {/* Mobile Background Image - Only visible on mobile */}
          <div className="relative block w-full md:hidden">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot+Banner+Mob.png"
              alt="Slot Providers Background Mobile"
              width={1920}
              height={400}
              className="h-auto w-full object-contain"
              priority
            />



          </div>
        </section>

        <div className="container mx-auto px-2 pt-8 md:px-0">
          {/* Search Container */}
          <div
            className="mb-2 flex w-full flex-row items-center justify-between gap-2 border px-3 py-2.5 md:mb-5 md:gap-4 md:px-4 md:py-3"
            style={{
              borderColor: 'rgba(6, 214, 160, 0.3)',
              backgroundColor: 'rgba(20, 33, 61, 0.5)',
            }}
          >
            <div className="flex shrink-0 items-center">
              <h3
                className="text-[16px] font-normal tracking-wide text-white uppercase sm:text-[20px] md:text-[24px]"
                style={{
                  fontFamily: 'var(--font-king-town)',
                }}
              >
                {selectedProviderId
                  ? getProviderNameById(selectedProviderId, allProvidersData) ||
                    t('slot_games')
                  : t('slot_games')}
              </h3>
              <div
                className="ml-4 h-6 w-px"
                style={{
                  backgroundColor: '#06D6A0',
                }}
              />
            </div>

            <div
              className="flex w-[200px] items-center border px-3 py-2.5 md:w-[270px] md:px-4 md:py-3"
              style={{
                borderColor: '#06D6A0',
                backgroundColor: 'transparent',
                borderRadius: '4px',
              }}
            >
              <input
                type="text"
                placeholder="Search Here"
                className="w-full bg-transparent text-xs text-white outline-none placeholder:text-[#8B8B8B] md:text-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2 h-4 w-4 shrink-0 md:ml-3 md:h-[24px] md:w-[24px]"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                  stroke="#06D6A0"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
