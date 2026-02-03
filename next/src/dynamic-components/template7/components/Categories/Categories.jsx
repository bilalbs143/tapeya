'use client';

import Link from 'next/link';
import React from 'react';

import LazyImage from '@/dynamic-components/template7/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

function Categories() {
  const { t } = useTranslations();

  const categories = [
    {
      id: 'casino',
      nameKey: 'casino',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-cat-7-up-2.png',
      imageMobile:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-cat-mob-7-up-2.png',
      href: '/live-casino',
      buttonTextKey: 'go_to_casino',
      subtitleKey: 'casino_fantasy_subtitle',
    },
    {
      id: 'slot',
      nameKey: 'slots',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-cat-7-up-2.png',
      imageMobile:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-cat-mob-7-up-2.png',
      href: '/slot-providers',
      buttonTextKey: 'play_games',
      subtitleKey: 'slots_fantasy_subtitle',
    },
  ];

  return (
    <section className="pt-6 md:pt-10">
      {/* Desktop View - Show all categories */}
      <div className="hidden lg:grid lg:grid-cols-2 lg:gap-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative block w-full overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2"
          >
            <div className="relative">
              <LazyImage
                src={category.image}
                alt={t(category.nameKey)}
                width={600}
                height={400}
                className="h-auto w-full rounded-[5px] object-cover"
              />
              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-center gap-6 overflow-hidden p-4 pl-10">
                <div className="w-full">
                  <h3
                    className="font-bring-race text-[35px] uppercase"
                    style={{
                      textAlign: 'left',
                      textShadow: '0 10px 6px rgba(0, 0, 0, 0.25)',
                      fontSize: '30px',
                    }}
                  >
                    {t(category.nameKey)}
                  </h3>
                  <p className="mt-2 text-left text-sm text-white">
                    {t(category.subtitleKey)}
                  </p>
                </div>
                <div className="mt-4 flex justify-start md:mt-8">
                  <button
                    className={`angled-button ${category.id === 'casino' ? 'angled-button-pink' : 'angled-button-blue'} px-6 py-3`}
                  >
                    <div className="angled-button-inner px-6 py-3">
                      <span className="angled-button-text text-sm">
                        {t(category.buttonTextKey)}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile View - Show categories stacked */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative block w-full overflow-hidden transition-transform duration-300 ease-in-out hover:-translate-y-2"
          >
            <div className="relative">
              <LazyImage
                src={category.imageMobile}
                alt={t(category.nameKey)}
                width={600}
                height={400}
                className="h-auto w-full rounded-[5px] object-cover"
              />
              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-start overflow-hidden p-4 md:justify-center">
                <div className="w-full">
                  <h3
                    className="font-bring-race text-[16px] uppercase md:text-[20px]"
                    style={{
                      textAlign: 'left',
                      textShadow: '0 10px 6px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {t(category.nameKey)}
                  </h3>
                  <p className="mt-2 text-left text-xs text-white">
                    {t(category.subtitleKey)}
                  </p>
                </div>
                <div className="mt-4 flex justify-start md:mt-[auto]">
                  <button
                    className={`angled-button ${category.id === 'casino' ? 'angled-button-pink' : 'angled-button-blue'} px-4 py-2`}
                  >
                    <div className="angled-button-inner px-4 py-2">
                      <span className="angled-button-text !text-[10px] md:text-[16px]">
                        {t(category.buttonTextKey)}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default Categories;
