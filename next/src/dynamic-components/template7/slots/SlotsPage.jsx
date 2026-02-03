'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template7/components/GameProviders/GameProviders';
import SlotCategories from '@/dynamic-components/template7/components/SlotCategories/SlotCategories';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';

export default function SlotsPage() {
  const { t } = useTranslations();
  const { selectedProviderId, allProvidersData } = useSelector(
    (state) => state.website,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt={t('lines_pattern')}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Slot Detail Hero Banner */}
        <section
          className="relative mx-auto w-full overflow-hidden"
          aria-label={t('live_casino_banner')}
        >
          <div
            className="relative w-full overflow-hidden"
            style={{ minHeight: '200px' }}
          >
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <div className="relative hidden w-full md:block">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-7.webp"
                alt={t('live_casino_background_alt')}
                width={1920}
                height={600}
                className="w-full rounded-[5px] object-cover"
                style={{ height: 'auto', display: 'block' }}
                priority
              />
            </div>

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <div className="relative block w-full md:hidden">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-mob-7.webp"
                alt={t('live_casino_mobile_background_alt')}
                width={1920}
                height={600}
                className="w-full rounded-[5px] object-cover"
                style={{ height: 'auto', display: 'block' }}
                priority
              />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 pl-8 sm:pt-6 sm:pl-6 md:mt-6 md:items-center md:pt-0 md:pl-12 lg:pl-16 xl:pl-20">
              <div className="w-auto max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-none">
                <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-3">
                  {/* SLOTS Badge */}
                  <div
                    className="rounded px-3 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-4 lg:py-2"
                    style={{
                      border: '1px solid rgba(51, 19, 105, 0.70)',
                      backgroundColor: 'rgba(24, 14, 58, 0.5)',
                    }}
                  >
                    <span className="inline-block text-[12px] font-bold whitespace-nowrap text-white uppercase sm:text-[12px] md:text-[12px] lg:text-[14px] xl:text-[16px]">
                      {t('slots')}
                    </span>
                  </div>

                  {/* EXPERIENCE THE GLAMOUR OF THE GAME */}
                  <h2
                    className="font-bring-race text-left text-[18px] leading-tight break-words text-white sm:text-[18px] md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl"
                    style={{ letterSpacing: '1px' }}
                  >
                    {t('experience_glamour')}
                    <br />
                    {t('glamour_of_game')}
                  </h2>

                  {/* Dive into our in-house Slots fantasy */}
                  <p className="text-left text-[12px] text-white sm:text-xs md:text-sm lg:text-base">
                    {t('slots_fantasy')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-6">
          {/* Header */}
          <div className="mb-6 w-full">
            <div
              className="flex items-center rounded-[5px] px-3 md:rounded-[10px] md:px-6"
              style={{
                border: '1px solid #7351FF',
                background: '#1E1451',
              }}
            >
              {/* Title with border separator */}
              <div
                className="flex items-center pr-3 md:pr-6"
                style={{
                  borderRight: '1px solid #7351FF',
                }}
              >
                <h3 className="font-bring-race py-3 text-[10px] tracking-wide text-white uppercase md:py-4 md:text-[16px]">
                  {selectedProviderId && allProvidersData
                    ? getProviderNameById(
                      selectedProviderId,
                      allProvidersData,
                    ) || t('slots')
                    : t('slots')}
                </h3>
              </div>

              {/* Search */}
              <div className="flex flex-1 items-center gap-2 pl-3 md:pl-4">
                <input
                  type="text"
                  placeholder={t('search_games')}
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
                    stroke="#7351FF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <SlotCategories searchQuery={searchQuery} />
        {/* Bottom Curved Pattern above footer (positioned, no layout shift) */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-[420px]"
          aria-hidden
        >
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/curved-pattern.svg"
            alt={t('curved_pattern_alt')}
            className="h-full w-full object-cover opacity-30"
          />
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="mt-0">
        <div className="px-0 pt-8 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-bottom-banner-7.webp"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-bottom-banner-mob-7.webp"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
            />

            {/* Text Overlay - Right aligned on desktop, left aligned on mobile (matching top banner) */}
            <div className="absolute inset-0 z-10 flex items-start justify-start pt-8 pr-0 pl-8 md:items-center md:justify-end md:pt-6 md:pr-20 md:pl-6 lg:pt-0 lg:pl-20">
              <div className="w-auto max-w-[calc(100%-2rem)] text-left sm:max-w-[calc(100%-3rem)] md:max-w-none">
                <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-3">
                  <h2
                    className="!lg:text-[35px] font-bring-race text-[18px] leading-tight text-white uppercase sm:text-[18px] md:text-[30px] xl:text-[40px]"
                    style={{ letterSpacing: '1px' }}
                  >
                    {t('where_millionaires')}
                    <br />
                    {(() => {
                      const text = t('millionaires_made');
                      const parts = text.split('MILLIONAIRES');
                      return parts.length > 1 ? (
                        <>
                          MILLIONAIRES
                          <br />
                          {parts[1].trim()}
                        </>
                      ) : (
                        text
                      );
                    })()}
                  </h2>
                  {/* <button className="angled-button angled-button-pink mt-2 px-6 py-3 md:mt-0 md:px-8 md:py-4">
                    <div className="angled-button-inner">
                      <span className="angled-button-text px-4 py-2 md:px-6 md:py-3">
                        {t('enter_the_realm_now')}
                      </span>
                    </div>
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
