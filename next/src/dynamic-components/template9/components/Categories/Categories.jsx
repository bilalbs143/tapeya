'use client';

import Link from 'next/link';
import React from 'react';

import LazyImage from '@/dynamic-components/template9/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/';

const categories = [
  {
    id: 'casino',
    nameKey: 'casino',
    image: `${baseUrl}casino-cat-9.webp`,
    imageMobile: `${baseUrl}casino-cat-9.webp`,
    href: '/live-casino',
    buttonTextKey: 'play_now',
  },
  {
    id: 'slot',
    nameKey: 'slots',
    image: `${baseUrl}slot-cat-9.webp`,
    imageMobile: `${baseUrl}slot-cat-9.webp`,
    href: '/slot-providers',
    buttonTextKey: 'play_now',
  },
  {
    id: 'jackpot',
    nameKey: 'jackpot',
    image: `${baseUrl}jackpot-cat-9.webp`,
    imageMobile: `${baseUrl}jackpot-cat-9.webp`,
    href: '/slot-providers',
    buttonTextKey: 'play_now',
  },
];

function Categories() {
  const { t } = useTranslations();

  const casinoCategory = categories.find((cat) => cat.id === 'casino');
  const slotCategory = categories.find((cat) => cat.id === 'slot');
  const jackpotCategory = categories.find((cat) => cat.id === 'jackpot');

  const renderCategoryCard = (category, isMobile = false) => {
    return (
      <Link
        key={category.id}
        href={category.href}
        className="group relative block w-full overflow-hidden"
      >
        <div className="relative w-full">
          <LazyImage
            src={isMobile ? category.imageMobile : category.image}
            alt={t(category.nameKey)}
            width={600}
            height={400}
            className="h-auto w-full rounded-[5px]"
          />
          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col justify-between p-4">
            {/* Category Name - Top Left */}
            <div className="w-full">
              {category.id === 'jackpot' ? (
                <div className="flex max-w-[fit-content] flex-col items-end">
                  {/* 1 MILLION IDR - Main Text */}
                  <h3
                    className={`font-cravend uppercase ${isMobile ? 'text-[18px] md:text-[24px]' : 'text-[24px] lg:text-[32px] xl:text-[40px]'}`}
                    style={{
                      color: '#DBB42C',
                      textAlign: 'left',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    1 MILLION IDR
                  </h3>
                  {/* JACKPOT Text - Below 1 MILLION IDR, Left Aligned */}
                  <p
                    className={`font-sans uppercase ${isMobile ? 'text-[12px] md:text-[14px]' : 'text-[14px] lg:text-[16px]'}`}
                    style={{
                      color: '#DBB42C',
                      textDecoration: 'underline',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                      letterSpacing: '5px',
                      textAlign: 'left',
                    }}
                  >
                    JACKPOT
                  </p>
                </div>
              ) : (
                <h3
                  className={`font-cravend text-white uppercase ${isMobile ? 'text-[14px] md:text-[20px]' : 'text-[20px] lg:text-[24px]'}`}
                  style={{
                    textAlign: 'left',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  {t(category.nameKey)}
                </h3>
              )}
            </div>
            {/* Bottom Text */}
            {category.id !== 'jackpot' && (
              <div className="w-full">
                {/* PLAY NOW Text */}
                <p
                  className={`text-left font-sans ${isMobile ? 'text-[10px] md:text-[14px]' : 'text-[14px] lg:text-[14px]'}`}
                  style={{
                    color: '#DBB42C',
                    textDecoration: 'underline',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    letterSpacing: '5px',
                  }}
                >
                  {t(category.buttonTextKey)}
                </p>
              </div>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="pt-6 md:pt-10">
      {/* Desktop View - All three in one row */}
      <div className="hidden lg:grid lg:grid-cols-12 lg:gap-3">
        {/* Casino - takes 3 columns */}
        <div className="col-span-3">
          {casinoCategory && renderCategoryCard(casinoCategory)}
        </div>
        {/* Slot - takes 3 columns */}
        <div className="col-span-3">
          {slotCategory && renderCategoryCard(slotCategory)}
        </div>
        {/* Jackpot - takes 6 columns (wider) */}
        <div className="col-span-6">
          {jackpotCategory && renderCategoryCard(jackpotCategory)}
        </div>
      </div>

      {/* Mobile View - Show only Casino and Slot in 2-column grid */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
        {casinoCategory && renderCategoryCard(casinoCategory, true)}
        {slotCategory && renderCategoryCard(slotCategory, true)}
      </div>
    </section>
  );
}

export default Categories;
