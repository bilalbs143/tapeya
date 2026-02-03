'use client';

import Image from 'next/image';
import React from 'react';
import { useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template4/components/GameProviders/GameProviders';
import LazyImage from '@/dynamic-components/template4/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template4/components/SlotCategories/SlotCategories';
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
          className="relative mx-auto w-full overflow-hidden px-2 md:px-6"
          aria-label={t('hero_section')}
        >
          {/* Desktop Background Image - Hidden on mobile */}
          <div className="relative hidden w-full md:block">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-banner-4.webp"
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
                    <h1
                      className="!text-[30px] leading-tight font-semibold tracking-wide text-white uppercase lg:!text-[55px]"
                      style={{
                        fontFamily: 'var(--font-alatsi)',
                        WebkitTextStroke: '0px transparent',
                        textStroke: '0px transparent',
                      }}
                    >
                      {t('vegas_thrills')}
                      <br />
                      {t('one_spin_away')}
                    </h1>
                    <div className="flex items-center justify-start gap-2 sm:mt-6">
                      {/* Diamond Icon */}
                      <div className="flex h-6 w-6 items-center justify-center sm:h-7 sm:w-7">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
                          alt={t('hero_girl')}
                          width={480}
                          height={500}
                          className="h-auto"
                          priority
                        />
                      </div>
                      <p
                        className="text-[20px] font-semibold text-transparent text-white sm:text-base md:text-lg lg:text-xl"
                        style={{ fontFamily: 'var(--font-alatsi)' }}
                      >
                        {t('jackpot_dreams_start_here')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Background Image - Only visible on mobile */}
          <div className="relative mt-4 block w-full md:hidden">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-banner-4-mob.webp"
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
                    <h1
                      className="!text-[24px] leading-tight font-semibold tracking-wide text-transparent text-white uppercase"
                      style={{
                        fontFamily: 'var(--font-alatsi)',
                        WebkitTextStroke: '0px transparent',
                        textStroke: '0px transparent',
                      }}
                    >
                      {t('vegas_thrills')}
                      <br />
                      {t('one_spin_away')}
                    </h1>

                    <p
                      className="mt-4 text-sm font-semibold text-transparent text-white sm:text-base"
                      style={{ fontFamily: 'var(--font-alatsi)' }}
                    >
                      {t('jackpot_dreams_start_here')}
                    </p>
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
              <div className="flex flex-1 items-center gap-3 pl-0">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
                  alt="Slot Games"
                  width={40}
                  height={40}
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

                {/* Responsive divider line to the right of title */}
                <div className="mx-2 h-[2px] flex-1 bg-[#5AB25A]" />
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
      <div className="container mx-auto px-2 py-8 sm:px-4">
        <div className="relative overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-4.webp"
            alt={t('home_page_banner')}
            className="hidden h-auto w-full object-cover md:block"
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-4.webp"
            alt={t('home_page_banner')}
            className="block h-auto w-full object-cover md:hidden"
          />

          {/* Text Overlay - Top center on mobile, right side on desktop */}
          <div className="absolute inset-0 flex items-start justify-center pt-4 pr-0 md:items-center md:justify-end md:pt-0 md:pr-16">
            <div className="text-center font-['Montserrat']">
              {/* LUCK IS JUST A SPIN AWAY */}
              <div className="mb-2 text-[22px] font-black text-white uppercase drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] md:text-[30px] lg:text-[50px]">
                {t('luck_is_just_a_spin_away')}
              </div>

              {/* TRY YOUR LUCK NOW with SVG wrapper */}
              <div className="relative mb-2">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1033"
                    height="151"
                    viewBox="0 0 1033 151"
                    fill="none"
                    className="h-12 w-full md:h-16 lg:h-20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M76.5 0H998.5L957 151H34.5L76.5 0Z"
                      fill="url(#paint0_linear_388_512)"
                      fillOpacity="0.7"
                    />
                    <path d="M44 0H69.5L27.2614 151H0L44 0Z" fill="#5AB25A" />
                    <path
                      d="M1007.5 0H1033L990.761 151H963.5L1007.5 0Z"
                      fill="#5AB25A"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_388_512"
                        x1="-35.6091"
                        y1="-6.86363"
                        x2="13.8558"
                        y2="326.752"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#5AB25A" />
                        <stop offset="0.433806" stopColor="#55BC55" />
                        <stop offset="0.898108" stopColor="#139113" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* TRY YOUR LUCK NOW text - centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[25px] font-black text-white uppercase drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] md:text-[35px] lg:text-[50px]">
                      {t('try_your_luck_now')}
                    </div>
                  </div>
                </div>
              </div>

              {/* Try Now */}
              <div className="text-center text-[14px] font-normal tracking-[8px] text-white md:text-[16px] lg:text-[18px]">
                {t('try_now')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
