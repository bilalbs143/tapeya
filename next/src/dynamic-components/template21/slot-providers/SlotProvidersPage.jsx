'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CategoryGamesSlider from '@/dynamic-components/template21/components/CategoryGamesSlider/CategoryGamesSlider';
import LazyImage from '@/dynamic-components/template21/components/LazyImage/LazyImage';
import LiveCasinoSlider from '@/dynamic-components/template21/components/LiveCasinoSlider/LiveCasinoSlider';
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

  // Slot Providers data with dynamic IDs
  const slotProviders = [
    {
      key: 'pragmatic_slot',
      id: getProviderId('pragmatic_slot'),
      icon: 'sp-2-3-up.webp',
      logo: 'pragmatic-play.png',
      name: 'Pragmatic play',
      isLive: true,
    },
    {
      key: 'MICRO_Slot',
      id: getProviderId('MICRO_Slot'),
      icon: 'sp-4-3-up.webp',
      logo: 'microgaming.png',
      name: 'Microgaming',
      isLive: true,
    },
    {
      key: 'booongo',
      id: getProviderId('booongo'),
      icon: 'sp-5-3-up.webp',
      logo: 'bongo.png',
      name: 'Booongo',
      isLive: true,
    },
    {
      key: 'PLAYNGO',
      id: getProviderId('PLAYNGO'),
      icon: 'sp-6-3-up.webp',
      logo: 'Play n Go.png',
      name: 'Play n Go',
      isLive: true,
    },
    {
      key: 'habanero',
      id: getProviderId('habanero'),
      icon: 'sp-7-3-up.webp',
      logo: 'habanero_white 3.png',
      name: 'Habanero',
      isLive: true,
    },
    {
      key: 'TOMHORN_SLOT',
      id: getProviderId('TOMHORN_SLOT'),
      icon: 'sp-8-3-up.webp',
      logo: 'tomhorn.png',
      name: 'Tom Horn Gaming',
      isLive: true,
    },
    {
      key: 'cq9',
      id: getProviderId('cq9'),
      icon: 'sp-9-3-up.webp',
      logo: 'cq9.png',
      name: 'CQ9',
      isLive: true,
    },
    {
      key: 'PGSoft',
      id: getProviderId('PGSoft'),
      icon: 'sp-10-3-up.webp',
      logo: 'Pocketsoft Games.png',
      name: 'Pocket Soft Gaming',
      isLive: true,
    },
    {
      key: 'redtiger',
      id: getProviderId('redtiger'),
      icon: 'sp-39-3-up.webp',
      logo: 'Red Tiger.png',
      name: 'Red Tiger',
      isLive: true,
    },
    {
      key: 'netent',
      id: getProviderId('netent'),
      icon: 'sp-28-3-up.webp',
      logo: 'netent.png',
      name: 'NetEnt',
      isLive: true,
    },
    {
      key: 'evoplay',
      id: getProviderId('evoplay'),
      icon: 'sp-18-3-up.webp',
      logo: 'evoplay.png',
      name: 'Evoplay',
      isLive: true,
    },
    {
      key: 'nlc',
      id: getProviderId('nlc'),
      icon: 'sp-1-3-New.webp',
      logo: 'nlc.png',
      name: 'NLC',
      isLive: true,
    },
    {
      key: 'btg',
      id: getProviderId('btg'),
      icon: 'sp-14-3-up.webp',
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
      icon: 'sp-22-3-up.webp',
      logo: 'JDPGaming.png',
      name: 'JDP Gaming',
      isLive: true,
    },
    {
      key: 'hacksaw_arcade',
      id: getProviderId('hacksaw_arcade'),
      icon: 'sp-20-3-up.webp',
      logo: 'Hacksaw.png',
      name: 'Hacksaw',
      isLive: true,
    },
    {
      key: 'oriental',
      id: getProviderId('oriental'),
      icon: 'sp-17-3-New.webp',
      logo: 'Oriental.png',
      name: 'Oriental Game',
      isLive: true,
    },
    {
      key: 'fc_arcade',
      id: getProviderId('fc_arcade'),
      icon: 'sp-21-3-New.webp',
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
      {/* Home-style Hero Banner (same as Home Page) */}
      <section
        className="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        aria-label={t('hero_section')}
        style={{
          backgroundImage:
            ' url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-page-banner-3.webp)',
        }}
      >
        {/* Content */}
        <div className="container mx-auto flex w-full items-center pt-6 sm:pt-8 lg:pt-10">
          <div className="grid w-full grid-cols-1 items-center gap-6 md:grid-cols-2 lg:gap-10">
            {/* Girl image (right on desktop) */}
            <div className="order-2 flex justify-center md:order-2 md:justify-end">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-banner-girl-3.webp"
                alt={t('hero_girl')}
                width={480}
                height={500}
                className="h-auto w-[400px] max-w-full object-contain sm:w-[400px] md:w-[400px] lg:w-[400px] xl:w-[550px]"
                sizes="(min-width: 1280px) 480px, (min-width: 1024px) 420px, (min-width: 768px) 360px, (min-width: 640px) 280px, 220px"
                priority
              />
            </div>

            {/* Headline and Subheadline (left on desktop) */}
            <div className="order-1 text-center md:order-1 md:text-left">
              <h1
                className="bg-[#E8D25E] bg-clip-text !text-[40px] leading-tight font-semibold tracking-wide text-transparent uppercase lg:!text-[60px]"
                style={{
                  WebkitTextStroke: '0px transparent',
                  textStroke: '0px transparent',
                }}
              >
                {t('your_jackpot_journey_begins_here')}
              </h1>

              <p className="mt-4 bg-[#E8D25E] bg-clip-text text-[20px] font-semibold text-transparent sm:mt-6 sm:text-base md:text-lg lg:text-xl">
                {t('jackpot_dreams_start_here')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button, Title, Search, and Category Dropdown */}
        <div className="mb-6 w-full">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E8D25E] px-2 py-2 md:flex-nowrap md:justify-between md:gap-3 md:px-3 md:py-3">
            {/* Left Side: Back Button + Title */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Back Button */}
              <button
                onClick={() => router.push('/')}
                className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:opacity-80 sm:h-[36px] sm:w-[36px] md:h-[40px] md:w-[40px]"
                style={{ backgroundColor: '#E8D25E' }}
                aria-label="Go to home"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
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
            <div className="relative flex w-full flex-1 items-center gap-2 md:w-auto md:flex-initial md:gap-3">
              {/* Search */}
              <div
                className="flex h-[32px] flex-1 items-center gap-2 px-2 sm:h-[36px] sm:px-3 md:h-[40px] md:w-[190px] md:flex-none"
                style={{
                  border: '1px solid #E8D25E',
                  borderRadius: '8px',
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
                    stroke="#E8D25E"
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
                    if (val === 'live' || val === 'table') {
                      router.push(`/live-casino?q=${val}`);
                    } else {
                      router.push(`/slot-providers?q=${val}`);
                    }
                  }}
                >
                  <SelectTrigger className="relative flex h-[32px] min-w-[90px] items-center justify-between rounded-lg border border-[#E8D25E] bg-transparent px-2 pr-7 text-[10px] text-white shadow-none focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[36px] sm:min-w-[110px] sm:px-2.5 sm:pr-8 sm:text-xs md:h-[40px] md:min-w-[160px] md:px-3 md:text-sm [&_svg]:text-[#E8D25E]">
                    <SelectValue
                      placeholder="Select Category"
                      className={category ? 'text-white' : 'text-[#FFFFFF66]'}
                    />
                  </SelectTrigger>
                  <SelectContent
                    className="z-50 max-h-[200px] w-full border-[#E8D25E] bg-[#1a1a1a]"
                    side="bottom"
                    align="start"
                  >
                    <SelectItem
                      value="slots"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      {t('slots') || 'Slots'}
                    </SelectItem>
                    <SelectItem
                      value="arcade"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      {t('arcade') || 'Arcade'}
                    </SelectItem>
                    <SelectItem
                      value="hybrid"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      {t('hybrid_games') || 'Hybrid Games'}
                    </SelectItem>
                    <SelectItem
                      value="live"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      {t('casino') || 'Live Casino'}
                    </SelectItem>
                    <SelectItem
                      value="table"
                      className="text-white capitalize hover:bg-[#E8D25E] hover:text-black"
                    >
                      {t('table_games') || 'Table Games'}
                    </SelectItem>
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
                className="rounded-lg border px-8 py-6 text-center"
                style={{
                  borderColor: 'rgba(211, 175, 55, 0.28)',
                  background: 'transparent',
                }}
              >
                <p className="text-xl font-semibold text-[#E8D25E] md:text-2xl">
                  {t('coming_soon')}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredProviders.map((provider) => (
                <div
                  key={provider.key}
                  className="group relative w-full overflow-hidden rounded-xl border border-purple-500/20 bg-black/20 shadow-sm transition-all duration-300 hover:border-[#E8D25E] hover:shadow-[0_0_10px_0_#FC7E09_inset]"
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
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    {/* Hover Overlay - Only on Image */}
                    <div className="absolute inset-0 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#6d6936c9] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
                        className="rounded-md border-2 border-black px-5 py-2 text-sm font-semibold text-black shadow-md hover:brightness-110"
                        style={{
                          background: '#E8D25E',
                        }}
                      >
                        PLAY
                      </button>
                    </div>
                  </div>
                  {/* Provider Name - Bottom Right */}
                  <div className="pointer-events-none absolute right-0 bottom-[0px]">
                    <div
                      className="max-w-[120px] min-w-[120px] truncate px-3 py-1 text-center text-[12px] font-semibold text-black uppercase md:max-w-[170px] md:min-w-[150px] md:text-[14px]"
                      style={{
                        borderRadius: '14px 0 6px 0',
                        background: '#E8D25E',
                      }}
                    >
                      {provider.name}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Live Casino Slider */}
      <div className="container mx-auto px-4 py-8">
        <LiveCasinoSlider />
      </div>

      {/* Category-based Games Slider - Shows games from different category */}
      <div className="container mx-auto px-4 py-8">
        <CategoryGamesSlider category={category} />
      </div>

      {/* Slot Bottom Banner */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-3-new.webp"
            alt={t('slot_bottom_banner')}
            width={1920}
            height={400}
            className="hidden h-auto w-full object-cover md:block"
            sizes="100vw"
            priority={false}
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-3-new-mob.webp"
            alt={t('slot_bottom_banner')}
            width={1920}
            height={400}
            className="block h-auto w-full object-cover md:hidden"
            sizes="100vw"
            priority={false}
          />

          {/* Text Overlay - Top centered on mobile, left aligned on desktop */}
          <div className="absolute inset-0 flex items-start justify-center pt-12 md:items-center md:justify-start md:pt-0">
            {/* eslint-disable-next-line react/no-unknown-property */}
            <style jsx>{`
              .banner-text {
                font-family: var(--font-alatsi);
              }
            `}</style>
            <h1 className="banner-text bg-[#E8D25E] bg-clip-text px-4 text-center leading-tight font-semibold tracking-wide text-transparent uppercase md:px-16 md:text-left">
              <div className="text-center !text-[22px] md:text-left md:!text-[30px] lg:!text-[50px]">
                {t('diamonds_dollars')}
                <br />
                {t('and_destiny')}
              </div>
              <div className="mt-1 text-center !text-[20px] md:mt-2 md:text-left md:!text-[25px] lg:!text-[30px]">
                {t('spin_like_a_vip')}
              </div>
            </h1>
          </div>
        </div>
      </div>
    </div>
  );
}
