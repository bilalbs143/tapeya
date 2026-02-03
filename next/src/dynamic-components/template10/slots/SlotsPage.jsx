'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template10/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template10/components/SlotCategories/SlotCategories';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllProvider } from '@/website/websiteAction';

export default function SlotsPage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const { selectedProviderId, allProvidersData } = useSelector(
    (state) => state.website,
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch providers on mount
  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  // Provider logo mapping
  const providesNames = {
    pragmatic_slot:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-6-5.png',
    thebighit: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/bighit-5.png',
    MICRO_Slot: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-21-5.png',
    booongo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/boongo-6.png',
    PLAYNGO: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-17-5.png',
    habanero: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-9-5.png',
    TOMHORN_SLOT:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tomhorm-6.png',
    cq9: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-18-5-1.png',
    gtf: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gtf-6.png',
    spade: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-7-5.png',
    yellowbat:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/yellowbet-6.png',
    advantplay: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-10-5.png',
    askmeslot: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/askme-6.png',
    bgaming: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/bgaming-6.png',
    gpk7mj: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/mojos-6.png',
    booming: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-15-5.png',
    spinomenal:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/spinomenal-6.png',
    dbgame: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/db-gaming-6.png',
    live22: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/live22-6.png',
    cg: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/CG-6.png',
    thunderkick:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/thunderkirk-6.png',
  };

  // Get provider logo by name
  const getProviderLogo = (providerName) => {
    if (!providerName) return null;

    // Try exact match first
    const normalizedName = providerName.toLowerCase().trim();
    const exactKey = Object.keys(providesNames).find(
      (key) => key.toLowerCase() === normalizedName,
    );
    if (exactKey) return providesNames[exactKey];

    // Try with underscores replaced by spaces
    const withSpaces = normalizedName.replace(/_/g, ' ');
    const spaceKey = Object.keys(providesNames).find(
      (key) => key.toLowerCase().replace(/_/g, ' ') === withSpaces,
    );
    if (spaceKey) return providesNames[spaceKey];

    // Try with spaces replaced by underscores
    const withUnderscores = normalizedName.replace(/\s+/g, '_');
    const underscoreKey = Object.keys(providesNames).find(
      (key) => key.toLowerCase() === withUnderscores,
    );
    if (underscoreKey) return providesNames[underscoreKey];

    return null;
  };

  // Get selected provider info
  const selectedProvider = useMemo(() => {
    if (!selectedProviderId || !allProvidersData) return null;
    return allProvidersData.find((p) => p.id === selectedProviderId);
  }, [selectedProviderId, allProvidersData]);

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
          <div className="relative min-h-[200px] w-full overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <div className="relative hidden w-full md:block">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-10.webp"
                alt={t('live_casino_background_alt')}
                width={1920}
                height={600}
                className="block h-auto w-full rounded-[5px] object-cover"
                priority
              />
            </div>

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <div className="relative block w-full md:hidden">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-mob-10.webp"
                alt={t('live_casino_mobile_background_alt')}
                width={1920}
                height={600}
                className="block h-auto w-full rounded-[5px] object-cover"
                priority
              />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 sm:pt-6 md:mt-6 md:items-center md:justify-end md:pt-0 md:pr-24">
              <div className="w-auto max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-none">
                <div className="flex flex-col items-start">
                  {/* SLOTS */}
                  <h3
                    className="text-left text-[14px] font-bold uppercase sm:text-base md:text-right md:text-lg lg:text-xl"
                    style={{
                      color: '#E33A24',
                      letterSpacing: '8px',
                    }}
                  >
                    {t('slots').toUpperCase()}
                  </h3>

                  {/* BALANCE YOUR LUCK. */}
                  <h2 className="font-spy-agency text-left text-[20px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-right md:text-lg lg:text-[25px] xl:text-[30px] 2xl:text-[30px]">
                    {t('balance_your_luck')}
                  </h2>

                  {/* ELEVATE YOUR GAME. */}
                  <h2 className="font-spy-agency text-left text-[20px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-right md:text-lg lg:text-[25px] xl:text-[30px] 2xl:text-[30px]">
                    {t('elevate_your_game')}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="pt-6">
          {/* Header */}
          <div className="mb-6 w-full">
            <div
              className="flex items-center rounded-[5px] border px-3 md:px-6"
              style={{
                border: '1px solid #E33A24',
                background:
                  'linear-gradient(0deg, rgba(23, 47, 49, 0.80) 0%, rgba(23, 47, 49, 0.80) 100%)',
              }}
            >
              {/* Title */}
              <div className="flex items-center pr-3 md:pr-6">
                <h3
                  className="font-bring-race py-3 text-[10px] tracking-wide uppercase md:py-4 md:text-[16px]"
                  style={{
                    color: '#FFFFFF',
                  }}
                >
                  <span className="font-spy-agency">
                    {selectedProviderId && allProvidersData
                      ? getProviderNameById(
                        selectedProviderId,
                        allProvidersData,
                      ) || t('slots')
                      : t('slots')}
                  </span>
                </h3>
              </div>

              {/* Separator */}
              <div
                className="w-px self-stretch"
                style={{
                  backgroundColor: '#E33A24',
                }}
              />

              {/* Search */}
              <div className="flex flex-1 items-center gap-2 pl-3 md:pl-4">
                <input
                  type="text"
                  placeholder={t('search_game')}
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 md:h-[23px] md:w-[23px]"
                  viewBox="0 0 23 23"
                  fill="none"
                >
                  <path
                    d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Game Cards */}
          <SlotCategories searchQuery={searchQuery} />
        </div>
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
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-10.webp"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-10.webp"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
            />

            {/* Text Overlay - Top on mobile, centered on desktop */}
            <div className="absolute inset-0 z-10 flex items-start justify-center pt-8 sm:pt-6 md:items-center md:pt-0">
              <div className="w-auto max-w-[calc(100%-2rem)] text-center sm:max-w-[calc(100%-3rem)] md:max-w-none">
                <div className="flex flex-col items-center">
                  {/* JACKPOTS AREN'T FOUND-THEY'RE FORGED. */}
                  <h2 className="font-spy-agency text-center text-[20px] leading-tight tracking-[1px] break-words text-white uppercase sm:text-[18px] md:text-lg lg:text-[20px] xl:text-[22px] 2xl:text-[27px]">
                    {t('jackpots_arent_found')}
                    <br />
                    {t('theyre_forged')}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
