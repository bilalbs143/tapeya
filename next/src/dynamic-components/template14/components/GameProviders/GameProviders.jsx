'use client';

import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template14/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllProvider } from '@/website/websiteAction';
import { setSelectedProviderId } from '@/website/websiteSlice';

function GameProviders() {
  const { t } = useTranslations();
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    loop: true,
    skipSnaps: false,
    dragFree: false,
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [autoplayInterval, setAutoplayInterval] = useState(null);
  const [currentPerPage, setCurrentPerPage] = useState(3);
  const [slideWidth, setSlideWidth] = useState('calc((100% - 32px) / 3)');

  const dispatch = useDispatch();
  const { allProvidersData, selectedProviderId } = useSelector(
    (state) => state.website,
  );

  const providesNames = {
    'Pragmatic Play':
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-6-5.png',
    thebighit: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/bighit-5.png',
    Micro: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-21-5.png',
    booongo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/boongo-6.png',
    PLAYNGO: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-17-5.png',
    habanero: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-9-5.png',
    TOMHORN_SLOT:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tomhorm-6.png',
    cq9: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-18-5-1.png',
    gtf: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gtf-6.png',
    spade: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-7-5.png',
    yellowbat:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/yellowbet-6.png',
    advantplay: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-10-5.png',
    askmeslot: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/askme-6.png',
    bgaming: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/bgaming-6.png',
    gpk7mj: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/mojos-6.png',
    booming: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/tp-15-5.png',
    spinomenal:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/spinomenal-6.png',
    dbgame: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/db-gaming-6.png',
    live22: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/live22-6.png',
    cg: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/CG-6.png',
    thunderkick:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/thunderkirk-6.png',
  };

  // Function to create dynamic providers array from API data
  const createDynamicProviders = () => {
    if (!allProvidersData || !Array.isArray(allProvidersData)) {
      return [{ id: 1, isAllGames: true, text: t('all_games') }];
    }

    const dynamicProviders = [
      { id: 1, isAllGames: true, text: t('all_games') },
    ];

    // Iterate through providesNames in the defined order to maintain order
    Object.entries(providesNames).forEach(([providerKey, logoPath]) => {
      // Find matching provider in API data by exact name match
      const matchingProvider = allProvidersData.find(
        (provider) => provider.name.toLowerCase() === providerKey.toLowerCase(),
      );

      if (matchingProvider) {
        dynamicProviders.push({
          id: matchingProvider.id,
          logo: logoPath,
        });
      }
    });

    return dynamicProviders;
  };
  const providers = createDynamicProviders();

  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  // Handle card click
  const handleCardClick = (providerId) => {
    // If "All Games" is selected (id: 1), clear the provider filter
    if (providerId === 1) {
      dispatch(setSelectedProviderId(null));
    } else {
      // Set the selected provider ID for filtering
      dispatch(setSelectedProviderId(providerId));
    }
  };

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

  // Autoplay functionality
  useEffect(() => {
    if (!emblaApi) return;

    const startAutoplay = () => {
      const intervalId = setInterval(() => {
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          // Don't loop back to start, just stop
          clearInterval(intervalId);
          setAutoplayInterval(null);
        }
      }, 3000);
      setAutoplayInterval(intervalId);
    };

    const stopAutoplay = () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
        setAutoplayInterval(null);
      }
    };

    // Pause on mouse enter
    const container = emblaApi.rootNode();
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);

    startAutoplay();

    return () => {
      container.removeEventListener('mouseenter', stopAutoplay);
      container.removeEventListener('mouseleave', startAutoplay);
      stopAutoplay();
    };
  }, [emblaApi]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoplayInterval) {
        clearInterval(autoplayInterval);
      }
    };
  }, [autoplayInterval]);

  // Responsive slide width calculation
  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      const gap = 16; // 16px gap between cards

      if (width >= 768) {
        // Desktop: show 5 cards
        setCurrentPerPage(5);
        setSlideWidth(`calc((100% - ${gap * 4}px) / 5)`);
      } else {
        // Mobile: show 3 cards
        setCurrentPerPage(3);
        setSlideWidth(`calc((100% - ${gap * 2}px) / 3)`);
      }
    };

    checkResponsive();
    window.addEventListener('resize', checkResponsive);
    return () => window.removeEventListener('resize', checkResponsive);
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    if (emblaApi) {
      emblaApi.scrollPrev();
    }
  };

  const handleNext = () => {
    if (emblaApi) {
      emblaApi.scrollNext();
    }
  };

  const isActive = (provider) => {
    return (
      (provider.isAllGames && selectedProviderId === null) ||
      (!provider.isAllGames && selectedProviderId === provider.id)
    );
  };

  return (
    <section className="w-full pt-3 md:pt-6">
      <div className="container mx-auto">
        <div
          className="relative rounded-[5px]"
          style={{
            border: '1px solid rgba(251, 99, 33, 0.30)',
          }}
        >
          <div className="px-4 py-3 sm:px-10 sm:py-4 md:px-12">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className="min-w-0 flex-shrink-0"
                    style={{
                      width: slideWidth,
                      marginRight: '16px',
                    }}
                  >
                    <div
                      className="flex h-[70px] cursor-pointer items-center justify-center rounded-[5px] px-2 transition-all duration-200 sm:h-[100px] sm:px-3 md:h-[100px]"
                      style={{
                        border: '1px solid rgba(251, 99, 33, 0.30)',
                        backgroundColor: isActive(provider)
                          ? 'rgba(67, 2, 1, 0.64)'
                          : 'transparent',
                      }}
                      onClick={() => handleCardClick(provider.id)}
                    >
                      {provider.isAllGames ? (
                        <span className="text-sm font-semibold text-white sm:text-xl md:text-2xl">
                          {provider.text}
                        </span>
                      ) : (
                        <LazyImage
                          src={provider.logo}
                          alt={t('game_provider')}
                          width={140}
                          height={48}
                          className="h-6 w-auto max-w-[100px] object-contain sm:h-9 sm:max-w-[140px] md:h-10"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Only show navigation buttons if we have more providers than can fit */}
          {providers.length > currentPerPage && (
            <>
              <button
                aria-label={t('previous_providers')}
                className={`absolute top-1/2 left-2 z-10 flex h-8 w-6 -translate-y-1/2 items-center justify-center rounded-sm transition-opacity duration-200 sm:h-10 sm:w-6 ${
                  canScrollPrev
                    ? 'opacity-100 hover:opacity-80'
                    : 'cursor-not-allowed opacity-40'
                }`}
                onClick={handlePrev}
                disabled={!canScrollPrev}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="21"
                  viewBox="0 0 13 21"
                  fill="none"
                >
                  <path
                    d="M0.58609 8.76135L8.75766 0.589781C10.0176 -0.670149 12.1719 0.222184 12.1719 2.00399V18.3471C12.1719 20.129 10.0176 21.0213 8.75766 19.7614L0.586088 11.5898C-0.19496 10.8087 -0.194959 9.5424 0.58609 8.76135Z"
                    fill="#D61324"
                  />
                </svg>
              </button>

              <button
                aria-label={t('next_providers')}
                className={`absolute top-1/2 right-2 z-10 flex h-8 w-6 -translate-y-1/2 items-center justify-center rounded-sm transition-opacity duration-200 sm:h-10 sm:w-6 ${
                  canScrollNext
                    ? 'opacity-100 hover:opacity-80'
                    : 'cursor-not-allowed opacity-40'
                }`}
                onClick={handleNext}
                disabled={!canScrollNext}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="13"
                  height="21"
                  viewBox="0 0 13 21"
                  fill="none"
                >
                  <path
                    d="M11.5858 11.5898L3.41421 19.7614C2.15428 21.0213 0 20.129 0 18.3471L0 2.004C0 0.222185 2.15429 -0.670147 3.41422 0.589783L11.5858 8.76135C12.3668 9.5424 12.3668 10.8087 11.5858 11.5898Z"
                    fill="#D61324"
                  />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default GameProviders;
