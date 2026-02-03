'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import GameCard from '@/dynamic-components/template11/components/GameCard/GameCard';
import LazyImage from '@/dynamic-components/template11/components/LazyImage/LazyImage';

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
  imageClassName = 'h-[165px] w-full sm:h-[250px] md:h-[300px] md:w-[237px]',
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
    slidesToScroll: 1,
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
    () => (isMobile ? Math.max(16, Math.floor(gap / 1.5)) : Math.max(28, gap)),
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
      <section className={`px-2 py-4 sm:px-4 sm:py-6 md:py-8 ${className}`}>
        <div className={`container mx-auto ${containerClassName}`}>
          {showTitle && (
            <div className="mb-6 w-full">
              <div className="relative flex items-center justify-center px-4 py-4 md:px-6 md:py-5">
                <div className="flex flex-1 flex-col items-center justify-center">
                  <h3
                    className="text-[24px] font-semibold tracking-wide text-white uppercase md:text-[32px]"
                    style={{
                      fontFamily: 'var(--font-king-town)',
                    }}
                  >
                    {title}
                  </h3>
                  <div
                    className="mt-1 h-[1px] w-full max-w-[200px] md:max-w-[300px]"
                    style={{
                      backgroundColor: '#5E4413',
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <CommonLoader border="border-[#55BC55]" />
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
        {/* Header with gradient border */}
        {showTitle && (
          <div className="mb-6 w-full">
            <div className="relative flex items-center justify-between gap-4 px-4 py-4 md:px-6 md:py-5">
              {/* Left Navigation Button */}
              {showNavigation && validGames.length > currentPerPage ? (
                <button
                  className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[5px] transition-all duration-200 hover:opacity-80 md:h-12 md:w-12 ${
                    canScrollPrev ? '' : 'cursor-not-allowed opacity-50'
                  }`}
                  onClick={handlePrev}
                  disabled={!canScrollPrev}
                  aria-label="Previous slide"
                  style={{
                    backgroundColor: '#5E4413',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
              ) : (
                <div className="h-10 w-10 shrink-0 md:h-12 md:w-12" />
              )}

              {/* Line segments with centered title */}
              <div className="relative flex flex-1 items-center justify-center gap-4">
                {/* Left line segment */}
                <div
                  className="h-[1px] flex-1"
                  style={{
                    backgroundColor: '#5E4413',
                  }}
                />
                {/* Title centered with spacing */}
                <h3
                  className="shrink-0 px-4 text-[24px] font-semibold tracking-wide text-white uppercase md:text-[32px]"
                  style={{
                    fontFamily: 'var(--font-king-town)',
                  }}
                >
                  {title}
                </h3>
                {/* Right line segment */}
                <div
                  className="h-[1px] flex-1"
                  style={{
                    backgroundColor: '#5E4413',
                  }}
                />
              </div>

              {/* Right Navigation Button */}
              {showNavigation && validGames.length > currentPerPage ? (
                <button
                  className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[5px] transition-all duration-200 hover:opacity-80 md:h-12 md:w-12 ${
                    canScrollNext ? '' : 'cursor-not-allowed opacity-50'
                  }`}
                  onClick={handleNext}
                  disabled={!canScrollNext}
                  aria-label="Next slide"
                  style={{
                    backgroundColor: '#5E4413',
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              ) : (
                <div className="h-10 w-10 shrink-0 md:h-12 md:w-12" />
              )}
            </div>
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
                  className="flex-shrink-0"
                  style={{
                    width: `calc((100% - ${effectiveGap * (currentPerPage - 1)}px) / ${currentPerPage})`,
                    minWidth: isMobile ? '130px' : '230px',
                    maxWidth: isMobile ? '150px' : '270px',
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
