'use client';

import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import GameCard from '@/dynamic-components/template14/components/GameCard/GameCard';
import { useGameData } from '@/hooks/useGameData';
import { useTranslations } from '@/hooks/useTranslations';

function PopularGames() {
  const { t } = useTranslations();
  const { games, loading } = useGameData(
    { is_trending: true },
    { perPage: 20 },
  );

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
  const [isAutoPlayPaused, setIsAutoPlayPaused] = useState(false);
  const inactivityTimerRef = useRef(null);
  const scrollIntervalRef = useRef(null);

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

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
      }
    };
  }, []);

  // Validate games data
  const validGames =
    games && Array.isArray(games)
      ? games.filter(
        (game) => game && typeof game === 'object' && game.id && game.name,
      )
      : [];

  // Reset inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setIsAutoPlayPaused(false);
    }, 30000); // 30 seconds
  }, []);

  // Autoplay - continuous scroll (opposite direction - right to left)
  useEffect(() => {
    if (!emblaApi || isHovered || validGames.length === 0 || isAutoPlayPaused)
      return;

    const id = setInterval(() => {
      if (!emblaApi) return;
      emblaApi.scrollPrev(); // Scroll to previous (opposite direction)
    }, 3000);

    return () => clearInterval(id);
  }, [emblaApi, isHovered, validGames.length, isAutoPlayPaused]);

  // Calculate how many slides to scroll based on viewport
  const getSlidesToScroll = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width < 768) return 3; // Mobile: 3 games visible
    return 6; // Desktop: 6 games visible
  }, []);

  // Navigation handlers with smooth train-like scrolling
  const handlePrev = useCallback(() => {
    if (!emblaApi) return;

    // Clear any existing scroll interval to prevent overlapping
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }

    setIsAutoPlayPaused(true);
    resetInactivityTimer();
    const slidesToScroll = getSlidesToScroll();

    // Scroll smoothly like a train by scrolling one by one with small delays
    let scrollCount = 0;
    scrollIntervalRef.current = setInterval(() => {
      if (scrollCount < slidesToScroll) {
        emblaApi.scrollPrev();
        scrollCount++;
      } else {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }, 80); // 80ms delay between each scroll for smooth train effect
  }, [emblaApi, resetInactivityTimer, getSlidesToScroll]);

  const handleNext = useCallback(() => {
    if (!emblaApi) return;

    // Clear any existing scroll interval to prevent overlapping
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
    }

    setIsAutoPlayPaused(true);
    resetInactivityTimer();
    const slidesToScroll = getSlidesToScroll();

    // Scroll smoothly like a train by scrolling one by one with small delays
    let scrollCount = 0;
    scrollIntervalRef.current = setInterval(() => {
      if (scrollCount < slidesToScroll) {
        emblaApi.scrollNext();
        scrollCount++;
      } else {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    }, 80); // 80ms delay between each scroll for smooth train effect
  }, [emblaApi, resetInactivityTimer, getSlidesToScroll]);

  // Loading state
  if (loading) {
    return (
      <section
        className="relative mt-6 px-4 py-4 pb-4 md:mt-10 md:px-4"
        style={{
          border: '1px solid rgba(251, 99, 33, 0.30)',
          borderRadius: '5px',
        }}
      >
        <div className="">
          {/* Header - matching the loaded state design */}
          <div className="mb-6 w-full">
            <div className="flex items-center justify-between gap-3 px-0 py-0 md:px-2 md:py-1">
              {/* Left side - Icon and Title */}
              <div className="flex items-center gap-3">
                <h3 className="text-[16px] tracking-wide uppercase md:text-[30px]">
                  <span className="font-bring-race text-white">
                    {t('trending')}
                  </span>{' '}
                  <span
                    className="font-bring-race"
                    style={{ color: '#951EDD' }}
                  >
                    {t('games')}
                  </span>
                </h3>
              </div>
            </div>
          </div>
          <CommonLoader border="border-[#EE7AF4]" />
        </div>
      </section>
    );
  }

  // Empty state
  if (validGames.length === 0) {
    return null;
  }

  // Duplicate games for infinite loop effect
  const duplicatedGames =
    validGames.length > 0
      ? [...validGames, ...validGames, ...validGames]
      : validGames;

  return (
    <section className="relative mt-6 py-4 pb-4 md:mt-10">
      <div className="">
        {/* Header */}
        <div className="mb-6 w-full">
          <div className="flex items-center justify-between gap-3 px-0 py-0 md:px-2 md:py-1">
            {/* Left side - Icon and Title */}
            <div className="flex items-center gap-3">
              <h3 className="text-[16px] tracking-wide uppercase md:text-[30px]">
                <span className="font-bring-race text-white">
                  {t('trending')}
                </span>{' '}
                <span className="font-bring-race" style={{ color: '#951EDD' }}>
                  {t('games')}
                </span>
              </h3>
            </div>

            {/* Right side - Navigation Buttons */}
            {validGames.length > 5 && (
              <div className="flex shrink-0 gap-2">
                <button
                  className="flex h-7 w-7 cursor-pointer items-center justify-center transition-all duration-200 hover:scale-110 sm:h-9 sm:w-9"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(102, 27, 181, 0.34) -222.58%, rgba(199, 46, 239, 0.34) -12.91%, rgba(100, 26, 185, 0.34) 184.24%)',
                    border: '2px solid #EE7AF4',
                  }}
                  onClick={handlePrev}
                  aria-label="Previous slide"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="9"
                    viewBox="0 0 20 15"
                    fill="none"
                  >
                    <path
                      d="M18.4269 8.11168C18.9626 8.11168 19.3968 7.67747 19.3968 7.14185C19.3968 6.60622 18.9626 6.17201 18.4269 6.17201V7.14185V8.11168ZM0.28407 6.45607C-0.0946753 6.83481 -0.0946753 7.44888 0.28407 7.82762L6.45608 13.9996C6.83482 14.3784 7.44889 14.3784 7.82764 13.9996C8.20638 13.6209 8.20638 13.0068 7.82764 12.6281L2.34141 7.14185L7.82764 1.65562C8.20638 1.27687 8.20638 0.662803 7.82764 0.284058C7.44889 -0.094687 6.83482 -0.094687 6.45608 0.284058L0.28407 6.45607ZM18.4269 7.14185V6.17201H0.969849V7.14185V8.11168H18.4269V7.14185Z"
                      fill="white"
                    />
                  </svg>
                </button>
                <button
                  className="flex h-7 w-7 cursor-pointer items-center justify-center transition-all duration-200 hover:scale-110 sm:h-9 sm:w-9"
                  style={{
                    background:
                      'linear-gradient(90deg, rgba(102, 27, 181, 0.34) -222.58%, rgba(199, 46, 239, 0.34) -12.91%, rgba(100, 26, 185, 0.34) 184.24%)',
                    border: '2px solid #EE7AF4',
                  }}
                  onClick={handleNext}
                  aria-label="Next slide"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="9"
                    viewBox="0 0 20 15"
                    fill="none"
                  >
                    <path
                      d="M0.969864 6.17201C0.434237 6.17201 2.67029e-05 6.60622 2.67029e-05 7.14185C2.67029e-05 7.67747 0.434237 8.11168 0.969864 8.11168V7.14185V6.17201ZM19.1127 7.82762C19.4915 7.44888 19.4915 6.83481 19.1127 6.45607L12.9407 0.284058C12.562 -0.094687 11.9479 -0.094687 11.5692 0.284058C11.1904 0.662803 11.1904 1.27687 11.5692 1.65562L17.0554 7.14185L11.5692 12.6281C11.1904 13.0068 11.1904 13.6209 11.5692 13.9996C11.9479 14.3784 12.562 14.3784 12.9407 13.9996L19.1127 7.82762ZM0.969864 7.14185V8.11168L18.4269 8.11168V7.14185V6.17201L0.969864 6.17201V7.14185Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Content with Cards */}
        <div>
          {/* Infinite Slider Area - Single Row */}
          <div
            className="w-full min-w-0"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="template14-game-slider template14-trending-games-slider overflow-hidden"
              ref={emblaRef}
            >
              <div className="flex">
                {/* Single row layout */}
                {duplicatedGames.map((game, index) => {
                  // Calculate position number (1-based) for all games, continuing increment
                  const positionNumber = index + 1;
                  return (
                    <div
                      key={`game-${index}`}
                      className="flex w-[calc((100%-1.5rem)/3)] flex-shrink-0 flex-col sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-3.75rem)/6)] lg:w-[calc((100%-3.75rem)/6)] xl:w-[calc((100%-3.75rem)/6)] 2xl:w-[calc((100%-3.75rem)/6)]"
                      style={{ marginRight: '0.75rem' }}
                    >
                      <div className="flex-shrink-0 md:h-[270px]">
                        <GameCard
                          game={game}
                          className="h-full w-full"
                          imageClassName="h-full w-full"
                          positionNumber={positionNumber}
                        />
                      </div>
                      {/* Game Name Container */}
                      <div
                        className="mt-4 w-full flex-shrink-0"
                        style={{
                          borderRadius: '3px',
                          border: '1px solid #3E1D88',
                          background: 'rgba(51, 19, 105, 0.70)',
                          boxShadow: '4px 5px 16px 0 rgba(0, 0, 0, 0.25) inset',
                          padding: '14px 32px 13px 33px',
                        }}
                      >
                        <p className="truncate text-center text-xs font-medium text-white">
                          {game.name}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PopularGames;
