'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();
  const router = useRouter();

  const backgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/hm-Banner-18.png';
  const mobileBackgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Hm-Banner-Mob-18.png';
  const girlUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-18-desktop.png';
  const casinoGameUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot.png';

  return (
    <section
      className="relative mx-auto w-full max-w-[1530px] px-2 py-4 md:px-0 md:py-6"
      aria-label={t('hero_section')}
    >
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden gap-5 md:grid md:grid-cols-12">
        {/* Main Banner (Left - 9 Cols) */}
        <div className="group relative overflow-hidden rounded-[14px] border border-[#FFB7034D] bg-[#1a1a1e] md:col-span-9">
          {/* Main Background */}
          <div className="relative h-[450px] w-full md:h-[400px]">
            <Image
              src={backgroundUrl}
              alt="Hero Background"
              fill
              className="object-cover"
              priority
            />
            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col items-start justify-center p-6 md:pl-16">
              <span className="mb-3 text-[16px] font-bold tracking-[0.1em] text-[#F0C059] uppercase">
                Where Luck Meets Adrenaline
              </span>
              <h1
                className="mb-8 max-w-[550px] text-[58px] leading-[1.1] font-bold tracking-tight text-white uppercase"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                Unlock The Magic <br /> Of Chance.
              </h1>
              <button
                onClick={() => router.push('/live-casino')}
                className="flex items-center gap-2 rounded-lg bg-[#FFB800] px-8 py-3 text-[15px] font-bold text-white transition-transform hover:scale-105 active:scale-95"
              >
                PLAY NOW
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 11 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* line */}
                  <path
                    d="M0.75 5H8.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />

                  {/* arrow head */}
                  <path
                    d="M6.2 1.2L9.5 5L6.2 8.8"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar (Right - 3 Cols) */}
        <div className="flex h-[400px] flex-col items-end gap-5 md:col-span-3">
          {/* Casino Card */}
          <div
            onClick={() => router.push('/live-casino')}
            className="group relative flex h-[190px] w-[365px] cursor-pointer flex-col justify-center overflow-hidden rounded-[14px] border border-[#FFB7034D]"
          >
            <div className="absolute inset-0">
              <Image
                src={girlUrl}
                alt="Casino"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient Overlay for Text Visibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>
            <div className="relative z-10 flex flex-col items-start pl-8">
              <h3
                className="mb-1 text-[32px] font-bold text-white uppercase"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                Casino
              </h3>
              <span className="text-[14px] font-medium tracking-wider text-[#FFB800] uppercase">
                Play Now
              </span>
            </div>
          </div>

          {/* Slot Card */}
          <div
            onClick={() => router.push('/slot-providers')}
            className="group relative flex h-[190px] w-[365px] cursor-pointer flex-col justify-center overflow-hidden rounded-[14px] border border-[#FFB7034D]"
          >
            <div className="absolute inset-0">
              <Image
                src={casinoGameUrl}
                alt="Slot"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient Overlay for Text Visibility */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
            </div>
            <div className="relative z-10 flex flex-col items-start pl-8">
              <h3
                className="mb-1 text-[32px] font-bold text-white uppercase"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                Slot
              </h3>
              <span className="text-[14px] font-medium tracking-wider text-[#FFB800] uppercase">
                Play Now
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Only visible on mobile */}
      <div className="block space-y-4 md:hidden">
        {/* Main Mobile Banner */}
        <div className="relative h-[430px] w-full overflow-hidden rounded-[14px] border border-[#FFB7034D] bg-[#1a1a1e]">
          <Image
            src={mobileBackgroundUrl}
            alt="Hero Background Mobile"
            fill
            className="object-cover"
            priority
          />

          {/* Content Overlay */}
          <div className="absolute inset-0 z-10 flex flex-col items-start p-6 pt-5">
            <span className="mb-2 text-[12px] font-bold tracking-[0.1em] text-[#F0C059] uppercase">
              Where Luck Meets Adrenaline
            </span>
            <h1
              className="mb-4 text-[24px] leading-[1.1] font-bold tracking-tight text-white uppercase"
              style={{ fontFamily: 'var(--font-king-town)' }}
            >
              Unlock The Magic <br /> Of Chance.
            </h1>
            <button
              onClick={() => router.push('/live-casino')}
              className="flex items-center gap-2 rounded-lg bg-[#FFB800] px-4 py-2 text-[13px] font-bold text-white transition-transform hover:scale-105 active:scale-95"
            >
              PLAY NOW
              <svg
                width="11"
                height="13"
                viewBox="0 0 11 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* line */}
                <path
                  d="M0.75 5H8.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

                {/* arrow head */}
                <path
                  d="M6.2 1.2L9.5 5L6.2 8.8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>



            </button>
          </div>
        </div>

        {/* Mobile Stacked Cards (Casino & Slot) */}
        <div className="flex flex-col gap-4">
          {/* Casino Card Mobile */}
          <div
            onClick={() => router.push('/live-casino')}
            className="group relative flex h-[160px] w-full cursor-pointer flex-col justify-center overflow-hidden rounded-[14px] border border-[#FFB7034D]"
          >
            <div className="absolute inset-0">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Casino+mob.png"
                alt="Casino"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/20 to-transparent" />
            </div>
            <div className="relative z-10 flex flex-col items-start pl-6">
              <h3
                className="mb-1 text-[28px] font-bold text-white uppercase"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                Casino
              </h3>
              <span className="text-[12px] font-medium tracking-wider text-[#FFB800] uppercase">
                Play Now
              </span>
            </div>
          </div>

          {/* Slot Card Mobile */}
          <div
            onClick={() => router.push('/slot-providers')}
            className="group relative flex h-[160px] w-full cursor-pointer flex-col justify-center overflow-hidden rounded-[14px] border border-[#FFB7034D]"
          >
            <div className="absolute inset-0">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot+Mob.png"
                alt="Slot"
                fill
                className="object-cover object-top"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/20 to-transparent" />
            </div>
            <div className="relative z-10 flex flex-col items-start pl-6">
              <h3
                className="mb-1 text-[28px] font-bold text-white uppercase"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                Slot
              </h3>
              <span className="text-[12px] font-medium tracking-wider text-[#FFB800] uppercase">
                Play Now
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
