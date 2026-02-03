'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import LazyImage from '@/dynamic-components/template14/components/LazyImage/LazyImage';
import LiveCasinoSlider from '@/dynamic-components/template14/components/LiveCasinoSlider/LiveCasinoSlider';
import {
  getTemplate14CategoryRoute,
  TEMPLATE14_PROVIDER_CATEGORIES,
} from '@/dynamic-components/template14/constants/providerDropdownConfig';
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

  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

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

  // Slot providers data with dynamic IDs
  const slotProviders = [
    {
      key: 'pragmatic_slot',
      id: getProviderId('Pragmatic Play'),
      icon: 'sp-2-7.webp',
      logo: 'pragmatic-play.png',
      name: 'Pragmatic Play',
      isLive: true,
    },
    {
      key: 'Micro',
      id: getProviderId('Micro'),
      icon: 'sp-4-7.webp',
      logo: 'microgaming.png',
      name: 'Microgaming',
      isLive: true,
    },
    {
      key: 'booongo',
      id: getProviderId('booongo'),
      icon: 'sp-5-7.webp',
      logo: 'bongo.png',
      name: 'Booongo',
      isLive: true,
    },
    {
      key: 'PLAYNGO',
      id: getProviderId('PLAYNGO'),
      icon: 'sp-6-7.webp',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: true,
    },
    {
      key: 'habanero',
      id: getProviderId('habanero'),
      icon: 'sp-7-7.webp',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: true,
    },
    {
      key: 'TOMHORN_SLOT',
      id: getProviderId('TOMHORN_SLOT'),
      icon: 'sp-8-7.webp',
      logo: 'tomhorn.png',
      name: 'Tom Horn Gaming',
      isLive: true,
    },
    {
      key: 'cq9',
      id: getProviderId('cq9'),
      icon: 'sp-9-7.webp',
      logo: 'cq9.png',
      name: 'CQ9',
      isLive: true,
    },
    {
      key: 'PGSoft',
      id: getProviderId('PGSoft'),
      icon: 'sp-10-7.webp',
      logo: 'Pocketsoft Games.png',
      name: 'Pocket Soft Gaming',
      isLive: true,
    },
    {
      key: 'redtiger',
      id: getProviderId('redtiger'),
      icon: 'sp-39-7.webp',
      logo: 'Red Tiger.png',
      name: 'Red Tiger',
      isLive: true,
    },
    {
      key: 'netent',
      id: getProviderId('netent'),
      icon: 'sp-28-7.webp',
      logo: 'netent.png',
      name: 'NetEnt',
      isLive: true,
    },
    {
      key: 'nlc',
      id: getProviderId('nlc'),
      icon: 'sp-1-7-new.webp',
      logo: 'nlc.png',
      name: 'NLC',
      isLive: true,
    },
    {
      key: 'btg',
      id: getProviderId('btg'),
      icon: 'sp-14-7.webp',
      logo: 'BTG_Logo.png',
      name: 'Big Time Gaming',
      isLive: true,
    },
    {
      key: 'hacksaw_slot',
      id: getProviderId('hacksaw_slot'),
      icon: 'sp-20-7.webp',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: true,
    },
    {
      key: 'jdb_arcade',
      id: getProviderId('jdb_arcade'),
      icon: 'sp-23-7.webp',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: true,
    },
  ];

  // Arcade Providers data
  const arcadeProviders = [
    {
      key: 'jdb_arcade',
      id: getProviderId('jdb_arcade'),
      icon: 'sp-23-7.webp',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: true,
    },
    {
      key: 'hacksaw_arcade',
      id: getProviderId('hacksaw_arcade'),
      icon: 'sp-20-7.webp',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: true,
    },
    {
      key: 'oriental',
      id: getProviderId('oriental'),
      icon: 'sp-21-7-new.webp',
      logo: 'Oriental.png',
      name: 'Oriental Game',
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
      <section
        className="relative mx-auto w-full overflow-hidden"
        aria-label={t('live_casino_banner')}
      >
        <div
          className="relative w-full overflow-hidden"
          style={{ minHeight: '200px' }}
        >
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <div className="relative hidden w-full md:block">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-7.webp"
              alt={t('live_casino_background_alt')}
              width={1920}
              height={600}
              className="w-full rounded-[5px] object-cover"
              style={{ height: 'auto', display: 'block' }}
              priority
            />
          </div>

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <div className="relative block w-full md:hidden">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-top-banner-mob-7.webp"
              alt={t('live_casino_mobile_background_alt')}
              width={1920}
              height={600}
              className="w-full rounded-[5px] object-cover"
              style={{ height: 'auto', display: 'block' }}
              priority
            />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 z-10 mt-0 flex items-start justify-center pt-8 pl-8 sm:pt-6 sm:pl-6 md:mt-6 md:items-center md:pt-0 md:pl-12 lg:pl-16 xl:pl-20">
            <div className="w-auto max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-3rem)] md:max-w-none">
              <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-3">
                {/* SLOTS Badge */}
                <div
                  className="rounded px-3 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 lg:px-4 lg:py-2"
                  style={{
                    border: '1px solid rgba(51, 19, 105, 0.70)',
                    backgroundColor: 'rgba(24, 14, 58, 0.5)',
                  }}
                >
                  <span className="inline-block text-[12px] font-bold whitespace-nowrap text-white uppercase sm:text-[12px] md:text-[12px] lg:text-[14px] xl:text-[16px]">
                    {t('slots')}
                  </span>
                </div>

                {/* EXPERIENCE THE GLAMOUR OF THE GAME */}
                <h2
                  className="font-bring-race text-left text-[18px] leading-tight break-words text-white sm:text-[18px] md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl"
                  style={{ letterSpacing: '1px' }}
                >
                  {t('experience_glamour')}
                  <br />
                  {t('glamour_of_game')}
                </h2>

                {/* Dive into our in-house Slots fantasy */}
                <p className="text-left text-[12px] text-white sm:text-xs md:text-sm lg:text-base">
                  {t('slots_fantasy')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 pt-6">
        {/* Header */}
        <div className="relative z-20 mb-6 w-full overflow-visible">
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
              <h3 className="font-bring-race min-w-0 truncate text-[12px] tracking-wide text-white uppercase md:text-[22px] md:whitespace-nowrap">
                {pageTitle}
              </h3>
            </div>

            {/* Right Side: Search + Category Dropdown */}
            <div className="relative z-30 flex flex-shrink-0 items-center gap-1.5 md:gap-3">
              {/* Search */}
              <div
                className="flex h-[32px] min-w-[85px] items-center gap-1.5 px-2 sm:min-w-[120px] sm:gap-2 sm:px-3 md:h-[40px] md:min-w-[220px] md:gap-2 md:px-3"
                style={{
                  border: '1px solid #7351FF',
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
                  className="flex-shrink-0 sm:h-[18px] sm:w-[18px] md:h-[23px] md:w-[23px]"
                >
                  <path
                    d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                    stroke="#7351FF"
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
                  onValueChange={(val) => router.push(getTemplate14CategoryRoute(val))}
                >
                  <SelectTrigger
                    className="relative flex h-[32px] min-w-[100px] items-center justify-between rounded-[5px] border bg-transparent px-2 pr-7 text-[10px] text-white shadow-none focus:ring-0 focus:ring-transparent focus:outline-none sm:min-w-[120px] sm:px-2.5 sm:pr-8 sm:text-xs md:h-[40px] md:min-w-[160px] md:px-3 md:pr-9 md:text-sm [&_svg]:text-[#7351FF]"
                    style={{ borderColor: '#7351FF', textTransform: 'none' }}
                  >
                    <SelectValue
                      placeholder="Select Category"
                      className={category ? 'text-white' : 'text-[#FFFFFF66]'}
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="z-[100] max-h-[200px] w-[var(--radix-select-trigger-width)] overflow-y-auto border bg-[#1E1451]"
                    style={{ borderColor: '#7351FF' }}
                    side="bottom"
                    align="end"
                    sideOffset={5}
                  >
                    {TEMPLATE14_PROVIDER_CATEGORIES.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        className="text-white hover:bg-[#7351FF]"
                      >
                        {t(option.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </UiSelect>
              </div>
            </div>
          </div>
        </div>

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
                  borderColor: '#3E1D88',
                  background: '#1E1451',
                }}
              >
                <p className="text-xl font-semibold text-[#7351FF] md:text-2xl">
                  {t('coming_soon')}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.key}
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
                    <div className="pointer-events-none absolute inset-0 rounded-[5px] bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
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
                        onClick={() => handlePlayClick(provider)}
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
                  {/* Provider Name - Bottom Center */}
                  {/* <div className="pointer-events-none absolute bottom-[-4px] left-1/2 -translate-x-1/2 transform">
                  <div className="max-w-[120px] min-w-[120px] px-3 py-1 text-center text-[12px] font-bold text-white uppercase md:max-w-[170px] md:min-w-[230px] md:text-[20px]">
                    {provider.name}
                  </div>
                </div> */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Casino Slider */}
      <div className="py-8">
        <LiveCasinoSlider />
      </div>

      {/* Bottom Banner */}
      <div className="mt-0">
        <div className="px-0 pt-8 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-bottom-banner-7.webp"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/casino-bottom-banner-mob-7.webp"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
            />

            {/* Text Overlay - Right aligned on desktop, left aligned on mobile (matching top banner) */}
            <div className="absolute inset-0 z-10 flex items-start justify-start pt-8 pr-0 pl-8 md:items-center md:justify-end md:pt-6 md:pr-20 md:pl-6 lg:pt-0 lg:pl-20">
              <div className="w-auto max-w-[calc(100%-2rem)] text-left sm:max-w-[calc(100%-3rem)] md:max-w-none">
                <div className="flex flex-col items-start gap-2 sm:gap-3 md:gap-3">
                  <h2
                    className="!lg:text-[35px] font-bring-race text-[18px] leading-tight text-white uppercase sm:text-[18px] md:text-[30px] xl:text-[40px]"
                    style={{ letterSpacing: '1px' }}
                  >
                    {t('where_millionaires')}
                    <br />
                    {(() => {
                      const text = t('millionaires_made');
                      const parts = text.split('MILLIONAIRES');
                      return parts.length > 1 ? (
                        <>
                          MILLIONAIRES
                          <br />
                          {parts[1].trim()}
                        </>
                      ) : (
                        text
                      );
                    })()}
                  </h2>
                  {/* <button className="angled-button angled-button-pink mt-2 px-6 py-3 md:mt-0 md:px-8 md:py-4">
                    <div className="angled-button-inner">
                      <span className="angled-button-text px-4 py-2 md:px-6 md:py-3">
                        {t('enter_the_realm_now')}
                      </span>
                    </div>
                  </button> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
