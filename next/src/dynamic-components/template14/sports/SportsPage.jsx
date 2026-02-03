'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import CategoryGamesSlider from '@/dynamic-components/template14/components/CategoryGamesSlider/CategoryGamesSlider';
import LazyImage from '@/dynamic-components/template14/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';

function SportsPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('q') || 'sports'; // Default to 'sports'

  // Base URL for images
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  const [searchQuery, setSearchQuery] = useState('');

  // Sports providers data - using Sports-1-7.png to Sports-9-7.png
  const sportsProviders = [
    {
      key: 'sports-1',
      name: 'SBOBET',
      provider: 'Sports',
      icon: 'Sports-1-7.png',
      logo: 'SBOBET.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-1-7.png',
      isLive: false,
    },
    {
      key: 'sports-2',
      name: '568WIN',
      provider: 'Sports',
      icon: 'Sports-2-7.png',
      logo: '568WIN.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-2-7.png',
      isLive: false,
    },
    {
      key: 'sports-3',
      name: 'Funky Games',
      provider: 'Sports',
      icon: 'Sports-3-7.png',
      logo: 'FUNKY-GAMES.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-3-7.png',
      isLive: false,
    },
    {
      key: 'sports-4',
      name: 'AFB',
      provider: 'Sports',
      icon: 'Sports-4-7.png',
      logo: 'AFB.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-4-7.png',
      isLive: false,
    },
    {
      key: 'sports-5',
      name: 'Saba Sports',
      provider: 'Sports',
      icon: 'Sports-5-7.png',
      logo: 'SABA-SPORTS.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-5-7.png',
      isLive: false,
    },
    {
      key: 'sports-6',
      name: 'VGaming',
      provider: 'Sports',
      icon: 'Sports-6-7.png',
      logo: 'VGAMING.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-6-7.png',
      isLive: false,
    },
    {
      key: 'sports-7',
      name: 'BTI Sports',
      provider: 'Sports',
      icon: 'Sports-7-7.png',
      logo: 'BTI-SPORTS.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-7-7.png',
      isLive: false,
    },
    {
      key: 'sports-8',
      name: 'Panda Sports',
      provider: 'Sports',
      icon: 'Sports-8-7.png',
      logo: 'PANDA-SPORTS.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-8-7.png',
      isLive: false,
    },
    {
      key: 'sports-9',
      name: 'Lucky Sports',
      provider: 'Sports',
      icon: 'Sports-9-7.png',
      logo: 'LUCKY-SPORTS.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-9-7.png',
      isLive: false,
    },
  ];

  // Virtual Sports providers data - using VSports-1-7.png
  const virtualSportsProviders = [
    {
      key: 'virtual-sports-1',
      name: 'Saba Virtual Sports',
      provider: t('virtual_sports', 'Virtual Sports'),
      icon: 'VSports-1-7.png',
      logo: 'SABA-SPORTS.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/VSports-1-7.png',
      isLive: false,
    },
  ];

  // Determine which providers to display based on query parameter
  const { providers, pageTitle, pageAltText } = useMemo(() => {
    switch (category) {
      case 'virtual':
        return {
          providers: virtualSportsProviders,
          pageTitle: t('virtual_sports', 'Virtual Sports'),
          pageAltText: t('virtual_sports_providers', 'Virtual Sports Providers'),
        };
      case 'sports':
      default:
        return {
          providers: sportsProviders,
          pageTitle: t('sports', 'Sports'),
          pageAltText: 'Sports Providers',
        };
    }
  }, [category, sportsProviders, virtualSportsProviders, t]);

  const handleSportsClick = (provider) => {
    // Redirect to sports-games page with category
    router.push(`/sports-games?category=${category}`);
  };

  const filteredProviders = useMemo(() => {
    if (!searchQuery) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter((p) =>
      [p.name, p.provider].some((v) => (v || '').toLowerCase().includes(q)),
    );
  }, [providers, searchQuery]);

  return (
    <div className="text-white">
      {/* Sports Top Banner */}
      <div className="relative w-full overflow-hidden">
        {/* Desktop Banner - Hidden on mobile (<=768px) */}
        <Image
          src={`${baseUrl}/backgrounds/sports-top-banner-7.png`}
          alt={t('sports_top_banner', 'Sports Top Banner')}
          width={1920}
          height={400}
          className="hidden h-auto w-full object-cover md:block"
          sizes="100vw"
          priority={true}
        />

        {/* Mobile Banner - Only visible on mobile (<=768px) */}
        <Image
          src={`${baseUrl}/backgrounds/sports-top-banner-mob-7.png`}
          alt={t('sports_top_banner', 'Sports Top Banner')}
          width={1920}
          height={400}
          className="block h-auto w-full object-cover md:hidden"
          sizes="100vw"
          priority={true}
        />
      </div>
      <div className="container mx-auto py-8">
        {/* Header with Back Button, Title, Search, and Category Dropdown */}
        <div className="mb-6 w-full">
          <div
            className="relative z-20 flex items-center justify-between gap-2 overflow-visible px-2 py-2 md:gap-3 md:px-3 md:py-3"
            style={{
              border: '1px solid #7351FF',
              borderRadius: '5px',
              background: '#1E1451',
            }}
          >
            {/* Left Side: Back Button + Title */}
            <div className="flex min-w-0 flex-1 items-center gap-1.5 md:gap-3">
              {/* Back Button */}
              <button
                onClick={() => router.push('/')}
                className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-[5px] transition-colors hover:opacity-80 sm:h-[36px] sm:w-[36px] md:h-[40px] md:w-[40px]"
                style={{ backgroundColor: '#7351FF' }}
                aria-label="Go to home"
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
                  className="md:h-6 md:w-6"
                >
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Title */}
              <h3
                className="flex-shrink-0 text-[12px] font-semibold tracking-wide whitespace-nowrap text-white uppercase md:text-[22px]"
                style={{ fontFamily: 'var(--font-urbanist)' }}
              >
                {/* Mobile: Show shorter title */}
                <span className="block md:hidden">
                  {category === 'virtual'
                    ? t('virtual_sports', 'Virtual Sports')
                    : t('sports', 'Sports')}
                </span>
                {/* Desktop: Show full title */}
                <span className="hidden md:block">{pageTitle}</span>
              </h3>
            </div>

            {/* Right Side: Search + Category Dropdown */}
            <div className="relative z-30 flex w-full flex-1 items-center gap-2 md:w-auto md:flex-initial md:gap-3">
              {/* Search */}
              <div
                className="flex h-[32px] flex-1 items-center gap-2 px-2 sm:h-[36px] sm:px-3 md:h-[40px] md:w-[190px] md:flex-none"
                style={{
                  border: '1px solid #7351FF',
                  borderRadius: '5px',
                  background: 'rgba(27, 25, 76, 0.4)',
                }}
              >
                <input
                  type="text"
                  placeholder={t('search_providers')}
                  className="w-full min-w-0 bg-transparent text-[10px] text-white outline-none placeholder:text-[#9CA3AF] sm:text-xs md:text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 23 23"
                  fill="none"
                  className="flex-shrink-0 sm:h-[20px] sm:w-[20px] md:h-[23px] md:w-[23px]"
                >
                  <path
                    d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                    stroke="#6f1dbe"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Category Dropdown */}
              <div className="relative z-30 flex-shrink-0">
                <UiSelect
                  value={category}
                  onValueChange={(val) => {
                    router.push(`/sports?q=${val}`);
                  }}
                >
                  <SelectTrigger className="relative flex h-[32px] min-w-[90px] items-center justify-between rounded-[5px] border border-[#7351FF] bg-transparent px-2 pr-7 text-[10px] text-white shadow-none focus:border-[#ED7AF3] focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[36px] sm:min-w-[110px] sm:px-2.5 sm:pr-8 sm:text-xs md:h-[40px] md:min-w-[160px] md:px-3 md:text-sm [&_svg]:text-[#ED7AF3]">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-50 max-h-[200px] w-full border-[#7351FF] bg-[#1E1451]"
                    side="bottom"
                    align="start"
                  >
                    <SelectItem
                      value="sports"
                      className="text-white capitalize hover:bg-[#ED7AF3] hover:text-black"
                    >
                      {t('sports') || 'Sports'}
                    </SelectItem>
                    <SelectItem
                      value="virtual"
                      className="text-white capitalize hover:bg-[#ED7AF3] hover:text-black"
                    >
                      {t('virtual_sports') || 'Virtual Sports'}
                    </SelectItem>
                  </SelectContent>
                </UiSelect>
              </div>
            </div>
          </div>
        </div>

        {/* Sports Providers Grid */}
        {filteredProviders.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div
              className="rounded-[5px] border px-8 py-6 text-center"
              style={{
                borderColor: '#7351FF',
                background: 'transparent',
              }}
            >
              <p className="text-xl font-semibold text-[#ED7AF3] md:text-2xl">
                {t('coming_soon')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredProviders.map((provider) => (
              <div
                key={provider.key}
                onClick={() => handleSportsClick(provider)}
                className={`group relative w-full overflow-hidden rounded-[5px] border border-transparent bg-black/20 shadow-sm transition-all duration-300 ${
                  !provider.isLive ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}
              >
                <div className="relative w-full bg-transparent">
                  <div className="flex min-h-[150px] items-center justify-center">
                    <LazyImage
                      src={provider.background}
                      alt={provider.name}
                      width={200}
                      height={150}
                      className="h-auto w-full object-contain transition-transform duration-300"
                      quality={85}
                      unoptimized
                    />
                  </div>
                  {/* Hover Overlay with backdrop blur */}
                  <div
                    className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 rounded-[5px] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[5px]"
                    style={{
                      backgroundColor: 'rgba(62, 29, 136, 0.3)',
                    }}
                  >
                    {provider.logo && (
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
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSportsClick(provider);
                      }}
                      className="rounded-[5px] border-2 px-10 py-2 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 disabled:opacity-50"
                      style={{
                        backgroundColor: '#000000',
                        borderColor: '#EE7AF4',
                      }}
                      disabled={!provider.isLive}
                    >
                      {t('play')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Category-based Games Slider */}
        <div className="container mx-auto py-8">
          <CategoryGamesSlider category="slots" />
        </div>
      </div>
    </div>
  );
}

export default SportsPage;
