'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import LazyImage from '@/dynamic-components/template14/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

function TopSlotProvider() {
  const { t } = useTranslations();
  const router = useRouter();

  // Top Slot Providers with new S3 image links
  const slotProviders = [
    {
      key: 'pragmatic_slot',
      name: 'Pragmatic Play',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/tsp-1-5.webp',
    },
    {
      key: 'thebighit',
      name: 'The Big Hit',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/tsp-2-5.webp',
    },
    {
      key: 'cq9',
      name: 'CQ9 Gaming',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/tsp-3-5.webp',
    },
    {
      key: 'booongo',
      name: 'Bcoongo',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/tsp-4-5.webp',
    },
  ];

  const handleProviderClick = (provider) => {
    router.push('/slot-providers?q=slots');
  };

  const handleViewMore = () => {
    router.push('/slots');
  };

  return (
    <section className="relative pt-6 md:pt-10">
      <div
        className="container mx-auto rounded-[5px] border px-2 py-2 md:px-6 md:py-6"
        style={{ borderColor: 'rgba(251, 99, 33, 0.30)' }}
      >
        {/* Header */}
        <div className="mb-6 w-full">
          <h3
            className="text-[18px] font-semibold tracking-wide text-white uppercase md:text-[20px]"
            style={{ fontFamily: 'var(--font-alatsi)' }}
          >
            {t('top_slot_providers') || 'Top Slot Providers'}
          </h3>
        </div>

        {/* Provider Cards - Static Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {slotProviders.map((provider) => (
            <div
              key={provider.key}
              className="group relative w-full cursor-pointer overflow-hidden rounded-[5px] transition-all duration-300"
              onClick={() => handleProviderClick(provider)}
            >
              <LazyImage
                src={provider.image}
                alt={`${provider.name} background`}
                width={300}
                height={280}
                className="h-auto w-full"
                quality={85}
              />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          ))}

          {/* View More Card - Hidden on mobile */}
          <div
            className="group relative hidden w-full cursor-pointer overflow-hidden rounded-[5px] transition-all duration-300 md:block"
            onClick={handleViewMore}
          >
            <LazyImage
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/tp-view-5.webp"
              alt="View More"
              width={300}
              height={280}
              className="h-auto w-full"
              quality={85}
            />
            {/* View More Text Overlay */}
            <div className="absolute top-1/2 left-4 z-10 -translate-y-1/2">
              <div
                className="flex flex-col text-[20px] font-bold text-white italic"
                style={{
                  textShadow: '0 4px 10px rgba(244, 94, 42, 0.51)',
                  WebkitTextStrokeWidth: '1px',
                  WebkitTextStrokeColor: '#D61324',
                }}
              >
                <span>VIEW</span>
                <span>MORE</span>
              </div>
            </div>
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </div>
        </div>

        {/* See All Button - Mobile Only */}
        <button
          onClick={handleViewMore}
          className="mt-4 w-full rounded-[5px] bg-[#D61324] py-3 text-center text-base font-semibold text-white transition-colors duration-200 hover:bg-[#D61324]/90 md:hidden"
        >
          {t('view_all') || 'View All'}
        </button>
      </div>
    </section>
  );
}

export default TopSlotProvider;
