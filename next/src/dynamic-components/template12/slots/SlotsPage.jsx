'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CategoryGamesSlider from '@/dynamic-components/template12/components/CategoryGamesSlider/CategoryGamesSlider';
import GameProviders from '@/dynamic-components/template12/components/GameProviders/GameProviders';
import LazyImage from '@/dynamic-components/template12/components/LazyImage/LazyImage';
import SlotCategories from '@/dynamic-components/template12/components/SlotCategories/SlotCategories';
import { getProviderNameById } from '@/helpers/stringUtils';
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

export default function SlotsPage() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'slots'; // Track category from where user came

  const { selectedProviderId, allProvidersData } = useSelector(
    (state) => state.website,
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

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

  // Slot providers - matches exactly with SlotProvidersPage
  const slotProviders = useMemo(
    () => [
      {
        key: 'pragmatic_slot',
        id: getProviderId('pragmatic_slot'),
        name: 'Pragmatic play',
        isLive: true,
      },
      {
        key: 'MICRO_Slot',
        id: getProviderId('MICRO_Slot'),
        name: 'Microgaming',
        isLive: true,
      },
      {
        key: 'booongo',
        id: getProviderId('booongo'),
        name: 'Booongo',
        isLive: true,
      },
      {
        key: 'PLAYNGO',
        id: getProviderId('PLAYNGO'),
        name: 'Play n Go',
        isLive: true,
      },
      {
        key: 'habanero',
        id: getProviderId('habanero'),
        name: 'Habanero',
        isLive: true,
      },
      {
        key: 'TOMHORN_SLOT',
        id: getProviderId('TOMHORN_SLOT'),
        name: 'Tom Horn Gaming',
        isLive: true,
      },
      {
        key: 'cq9',
        id: getProviderId('cq9'),
        name: 'CQ9',
        isLive: true,
      },
      {
        key: 'PGSoft',
        id: getProviderId('PGSoft'),
        name: 'Pocket Soft Gaming',
        isLive: true,
      },
      {
        key: 'redtiger',
        id: getProviderId('redtiger'),
        name: 'Red Tiger',
        isLive: true,
      },
      {
        key: 'netent',
        id: getProviderId('netent'),
        name: 'NetEnt',
        isLive: true,
      },
      {
        key: 'evoplay',
        id: getProviderId('evoplay'),
        name: 'Evoplay',
        isLive: true,
      },
      {
        key: 'nlc',
        id: getProviderId('nlc'),
        name: 'NLC',
        isLive: true,
      },
      {
        key: 'btg',
        id: getProviderId('btg'),
        name: 'Big Time Gaming',
        isLive: true,
      },
    ],
    [allProvidersData],
  );

  // Arcade providers - matches exactly with SlotProvidersPage
  const arcadeProviders = useMemo(
    () => [
      {
        key: 'jdb_arcade',
        id: getProviderId('jdb_arcade'),
        name: 'JDP Gaming',
        isLive: true,
      },
      {
        key: 'hacksaw_arcade',
        id: getProviderId('hacksaw_arcade'),
        name: 'Hacksaw',
        isLive: true,
      },
      {
        key: 'oriental',
        id: getProviderId('oriental'),
        name: 'Oriental Game',
        isLive: true,
      },
      {
        key: 'fc_arcade',
        id: getProviderId('fc_arcade'),
        name: 'FC Arcade',
        isLive: true,
      },
    ],
    [allProvidersData],
  );

  // Hybrid providers - matches exactly with SlotProvidersPage (empty for now)
  const hybridProviders = useMemo(() => [], [allProvidersData]);

  // Filter providers based on category from URL
  const allProviders = useMemo(() => {
    let categoryProviders = [];

    // Select providers based on category
    if (category === 'arcade') {
      categoryProviders = arcadeProviders;
    } else if (category === 'hybrid') {
      categoryProviders = hybridProviders;
    } else {
      // Default to slots category
      categoryProviders = slotProviders;
    }

    // Remove duplicates based on ID (if available) or key, and keep all providers
    // This ensures we show exactly the same providers as SlotProvidersPage
    const uniqueProviders = categoryProviders.filter(
      (provider, index, self) => {
        // Use ID for comparison if available, otherwise use key
        const identifier = provider.id || provider.key;
        return (
          identifier &&
          index === self.findIndex((p) => (p.id || p.key) === identifier)
        );
      },
    );
    return uniqueProviders;
  }, [slotProviders, arcadeProviders, hybridProviders, category]);

  // Handle back navigation to slot providers with category preservation
  const handleBackClick = () => {
    router.push(`/slot-providers?q=${category}`);
  };

  // Handle provider selection
  const handleProviderChange = (providerId) => {
    if (providerId) {
      // Convert to number if it's a string number
      const numericId = isNaN(Number(providerId))
        ? providerId
        : Number(providerId);
      dispatch(setSelectedProviderId(numericId));
    }
  };

  // Get current provider name for banner and title
  const currentProviderName = useMemo(() => {
    if (selectedProviderId && allProviders.length > 0) {
      // Try to find provider by ID or key (handle both string and number comparison)
      const provider = allProviders.find(
        (p) =>
          p.id === selectedProviderId ||
          String(p.id) === String(selectedProviderId) ||
          p.key === selectedProviderId ||
          String(p.key) === String(selectedProviderId),
      );

      if (provider) {
        return provider.name;
      }

      // Fallback to API data (only if selectedProviderId is a number/ID)
      if (!isNaN(Number(selectedProviderId))) {
        const apiProviderName = getProviderNameById(
          selectedProviderId,
          allProvidersData,
        );
        return apiProviderName || t('slot_games');
      }
      return t('slot_games');
    }
    return t('slot_games');
  }, [selectedProviderId, allProvidersData, allProviders, t]);

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt="Lines Pattern"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Slot Detail Page Banner */}
        <section
          className="relative w-full overflow-hidden"
          aria-label={t('hero_section')}
        >
          {/* Desktop Banner Image - Hidden on mobile */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-detail-page-banner-3.webp"
            alt={t('hero_section')}
            className="hidden w-full md:block"
          />

          {/* Mobile Banner Image - Only visible on mobile */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-detail-page-banner-mob-3.webp"
            alt={t('hero_section')}
            className="block w-full md:hidden"
          />

          {/* Content - Text Overlay: Top center on mobile, left aligned on desktop */}
          <div className="absolute inset-0 flex items-start justify-center pt-6 md:items-center md:justify-start md:pt-0">
            <div className="container mx-auto px-4">
              <div className="text-center md:text-left">
                <h1
                  className="bg-[#E8D25E] bg-clip-text !text-[24px] leading-tight font-semibold tracking-wide break-words text-transparent uppercase sm:!text-[32px] md:max-w-2xl md:!text-[40px] lg:!text-[60px]"
                  style={{
                    fontFamily: 'var(--font-alatsi)',
                    WebkitTextStroke: '0px transparent',
                    textStroke: '0px transparent',
                    wordBreak: 'normal',
                    overflowWrap: 'break-word',
                    whiteSpace: 'normal',
                  }}
                >
                  {t('your_jackpot_journey_begins_here')}
                </h1>

                <p
                  className="mt-2 bg-[#E8D25E] bg-clip-text text-[14px] font-semibold text-transparent sm:mt-4 sm:text-base md:mt-6 md:text-lg lg:text-xl"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {t('jackpot_dreams_start_here')}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          {/* Header with Back Button, Title, Search, and Provider Dropdown */}
          <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#E8D25E] px-2 py-2 md:flex-nowrap md:justify-between md:gap-3 md:px-3 md:py-3">
              {/* Left Side: Back Button + Title */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* Back Button */}
                <button
                  onClick={handleBackClick}
                  className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-lg transition-colors hover:opacity-80 sm:h-[36px] sm:w-[36px] md:h-[40px] md:w-[40px]"
                  style={{ backgroundColor: '#E8D25E' }}
                  aria-label="Go back to providers"
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
                  {currentProviderName}
                </h3>
              </div>

              {/* Right Side: Search + Provider Dropdown */}
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
                    placeholder={t('search_games')}
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

                {/* Provider Dropdown */}
                <div className="relative flex-shrink-0">
                  <UiSelect
                    value={
                      selectedProviderId
                        ? String(selectedProviderId)
                        : undefined
                    }
                    onValueChange={(val) => handleProviderChange(val)}
                  >
                    <SelectTrigger className="relative flex h-[32px] min-w-[90px] items-center justify-between rounded-lg border border-[#E8D25E] bg-transparent px-2 pr-7 text-[10px] text-white shadow-none focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[36px] sm:min-w-[110px] sm:px-2.5 sm:pr-8 sm:text-xs md:h-[40px] md:min-w-[160px] md:px-3 md:text-sm [&_svg]:text-[#E8D25E]">
                      <SelectValue placeholder="Select Providers" />
                    </SelectTrigger>
                    <SelectContent
                      className="template12-provider-select z-50 max-h-[200px] w-full overflow-y-auto border-[#E8D25E] bg-[#1a1a1a]"
                      side="bottom"
                      align="start"
                    >
                      {allProviders.map((provider) => {
                        // Use ID if available, otherwise use key as fallback
                        const providerIdentifier = provider.id || provider.key;
                        return (
                          <SelectItem
                            key={providerIdentifier}
                            value={String(providerIdentifier)}
                            className="text-white hover:bg-[#E8D25E] hover:text-black"
                          >
                            {provider.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </UiSelect>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SlotCategories searchQuery={searchQuery} />
        {/* Bottom Curved Pattern above footer (positioned, no layout shift) */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-[420px]"
          aria-hidden
        >
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/curved-pattern.svg"
            alt="Curved Pattern"
            className="h-full w-full object-cover opacity-30"
          />
        </div>
      </div>

      {/* Category-based Games Slider - Shows providers from different category */}
      <div className="container mx-auto px-4 py-8">
        <CategoryGamesSlider category={category} />
      </div>

      {/* Slot Bottom Banner */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-xl">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-3-new.webp"
            alt={t('slot_bottom_banner')}
            width={1920}
            height={400}
            className="hidden h-auto w-full rounded-xl object-cover md:block"
            sizes="100vw"
            priority={false}
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-3-new-mob.webp"
            alt={t('slot_bottom_banner')}
            width={1920}
            height={400}
            className="block h-auto w-full rounded-xl object-cover md:hidden"
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
    </>
  );
}
