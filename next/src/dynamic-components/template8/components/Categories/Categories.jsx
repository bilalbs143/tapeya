'use client';

import Link from 'next/link';
import React, { useMemo, useRef, useState } from 'react';

import LazyImage from '@/dynamic-components/template8/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/';

const categories = [
  {
    id: 'casino',
    nameKey: 'casino',
    image: `${baseUrl}casino-cat-8.webp`,
    imageMobile: `${baseUrl}casino-cat-8.webp`,
    href: '/live-casino',
    buttonTextKey: 'go_to_casino',
    subtitleKey: 'casino_fantasy_subtitle',
  },
  {
    id: 'slot',
    nameKey: 'slots',
    image: `${baseUrl}slot-cat-8.webp`,
    imageMobile: `${baseUrl}slot-cat-8.webp`,
    href: '/slots',
    buttonTextKey: 'play_games',
    subtitleKey: 'slots_fantasy_subtitle',
  },
  {
    id: 'sports',
    nameKey: 'sports',
    image: `${baseUrl}sports-cat-8.webp`,
    imageMobile: `${baseUrl}sports-cat-8.webp`,
    href: '/sports',
    buttonTextKey: 'play_games',
    subtitleKey: 'sports_fantasy_subtitle',
  },
  {
    id: 'lottery',
    nameKey: 'category_spin',
    image: `${baseUrl}spin-cat-8.webp`,
    imageMobile: `${baseUrl}spin-cat-8.webp`,
    href: '/lottery',
    buttonTextKey: 'play_games',
    subtitleKey: 'lottery_fantasy_subtitle',
  },
  {
    id: 'fishing',
    nameKey: 'p2p',
    image: `${baseUrl}p2p-cat-8.webp`,
    imageMobile: `${baseUrl}p2p-cat-8.webp`,
    href: '/fishing',
    buttonTextKey: 'play_games',
    subtitleKey: 'fishing_fantasy_subtitle',
  },
];

function Categories() {
  const { t } = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef(null);

  // Group categories into pairs for sliding
  const categoryPairs = useMemo(() => {
    const pairs = [];
    for (let i = 0; i < categories.length; i += 2) {
      pairs.push(categories.slice(i, i + 2));
    }
    return pairs;
  }, []);

  const handleNext = () => {
    setCurrentSlide((prev) => prev + 1);
  };

  // Get client X from event (touch or mouse)
  const getClientX = (e) => {
    if (e.touches && e.touches.length > 0) {
      return e.touches[0].clientX;
    }
    return e.clientX;
  };

  // Handle drag start
  const handleDragStart = (e) => {
    // Only start drag on left mouse button
    if (e.type === 'mousedown' && e.button !== 0) return;

    setIsDragging(true);
    setStartX(getClientX(e));
    setDragOffset(0);

    // Prevent default to avoid text selection and scrolling
    if (e.type === 'touchstart') {
      e.preventDefault();
    }
  };

  // Handle drag move
  const handleDragMove = (e) => {
    if (!isDragging) return;

    e.preventDefault();
    const currentX = getClientX(e);
    const offset = currentX - startX;
    setDragOffset(offset);
  };

  // Handle drag end
  const handleDragEnd = () => {
    if (!isDragging) return;

    const containerWidth = containerRef.current?.offsetWidth || 0;
    const threshold = containerWidth * 0.2; // 20% of container width

    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0) {
        // Swipe right - go to previous slide
        setCurrentSlide(
          (prev) => (prev - 1 + categoryPairs.length) % categoryPairs.length,
        );
      } else {
        // Swipe left - go to next slide
        setCurrentSlide((prev) => (prev + 1) % categoryPairs.length);
      }
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  return (
    <section className="pt-6 md:pt-10">
      {/* Desktop View - Show all categories in 5-column grid */}
      <div className="hidden lg:grid lg:grid-cols-5 lg:gap-3">
        {categories.map((category, index) => {
          const isEnabled = index < 2;
          const CardWrapper = isEnabled ? Link : 'div';
          const wrapperProps = isEnabled
            ? { href: category.href }
            : { onClick: (e) => e.preventDefault() };

          return (
            <CardWrapper
              key={category.id}
              {...wrapperProps}
              className={`group relative block w-full overflow-hidden ${!isEnabled ? 'cursor-not-allowed opacity-75' : ''}`}
            >
              <div className="relative w-full">
                <LazyImage
                  src={category.image}
                  alt={t(category.nameKey)}
                  width={600}
                  height={400}
                  className="h-auto w-full rounded-[5px]"
                />
                {/* Overlay Content */}
                <div className="absolute inset-0 overflow-hidden p-4">
                  <div className="w-full">
                    <h3 className="font-bring-race text-[20px] uppercase">
                      {t(category.nameKey)}
                    </h3>
                  </div>
                  <button
                    className="absolute right-3 bottom-4 left-3 px-6 py-3 text-sm text-white transition-all duration-300 ease-in-out hover:scale-[1.02]"
                    style={{
                      backgroundColor: '#0A1414',
                      border: '1px solid rgba(45, 250, 26, 0.30)',
                      borderRadius: '5px',
                    }}
                    onMouseEnter={(e) => {
                      if (isEnabled) {
                        e.currentTarget.style.backgroundColor =
                          'rgba(45, 250, 26, 1)';
                        e.currentTarget.style.borderColor =
                          'rgba(45, 250, 26, 1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#0A1414';
                      e.currentTarget.style.borderColor =
                        'rgba(45, 250, 26, 0.30)';
                    }}
                    disabled={!isEnabled}
                    onClick={(e) => {
                      if (!isEnabled) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  >
                    {index < 2 ? t('play_now') : t('available_soon')}
                  </button>
                </div>
              </div>
            </CardWrapper>
          );
        })}
      </div>

      {/* Mobile View - Show 2 categories with Next button */}
      <div className="flex items-stretch gap-4 lg:hidden">
        <div
          ref={containerRef}
          className="relative flex-1 cursor-grab overflow-hidden active:cursor-grabbing"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          style={{ touchAction: 'pan-x' }}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(calc(-${(currentSlide % categoryPairs.length) * 100}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 0.5s ease-in-out',
            }}
          >
            {categoryPairs.map((pair, pairIndex) => (
              <div
                key={pairIndex}
                className="grid w-full flex-shrink-0 grid-cols-2 gap-4"
              >
                {pair.map((category, index) => {
                  const globalIndex = pairIndex * 2 + index;
                  const isEnabled = globalIndex < 2;
                  const CardWrapper = isEnabled ? Link : 'div';
                  const wrapperProps = isEnabled
                    ? {
                      href: category.href,
                      onClick: (e) => {
                        if (isDragging) {
                          e.preventDefault();
                        }
                      },
                    }
                    : { onClick: (e) => e.preventDefault() };

                  return (
                    <CardWrapper
                      key={category.id}
                      {...wrapperProps}
                      className={`group relative block w-full overflow-hidden ${!isEnabled ? 'cursor-not-allowed opacity-75' : ''}`}
                    >
                      <div className="relative w-full">
                        <LazyImage
                          src={category.imageMobile}
                          alt={t(category.nameKey)}
                          width={600}
                          height={400}
                          className="h-auto w-full rounded-[5px]"
                        />
                        {/* Overlay Content */}
                        <div className="absolute inset-0 overflow-hidden p-4">
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
                          </div>
                          <button
                            className="absolute right-3 bottom-4 left-3 px-4 py-2 text-white transition-all duration-300 ease-in-out hover:scale-[1.02]"
                            style={{
                              backgroundColor: '#0A1414',
                              border: '1px solid rgba(45, 250, 26, 0.30)',
                              borderRadius: '5px',
                              fontSize: '10px',
                            }}
                            onMouseEnter={(e) => {
                              if (isEnabled) {
                                e.currentTarget.style.backgroundColor =
                                  'rgba(45, 250, 26, 1)';
                                e.currentTarget.style.borderColor =
                                  'rgba(45, 250, 26, 1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#0A1414';
                              e.currentTarget.style.borderColor =
                                'rgba(45, 250, 26, 0.30)';
                            }}
                            disabled={!isEnabled}
                            onClick={(e) => {
                              if (!isEnabled) {
                                e.preventDefault();
                                e.stopPropagation();
                              }
                            }}
                          >
                            <span className="md:text-[16px]">
                              {globalIndex < 2
                                ? t('play_now')
                                : t('available_soon')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </CardWrapper>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          className="flex items-center justify-center self-stretch rounded-[5px] px-4 font-bold text-white transition-all hover:opacity-90"
          style={{
            backgroundColor: 'rgba(45, 250, 26, 0.30)',
            border: '1px solid rgba(45, 250, 26, 0.30)',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            minWidth: '50px',
          }}
        >
          {t('next')}
        </button>
      </div>
    </section>
  );
}

export default Categories;
