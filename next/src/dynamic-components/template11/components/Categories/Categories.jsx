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
    image: `${baseUrl}Casino-11.png`,
    imageMobile: `${baseUrl}Casino-mob-11.png`,
    href: '/live-casino',
    buttonTextKey: 'play_now',
  },
  {
    id: 'slot',
    nameKey: 'slots',
    image: `${baseUrl}Slot-11.png`,
    imageMobile: `${baseUrl}Slot-mob-11.png`,
    href: '/slot-providers',
    buttonTextKey: 'play_now',
  },
  {
    id: 'jackpot',
    nameKey: 'jackpot',
    image: `${baseUrl}jackpot-11.png`,
    imageMobile: `${baseUrl}Jackpot-mob-11.png`,
    href: '/slot-providers',
    buttonTextKey: 'play_now',
  },
];

/** Jackpot specific size */
const JACKPOT_WRAPPER_CLASS = 'h-[220px] sm:h-[260px] md:h-[320px] lg:h-full';

function Categories() {
  const { t } = useTranslations();

  const casinoCategory = categories.find((cat) => cat.id === 'casino');
  const slotCategory = categories.find((cat) => cat.id === 'slot');
  const jackpotCategory = categories.find((cat) => cat.id === 'jackpot');

  const renderCategoryCard = (category, isMobile = false) => {
    const isJackpot = category.id === 'jackpot';

    return (
      <Link
        key={category.id}
        href={category.href}
        className={`group relative block w-full overflow-hidden ${
          isJackpot ? JACKPOT_WRAPPER_CLASS : ''
        }`}
      >
        <div className="relative w-full">
          <LazyImage
            src={isMobile ? category.imageMobile : category.image}
            alt={t(category.nameKey)}
            width={600}
            height={400}
            className="h-auto w-full rounded-[5px]"
          />

          {/* Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-7">
            {/* Top */}
            <div>
              {isJackpot ? (
                <div className="flex flex-col items-start">
                  <h3
                    className={`font-cravend uppercase ${
                      isMobile ? 'text-[18px]' : 'text-[32px] xl:text-[45px]'
                    }`}
                    style={{
                      color: '#fff',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    100.000 IDR
                  </h3>
                  <p
                    className="font-sans text-[12px] uppercase"
                    style={{
                      color: '#DBB42C',
                      letterSpacing: '5px',
                      textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                    }}
                  >
                    JACKPOT
                  </p>
                </div>
              ) : (
                <h3
                  className={`font-cravend text-white uppercase ${
                    isMobile ? 'text-[16px]' : 'text-[24px]'
                  }`}
                  style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {t(category.nameKey)}
                </h3>
              )}
            </div>

            {/* Bottom */}
            {!isJackpot && (
              <p
                className="font-sans text-[12px] font-bold uppercase"
                style={{
                  color: '#DBB42C',
                  letterSpacing: '5px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {t(category.buttonTextKey)}
              </p>
            )}
          </div>
        </div>
      </Link>
    );
  };

  return (
    <section className="pt-6 md:pt-10">
      {/* ================= DESKTOP ================= */}
      <div className="hidden lg:block">
        <div className="mx-auto max-w-[1520px] px-4">
          <div className="flex gap-4">
            <div className="col-span-3">
              {casinoCategory && renderCategoryCard(casinoCategory)}
            </div>
            <div className="col-span-3">
              {slotCategory && renderCategoryCard(slotCategory)}
            </div>
            <div className="col-span-6">
              {jackpotCategory && renderCategoryCard(jackpotCategory)}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE ================= */}
      <div className="grid grid-cols-2 gap-4 px-2 lg:hidden">
        {casinoCategory && renderCategoryCard(casinoCategory, true)}
        {slotCategory && renderCategoryCard(slotCategory, true)}

        {/* Jackpot – full width */}
        {jackpotCategory && (
          <div className="col-span-2">
            {renderCategoryCard(jackpotCategory, true)}
          </div>
        )}
      </div>
    </section>
  );
}

export default Categories;
