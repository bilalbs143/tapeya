'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import CategoryGamesSlider from '@/dynamic-components/template13/components/CategoryGamesSlider/CategoryGamesSlider';
import LazyImage from '@/dynamic-components/template13/components/LazyImage/LazyImage';
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

  // Sports providers data - using Sports-1-5-up.png to Sports-9-5-up.png
  const sportsProviders = [
    {
      key: 'sports-1',
      name: 'SBO Sportsbook',
      provider: 'Sports',
      icon: 'Sports-1-5-up.png',
      logo: 'SBOBET.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-1-5-up.png',
      isLive: false,
    },
    {
      key: 'sports-2',
      name: 'SBO Sportsbook Wap',
      provider: 'Sports',
      icon: 'Sports-2-5-up.png',
      logo: 'SBOBET.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-2-5-up.png',
      isLive: false,
    },
    {
      key: 'sports-3',
      name: 'Saba Sports',
      provider: 'Sports',
      icon: 'Sports-3-5-up.png',
      logo: 'SABA-SPORTS.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-3-5-up.png',
      isLive: false,
    },
    {
      key: 'sports-4',
      name: 'AFB Sports',
      provider: 'Sports',
      icon: 'Sports-4-5-up.png',
      logo: 'AFB.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-4-5-up.png',
      isLive: false,
    },
    {
      key: 'sports-5',
      name: 'BTI Sports',
      provider: 'Sports',
      icon: 'Sports-5-5-up.png',
      logo: 'BTI-SPORTS.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-5-5-up.png',
      isLive: false,
    },
    {
      key: 'sports-6',
      name: 'Panda Sports',
      provider: 'Sports',
      icon: 'Sports-6-5-up.png',
      logo: 'PANDA-SPORTS.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-6-5-up.png',
      isLive: false,
    },
    {
      key: 'sports-7',
      name: 'Lucky Sports',
      provider: 'Sports',
      icon: 'Sports-7-5-up.png',
      logo: 'LUCKY-SPORTS.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-7-5-up.png',
      isLive: false,
    },
    {
      key: 'sports-8',
      name: 'AP Gaming',
      provider: 'Sports',
      icon: 'Sports-8-5-up.png',
      logo: 'ap-gaming.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/Sports-8-5-up.png',
      isLive: false,
    },
  ];

  // Virtual Sports providers data - using VSports-1-5-up.png
  const virtualSportsProviders = [
    {
      key: 'virtual-sports-1',
      name: 'SBO Virtual Sports',
      provider: t('virtual_sports', 'Virtual Sports'),
      icon: 'VSports-1-5-up.png',
      logo: 'SBOBET.png',
      background: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/VSports-1-5-up.png',
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
          src={`${baseUrl}/backgrounds/sports-top-banner-5.png`}
          alt={t('sports_top_banner', 'Sports Top Banner')}
          width={1920}
          height={400}
          className="hidden h-auto w-full object-cover md:block"
          sizes="100vw"
          priority={true}
        />

        {/* Mobile Banner - Only visible on mobile (<=768px) */}
        <Image
          src={`${baseUrl}/backgrounds/sports-top-banner-mob-5.png`}
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
            className="flex flex-wrap items-center gap-2 rounded-[5px] border px-2 py-2 md:flex-nowrap md:justify-between md:gap-3 md:px-3 md:py-3"
            style={{
              border: '1px solid #00374A',
              background: 'transparent',
            }}
          >
            {/* Left Side: Back Button + Title */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Back Button */}
              <button
                onClick={() => router.push('/')}
                className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-[5px] transition-colors hover:opacity-80 sm:h-[36px] sm:w-[36px] md:h-[40px] md:w-[40px]"
                style={{ backgroundColor: '#20C5FE' }}
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
            <div className="relative flex w-full flex-1 items-center gap-2 md:w-auto md:flex-initial md:gap-3">
              {/* Search */}
              <div
                className="flex h-[32px] flex-1 items-center gap-2 px-2 sm:h-[36px] sm:px-3 md:h-[40px] md:w-[190px] md:flex-none"
                style={{
                  border: '1px solid #00374A',
                  borderRadius: '5px',
                  background: 'transparent',
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
                    stroke="#20C5FE"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              {/* Category Dropdown */}
              <div className="relative flex-shrink-0">
                <UiSelect
                  value={category}
                  onValueChange={(val) => {
                    router.push(`/sports?q=${val}`);
                  }}
                >
                  <SelectTrigger className="relative flex h-[32px] min-w-[90px] items-center justify-between rounded-[5px] border border-[#00374A] bg-transparent px-2 pr-7 text-[10px] text-white shadow-none focus:border-[#20C5FE] focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[36px] sm:min-w-[110px] sm:px-2.5 sm:pr-8 sm:text-xs md:h-[40px] md:min-w-[160px] md:px-3 md:text-sm [&_svg]:text-[#20C5FE]">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent
                    className="z-50 max-h-[200px] w-full border-[#00374A] bg-[#001724]"
                    side="bottom"
                    align="start"
                  >
                    <SelectItem
                      value="sports"
                      className="text-white capitalize hover:bg-[#20C5FE] hover:text-black"
                    >
                      {t('sports') || 'Sports'}
                    </SelectItem>
                    <SelectItem
                      value="virtual"
                      className="text-white capitalize hover:bg-[#20C5FE] hover:text-black"
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
                borderColor: '#00374A',
                background: 'transparent',
              }}
            >
              <p className="text-xl font-semibold text-[#20C5FE] md:text-2xl">
                {t('coming_soon')}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
            {filteredProviders.map((provider, index) => (
              <motion.div
                key={provider.key}
                className="group relative w-full overflow-hidden !rounded-[5px] border bg-black/20 shadow-sm transition-all duration-300 hover:border-[rgb(0,55,74)] hover:shadow-[0_0_10px_0_#FC7E09_inset]"
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: index * 0.025,
                }}
                style={{ willChange: 'opacity, transform', border: '1px solid rgb(0, 55, 74)' }}
              >
                <div className="relative w-full bg-transparent">
                  <div className="flex items-center justify-center">
                    <LazyImage
                      src={provider.background}
                      alt={provider.name}
                      width={200}
                      height={150}
                      className="h-auto w-full rounded-none object-contain transition-transform duration-300"
                      quality={85}
                      unoptimized
                    />
                  </div>
                  {/* Hover Overlay - Only on Image */}
                  <div className="absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#20c5fe73] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[5px]">
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
                      onClick={() => handleSportsClick(provider)}
                      className="rounded-[5px] border-2 border-[#00374A] bg-[#00111A] px-10 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110"
                    >
                      {t('play', 'PLAY')}
                    </button>
                  </div>
                </div>
              </motion.div>
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
