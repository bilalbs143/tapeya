'use client';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function ServiceAdvantages() {
  const { t } = useTranslations();

  const backgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-banner-bg.webp';
  const dragonUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/dragon.png';

  return (
    <section
      className="relative container mx-auto mt-8 mb-12 overflow-hidden rounded-[24px] bg-cover bg-center bg-no-repeat px-6 py-6 md:px-16 md:py-10"
      aria-label={t('service_advantages')}
      style={{
        backgroundImage: `linear-gradient(0deg, rgba(24, 0, 44, 0.80), rgba(24, 0, 44, 0.80)), url(${backgroundUrl})`,
      }}
    >
      <div className="container mx-auto">
        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-2 lg:gap-10">
          {/* Text */}
          <div className="order-1 text-center md:order-1 md:text-left">
            <h2 className="mb-3 text-2xl leading-tight font-extrabold text-white sm:text-3xl md:text-4xl lg:text-5xl">
              {t('where_every_spin_big_one')}
            </h2>
            <p className="max-w-xl text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">
              {t('casino_gambling_description')}
            </p>
          </div>

          {/* Dragon Image */}
          <div className="order-2 flex justify-center md:order-2 md:justify-end">
            <img
              src={dragonUrl}
              alt={t('dragon')}
              className="h-auto w-[300px] max-w-full object-contain sm:w-[300px] md:w-[400px] lg:w-[450px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceAdvantages;
