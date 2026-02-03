'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import GameCard from '@/dynamic-components/template18/components/GameCard/GameCard';
import LazyImage from '@/dynamic-components/template18/components/LazyImage/LazyImage';

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

  // Responsive perPage calculation
  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      let newPerPage;

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
        if (width >= 1536) newPerPage = 6;
        else if (width >= 1280) newPerPage = 5;
        else if (width >= 1024) newPerPage = 4;
        else newPerPage = width >= 768 ? 3 : 3;
      }

      setIsMobile(width < 768);

      if (newPerPage !== currentPerPage) {
        setCurrentPerPage(newPerPage);
        if (emblaApi) emblaApi.reInit();
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
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

  // Autoplay
  useEffect(() => {
    if (!emblaApi || !autoplay) return;
    if (pauseOnHover && isHovered) return;

    const id = setInterval(
      () => {
        if (!emblaApi) return;
        if (autoplayDirection === 'prev') emblaApi.scrollPrev();
        else emblaApi.scrollNext();
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

  const getNavigationStep = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    return window.innerWidth >= 1024 ? 3 : 1;
  }, []);

  const effectiveGap = useMemo(
    () => (isMobile ? Math.max(10, Math.floor(gap / 2)) : Math.max(28, gap)),
    [gap, isMobile],
  );

  const carouselStyle = useMemo(
    () => ({
      display: 'flex',
      gap: `${effectiveGap}px`,
      paddingLeft: isMobile ? '0px' : `${effectiveGap}px`,
      paddingRight: isMobile ? '0px' : `${effectiveGap}px`,
    }),
    [effectiveGap, isMobile],
  );

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

  const validGames =
    games && Array.isArray(games)
      ? games.filter(
        (game) => game && typeof game === 'object' && game.id && game.name,
      )
      : [];

  if (loading) {
    return (
      <section className={`px-2 py-4 sm:px-4 sm:py-6 md:py-8 ${className}`}>
        <div className={`container mx-auto ${containerClassName}`}>
          {showTitle && (
            <div className="mb-6 w-full">
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{
                  background: '#E8D25E',
                  borderRadius: '10px',
                  padding: '2px',
                }}
              >
                <div className="flex w-full items-center gap-3 rounded-lg bg-black px-4 py-3">
                  {iconSrc && (
                    <LazyImage
                      src={iconSrc}
                      alt={iconAlt || 'icon'}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  )}
                  <h3
                    className="text-[22px] font-bold tracking-wide text-white uppercase md:text-[40px]"
                    style={{ fontFamily: 'var(--font-alatsi)' }}
                  >
                    {title}
                  </h3>
                </div>
              </div>
            </div>
          )}
          <CommonLoader border="border-[#CBBC91]" />
        </div>
      </section>
    );
  }

  if (validGames.length === 0) return null;

  return (
    <section className={`px-2 py-6 sm:px-4 md:py-10 ${className}`}>
      <div className={`container mx-auto ${containerClassName}`}>
        {/* Header */}
        {showTitle && (
          <div className="mb-6 w-full">
            <div className="flex items-center justify-between px-0 py-0 md:px-2 md:py-1">
              {/* Left side: title and icon */}
              <div className="flex items-center gap-3">
                {iconSrc && (
                  <LazyImage
                    src={iconSrc}
                    alt={iconAlt || 'icon'}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                )}
                <h3
                  className="text-[22px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {title}
                </h3>
              </div>

              {/* Right side: navigation buttons */}
              {showNavigation && validGames.length > currentPerPage && (
                <div className="flex items-center gap-2 md:gap-3 md:pr-2">
                  {/* PREV */}
                  <button
                    onClick={handlePrev}
                    disabled={!canScrollPrev}
                    aria-label="Previous slide"
                    className={`group flex h-[33px] w-[33px] items-center justify-center rounded-[10px] border border-[#FFB7034D] bg-[#14213D] transition-all hover:bg-[#1f2e4d] md:h-[45px] md:w-[45px] ${!canScrollPrev
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:border-[#FFB703]'
                    }`}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-6 md:w-6"
                    >
                      <path
                        d="M19 12H5M5 12L12 19M5 12L12 5"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* NEXT */}
                  <button
                    onClick={handleNext}
                    disabled={!canScrollNext}
                    aria-label="Next slide"
                    className={`group flex h-[33px] w-[33px] items-center justify-center rounded-[10px] border border-[#FFB7034D] bg-[#14213D] transition-all hover:bg-[#1f2e4d] md:h-[45px] md:w-[45px] ${!canScrollNext
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:border-[#FFB703]'
                    }`}
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 md:h-6 md:w-6"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
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
                    minWidth: isMobile ? '0px' : '230px',
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
