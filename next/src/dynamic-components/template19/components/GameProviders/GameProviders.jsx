'use client';

import useEmblaCarousel from 'embla-carousel-react';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template19/components/LazyImage/LazyImage';
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
  const [currentPerPage, setCurrentPerPage] = useState(7);
  const [slideWidth, setSlideWidth] = useState('calc((100% - 96px) / 7)');

  const dispatch = useDispatch();
  const { allProvidersData, selectedProviderId } = useSelector(
    (state) => state.website,
  );

  const providesNames = {
    pragmatic_slot:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/slot-gp-1.svg',
    thebighit:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/slot-gp-11.png',
    MICRO_Slot:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/slot-gp-5.svg',
    booongo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/slot-gp-8.png',
    PLAYNGO: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/slot-gp-9.png',
    habanero: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/slot-gp-10.png',
    TOMHORN_SLOT:
      'https://d3emlo5tm9es2f.cloudfront.net/next/logos/slot-gp-4.svg',
    // playson: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/slot-gp-7.png',
    cq9: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/slot-gp-2.svg',
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

  // Responsive perPage calculation and slide width
  useEffect(() => {
    const checkResponsive = () => {
      const width = window.innerWidth;
      const gap = 16; // 16px gap between cards

      if (width >= 1536) {
        setCurrentPerPage(7);
        setSlideWidth(`calc((100% - ${gap * 6}px) / 7)`);
      } else if (width >= 1280) {
        setCurrentPerPage(6);
        setSlideWidth(`calc((100% - ${gap * 5}px) / 6)`);
      } else if (width >= 1024) {
        setCurrentPerPage(5);
        setSlideWidth(`calc((100% - ${gap * 4}px) / 5)`);
      } else if (width >= 768) {
        setCurrentPerPage(4);
        setSlideWidth(`calc((100% - ${gap * 3}px) / 4)`);
      } else if (width >= 640) {
        setCurrentPerPage(3);
        setSlideWidth(`calc((100% - ${gap * 2}px) / 3)`);
      } else {
        setCurrentPerPage(2);
        setSlideWidth(`calc((100% - ${gap}px) / 2)`);
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

  return (
    <section className="w-full border-b-6 border-[#F25307] bg-[#42339F] py-3 md:py-10">
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="px-8 sm:px-10 md:px-12">
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
                      className={`flex h-[100px] cursor-pointer items-center justify-center rounded-lg bg-[#221756] px-3 transition-all duration-200 sm:h-[100px] md:h-[100px] ${
                        (provider.isAllGames && selectedProviderId === null) ||
                        (!provider.isAllGames &&
                          selectedProviderId === provider.id)
                          ? 'border border-[#D3AF37]'
                          : ''
                      }`}
                      style={{
                        boxShadow:
                          (provider.isAllGames &&
                            selectedProviderId === null) ||
                          (!provider.isAllGames &&
                            selectedProviderId === provider.id)
                            ? '0 0 10px 0 #FC7E09 inset'
                            : 'none',
                      }}
                      onClick={() => handleCardClick(provider.id)}
                    >
                      {provider.isAllGames ? (
                        <span className="text-lg font-semibold text-white sm:text-xl md:text-2xl">
                          {provider.text}
                        </span>
                      ) : (
                        <LazyImage
                          src={provider.logo}
                          alt={t('game_provider')}
                          width={140}
                          height={48}
                          className="h-8 w-auto max-w-[140px] object-contain sm:h-9 md:h-10"
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
                className={`absolute top-1/2 left-0 z-10 flex h-8 w-6 -translate-y-1/2 items-center justify-center rounded-sm transition-colors duration-200 sm:h-10 sm:w-6 ${
                  canScrollPrev
                    ? 'bg-[#D3AF37] hover:bg-orange-600'
                    : 'cursor-not-allowed bg-gray-400'
                }`}
                onClick={handlePrev}
                disabled={!canScrollPrev}
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
                aria-label={t('next_providers')}
                className={`absolute top-1/2 right-0 z-10 flex h-8 w-6 -translate-y-1/2 items-center justify-center rounded-sm transition-colors duration-200 sm:h-10 sm:w-6 ${
                  canScrollNext
                    ? 'bg-[#D3AF37] hover:bg-orange-600'
                    : 'cursor-not-allowed bg-gray-400'
                }`}
                onClick={handleNext}
                disabled={!canScrollNext}
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default GameProviders;
