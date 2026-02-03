import Link from 'next/link';
import React, { useState } from 'react';

import LazyImage from '@/dynamic-components/template4/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

function Categories() {
  const { t } = useTranslations();

  const categories = [
    {
      id: 'casino',
      name: t('category_casino'),
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-4.png',
      href: '/live-casino',
      isActive: true,
    },
    {
      id: 'slot',
      name: t('category_slot'),
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-4.png',
      href: '/slot-providers',
      isActive: true,
    },
    {
      id: 'spin',
      name: t('category_spin'),
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/spin-4.png',
      href: '#',
      isActive: false,
      comingSoon: true,
    },
    {
      id: 'sports',
      name: t('category_sports'),
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/sports-4.png',
      href: '#',
      isActive: false,
      comingSoon: true,
    },
    {
      id: 'p2p',
      name: t('category_p2p'),
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/p2p-4.png',
      href: '#',
      isActive: false,
      comingSoon: true,
    },
    {
      id: 'egames',
      name: t('category_e_games'),
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/egames-4.png',
      href: '#',
      isActive: false,
      comingSoon: true,
    },
  ];

  // Mobile slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const categoriesPerSlide = 2;
  const totalSlides = Math.ceil(categories.length / categoriesPerSlide);

  // Auto-advance slider functionality
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Touch event handlers
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  return (
    <section className="px-2 py-4 md:px-6">
      <div className="">
        {/* Desktop Categories */}
        <div className="hidden md:flex md:gap-2 lg:gap-3">
          {categories.map((category) => (
            <div key={category.id} className="flex-1">
              {category.isActive ? (
                <Link
                  href={category.href}
                  className="group relative block h-22 w-full overflow-hidden transition-transform duration-200 hover:scale-105"
                >
                  <LazyImage
                    src={category.image}
                    alt={category.name}
                    fill
                    className=""
                  />
                  <div className="absolute inset-0 flex items-center justify-start p-3">
                    <div className="text-left">
                      <h3 className="text-sm leading-tight font-bold text-white uppercase drop-shadow-lg sm:text-base md:text-lg">
                        {category.name}
                      </h3>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="group relative block h-22 w-full overflow-hidden opacity-75">
                  <LazyImage
                    src={category.image}
                    alt={category.name}
                    fill
                    className=""
                  />
                  <div className="absolute inset-0 flex items-center justify-start p-3">
                    <div className="text-left">
                      <h3 className="text-sm leading-tight font-bold text-white uppercase drop-shadow-lg sm:text-base md:text-lg">
                        {category.name}
                      </h3>
                      <p className="text-xs leading-tight text-white opacity-80 drop-shadow-lg">
                        {t('available_soon')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Categories Slider */}
        <div className="relative block md:hidden">
          <div
            className="overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Generate slides with 2 categories each */}
              {Array.from({ length: totalSlides }, (_, slideIndex) => (
                <div key={slideIndex} className="w-full flex-shrink-0 px-2">
                  <div className="flex justify-center gap-2">
                    {categories
                      .slice(
                        slideIndex * categoriesPerSlide,
                        (slideIndex + 1) * categoriesPerSlide,
                      )
                      .map((category) => (
                        <div key={category.id} className="flex-1">
                          {category.isActive ? (
                            <Link
                              href={category.href}
                              className="group relative block h-20 w-full overflow-hidden transition-transform duration-200 hover:scale-105"
                            >
                              <LazyImage
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-contain"
                              />
                              <div className="absolute inset-0 flex items-center justify-start p-2 pl-4">
                                <div className="text-left">
                                  <h3 className="text-xs leading-tight font-bold text-white uppercase drop-shadow-lg">
                                    {category.name}
                                  </h3>
                                </div>
                              </div>
                            </Link>
                          ) : (
                            <div className="group relative block h-20 w-full overflow-hidden opacity-75">
                              <LazyImage
                                src={category.image}
                                alt={category.name}
                                fill
                                className="object-contain grayscale"
                              />
                              <div className="absolute inset-0 flex items-center justify-start p-2 pl-4">
                                <div className="text-left">
                                  <h3 className="text-xs leading-tight font-bold text-white uppercase drop-shadow-lg">
                                    {category.name}
                                  </h3>
                                  <p className="text-xs leading-tight text-white opacity-80 drop-shadow-lg">
                                    Available soon
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation arrows */}
          {/* Left arrow */}
          <div className="absolute top-1/2 left-[-5px] -translate-y-1/2">
            <button
              onClick={prevSlide}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d2d2d] shadow-lg transition-colors duration-200 hover:bg-[#4A9A4A]"
            >
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          </div>

          {/* Right arrow */}
          <div className="absolute top-1/2 right-[-5px] -translate-y-1/2">
            <button
              onClick={nextSlide}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-[#2d2d2d] shadow-lg transition-colors duration-200 hover:bg-[#4A9A4A]"
            >
              <svg
                className="h-4 w-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Categories;
