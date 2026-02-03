'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template6/components/GameProviders/GameProviders';
import SlotCategories from '@/dynamic-components/template6/components/SlotCategories/SlotCategories';
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
          aria-label={t('slots_banner')}
        >
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-6.webp"
              alt={t('slots_background_alt')}
              width={1920}
              height={600}
              className="hidden h-auto w-full rounded-[5px] object-cover md:block"
              priority
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-mob-6.webp"
              alt={t('slots_mobile_background_alt')}
              width={1920}
              height={600}
              className="block h-auto w-full rounded-[5px] object-cover md:hidden"
              priority
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-start justify-center px-4 pt-6 md:items-center md:justify-start md:px-6 md:pt-0 md:pl-12">
              <div className="mt-0 flex flex-col items-center md:mt-6 md:items-start">
                {/* SLOTS Label with SVG */}
                <div style={{ transform: 'rotate(-3.075deg)' }}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="94"
                    height="45"
                    viewBox="0 0 94 45"
                    fill="none"
                  >
                    <g filter="url(#filter0_d_slots)">
                      <path
                        d="M6.54904 9.06407L87.0804 4.61847L86.9782 30.728L6.46572 35.8541L6.54904 9.06407Z"
                        fill="#F45E2A"
                      />
                    </g>
                    <defs>
                      <filter
                        id="filter0_d_slots"
                        x="-3.19481e-05"
                        y="3.33786e-06"
                        width="93.5465"
                        height="44.1673"
                        filterUnits="userSpaceOnUse"
                        colorInterpolationFilters="sRGB"
                      >
                        <feFlood floodOpacity="0" result="BackgroundImageFix" />
                        <feColorMatrix
                          in="SourceAlpha"
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                          result="hardAlpha"
                        />
                        <feOffset dy="1.84739" />
                        <feGaussianBlur stdDeviation="3.23293" />
                        <feComposite in2="hardAlpha" operator="out" />
                        <feColorMatrix
                          type="matrix"
                          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                        />
                        <feBlend
                          mode="normal"
                          in2="BackgroundImageFix"
                          result="effect1_dropShadow_80_752"
                        />
                        <feBlend
                          mode="normal"
                          in="SourceGraphic"
                          in2="effect1_dropShadow_80_752"
                          result="shape"
                        />
                      </filter>
                    </defs>
                    <foreignObject
                      x="6"
                      y="9"
                      width="81"
                      height="27"
                      xmlns="http://www.w3.org/1999/xhtml"
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        <span
                          className="text-sm font-bold text-white uppercase md:text-base"
                          style={{ transform: 'rotate(-3.075deg)' }}
                        >
                          {t('slots_label')}
                        </span>
                      </div>
                    </foreignObject>
                  </svg>
                </div>

                {/* Main Headline */}
                <h1 className="font-rammetto-one text-center text-[24px] leading-tight text-white md:text-left md:text-[30px] lg:text-[25px]">
                  {t('slots_headline_line_1')}
                  <br />
                  {t('slots_headline_line_2')}
                </h1>

                {/* PLAY NOW CTA */}
                <button className="pt-2 text-center text-base font-bold text-[#F45E2A] underline md:text-left md:text-[14px] lg:text-[16px]">
                  {t('play_now')}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Game Providers Section */}
        <GameProviders />

        <div className="container mx-auto pt-6">
          {/* Header */}
          <div className="mb-6 w-full">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              {/* Search Bar */}
              <div
                className="flex flex-1 items-center gap-2"
                style={{
                  border: '1px solid #D61324',
                  borderRadius: '5px',
                  background: '#000000',
                  padding: '13px 12px',
                }}
              >
                <input
                  type="text"
                  placeholder={t('search_providers')}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                  style={{
                    color: '#FFFFFF',
                  }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 23 23"
                  fill="none"
                >
                  <path
                    d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                    stroke="#D61324"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Category Buttons */}
              <div className="flex items-center gap-2">
                {['All', 'Top', 'New', 'Featured'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className="flex rounded-[5px] text-sm font-semibold text-white transition-all"
                    style={{
                      display: 'flex',
                      width: '106px',
                      padding: '13px 0',
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor:
                        selectedCategory === category ? '#D61324' : '#000000',
                      border:
                        selectedCategory === category
                          ? 'none'
                          : '1px solid rgba(251, 99, 33, 0.30)',
                    }}
                  >
                    {t(`filter_${category.toLowerCase()}`)}
                  </button>
                ))}
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
        <div className="container mx-auto px-0 pt-8 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-6.webp"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-6.webp"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
            />

            {/* Text Overlay - Top center on mobile, left aligned on desktop */}
            <div className="absolute inset-0 flex items-start justify-center px-4 pt-8 md:items-center md:justify-start md:px-6 md:pt-0 md:pl-12">
              <div className="text-center md:text-left">
                <h2 className="mb-2 text-[24px] leading-tight font-bold text-white md:mb-4 md:text-[32px] lg:text-[35px] xl:text-[40px]">
                  {t('slots_bottom_headline_line_1')}
                  <br />
                  {t('slots_bottom_headline_line_2')}
                </h2>
                <p className="text-base font-normal text-[#FB6321] underline md:text-lg lg:text-xl">
                  {t('slots_bottom_subtext')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
