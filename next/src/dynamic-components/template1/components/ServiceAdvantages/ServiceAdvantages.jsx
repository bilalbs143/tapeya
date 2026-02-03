'use client';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function ServiceAdvantages() {
  const { t, currentLocale } = useTranslations();

  const imageSrc =
    currentLocale === 'ko'
      ? 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-main-korean.png'
      : currentLocale === 'id'
        ? 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-main-indonasian.png'
        : 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sa-main.png';

  return (
    <section className="relative flex items-center justify-center overflow-hidden md:py-6 lg:py-10">
      {/* Background Gradient */}
      <div className="absolute inset-0" />

      {/* Abstract Geometric Patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 h-32 w-32 rounded-full bg-cyan-400 blur-3xl" />
        <div className="absolute right-20 bottom-20 h-40 w-40 rounded-full bg-purple-400 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-blue-400 blur-3xl" />
      </div>
      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex hidden items-center justify-center overflow-hidden md:block">
        <div className="bg-opacity-30 absolute top-1/2 left-1/2 h-[500px] w-full origin-center -translate-x-1/2 -translate-y-1/2 -rotate-[4.327deg] transform rounded-full bg-[#7010bb6b] blur-[50px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12 lg:gap-10">
          {/* Left Section - Text and Buttons */}
          <div className="col-span-1 space-y-6 text-center lg:col-span-5 lg:space-y-8 lg:text-left">
            {/* Headline */}
            <div>
              <h1 className="text-4xl leading-tight font-bold sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl">
                <span className="bg-gradient-to-r from-purple-300 via-pink-200 to-cyan-200 bg-clip-text text-transparent">
                  {t('where_every_spin_big_one')}
                </span>
              </h1>
            </div>

            {/* Description */}
            <div>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-white/90 sm:text-base md:text-lg lg:mx-0 lg:text-xl">
                {t('casino_gambling_description')}
              </p>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="flex w-full flex-row justify-center gap-3 sm:w-auto sm:gap-4 lg:justify-start">
              <a
                href="https://web.telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hover-border flex w-full cursor-pointer items-center justify-center gap-3 rounded-[60px] bg-[#2F80ED] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 sm:w-auto sm:text-base md:text-lg lg:text-xl"
              >
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/telegram.svg"
                  alt={t('telegram')}
                  className="h-6 w-6 sm:h-8 sm:w-8"
                />
                {t('telegram')}
              </a>

              <a
                href="https://web.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-hover-border flex w-full cursor-pointer items-center justify-center gap-3 rounded-[60px] bg-[#21C942] px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 sm:w-auto sm:text-base md:text-lg lg:text-xl"
              >
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/whatsapp.svg"
                  alt={t('whatsapp')}
                  className="h-6 w-6 sm:h-8 sm:w-8"
                />
                {t('whatsapp')}
              </a>
            </div>
          </div>

          {/* Right Section - Background Image */}
          <div className="relative col-span-1 lg:col-span-7">
            <div className="relative flex justify-center">
              <img
                src={imageSrc}
                alt={t('casino_scene')}
                className="h-auto w-full max-w-[500px] object-contain sm:max-w-[600px] md:max-w-[700px] lg:max-w-none"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceAdvantages;
