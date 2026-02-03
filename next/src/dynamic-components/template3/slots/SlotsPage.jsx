'use client';

import Image from 'next/image';
import React from 'react';
import { useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template3/components/GameProviders/GameProviders';
import LazyImage from '@/dynamic-components/template3/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template3/components/SlotCategories/SlotCategories';
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

        {/* Slot Detail Page Banner */}
        <section
          className="relative w-full overflow-hidden"
          aria-label={t('hero_section')}
        >
          {/* Desktop Banner Image - Hidden on mobile */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-detail-page-banner-3.webp"
            alt={t('hero_section')}
            className="hidden w-full md:block"
          />

          {/* Mobile Banner Image - Only visible on mobile */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-detail-page-banner-mob-3.webp"
            alt={t('hero_section')}
            className="block w-full md:hidden"
          />

          {/* Content - Text Overlay: Top center on mobile, left aligned on desktop */}
          <div className="absolute inset-0 flex items-start justify-center pt-6 md:items-center md:justify-start md:pt-0">
            <div className="container mx-auto px-4">
              <div className="text-center md:text-left">
                <h1
                  className="bg-[#E8D25E] bg-clip-text !text-[24px] leading-tight font-semibold tracking-wide break-words text-transparent uppercase sm:!text-[32px] md:max-w-2xl md:!text-[40px] lg:!text-[60px]"
                  style={{
                    fontFamily: 'var(--font-alatsi)',
                    WebkitTextStroke: '0px transparent',
                    textStroke: '0px transparent',
                    wordBreak: 'normal',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  {t('your_jackpot_journey_begins_here')}
                </h1>

                <p
                  className="mt-2 bg-[#E8D25E] bg-clip-text text-[14px] font-semibold text-transparent sm:mt-4 sm:text-base md:mt-6 md:text-lg lg:text-xl"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {t('jackpot_dreams_start_here')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Header with gradient border */}
          <div className="w-full">
            <div
              className="flex items-center gap-3 px-4 py-3"
              style={{
                background: '#E8D25E',
                borderRadius: '10px',
                padding: '2px',
              }}
            >
              <div className="flex w-full items-center gap-3 rounded-lg bg-black px-4 py-3">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/trending-games-3.png"
                  alt="Slot Games"
                  width={50}
                  height={50}
                  className="object-contain"
                />
                <h3
                  className="text-[22px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {selectedProviderId
                    ? getProviderNameById(
                      selectedProviderId,
                      allProvidersData,
                    ) || t('slot_games')
                    : t('slot_games')}
                </h3>
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

      {/* Slot Bottom Banner */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-xl">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-3-new.webp"
            alt={t('slot_bottom_banner')}
            width={1920}
            height={400}
            className="hidden h-auto w-full rounded-xl object-cover md:block"
            sizes="100vw"
            priority={false}
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-3-new-mob.webp"
            alt={t('slot_bottom_banner')}
            width={1920}
            height={400}
            className="block h-auto w-full rounded-xl object-cover md:hidden"
            sizes="100vw"
            priority={false}
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
                {t('diamonds_dollars')}
                <br />
                {t('and_destiny')}
              </div>
              <div className="mt-1 text-center !text-[20px] md:mt-2 md:text-left md:!text-[25px] lg:!text-[30px]">
                {t('spin_like_a_vip')}
              </div>
            </h1>
          </div>
        </div>
      </div>
    </>
  );
}
