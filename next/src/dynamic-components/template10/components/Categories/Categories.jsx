'use client';

import Link from 'next/link';
import React from 'react';

import LazyImage from '@/dynamic-components/template10/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/';

const categories = [
  {
    id: 'jackpot',
    nameKey: 'jackpot',
    image: `${baseUrl}jackpot-cat-10-up.webp`,
    imageMobile: `${baseUrl}jackpot-cat-10-up.webp`,
    href: '/slot-providers',
    buttonTextKey: 'play_now',
  },
  {
    id: 'casino',
    nameKey: 'casino',
    image: `${baseUrl}casino-cat-10.webp`,
    imageMobile: `${baseUrl}casino-cat-10.webp`,
    href: '/live-casino',
    buttonTextKey: 'play_now',
  },
  {
    id: 'slot',
    nameKey: 'slots',
    image: `${baseUrl}slot-cat-10.webp`,
    imageMobile: `${baseUrl}slot-cat-10.webp`,
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
        className="group relative block h-full w-full overflow-hidden rounded-[5px]"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[5px]">
          <LazyImage
            src={isMobile ? category.imageMobile : category.image}
            alt={t(category.nameKey)}
            width={600}
            height={400}
            className="h-full w-full rounded-[5px] object-cover"
          />
          {/* Overlay Content */}
          <div className="absolute inset-0 flex flex-col justify-center gap-1 p-4 md:gap-3">
            {/* Category Name - Left and Center Aligned */}
            <div className="w-full">
              {category.id === 'jackpot' ? (
                <div className="flex max-w-[fit-content] flex-col items-start">
                  {/* LUCKY JACKPOT - Top Text */}
                  <p
                    className={`text-left font-sans tracking-[2px] text-white uppercase ${isMobile ? 'text-[12px] md:text-[14px]' : 'text-[14px] lg:text-[14px] xl:text-[16px]'} [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]`}
                  >
                    {t('lucky_jackpot')}
                  </p>
                  {/* 1 MILLION IDR - Main Text */}
                  <h3
                    className={`font-spy-agency text-left font-bold text-white uppercase italic ${isMobile ? 'text-[24px] md:text-[32px]' : 'text-[32px] lg:text-[40px] xl:text-[40px]'} [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]`}
                  >
                    {t('one_million_idr')}
                  </h3>
                </div>
              ) : (
                <h3
                  className={`font-spy-agency text-left text-white uppercase ${isMobile ? 'text-[14px] md:text-[20px]' : 'text-[20px] lg:text-[24px]'} [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]`}
                >
                  {t(category.nameKey)}
                </h3>
              )}
            </div>
            {/* Bottom Text */}
            {category.id !== 'jackpot' && (
              <div className="w-full">
                {/* PLAY NOW Text */}
                <p className="text-left font-sans text-[12px] leading-normal font-normal tracking-[2px] text-[#E33A24] not-italic md:text-[14px] md:tracking-[6.4px]">
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
      {/* Desktop View - Jackpot wider and first, then Slot, then Casino */}
      <div className="hidden [grid-template-columns:1.5fr_1.25fr_1.25fr] lg:grid lg:gap-3">
        {/* Jackpot - 1.5 columns */}
        <div className="h-[auto]">
          {jackpotCategory && renderCategoryCard(jackpotCategory)}
        </div>
        {/* Slot - equal column (shares remaining space with Casino) */}
        <div className="h-[auto]">
          {slotCategory && renderCategoryCard(slotCategory)}
        </div>
        {/* Casino - equal column (shares remaining space with Slot) */}
        <div className="h-[auto]">
          {casinoCategory && renderCategoryCard(casinoCategory)}
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
