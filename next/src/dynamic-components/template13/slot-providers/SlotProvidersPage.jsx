'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CategoryGamesSlider from '@/dynamic-components/template13/components/CategoryGamesSlider/CategoryGamesSlider';
import LazyImage from '@/dynamic-components/template13/components/LazyImage/LazyImage';
import LiveCasinoSlider from '@/dynamic-components/template13/components/LiveCasinoSlider/LiveCasinoSlider';
import { useTranslations } from '@/hooks/useTranslations';
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { fetchAllProvider } from '@/website/websiteAction.js';
import { setSelectedProviderId } from '@/website/websiteSlice.js';

export default function SlotProvidersPage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('q') || 'slots'; // Default to 'slots'

  const { allProvidersData } = useSelector((state) => state.website);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Base URL already used across the site
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  // Function to get provider ID from API data by matching key
  const getProviderId = (providerKey) => {
    if (!allProvidersData || !Array.isArray(allProvidersData)) {
      return null;
    }

    const matchingProvider = allProvidersData.find(
      (apiProvider) =>
        apiProvider.name.toLowerCase() === providerKey.toLowerCase(),
    );

    return matchingProvider ? matchingProvider.id : null;
  };

  // Handle play button click
  const handlePlayClick = (provider) => {
    if (provider.isLive && provider.id) {
      dispatch(setSelectedProviderId(provider.id));
      router.push(`/slots?category=${category}`);
    } else {
      toast.info(t('coming_soon'));
    }
  };

  // Slot Providers data with dynamic IDs
  const slotProviders = [
    {
      key: 'pragmatic_slot',
      id: getProviderId('pragmatic_slot'),
      icon: 'sp-2-5.webp',
      logo: 'pragmatic-play.png',
      name: 'Pragmatic play',
      isLive: true,
    },
    {
      key: 'MICRO_Slot',
      id: getProviderId('MICRO_Slot'),
      icon: 'sp-4-5.webp',
      logo: 'microgaming.png',
      name: 'Microgaming',
      isLive: true,
    },
    {
      key: 'booongo',
      id: getProviderId('booongo'),
      icon: 'sp-5-5.webp',
      logo: 'bongo.png',
      name: 'Booongo',
      isLive: true,
    },
    {
      key: 'PLAYNGO',
      id: getProviderId('PLAYNGO'),
      icon: 'sp-6-5.webp',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: true,
    },
    {
      key: 'habanero',
      id: getProviderId('habanero'),
      icon: 'sp-7-5.webp',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: true,
    },
    {
      key: 'TOMHORN_SLOT',
      id: getProviderId('TOMHORN_SLOT'),
      icon: 'sp-8-5.webp',
      logo: 'tomhorn.png',
      name: 'Tom Horn Gaming',
      isLive: true,
    },
    {
      key: 'cq9',
      id: getProviderId('cq9'),
      icon: 'sp-9-5.webp',
      logo: 'cq9.png',
      name: 'CQ9',
      isLive: true,
    },
    {
      key: 'PGSoft',
      id: getProviderId('PGSoft'),
      icon: 'sp-10-5.webp',
      logo: 'Pocketsoft Games.png',
      name: 'Pocket Soft Gaming',
      isLive: true,
    },
    {
      key: 'redtiger',
      id: getProviderId('redtiger'),
      icon: 'sp-39-5.webp',
      logo: 'Red Tiger.png',
      name: 'Red Tiger',
      isLive: true,
    },
    {
      key: 'netent',
      id: getProviderId('netent'),
      icon: 'sp-28-5.webp',
      logo: 'netent.png',
      name: 'NetEnt',
      isLive: true,
    },
    {
      key: 'evoplay',
      id: getProviderId('evoplay'),
      icon: 'sp-18-5.webp',
      logo: 'evoplay.png',
      name: 'Evoplay',
      isLive: true,
    },
    {
      key: 'nlc',
      id: getProviderId('nlc'),
      icon: 'sp-3-5-New.webp',
      logo: 'nlc.png',
      name: 'NLC',
      isLive: true,
    },
    {
      key: 'btg',
      id: getProviderId('btg'),
      icon: 'sp-14-5.webp',
      logo: 'BTG_Logo.png',
      name: 'Big Time Gaming',
      isLive: true,
    },
  ];

  // Arcade Providers data
  const arcadeProviders = [
    {
      key: 'jdb_arcade',
      id: getProviderId('jdb_arcade'),
      icon: 'sp-22-5.webp',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: true,
    },
    {
      key: 'hacksaw_arcade',
      id: getProviderId('hacksaw_arcade'),
      icon: 'sp-20-5.webp',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: true,
    },
    {
      key: 'oriental',
      id: getProviderId('oriental'),
      icon: 'sp-17-5-New.webp',
      logo: 'Oriental.png',
      name: 'Oriental Game',
      isLive: true,
    },
    {
      key: 'fc_arcade',
      id: getProviderId('fc_arcade'),
      icon: 'sp-21-5-New.webp',
      logo: 'fc_arcade.png',
      name: 'FC Arcade',
      isLive: true,
    },
  ];

  // Hybrid Providers data
  const hybridProviders = [];

  // Determine which providers to display based on query parameter
  const { providers, pageTitle, pageAltText } = useMemo(() => {
    switch (category) {
      case 'arcade':
        return {
          providers: arcadeProviders,
          pageTitle: t('arcade', 'Arcade'),
          pageAltText: 'Arcade Games',
        };
      case 'hybrid':
        return {
          providers: hybridProviders,
          pageTitle: t('hybrid_games', 'Hybrid Games'),
          pageAltText: 'Hybrid Games',
        };
      case 'slots':
      default:
        return {
          providers: slotProviders,
          pageTitle: t('slot_providers'),
          pageAltText: 'Slot Providers',
        };
    }
  }, [category, slotProviders, arcadeProviders, hybridProviders, t]);

  const filteredProviders = useMemo(() => {
    if (!searchQuery) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter((p) =>
      [p.name, p.key].some((v) => (v || '').toLowerCase().includes(q)),
    );
  }, [searchQuery, providers]);

  return (
    <div className="text-white [&_.bg-gradient-to-t]:hidden [&_.group]:rounded-xl [&_.group]:border-0 [&_.group]:bg-transparent [&_.group]:shadow-none">
      {/* Slot Providers Hero Banner */}
      <motion.section
        className="relative mx-auto w-full overflow-hidden"
        aria-label="Live Casino Banner"
        initial={{ opacity: 0, y: 20 }}
        animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.1,
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        <div
          className="relative w-full rounded-[5px]"
          style={{ border: '1px solid #00374A' }}
        >
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-banner-5-up.webp"
            alt="Live Casino Background"
            width={1920}
            height={600}
            className="hidden w-full rounded-[5px] md:block"
            style={{ height: 'auto' }}
            priority
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-banner-mob-5-up.webp"
            alt="Live Casino Background Mobile"
            width={1920}
            height={600}
            className="block w-full rounded-[5px] md:hidden"
            style={{ height: 'auto' }}
            priority
          />

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 rounded-[3px]"
            style={{
              background:
                'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 1) 100%)',
            }}
          />

          {/* Content Overlay */}
          <div className="absolute inset-0 flex items-center justify-start px-4 md:px-6">
            <div className="w-full max-w-2xl text-left">
              <h1
                className="text-[20px] leading-tight font-bold tracking-wide text-white uppercase md:text-[35px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('slots')}
              </h1>
              <p
                className="mt-2 text-[12px] text-white/70 md:text-[16px]"
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {t('jackpot_dreams_start_here')}
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="relative z-10 pt-6">
        {/* Header */}
        <motion.div
          className="relative z-20 mb-6 w-full overflow-visible"
          initial={{ opacity: 0, y: -10 }}
          animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2,
          }}
          style={{ willChange: 'opacity, transform' }}
        >
          <div
            className="relative z-20 flex flex-wrap items-center gap-2 px-2 py-2 md:flex-nowrap md:justify-between md:gap-3 md:px-3 md:py-3"
            style={{
              border: '1px solid #00374A',
              borderRadius: '5px',
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
                style={{ fontFamily: 'var(--font-alatsi)' }}
              >
                {pageTitle}
              </h3>
            </div>

            {/* Right Side: Search + Category Dropdown */}
            <div className="relative z-30 flex w-full flex-1 items-center gap-2 md:w-auto md:flex-initial md:gap-3">
              {/* Search */}
              <div
                className="flex h-[32px] flex-1 items-center gap-2 px-2 sm:h-[36px] sm:px-3 md:h-[40px] md:w-[220px] md:flex-none"
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
              <div className="relative z-30 flex-shrink-0">
                <UiSelect
                  value={category}
                  onValueChange={(val) => {
                    if (val === 'live' || val === 'table') {
                      router.push(`/live-casino?q=${val}`);
                    } else {
                      router.push(`/slot-providers?q=${val}`);
                    }
                  }}
                >
                  <SelectTrigger className="relative flex h-[32px] min-w-[90px] items-center justify-between rounded-[5px] border border-[#00374A] bg-transparent px-2 pr-7 text-[10px] text-white shadow-none focus:border-[#20C5FE] focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[36px] sm:min-w-[110px] sm:px-2.5 sm:pr-8 sm:text-xs md:h-[40px] md:min-w-[160px] md:px-3 md:text-sm [&_svg]:text-[#20C5FE]">
                    <SelectValue
                      placeholder="Select Category"
                      className={category ? 'text-white' : 'text-[#FFFFFF66]'}
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[100] max-h-[200px] w-full border-[#00374A] bg-[#001724]"
                    side="bottom"
                    align="start"
                  >
                    <SelectItem
                      value="slots"
                      className="text-white capitalize hover:bg-[#20C5FE]"
                    >
                      {t('slots') || 'Slots'}
                    </SelectItem>
                    <SelectItem
                      value="arcade"
                      className="text-white capitalize hover:bg-[#20C5FE]"
                    >
                      {t('arcade') || 'Arcade'}
                    </SelectItem>
                    <SelectItem
                      value="hybrid"
                      className="text-white capitalize hover:bg-[#20C5FE]"
                    >
                      {t('hybrid_games') || 'Hybrid Games'}
                    </SelectItem>
                    <SelectItem
                      value="live"
                      className="text-white capitalize hover:bg-[#20C5FE]"
                    >
                      {t('casino') || 'Live Casino'}
                    </SelectItem>
                    <SelectItem
                      value="table"
                      className="text-white capitalize hover:bg-[#20C5FE]"
                    >
                      {t('table_games') || 'Table Games'}
                    </SelectItem>
                  </SelectContent>
                </UiSelect>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="relative">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <img
              src={`${baseUrl}/backgrounds/lines-pattern.svg`}
              alt="Lines Pattern"
              className="h-full w-full object-cover"
            />
          </div>

          {/* 5-column grid on large screens */}
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
                  className="group relative w-full overflow-hidden !rounded-[5px] border border-purple-500/20 bg-black/20 shadow-sm transition-all duration-300 hover:border-[#E8D25E] hover:shadow-[0_0_10px_0_#FC7E09_inset]"
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, margin: '-100px' }}
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                    delay: index * 0.025,
                  }}
                  style={{ willChange: 'opacity, transform' }}
                >
                  <div className="relative w-full bg-transparent">
                    <div className="flex items-center justify-center">
                      <LazyImage
                        src={`${baseUrl}/icons/${provider.icon}`}
                        alt={provider.name}
                        width={200}
                        height={150}
                        className="h-auto w-full rounded-none object-contain transition-transform duration-300"
                        quality={85}
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
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
                        onClick={() => handlePlayClick(provider)}
                        className="rounded-[5px] border-2 border-[#00374A] bg-[#00111A] px-10 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110"
                      >
                        PLAY
                      </button>
                    </div>
                  </div>
                  {/* Provider Name - Bottom Center */}
                  {/* <div className="pointer-events-none absolute bottom-[-4px] left-1/2 -translate-x-1/2 transform">
                  <div className="max-w-[120px] min-w-[120px] px-3 py-1 text-center text-[12px] font-bold text-white uppercase md:max-w-[170px] md:min-w-[230px] md:text-[20px]">
                    {provider.name}
                  </div>
                  </div> */}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Casino Slider */}
      <div className="container mx-auto py-8">
        <LiveCasinoSlider />
      </div>

      {/* Category-based Games Slider - Shows games from different category */}
      <div className="container mx-auto py-8">
        <CategoryGamesSlider category={category} />
      </div>

      {/* Bottom Banner */}
      <motion.div
        className="mt-0"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        <div className="px-0 pt-8 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-5-up-2.webp"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-5-up.webp"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
            />

            {/* Text Overlay - Center aligned on mobile, left and center aligned on desktop */}
            <div className="absolute inset-0 flex items-start justify-center px-4 pt-8 md:items-center md:justify-start md:pt-0 md:pl-12">
              <div className="text-center md:text-left">
                <h2 className="mb-2 text-[24px] leading-tight font-bold text-white uppercase md:mb-4 md:text-[32px] lg:text-[40px]">
                  {(() => {
                    const text = t(
                      'ready_to_take_slot_experience_to_next_level',
                    );
                    const lines = text.split('\n');
                    return lines.map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx < lines.length - 1 && <br />}
                      </React.Fragment>
                    ));
                  })()}
                </h2>
                <button className="text-base font-semibold text-white underline md:text-lg">
                  {t('spin_now')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
