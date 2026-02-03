'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();
  const router = useRouter();

  const backgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Hm-Main-Banner-12.webp';
  const mobileBackgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Hm-Main-Banner-mob-12.webp';
  const girlUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hero-girl-banner-4.webp';
  const casinoGameUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hero-casino-game-3.webp';

  return (
    <section
      className="relative mx-auto w-full max-w-[1530px] px-4 py-4 md:px-0 md:py-6"
      aria-label={t('hero_section')}
    >
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden gap-5 md:grid md:grid-cols-12">
        {/* Main Banner (Left - 8 Cols) */}
        <div className="group relative overflow-hidden rounded-[14px] bg-[#1a1a1e] md:col-span-8">
          {/* Main Background */}
          <div className="relative h-[450px] w-full">
            <Image
              src={backgroundUrl}
              alt="Hero Background"
              fill
              className="object-cover"
              priority
            />
            {/* Content Overlay */}
            <div className="absolute inset-0 z-10 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-12">
              <h1
                className="mb-2 text-[60px] leading-[1.1] font-bold tracking-tight text-white uppercase"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                Where Every <br /> Spin Tells a Story
              </h1>
              <p className="text-[18px] font-medium text-[#CBBC91]">
                Step into gold, where fortune unfolds....
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar (Right - 4 Cols) */}
        <div className="flex flex-col gap-5 md:col-span-4">
          <div className="grid grid-cols-2 gap-5">
            {/* Slot Card */}
            <div
              onClick={() => router.push('/slot-providers')}
              className="group relative flex h-[235px] border border-[#CBBC9121] cursor-pointer flex-col justify-between overflow-hidden rounded-[14px] bg-[#1a1a1e] p-4"
            >
              <div className="absolute inset-0 transition-opacity group-hover:opacity-60">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-45.png"
                  alt="Slot"
                  fill
                  className="scale-110 object-contain transition-transform duration-500 group-hover:scale-125"
                />
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between">
                <span
                  className="text-[22px] font-bold text-white uppercase"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  Slot
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F5045] transition-colors hover:bg-[#126154]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="#CBBC91"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Casino Card */}
            <div
              onClick={() => router.push('/live-casino')}
              className="group relative flex h-[235px] border border-[#CBBC9121] cursor-pointer flex-col justify-between overflow-hidden rounded-[14px] bg-[#1a1a1e] p-4"
            >
              <div className="absolute inset-0 transition-opacity group-hover:opacity-60">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-23.png"
                  alt="Casino"
                  fill
                  className="scale-110 object-contain transition-transform duration-500 group-hover:scale-125"
                />
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between">
                <span
                  className="text-[22px] font-bold text-white uppercase"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  Casino
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0F5045] transition-colors hover:bg-[#126154]">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="#CBBC91"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => router.push('/slot-providers')}
            className="group relative flex flex-1 border border-[#CBBC9121] cursor-pointer flex-col justify-end overflow-hidden rounded-[14px] bg-[#1a1a1e] p-6"
          >
            {/* Top Right Overlapping Coin */}
            <div className="absolute -top-4 -right-2 z-20 h-24 w-22">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Coin.png"
                alt="Jackpot"
                fill
                className="object-contain"
              />
            </div>

            <div className="relative z-10">
              <h2
                className="mb-14 text-[42px] leading-none font-bold"
                style={{ color: '#CBBC91' }}
              >
                100,000 IDR
              </h2>

              <div className="flex items-center gap-4">
                <span
                  className="text-[20px] font-bold tracking-wider text-white uppercase"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  Jackpot
                </span>
                <span className="text-[13px] font-medium tracking-[0.1em] text-[#8B8B8B] uppercase">
                  Limited Time Offer
                </span>
              </div>
            </div>

            {/* Bottom Right Button */}
            <div className="absolute right-5 bottom-5 z-20">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0F5045] transition-all group-hover:scale-110 hover:bg-[#126154]">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#CBBC91"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout - Only visible on mobile */}
      <div className="block space-y-4 md:hidden">
        {/* Refined Mobile Banner matching Image */}
        <div className="relative h-[430px] w-full overflow-hidden rounded-[14px] bg-[#1a1a1e]">
          <Image
            src={mobileBackgroundUrl}
            alt="Hero Background Mobile"
            fill
            className="object-cover"
            priority
          />

          {/* Top-Aligned Content Overlay for Mobile */}
          <div className="absolute inset-0 z-10 flex flex-col items-start p-6 pt-7">
            <h1
              className="mb-2 text-[29px] leading-[1.1] font-bold tracking-tight text-white uppercase"
              style={{ fontFamily: 'var(--font-king-town)' }}
            >
              Where Every <br /> Spin Tells a Story
            </h1>
            <p className="max-w-[80%] text-[15px] leading-tight font-medium text-[#CBBC91]">
              Step into gold, where fortune unfolds....
            </p>
          </div>
        </div>

        {/* Mobile Cards Sidebar equivalent */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Slot Card */}
            <div
              onClick={() => router.push('/slot-providers')}
              className="group relative flex h-[180px] border border-[#CBBC9121] cursor-pointer flex-col justify-between overflow-hidden rounded-[14px] bg-[#1a1a1e] p-4"
            >
              <div className="absolute inset-0">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot+mob.png"
                  alt="Slot"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between">
                <span
                  className="text-[18px] font-bold text-white uppercase"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  Slot
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F5045]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="#CBBC91"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
            {/* Casino Card */}
            <div
              onClick={() => router.push('/live-casino')}
              className="group relative flex h-[180px] border border-[#CBBC9121] cursor-pointer flex-col justify-between overflow-hidden rounded-[14px] bg-[#1a1a1e] p-4"
            >
              <div className="absolute inset-0">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Casino+Mob.png"
                  alt="Casino"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="relative z-10 mt-auto flex items-center justify-between">
                <span
                  className="text-[18px] font-bold text-white uppercase"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  Casino
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F5045]">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="#CBBC91"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div
            onClick={() => router.push('/slot-providers')}
            className="group relative flex min-h-[140px] border border-[#CBBC9121] cursor-pointer flex-col justify-end overflow-hidden rounded-[14px] bg-[#1a1a1e] p-6"
          >
            {/* Top Right Overlapping Coin Mobile */}
            <div className="absolute -top-3 -right-1 z-20 h-18 w-18">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Coin.png"
                alt="Jackpot"
                fill
                className="object-contain"
              />
            </div>

            <div className="relative z-10">
              <h2
                className="mb-12 text-[34px] leading-none font-bold"
                style={{ color: '#CBBC91' }}
              >
                100,000 IDR
              </h2>
              <div className="flex items-center gap-3">
                <span
                  className="text-[17px] font-bold tracking-wider text-white uppercase"
                  style={{ fontFamily: 'var(--font-king-town)' }}
                >
                  Jackpot
                </span>
                <span className="text-[10px] leading-none font-medium tracking-[0.1em] text-[#8B8B8B] uppercase">
                  Limited Time Offer
                </span>
              </div>
            </div>

            {/* Bottom Right Button Mobile */}
            <div className="absolute right-5 bottom-5 z-20">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0F5045]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="#CBBC91"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
