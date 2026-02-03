'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();
  const router = useRouter();

  const backgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Hero+Banner+HM.png';
  const mobileBackgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Hero+Banner+HM+Mob.png';
  const girlUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Casino.png';
  const casinoGameUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot.png';

  return (
    <section
      className="relative mx-auto w-full max-w-[1930px] px-2 py-4 md:px-4 md:py-2"
      aria-label={t('hero_section')}
    >
      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden items-start justify-center gap-3 md:flex">
        {/* Main Banner (Left) */}
        <div className="relative h-[454px] w-[1440px] rounded-[14px]">
          {/* Main Background */}
          <div className="relative h-full w-full">
            <Image
              src={backgroundUrl}
              alt="Hero Background"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </div>

        {/* Sidebar (Right) */}
        <div className="mt-3 flex h-[454px] w-[365px] flex-col gap-2">
          {/* Casino Card */}
          <div
            onClick={() => router.push('/live-casino')}
            className="group relative flex h-[221px] w-full cursor-pointer flex-col justify-center overflow-hidden rounded-[14px]"
          >
            <div className="absolute inset-0">
              <Image
                src={girlUrl}
                alt="Casino"
                fill
                className="object-contain object-center transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient Overlay for Text Visibility */}
              <div className="absolute inset-0" />
            </div>
            <div className="relative z-10 flex flex-col items-start pl-8">
              <h3
                className="mb-14 text-[32px] font-bold text-white uppercase"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                Casino
              </h3>
              <span className="text-[14px] font-medium tracking-wider text-[#FFDAB9] uppercase">
                Play Now
              </span>
            </div>
          </div>

          {/* Slot Card */}
          <div
            onClick={() => router.push('/slot-providers')}
            className="group relative flex h-[221px] w-full cursor-pointer flex-col justify-center overflow-hidden rounded-[14px]"
          >
            <div className="absolute inset-0">
              <Image
                src={casinoGameUrl}
                alt="Slot"
                fill
                className="object-contain object-center transition-transform duration-500 group-hover:scale-105"
              />
              {/* Gradient Overlay for Text Visibility */}
              <div className="absolute inset-0" />
            </div>
            <div className="relative z-10 flex flex-col items-start pl-8">
              <h3
                className="mb-14 text-[32px] font-bold text-white uppercase"
                style={{ fontFamily: 'var(--font-king-town)' }}
              >
                Slots
              </h3>
              <span className="text-[14px] font-medium tracking-wider text-[#FFDAB9] uppercase">
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
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Casino+Mob.png"
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
              <span className="text-[12px] font-medium tracking-wider text-[#FFDAB9] uppercase">
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
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Slot-Mob.png"
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
              <span className="text-[12px] font-medium tracking-wider text-[#FFDAB9] uppercase">
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
