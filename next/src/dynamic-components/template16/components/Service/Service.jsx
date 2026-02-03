'use client';
import Image from 'next/image';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons';

function Service() {
  const { t } = useTranslations();

  return (
    <section className="w-full bg-[#000304] py-4 md:py-6">
      <div className="container mx-auto px-4 md:px-0">
        {/* Title */}
        <h2
          className="mb-6 text-left text-2xl font-bold md:text-3xl lg:text-4xl"
          style={{ color: '#E8D25E' }}
        >
          {t('service') || 'Service'}
        </h2>

        {/* Service Container */}
        <div
          className="rounded-lg p-6 md:p-8"
          style={{
            backgroundColor: 'transparent',
            border: '1px solid #E8D25E4D',
          }}
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Deposit Section */}
            <div
              className="flex flex-col justify-center border-b pb-6 md:border-r md:border-b-0 md:pr-6 md:pb-0"
              style={{ borderColor: '#E8D25E4D' }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-col">
                  <h3 className="mb-1 text-lg font-bold text-white md:text-xl">
                    {t('deposit') || 'Deposit'}
                  </h3>
                  <p className="text-xs text-white opacity-70 md:text-sm">
                    {t('average_time') || 'Average time'}
                  </p>
                </div>
                <span className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                  01m
                </span>
              </div>
              {/* Progress Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#111111]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '66.67%',
                    backgroundColor: '#E8D25E',
                  }}
                />
              </div>
            </div>

            {/* Withdraw Section */}
            <div
              className="flex flex-col justify-center border-b pb-6 md:border-r md:border-b-0 md:pr-6 md:pb-0"
              style={{ borderColor: '#E8D25E4D' }}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-col">
                  <h3 className="mb-1 text-lg font-bold text-white md:text-xl">
                    {t('withdraw') || 'Withdraw'}
                  </h3>
                  <p className="text-xs text-white opacity-70 md:text-sm">
                    {t('average_time') || 'Average time'}
                  </p>
                </div>
                <span className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                  03m
                </span>
              </div>
              {/* Progress Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-[#111111]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: '75%',
                    backgroundColor: '#E8D25E',
                  }}
                />
              </div>
            </div>

            {/* Play Responsibilities Section */}
            <div
              className="flex flex-col border-b pb-6 md:border-r md:border-b-0 md:pr-6 md:pb-0"
              style={{ borderColor: '#E8D25E4D' }}
            >
              <h3 className="mb-4 text-lg font-bold text-white md:text-xl">
                {t('play_responsibilities') || 'Play Responsibilities'}
              </h3>
              <div className="flex items-center gap-3 md:gap-4">
                {/* GAMCARE Logo */}
                <div className="relative h-10 w-10 md:h-12 md:w-12">
                  <Image
                    src={`${BASE_ICON_URL}/game-care.svg`}
                    alt="GAMCARE"
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </div>
                {/* 18+ Circle */}
                <div className="relative h-10 w-10 md:h-12 md:w-12">
                  <Image
                    src={`${BASE_ICON_URL}/18plus.svg`}
                    alt="18+"
                    width={48}
                    height={48}
                    className="h-full w-full object-contain"
                  />
                </div>
                {/* Be Gamble Aware */}
                <div className="relative h-10 w-auto md:h-12">
                  <Image
                    src={`${BASE_ICON_URL}/be-gamble-aware.svg`}
                    alt="Be Gamble Aware"
                    width={80}
                    height={48}
                    className="h-full w-auto object-contain"
                  />
                </div>
              </div>
            </div>

            {/* Recommended Browser Section - No border (last item) */}
            <div className="flex flex-col">
              <h3 className="mb-4 text-lg font-bold text-white md:text-xl">
                {t('recommended_browser') || 'Recommended Browser'}
              </h3>
              <div className="flex items-center gap-3 md:gap-4">
                {/* Chrome Logo */}
                <div className="relative h-8 w-8 md:h-10 md:w-10">
                  <Image
                    src={`${BASE_ICON_URL}/chrome.svg`}
                    alt="Chrome"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </div>
                {/* Firefox Logo */}
                <div className="relative h-8 w-8 md:h-10 md:w-10">
                  <Image
                    src={`${BASE_ICON_URL}/firefox.svg`}
                    alt="Firefox"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </div>
                {/* Safari Logo */}
                <div className="relative h-8 w-8 md:h-10 md:w-10">
                  <Image
                    src={`${BASE_ICON_URL}/safari.svg`}
                    alt="Safari"
                    width={40}
                    height={40}
                    className="h-full w-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Service;
