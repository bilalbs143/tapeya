'use client';

import useEmblaCarousel from 'embla-carousel-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import LazyImage from '@/dynamic-components/template14/components/LazyImage/LazyImage';
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
      : Math.max(24, gapNum);
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
        <div className={`${containerClassName}`}>
          {showTitle && (
            <div className="mb-6 w-full">
              <div className="flex items-center justify-between gap-3 px-0 py-0 md:px-2 md:py-1">
                <div className="flex items-center gap-3">
                  <h3
                    className="font-bring-race text-[16px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                    style={{ letterSpacing: '1px' }}
                  >
                    {title}
                  </h3>
                </div>
              </div>
            </div>
          )}
          <CommonLoader border="border-[#7351FF]" />
        </div>
      </section>
    );
  }

  if (validProviders.length === 0) {
    return null;
  }

  return (
    <section className={`${className}`}>
      <div className={`${containerClassName}`}>
        {/* Header */}
        {showTitle && (
          <div className="mb-6 w-full">
            <div className="flex items-center justify-between gap-3 px-0 py-0 md:px-2 md:py-1">
              {/* Left side - Title */}
              <div className="flex items-center gap-3">
                <h3
                  className="font-bring-race text-[16px] font-semibold tracking-wide text-white uppercase md:text-[30px]"
                  style={{ letterSpacing: '1px' }}
                >
                  {title}
                </h3>
              </div>

              {/* Right side - Navigation Buttons */}
              {showNavigation && validProviders.length > currentPerPage && (
                <div className="flex shrink-0 gap-2">
                  <button
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center transition-all duration-200 hover:scale-110 sm:h-9 sm:w-9 ${
                      canScrollPrev ? '' : 'cursor-not-allowed opacity-50'
                    }`}
                    onClick={handlePrev}
                    disabled={!canScrollPrev}
                    aria-label="Previous slide"
                    style={{
                      background: canScrollPrev
                        ? 'linear-gradient(90deg, rgba(102, 27, 181, 0.34) -222.58%, rgba(199, 46, 239, 0.34) -12.91%, rgba(100, 26, 185, 0.34) 184.24%)'
                        : 'rgba(107, 114, 128, 0.34)',
                      border: '2px solid #EE7AF4',
                    }}
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
                    className={`flex h-7 w-7 cursor-pointer items-center justify-center transition-all duration-200 hover:scale-110 sm:h-9 sm:w-9 ${
                      canScrollNext ? '' : 'cursor-not-allowed opacity-50'
                    }`}
                    onClick={handleNext}
                    disabled={!canScrollNext}
                    aria-label="Next slide"
                    style={{
                      background: canScrollNext
                        ? 'linear-gradient(90deg, rgba(102, 27, 181, 0.34) -222.58%, rgba(199, 46, 239, 0.34) -12.91%, rgba(100, 26, 185, 0.34) 184.24%)'
                        : 'rgba(107, 114, 128, 0.34)',
                      border: '2px solid #EE7AF4',
                    }}
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
                    // Live Casino Provider Card
                    <div
                      onClick={() => handleProviderClick(provider)}
                      className={`group flex w-full cursor-pointer flex-col transition-all duration-300 ${
                        !provider.isLive ? 'cursor-not-allowed' : ''
                      }`}
                    >
                      {/* Card with border and padding */}
                      <div
                        className="relative flex w-full flex-col overflow-hidden transition-all duration-300"
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor = '#D61324';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.borderColor =
                            'rgba(251, 99, 33, 0.30)';
                        }}
                      >
                        {/* Background image layer */}
                        <div className="relative bg-transparent">
                          <div className="relative flex items-center justify-center overflow-hidden rounded-[5px]">
                            <LazyImage
                              src={provider.background}
                              alt={`${provider.name} background`}
                              width={300}
                              height={225}
                              className="h-auto w-full object-contain"
                              quality={85}
                            />
                            {/* Hover Overlay - Only on Image */}
                            <div
                              className="absolute inset-0 z-20 opacity-0 backdrop-blur-[5px] transition-opacity duration-300 group-hover:opacity-100"
                              style={{
                                backgroundColor: 'rgba(62, 29, 136, 0.3)',
                              }}
                            />

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                              <div className="z-40 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <button
                                  type="button"
                                  className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-2 bg-black transition-colors disabled:opacity-50 sm:h-16 sm:w-16"
                                  style={{
                                    backgroundColor: '#000000',
                                    borderColor: '#EE7AF4',
                                  }}
                                  disabled={isLaunching(provider.id)}
                                >
                                  {isLaunching(provider.id) ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#EE7AF4] border-t-transparent" />
                                  ) : (
                                    <svg
                                      className="h-4 w-4 sm:h-6 sm:w-6"
                                      fill="#EE7AF4"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* Background Pattern */}
                            <div
                              className="absolute inset-0 opacity-10"
                              style={{
                                clipPath:
                                  'polygon(0px 0%, calc(100% - 15px) 0%, 100% 15px, 100% calc(100% - 0px), calc(100% - 15px) 100%, 15px 100%, 0% calc(100% - 15px), 0% 15px)',
                              }}
                            >
                              <div className="absolute top-2 right-2 h-8 w-8 rounded-full border border-purple-400" />
                              <div className="absolute bottom-2 left-2 h-6 w-6 rounded-full border border-purple-400" />
                              <div className="absolute top-1/2 left-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform rounded-full border border-purple-400" />
                            </div>
                          </div>
                        </div>

                        {/* Provider Name - Inside the border container */}
                        <div className="relative z-10 mt-2 text-center">
                          <span className="text-sm font-bold text-white uppercase sm:text-base">
                            {provider.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Arcade Provider Card (similar to slot providers)
                    <div
                      onClick={() => handleProviderClick(provider)}
                      className="group relative w-full overflow-hidden rounded-[5px] shadow-sm transition-all duration-300"
                    >
                      <div className="relative w-full rounded-[5px]">
                        <div className="flex items-center justify-center">
                          <LazyImage
                            src={`${baseUrl}/icons/${provider.icon}`}
                            alt={provider.name}
                            width={200}
                            height={150}
                            className="h-auto w-full rounded-[5px] object-contain transition-transform duration-300"
                            quality={85}
                          />
                        </div>
                        {/* Hover Overlay with backdrop blur */}
                        <div
                          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 rounded-[5px] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[5px]"
                          style={{
                            backgroundColor: 'rgba(62, 29, 136, 0.3)',
                          }}
                        >
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
                            className="rounded-[5px] border-2 px-10 py-2 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110"
                            style={{
                              backgroundColor: '#000000',
                              borderColor: '#EE7AF4',
                            }}
                          >
                            {t('play')}
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
