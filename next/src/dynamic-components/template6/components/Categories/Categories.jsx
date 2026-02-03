'use client';

import Link from 'next/link';
import React, { useMemo, useState } from 'react';

import LazyImage from '@/dynamic-components/template6/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

function Categories() {
  const { t } = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);

  const categories = [
    {
      id: 'casino',
      nameKey: 'casino',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-cat-6.webp',
      href: '/live-casino',
      buttonTextKey: 'play_now',
    },
    {
      id: 'slot',
      nameKey: 'slots',
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-cat-6.webp',
      href: '/slots',
      buttonTextKey: 'play_now',
    },
    {
      id: 'live',
      nameKey: 'e_games',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/egames-cat-6.webp',
      href: '/live-casino',
      buttonTextKey: 'play_now',
    },
    {
      id: 'sport',
      nameKey: 'sport',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/sports-cat-6.webp',
      href: '#',
      buttonTextKey: 'play_now',
    },
  ];

  // Group categories into pairs for sliding
  const categoryPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < categories.length; i += 2) {
      pairs.push(categories.slice(i, i + 2));
    }
    return pairs;
  }, [categories]);

  // Calculate visible categories for mobile (2 at a time, infinite loop)
  const visibleCategories = useMemo(() => {
    const totalSlides = categoryPairs.length;
    const slideIndex = currentSlide % totalSlides;
    return categoryPairs[slideIndex] || [];
  }, [currentSlide, categoryPairs]);

  const handleNext = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  return (
    <section className="pt-6 md:pt-10">
      <div className="mb-3">
        <h2 className="text-[22px] font-semibold text-white md:text-[30px]">
          {t('game_categories')}
        </h2>
      </div>

      {/* Desktop View - Show all categories */}
      <div className="hidden md:grid md:grid-cols-4 md:gap-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={category.href}
            className="group relative block w-full overflow-hidden"
          >
            <div
              className="relative rounded-[5px] p-[15px]"
              style={{ border: '1px solid rgba(251, 99, 33, 0.30)' }}
            >
              <LazyImage
                src={category.image}
                alt={t(category.nameKey)}
                width={600}
                height={400}
                className="h-auto w-full rounded-[5px] object-cover"
              />
              {/* Overlay Content */}
              <div className="absolute inset-0 flex flex-col justify-between overflow-hidden p-4">
                <div className="mt-4 w-full text-center">
                  <h3
                    className="font-rammetto-one text-[35px] font-bold uppercase"
                    style={{
                      color: 'rgba(255, 255, 255, 0.80)',
                      textAlign: 'center',
                      textShadow: '0 10px 6px rgba(0, 0, 0, 0.25)',
                      WebkitTextStrokeWidth: '0.05rem',
                      WebkitTextStrokeColor: ' rgb(0, 0, 0)',
                      fontSize: '30px',
                      transform: 'rotate(-3.94deg)',
                    }}
                  >
                    {t(category.nameKey)}
                  </h3>
                </div>
                <div className="mt-auto flex justify-center">
                  <button className="fancy-hover-effect-red mx-auto mb-2 w-full max-w-[80%] rounded-[40px] bg-[#F45E2A] px-4 py-2 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#F45E2A]/90 md:py-2 md:text-[12px]">
                    <span className="text-container">
                      <span className="text">{t(category.buttonTextKey)}</span>
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Mobile View - Show 2 categories with Next button */}
      <div className="flex items-stretch gap-4 md:hidden">
        <div className="relative flex-1 overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${(currentSlide % categoryPairs.length) * 100}%)`,
            }}
          >
            {categoryPairs.map((pair, pairIndex) => (
              <div
                key={pairIndex}
                className="grid w-full flex-shrink-0 grid-cols-2 gap-4"
              >
                {pair.map((category) => (
                  <Link
                    key={category.id}
                    href={category.href}
                    className="group relative block w-full overflow-hidden"
                  >
                    <div
                      className="relative h-full rounded-[5px] p-[15px]"
                      style={{ border: '1px solid rgba(251, 99, 33, 0.30)' }}
                    >
                      <LazyImage
                        src={category.image}
                        alt={t(category.nameKey)}
                        width={600}
                        height={400}
                        className="h-auto w-full rounded-[5px] object-cover"
                      />
                      {/* Overlay Content */}
                      <div className="absolute inset-0 flex flex-col justify-between overflow-hidden p-4">
                        <div className="mt-4 w-full text-center">
                          <h3
                            className="font-rammetto-one text-[20px] font-bold uppercase md:text-[35px]"
                            style={{
                              color: 'rgba(255, 255, 255, 0.80)',
                              textAlign: 'center',
                              textShadow: '0 10px 6px rgba(0, 0, 0, 0.25)',
                              WebkitTextStrokeWidth: '0.05rem',
                              WebkitTextStrokeColor: ' rgb(0, 0, 0)',
                              transform: 'rotate(-3.94deg)',
                            }}
                          >
                            {t(category.nameKey)}
                          </h3>
                        </div>
                        <div className="mt-auto flex justify-center">
                          <button className="fancy-hover-effect-red mx-auto mb-2 w-full max-w-[80%] rounded-[40px] bg-[#F45E2A] px-4 py-1 text-center text-[12px] font-semibold text-white transition-colors duration-200 hover:bg-[#F45E2A]/90 md:py-2 md:text-[12px]">
                            <span className="text-container">
                              <span className="text">
                                {t(category.buttonTextKey)}
                              </span>
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Next Button - Fully heighted */}
        <button
          onClick={handleNext}
          className="flex items-center justify-center self-stretch rounded-[5px] px-4 font-bold text-white transition-all hover:opacity-90"
          style={{
            backgroundColor: 'rgba(251, 99, 33, 0.30)',
            border: '1px solid rgba(251, 99, 33, 0.30)',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            minWidth: '50px',
          }}
        >
          Next
        </button>
      </div>
    </section>
  );
}

export default Categories;
