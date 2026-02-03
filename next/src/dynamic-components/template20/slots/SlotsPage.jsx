'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template20/components/GameProviders/GameProviders';
import LazyImage from '@/dynamic-components/template20/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template20/components/SlotCategories/SlotCategories';
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
          className="relative mx-auto w-full overflow-hidden px-4 md:mb-4 mb-2 md:px-4"
          aria-label="Live Casino Banner"
        >
          {/* Desktop only */}
          <div className="hidden md:block w-full">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot+Hero+Banner.png"
              alt="Slot Casino Background"
              width={1920}
              height={400}
              className="h-auto w-full object-contain"
              priority
            />
          </div>

          {/* Mobile only */}
          <div className="block md:hidden w-full mt-4">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot+Hero+Banner+Mob.png"
              alt="Slot Background Mobile"
              width={1920}
              height={400}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        </section>

        <div className=" mx-auto px-4 md:px-4">
          {/* Search Container */}
          <div className="mb-6 w-full">
            <div
              className="flex items-center rounded-[10px] px-5 md:rounded-[10px] md:px-6"
              style={{
                border: '1px solid #FFDAB91A',
                background: '#1A1A1A',
              }}
            >
              {/* Title with border separator */}
              <div
                className="flex items-center"
                style={{
                  background: '#C1121F',
                  padding: '16px 24px',
                  borderRadius: '10px 0 0 10px',
                  marginLeft: '-24px',
                  marginTop: '-1px',
                  marginBottom: '-1px',
                }}
              >
                <h3 className="font-bring-race text-[10px] tracking-wide text-white uppercase md:text-[16px]">
                  <span className="font-bring-race md:hidden">
                    {t('providers')}
                  </span>
                  <span className="font-bring-race hidden md:inline">
                    {t('slot_providers')}
                  </span>
                </h3>
              </div>

              {/* Search */}
              <div className="flex flex-1 items-center gap-2 pl-3 md:pl-4">
                <input
                  type="text"
                  placeholder={t('search_providers')}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="23"
                  height="23"
                  viewBox="0 0 23 23"
                  fill="none"
                >
                  <path
                    d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                    stroke="#FFDAB9"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
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
    </>
  );
}
