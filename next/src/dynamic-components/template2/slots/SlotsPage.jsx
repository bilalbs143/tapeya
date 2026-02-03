'use client';

import Image from 'next/image';
import React from 'react';

import GameProviders from '@/dynamic-components/template2/components/GameProviders/GameProviders';
import SlotCategories from '@/dynamic-components/template2/components/SlotCategories/SlotCategories';
import { useTranslations } from '@/hooks/useTranslations';

export default function SlotsPage() {
  const { t } = useTranslations();

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

        {/* Hero Banner (same as SlotProvidersPage) */}
        <section
          className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
          aria-label={t('hero_section')}
          style={{
            backgroundImage:
              'linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0, 0, 0, 0.19) 50%, rgba(0, 0, 0, 0.77) 100%), url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-slider.webp)',
          }}
        >
          <div className="container mx-auto flex w-full items-center pt-6 sm:pt-8 lg:pt-10">
            <div className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-2 lg:gap-10">
              {/* Right: Girl image (desktop) - Second on mobile, Right on desktop */}
              <div className="order-2 flex justify-center md:order-2 md:justify-end">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-girl.webp"
                  alt={t('hero_girl')}
                  width={480}
                  height={500}
                  className="h-auto w-[400px] max-w-full object-contain sm:w-[400px] md:w-[400px] lg:w-[500px] xl:w-[550px]"
                  sizes="(min-width: 1280px) 480px, (min-width: 1024px) 420px, (min-width: 768px) 360px, (min-width: 640px) 280px, 220px"
                  priority
                />
              </div>

              {/* Left: Headline and CTA (desktop) - First on mobile, Left on desktop */}
              <div className="order-1 text-center md:order-1">
                <h1
                  className="!text-[30px] leading-tight font-normal tracking-wide text-white uppercase lg:!text-[50px]"
                  style={{ fontFamily: 'var(--font-airstrike)' }}
                >
                  JACKPOT
                  <br className="hidden sm:block" />
                  AWAITS-ONE
                  <br className="hidden sm:block" />
                  PULL AWAY
                </h1>

                <div className="mt-4 sm:mt-6">
                  <button
                    type="button"
                    className="inline-block px-6 py-2 text-sm font-semibold tracking-[0.5em] text-white uppercase shadow-md sm:px-10 sm:py-3 sm:text-base"
                    style={{
                      backgroundImage:
                        'linear-gradient(90deg, #1556439e 0%, #0e947369 100%)',
                      clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)',
                    }}
                  >
                    PULL THE LEVER. TRIGGER THE LEGEND.
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
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
