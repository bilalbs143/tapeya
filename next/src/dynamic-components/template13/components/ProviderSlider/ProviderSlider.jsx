'use client';

import useEmblaCarousel from 'embla-carousel-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import LazyImage from '@/dynamic-components/template13/components/LazyImage/LazyImage';
import { useGameLaunch } from '@/hooks/useGameLaunch';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal, setSelectedGame } from '@/slices/common/commonSlice';
import { setSelectedProviderId } from '@/website/websiteSlice';

const ProviderSlider = ({
  providers = [],
  title,
  iconSrc,
  iconAlt,
  className = '',
  perPage = 6,
  perPageDesktop,
  perPageMobile,
  gap = 20,
  showNavigation = true,
  loading = false,
  showTitle = true,
  titleClassName = '',
  containerClassName = '',
  slideClassName = '',
  baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next',
  providerType = 'live', // 'live' or 'arcade'
  autoplay = false,
  autoplayInterval = 4000,
  pauseOnHover = true,
  autoplayDirection = 'next', // 'next' | 'prev'
}) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t } = useTranslations();
  const { handlePlayGame, isLaunching } = useGameLaunch();
  const { isMobilePlatform } = useMobilePlatform();

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

  const getNavigationStep = useCallback(() => {
    if (typeof window === 'undefined') return 1;
    return window.innerWidth >= 1024 ? 3 : 1;
  }, []);

  const effectiveGap = useMemo(() => {
    const gapNum = typeof gap === 'string' ? parseInt(gap, 10) : gap;
    return isMobile
      ? Math.max(16, Math.floor(gapNum / 1.5))
      : Math.max(28, gapNum);
  }, [gap, isMobile]);

  const carouselStyle = useMemo(
    () => ({
      display: 'flex',
      gap: `${effectiveGap}px`,
      paddingLeft: `${effectiveGap}px`,
      paddingRight: `${effectiveGap}px`,
    }),
    [effectiveGap],
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

  const handleProviderClick = useCallback(
    (provider) => {
      if (!provider.isLive || !provider.id) {
        return;
      }

      // For arcade providers, navigate to slots page
      if (providerType === 'arcade') {
        dispatch(setSelectedProviderId(provider.id));
        router.push('/slots?category=arcade');
        return;
      }

      // For live casino providers, launch game directly
      // On mobile screens, open modal
      if (isMobilePlatform || isMobile) {
        const selectedGame = {
          id: provider.id,
          provider: provider.provider || provider.key,
          name: provider.name,
          image: provider.background || `${baseUrl}/icons/${provider.icon}`,
        };
        dispatch(setSelectedGame(selectedGame));
        dispatch(openModal('launchGame'));
        return;
      }

      // On larger screens, launch directly
      handlePlayGame(provider.id);
    },
    [
      isMobilePlatform,
      isMobile,
      dispatch,
      router,
      handlePlayGame,
      baseUrl,
      providerType,
    ],
  );

  const validProviders =
    providers && Array.isArray(providers)
      ? providers.filter(
        (provider) =>
          provider &&
            typeof provider === 'object' &&
            (provider.id || provider.key),
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
                  border: '1px solid #00374A',
                  borderRadius: '5px',
                  background: 'transparent',
                }}
              >
                <div className="flex w-full items-center gap-3">
                  <h3
                    className="text-[16px] font-bold tracking-wide text-white uppercase md:text-[40px]"
                    style={{ fontFamily: 'var(--font-alatsi)' }}
                  >
                    {title}
                  </h3>
                </div>
              </div>
            </div>
          )}
          <CommonLoader border="border-[#20C5FE]" />
        </div>
      </section>
    );
  }

  if (validProviders.length === 0) {
    return null;
  }

  return (
    <section className={`${className}`}>
      <div className={`container mx-auto ${containerClassName}`}>
        {/* Header with Template 13 styling */}
        {showTitle && (
          <div className="mb-6 w-full">
            <div
              className="flex items-center justify-between gap-3 px-4 py-3"
              style={{
                border: '1px solid #00374A',
                borderRadius: '5px',
                background: 'transparent',
              }}
            >
              <div className="flex flex-1 items-center gap-3">
                <h3
                  className="text-[16px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {title}
                </h3>
              </div>
              {/* Navigation Buttons - Inside Header */}
              {showNavigation && validProviders.length > currentPerPage && (
                <div className="flex gap-2">
                  <button
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] transition-all duration-200 sm:h-8 sm:w-8 ${
                      canScrollPrev ? '' : 'cursor-not-allowed opacity-50'
                    }`}
                    onClick={handlePrev}
                    disabled={!canScrollPrev}
                    aria-label="Previous slide"
                    style={{
                      background: canScrollPrev ? '#20C5FE' : '#00374A',
                      border: '1px solid #00374A',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2 w-2 sm:h-3 sm:w-3"
                    >
                      <path d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-[5px] transition-all duration-200 sm:h-8 sm:w-8 ${
                      canScrollNext ? '' : 'cursor-not-allowed opacity-50'
                    }`}
                    onClick={handleNext}
                    disabled={!canScrollNext}
                    aria-label="Next slide"
                    style={{
                      background: canScrollNext ? '#20C5FE' : '#00374A',
                      border: '1px solid #00374A',
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-2 w-2 sm:h-3 sm:w-3"
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Providers Carousel */}
        <div
          className="relative"
          onMouseEnter={pauseOnHover ? () => setIsHovered(true) : undefined}
          onMouseLeave={pauseOnHover ? () => setIsHovered(false) : undefined}
        >
          <div className="overflow-hidden" ref={emblaRef}>
            <div style={carouselStyle}>
              {validProviders.map((provider, index) => (
                <div
                  key={provider.key || provider.id || `provider-${index}`}
                  className="flex-shrink-0"
                  style={{
                    width: `calc((100% - ${effectiveGap * (currentPerPage - 1)}px) / ${currentPerPage})`,
                    flexShrink: 0,
                  }}
                >
                  {providerType === 'live' ? (
                    // Live Casino Provider Card - Template 13 styling
                    <div
                      onClick={() => handleProviderClick(provider)}
                      className={`group relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-transparent transition-all duration-300 ${
                        !provider.isLive ? 'cursor-not-allowed' : ''
                      }`}
                      style={{
                        border: '1px solid #00374A',
                        borderRadius: '3px',
                      }}
                    >
                      <div className="absolute inset-0 bg-transparent">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <LazyImage
                            src={provider.background}
                            alt={`${provider.name} background`}
                            fill
                            sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                            className="object-cover object-top"
                            quality={85}
                          />
                          <div className="absolute inset-0 z-20 bg-[#20c5fe73] opacity-0 backdrop-blur-[5px] transition-opacity duration-300 group-hover:opacity-100" />
                        </div>
                      </div>

                      <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <button
                            type="button"
                            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 bg-black transition-colors disabled:opacity-50 sm:h-16 sm:w-16"
                            style={{
                              backgroundColor: '#000000',
                              borderColor: '#20C5FE',
                            }}
                            disabled={isLaunching(provider.id)}
                          >
                            {isLaunching(provider.id) ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#20C5FE] border-t-transparent" />
                            ) : (
                              <svg
                                className="h-4 w-4 sm:h-6 sm:w-6"
                                fill="#20C5FE"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Arcade Provider Card - Template 13 styling
                    <div
                      onClick={() => handleProviderClick(provider)}
                      className="group relative w-full overflow-hidden transition-all duration-300"
                      style={{
                        border: '1px solid #00374A',
                        background: 'transparent',
                        borderRadius: '3px',
                      }}
                    >
                      <div className="relative w-full bg-transparent">
                        <div className="flex items-center justify-center">
                          <LazyImage
                            src={`${baseUrl}/icons/${provider.icon}`}
                            alt={provider.name}
                            width={200}
                            height={150}
                            className="h-auto w-full object-contain transition-transform duration-300"
                            quality={85}
                          />
                        </div>
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#20c5fe73] opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[5px]">
                          <div className="relative h-10 w-28 bg-transparent sm:h-12 sm:w-32 md:h-14 md:w-36">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <LazyImage
                                src={`${baseUrl}/logos/${provider.logo}`}
                                alt={`${provider.name} logo`}
                                fill
                                sizes="(min-width:1280px) 20vw, (min-width:1024px) 25vw, (min-width:768px) 33vw, 50vw"
                                className="object-contain"
                                quality={90}
                              />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProviderClick(provider);
                            }}
                            className="rounded-[5px] border-2 border-[#00374A] bg-[#00111A] px-5 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110"
                          >
                            PLAY
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProviderSlider;
