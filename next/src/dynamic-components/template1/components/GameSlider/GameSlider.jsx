'use client';

import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import GameCard from '@/dynamic-components/template1/components/GameCard/GameCard';
import LazyImage from '@/dynamic-components/template1/components/LazyImage/LazyImage';

const GameSlider = ({
  games = [],
  title,
  iconSrc,
  iconAlt,
  className = '',
  perPage = 6,
  perPageDesktop,
  perPageMobile,
  gap = 20,
  showNavigation = true,
  onGameClick,
  loading = false,
  showTitle = true,
  titleClassName = '',
  containerClassName = '',
  slideClassName = '',
  imageClassName = 'h-[165px] w-full sm:h-[250px] md:h-[250px] md:w-[237px]',
  showPlayButton = true,
  autoplay = false,
  autoplayInterval = 4000,
  pauseOnHover = true,
  autoplayDirection = 'next', // 'next' | 'prev'
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
  });

  const [currentPerPage, setCurrentPerPage] = useState(
    perPageDesktop || perPage,
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const MOBILE_FIT_ADJUST_PX = 20; // centralize fine-tuning

  // Responsive perPage calculation
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;

      let newPerPage;
      // If explicit props provided, use them; otherwise fall back to previous mapping
      if (
        typeof perPageDesktop === 'number' ||
        typeof perPageMobile === 'number'
      ) {
        newPerPage =
          width >= 1024
            ? typeof perPageDesktop === 'number'
              ? perPageDesktop
              : perPage
            : typeof perPageMobile === 'number'
              ? perPageMobile
              : Math.max(1, Math.min(3, perPage));
      } else {
        if (width >= 1536) {
          newPerPage = 6;
        } else if (width >= 1280) {
          newPerPage = 5;
        } else if (width >= 1024) {
          newPerPage = 4;
        } else if (width >= 768) {
          newPerPage = 3;
        } else {
          newPerPage = 3;
        }
      }

      setIsMobile(width < 768);

      if (newPerPage !== currentPerPage) {
        setCurrentPerPage(newPerPage);
        if (emblaApi) {
          emblaApi.reInit();
        }
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Also check on orientation change for mobile devices
    window.addEventListener('orientationchange', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, [currentPerPage, emblaApi, perPageDesktop, perPageMobile, perPage]);

  // Update scroll buttons state
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
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

  // Autoplay: advance one slide every few seconds
  useEffect(() => {
    if (!emblaApi || !autoplay) return;
    if (pauseOnHover && isHovered) return;

    const id = setInterval(
      () => {
        if (!emblaApi) return;
        if (autoplayDirection === 'prev') {
          emblaApi.scrollPrev();
        } else {
          emblaApi.scrollNext();
        }
      },
      Math.max(autoplayInterval, 1000),
    );

    return () => clearInterval(id);
  }, [
    emblaApi,
    autoplay,
    autoplayInterval,
    isHovered,
    pauseOnHover,
    autoplayDirection,
  ]);

  // Determine navigation step: 3 on desktop (>=1024px), 1 on mobile/tablet
  const getNavigationStep = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    return window.innerWidth >= 1024 ? 3 : 1;
  }, []);

  // Memoize the carousel style object
  const effectiveGap = useMemo(
    () => (isMobile ? Math.max(0, Math.floor(gap / 2)) : gap),
    [gap, isMobile],
  );

  const carouselStyle = useMemo(
    () => ({
      display: 'flex',
      gap: `${effectiveGap}px`,
      paddingLeft: `${effectiveGap}px`,
      paddingRight: `${effectiveGap}px`,
    }),
    [effectiveGap],
  );

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (!emblaApi) return;
    const step = getNavigationStep();
    const slideCount = emblaApi.scrollSnapList().length;
    const currentIndex = emblaApi.selectedScrollSnap();
    const targetIndex = (currentIndex - step + slideCount) % slideCount;
    emblaApi.scrollTo(targetIndex);
  }, [emblaApi, getNavigationStep]);

  const handleNext = useCallback(() => {
    if (!emblaApi) return;
    const step = getNavigationStep();
    const slideCount = emblaApi.scrollSnapList().length;
    const currentIndex = emblaApi.selectedScrollSnap();
    const targetIndex = (currentIndex + step) % slideCount;
    emblaApi.scrollTo(targetIndex);
  }, [emblaApi, getNavigationStep]);

  // Validate games data
  const validGames =
    games && Array.isArray(games)
      ? games.filter(
        (game) => game && typeof game === 'object' && game.id && game.name,
      )
      : [];
  // Loading state
  if (loading) {
    return (
      <section className={`px-2 py-6 sm:px-4 md:py-10 ${className}`}>
        <div className={`container mx-auto ${containerClassName}`}>
          <div className="mb-4 flex items-center gap-2 sm:mb-4 sm:gap-3">
            {iconSrc && (
              <div className="flex items-center justify-center">
                <LazyImage
                  src={iconSrc}
                  alt={iconAlt || 'icon'}
                  width={24}
                  height={24}
                  className="h-5 w-5 sm:h-6 sm:w-6"
                />
              </div>
            )}
            <h3
              className={`bg-gradient-to-r from-cyan-300 via-blue-100 via-purple-200 to-purple-700 bg-clip-text text-lg leading-tight font-extrabold text-transparent sm:text-xl md:text-2xl ${titleClassName}`}
            >
              {title}
            </h3>
          </div>
          <CommonLoader border="border-[#FC7E09]" />
        </div>
      </section>
    );
  }

  // Empty state (optional)
  if (validGames.length === 0) {
    return null;
  }

  return (
    <section className={`px-2 py-6 sm:px-4 md:py-10 ${className}`}>
      <div className={`container mx-auto ${containerClassName}`}>
        {/* Header */}
        {showTitle && (
          <div className="mb-4 flex items-center justify-between gap-4 sm:mb-4 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3">
              {iconSrc && (
                <div className="flex items-center justify-center">
                  <LazyImage
                    src={iconSrc}
                    alt={iconAlt || 'icon'}
                    width={24}
                    height={24}
                    sizes="(max-width: 640px) 20px, 24px"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                  />
                </div>
              )}
              <h3
                className={`bg-gradient-to-r from-cyan-300 via-blue-100 via-purple-200 to-purple-700 bg-clip-text text-lg leading-tight font-extrabold text-transparent sm:text-xl md:text-2xl ${titleClassName}`}
              >
                {title}
              </h3>
            </div>

            {/* Navigation Buttons */}
            {showNavigation && validGames.length > currentPerPage && (
              <div className="flex gap-2 self-end sm:self-auto">
                <button
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm transition-colors duration-200 sm:h-8 sm:w-8 ${
                    canScrollPrev
                      ? 'bg-[#FC7E09] hover:bg-orange-600'
                      : 'cursor-not-allowed bg-gray-400'
                  }`}
                  onClick={handlePrev}
                  disabled={!canScrollPrev}
                  aria-label="Previous slide"
                >
                  <svg
                    className="h-4 w-4 text-white sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm transition-colors duration-200 sm:h-8 sm:w-8 ${
                    canScrollNext
                      ? 'bg-[#FC7E09] hover:bg-orange-600'
                      : 'cursor-not-allowed bg-gray-400'
                  }`}
                  onClick={handleNext}
                  disabled={!canScrollNext}
                  aria-label="Next slide"
                >
                  <svg
                    className="h-4 w-4 text-white sm:h-5 sm:w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Games Carousel */}
        <div
          className="relative"
          onMouseEnter={pauseOnHover ? () => setIsHovered(true) : undefined}
          onMouseLeave={pauseOnHover ? () => setIsHovered(false) : undefined}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div style={carouselStyle}>
              {validGames.map((game, index) => (
                <div
                  key={game.id || `game-${index}`}
                  className="w-[calc((100%-var(--gap-total))/3)] min-w-0 flex-shrink-0 sm:w-[calc((100%-var(--gap-total))/3)] md:w-auto"
                  style={{
                    '--gap-total': `${Math.max(0, effectiveGap * 2 - MOBILE_FIT_ADJUST_PX)}px`,
                  }}
                >
                  <GameCard
                    game={game}
                    onClick={onGameClick}
                    className={slideClassName}
                    imageClassName={imageClassName}
                    showPlayButton={showPlayButton}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameSlider;
