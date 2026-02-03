'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import GameProviders from '@/dynamic-components/template18/components/GameProviders/GameProviders';
import LazyImage from '@/dynamic-components/template18/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template18/components/SlotCategories/SlotCategories';
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
          className="relative mx-auto w-full max-w-[1580px] px-4 py-4 md:px-6 md:py-6"
          aria-label="Live Casino Hero"
        >
          <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
            {/* Main Banner - Left 9 Cols */}
            <div className="group relative overflow-hidden rounded-[14px] !border border-[#FFB7034D] md:col-span-9">
              <div className="relative h-[450px] w-full md:h-[400px]">
                {/* Desktop Image */}
                <div className="hidden md:block">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot-BNr.png"
                    alt="Main Banner"
                    fill
                    className="object-cover transition-transform duration-700"
                    priority
                  />
                </div>
                {/* Mobile Image */}
                <div className="block md:hidden">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot-Bn-Mobl.png"
                    alt="Main Banner Mobile"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                {/* Content Overlay */}
                <div className="absolute inset-0 z-10 flex flex-col justify-start p-6 md:justify-center md:p-12">
                  {/* Back to Home Button */}
                  <Link
                    href="/"
                    className="mb-4 flex w-fit items-center gap-2 rounded-[8px] bg-[#FFB703] px-4 py-2 text-[14px] font-bold text-white transition-opacity hover:opacity-90"
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M19 12H5M5 12L12 19M5 12L12 5"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    BACK TO HOME
                  </Link>

                  <div className="mb-2 md:mt-4 text-[12px] font-bold tracking-[0.2em] text-[#DFA336] uppercase md:text-[14px]">
                    SLOTS
                  </div>
                  <h1
                    className="mb-4 text-[24px] leading-tight font-bold text-white uppercase md:mb-8 md:text-[42px]"
                    style={{ fontFamily: 'var(--font-king-town)' }}
                  >
                    YOUR SLOTS, <br /> ANYTIME, ANYWHERE
                  </h1>
                </div>
              </div>
            </div>

            {/* App Download Box - Right 3 Cols */}
            <div className="relative mx-auto flex h-[169px] w-[370px] flex-col justify-between overflow-hidden rounded-[14px] border border-[#FFB7034D] p-4 md:col-span-3 md:mx-0 md:h-auto md:min-h-[300px] md:w-auto md:p-6">
              {/* Background Texture/Image Overlay */}
              <div className="absolute inset-0">
                {/* Desktop Image */}
                <div className="absolute inset-0 hidden opacity-40 md:block">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Download-App-Section-18.png"
                    alt="App Interface"
                    fill
                    className="object-cover object-right-top"
                  />
                </div>
                {/* Mobile Image */}
                <div className="absolute inset-0 block md:hidden">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Download+Mob.png"
                    alt="App Interface Mobile"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              <div className="relative z-10 px-2 md:px-0">
                <h2
                  className="text-[20px] leading-tight font-bold text-white uppercase md:text-[28px]"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  GET OUR <br className="hidden md:block" /> APP
                </h2>
              </div>

              <div className="relative z-10 flex flex-col items-start justify-center gap-2 md:gap-4">
                <div className="rounded-lg  bg-transparent p-1">
                  <div className="h-[60px] w-[60px] rounded-md bg-white p-1 md:h-[120px] md:w-[120px]">
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/QR.png"
                      alt="QR Code"
                      width={100}
                      height={100}
                      className="h-full w-full object-contain"
                    />
                  </div>
                </div>
                <p className="max-w-[150px] text-left text-[10px] font-bold tracking-widest text-[#FFB703] uppercase md:max-w-none md:text-[12px]">
                  DOWNLOAD FOR BETTER EXPERIENCE
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 pt-2 md:px-0">
          {/* Search Container */}
          <div className="mb-6 w-full">
            <div
              className="flex items-center rounded-[5px] px-3 md:rounded-[10px] md:px-6"
              style={{
                border: '1px solid #FFB7034D',
                background: '#14213D',
              }}
            >
              {/* Title with border separator */}
              <div
                className="flex items-center pr-3 md:pr-6"
                style={{
                  borderRight: '1px solid #FFB7034D',
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
                    stroke="#FFB703"
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
