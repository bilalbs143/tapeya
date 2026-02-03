'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useState } from 'react';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import GameCard from '@/dynamic-components/template13/components/GameCard/GameCard';
import LazyImage from '@/dynamic-components/template13/components/LazyImage/LazyImage';
import { useGameData } from '@/hooks/useGameData';
import { useTranslations } from '@/hooks/useTranslations';

function NewGames() {
  const { t } = useTranslations();
  const { games, loading } = useGameData({ is_new: true }, { perPage: 20 });

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: true,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(true);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // Update scroll buttons state - for infinite slider, always enabled
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    // For infinite slider, scroll buttons are always enabled
    setCanScrollPrev(true);
    setCanScrollNext(true);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Validate games data
  const validGames =
    games && Array.isArray(games)
      ? games.filter(
        (game) => game && typeof game === 'object' && game.id && game.name,
      )
      : [];

  // Autoplay - continuous scroll
  useEffect(() => {
    if (!emblaApi || isHovered || validGames.length === 0) return;

    const id = setInterval(() => {
      if (!emblaApi) return;
      emblaApi.scrollNext(); // Scroll to next
    }, 3000);

    return () => clearInterval(id);
  }, [emblaApi, isHovered, validGames.length]);

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev(); // Scroll backward
  }, [emblaApi]);

  const handleNext = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext(); // Scroll forward
  }, [emblaApi]);

  // Loading state
  if (loading) {
    return (
      <motion.section
        className="pt-6 md:pt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          {/* Header - matching the loaded state design */}
          <div className="mb-6 w-full">
            <div className="flex items-center justify-between gap-3 px-0 py-0 md:px-2 md:py-1">
              {/* Left side - Icon and Title */}
              <div className="flex items-center gap-3">
                <h3
                  className="text-[16px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {t('new_games')}
                </h3>
              </div>
            </div>
          </div>
          <CommonLoader border="border-[#20C5FE]" />
        </div>
      </motion.section>
    );
  }

  // Empty state
  if (validGames.length === 0) {
    return null;
  }

  // Duplicate games for infinite loop effect and ensure even number for pairs
  const duplicatedGames =
    validGames.length > 0
      ? [...validGames, ...validGames, ...validGames]
      : validGames;
  // Ensure even number by adding one more if odd
  const evenGames =
    duplicatedGames.length % 2 === 0
      ? duplicatedGames
      : [...duplicatedGames, duplicatedGames[0]];

  return (
    <motion.section
      className="overflow-hidden pt-6 md:pt-10"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{ willChange: 'opacity, transform' }}
      layout
    >
      <div>
        {/* Header */}
        <motion.div
          className="mb-6 w-full"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.1,
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          <div className="flex items-center justify-between gap-3 px-0 py-0 md:px-2 md:py-1">
            {/* Left side - Icon and Title */}
            <div className="flex items-center gap-3">
              <h3
                className="text-[16px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('new_games')}
              </h3>
            </div>

            {/* Right side - Navigation Buttons */}
            {validGames.length > 5 && (
              <div className="flex shrink-0 gap-2">
                <button
                  className="group flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] border-2 bg-[#00111A] transition-all duration-200 hover:scale-110 hover:border-[#20C5FE] hover:bg-[#20C5FE] sm:h-8 sm:w-8"
                  style={{ borderColor: '#00374A' }}
                  onClick={handlePrev}
                  aria-label="Previous slide"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/arrow-left-5.svg"
                    alt="Previous"
                    width={20}
                    height={20}
                    className="h-3 w-3 group-hover:brightness-0 group-hover:invert"
                  />
                </button>
                <button
                  className="group flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] border-2 bg-[#00111A] transition-all duration-200 hover:scale-110 hover:border-[#20C5FE] hover:bg-[#20C5FE] sm:h-8 sm:w-8"
                  style={{ borderColor: '#00374A' }}
                  onClick={handleNext}
                  aria-label="Next slide"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/arrow-right-5.svg"
                    alt="Next"
                    width={20}
                    height={20}
                    className="h-3 w-3 group-hover:brightness-0 group-hover:invert"
                  />
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Content with Banner and Cards */}
        <motion.div
          className="flex flex-col gap-4 rounded-lg border-2 p-4 lg:flex-row lg:items-stretch"
          style={{ borderColor: '#00374A', willChange: 'opacity, transform' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2,
          }}
        >
          {/* Mobile Banner - Shown First on Mobile */}
          <div className="block w-full lg:hidden">
            <Link
              href="/slot-providers"
              className="relative block w-full cursor-pointer overflow-hidden rounded-[5px]"
            >
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/new-games-banner-mob-5.webp"
                alt="New Games Banner"
                width={800}
                height={400}
                className="h-auto w-full object-cover transition-opacity hover:opacity-90"
              />
              {/* View More Icon - Left Side */}
              <div className="pointer-events-none absolute top-1/2 left-4 z-20 -translate-y-1/2">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/view-more-5.svg"
                  alt="View More"
                  width={173}
                  height={133}
                  className="h-auto w-20 sm:w-24"
                />
              </div>
            </Link>
          </div>

          {/* Static Banner on Left - Desktop Only */}
          <div className="hidden flex-shrink-0 lg:flex lg:w-[280px] xl:w-[320px]">
            <Link
              href="/slot-providers"
              className="group/banner relative h-full w-full cursor-pointer overflow-hidden rounded-[5px] border border-[#20C5FE] transition-all duration-300 hover:border-[#20C5FE80]"
            >
              <div className="relative h-full w-full overflow-hidden rounded-[5px]">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/new-games-banner-5-up.webp"
                  alt="New Games Banner"
                  width={320}
                  height={650}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/banner:scale-110"
                  style={{ objectPosition: 'center' }}
                />
                {/* Bottom overlay effect on hover */}
                <div className="pointer-events-none absolute top-1/2 right-0 bottom-0 left-0 origin-bottom scale-y-0 bg-gradient-to-t from-[#20C5FE] to-transparent transition-transform duration-300 ease-in-out will-change-transform group-hover/banner:scale-y-100" />
                {/* Top center icon */}
                <div className="pointer-events-none absolute top-4 left-1/2 z-20 -translate-x-1/2">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/view-more-5.svg"
                    alt="View More"
                    width={173}
                    height={133}
                    className="h-auto w-24 sm:w-32"
                  />
                </div>
              </div>
              {/* Play Button Overlay - slides up from bottom on hover */}
              <div className="pointer-events-none absolute inset-0 z-10 hidden items-end justify-center pb-4 lg:flex">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = '/slot-providers';
                  }}
                  className="pointer-events-auto flex translate-y-full cursor-pointer items-center justify-center gap-2 rounded-[50px] border border-transparent bg-[#20C5FE] px-4 py-2.5 opacity-0 shadow-[0_4px_14px_rgba(0,0,0,0.75)] transition-all duration-300 ease-in-out group-hover/banner:translate-y-0 group-hover/banner:border-[#20C5FE] group-hover/banner:bg-[#20C5FE] group-hover/banner:opacity-100 sm:px-5 sm:py-3"
                >
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    fill="#FFFFFF"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm font-medium text-white">
                    View All Games
                  </span>
                </button>
              </div>
            </Link>
          </div>

          {/* Infinite Slider Area - Two Rows */}
          <div
            className="min-w-0 flex-1 lg:flex lg:flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="template13-game-slider h-full overflow-hidden"
              ref={emblaRef}
            >
              <div className="flex h-full">
                {/* Group games into pairs for two-row layout - always ensure both cards exist */}
                {Array.from({ length: evenGames.length / 2 }).map(
                  (_, pairIndex) => (
                    <div
                      key={`pair-${pairIndex}`}
                      className="flex h-full w-[calc((100%-1.5rem)/3)] flex-shrink-0 flex-col gap-3 sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-2.25rem)/4)] lg:w-[calc((100%-1.5rem)/3)] xl:w-[calc((100%-2.25rem)/4)] 2xl:w-[calc((100%-3rem)/5)]"
                      style={{ marginRight: '0.75rem' }}
                    >
                      {/* Top Row Game - always present */}
                      <div className="h-[150px] w-full md:h-auto md:flex-1">
                        <GameCard
                          game={evenGames[pairIndex * 2]}
                          className="h-full"
                          imageClassName="h-full w-full"
                        />
                      </div>
                      {/* Bottom Row Game - always present */}
                      <div className="h-[150px] w-full md:h-auto md:flex-1">
                        <GameCard
                          game={evenGames[pairIndex * 2 + 1]}
                          className="h-full"
                          imageClassName="h-full w-full"
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

export default NewGames;
