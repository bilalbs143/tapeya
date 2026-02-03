'use client';

import Link from 'next/link';
import React from 'react';

import LazyImage from '@/dynamic-components/template14/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

function Categories() {
  const { t } = useTranslations();

  const categories = [
    {
      id: 'casino',
      nameKey: 'casino',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-cat-7-up.webp',
      imageMobile:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-cat-7-up.webp',
      href: '/live-casino?q=live',
      buttonTextKey: 'play_now',
      subtitleKey: 'casino_fantasy_subtitle',
    },
    {
      id: 'slot',
      nameKey: 'slots',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-cat-7-up.webp',
      imageMobile:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-cat-7-up.webp',
      href: '/slot-providers?q=slots',
      buttonTextKey: 'play_now',
      subtitleKey: 'slots_fantasy_subtitle',
    },
    {
      id: 'arcade',
      nameKey: 'arcade',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/arcade-cat-7-up.webp',
      imageMobile:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/arcade-cat-7-up.webp',
      href: '/slot-providers?q=arcade',
      buttonTextKey: 'play_now',
      subtitleKey: 'slots_fantasy_subtitle',
    },
    {
      id: 'table_games',
      nameKey: 'table_games',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/table-cat-7-up.webp',
      imageMobile:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/table-cat-7-up.webp',
      href: '/live-casino?q=table',
      buttonTextKey: 'play_now',
      subtitleKey: 'slots_fantasy_subtitle',
    },
    {
      id: 'hybrid_games',
      nameKey: 'hybrid_games',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/hybrid-cat-7-up.webp',
      imageMobile:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/hybrid-cat-7-up.webp',
      href: '/slot-providers?q=hybrid',
      buttonTextKey: 'play_now',
      subtitleKey: 'slots_fantasy_subtitle',
    },
  ];

  return (
    <section className="pt-6 md:pt-10">
      {/* Desktop View - Show all categories */}
      <div className="hidden lg:grid lg:grid-cols-5 lg:gap-3">
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
              <div className="absolute inset-0 flex flex-col justify-start overflow-hidden p-4">
                <div className="w-full">
                  <h3 className="font-bring-race text-left text-[16px] uppercase [-webkit-text-stroke-color:#B75EBC] [-webkit-text-stroke-width:0.84px] [text-shadow:0_2.66px_2.66px_rgba(0,0,0,0.25)]">
                    {category.nameKey === 'table_games' ||
                    category.nameKey === 'hybrid_games'
                      ? (() => {
                        const text = t(category.nameKey);
                        const words = text.split(' ');
                        return words.length > 1 ? (
                            <>
                              {words[0]}
                              <br />
                              {words.slice(1).join(' ')}
                            </>
                          ) : (
                            text
                          );
                      })()
                      : t(category.nameKey)}
                  </h3>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile View - Show categories stacked */}
      <div className="grid grid-cols-2 gap-4 lg:hidden">
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
              <div className="absolute inset-0 flex flex-col justify-start overflow-hidden p-4">
                <div className="w-full">
                  <h3 className="font-bring-race text-left text-[14px] uppercase [-webkit-text-stroke-color:#B75EBC] [-webkit-text-stroke-width:0.84px] [text-shadow:0_2.66px_2.66px_rgba(0,0,0,0.25)] md:text-[18px]">
                    {category.nameKey === 'table_games' ||
                    category.nameKey === 'hybrid_games'
                      ? (() => {
                        const text = t(category.nameKey);
                        const words = text.split(' ');
                        return words.length > 1 ? (
                            <>
                              {words[0]}
                              <br />
                              {words.slice(1).join(' ')}
                            </>
                          ) : (
                            text
                          );
                      })()
                      : t(category.nameKey)}
                  </h3>
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
