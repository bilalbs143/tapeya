'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CategoryGamesSlider from '@/dynamic-components/template14/components/CategoryGamesSlider/CategoryGamesSlider';
import GameProviders from '@/dynamic-components/template14/components/GameProviders/GameProviders';
import SlotCategories from '@/dynamic-components/template14/components/SlotCategories/SlotCategories';
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
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    dispatch(fetchAllProvider());
  }, [dispatch]);

  // Fix margin-right issue when dropdown opens (Radix UI scroll lock)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const body = document.body;
      if (body.hasAttribute('data-scroll-locked')) {
        body.style.marginRight = '0';
        body.style.paddingRight = '0';
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['data-scroll-locked'],
    });

    // Also check immediately in case it's already set
    if (document.body.hasAttribute('data-scroll-locked')) {
      document.body.style.marginRight = '0';
      document.body.style.paddingRight = '0';
    }

    return () => observer.disconnect();
  }, []);

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
        id: getProviderId('Pragmatic Play'),
        name: 'Pragmatic Play',
        isLive: true,
      },
      {
        key: 'Micro',
        id: getProviderId('Micro'),
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
        key: 'hacksaw_slot',
        id: getProviderId('hacksaw_slot'),
        name: 'Hacksaw',
        isLive: true,
      },
      {
        key: 'jdb_arcade',
        id: getProviderId('jdb_arcade'),
        name: 'JDP Gaming',
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
      <style
        dangerouslySetInnerHTML={{
          __html: `
          body[data-scroll-locked] {
            margin-right: 0 !important;
            padding-right: 0 !important;
          }
        `,
        }}
      />
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt={t('lines_pattern')}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Slot Detail Hero Banner */}
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

                  {/* Current Provider Name or Default Text */}
                  <h2
                    className="font-bring-race text-left text-[18px] leading-tight break-words text-white sm:text-[18px] md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl"
                    style={{ letterSpacing: '1px' }}
                  >
                    {currentProviderName}
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

        <div className="pt-6">
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
                  onClick={handleBackClick}
                  className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-[5px] transition-colors hover:opacity-80 sm:h-[36px] sm:w-[36px] md:h-[40px] md:w-[40px]"
                  style={{ backgroundColor: '#7351FF' }}
                  aria-label="Go back to providers"
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
                  {currentProviderName}
                </h3>
              </div>

              {/* Right Side: Search + Provider Dropdown */}
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

                {/* Provider Dropdown */}
                <div className="relative flex-shrink-0">
                  <UiSelect
                    value={selectedProviderId ? String(selectedProviderId) : ''}
                    onValueChange={(val) => handleProviderChange(val)}
                  >
                    <SelectTrigger
                      className="relative flex h-[32px] min-w-[100px] items-center justify-between rounded-[5px] border bg-transparent px-2 pr-7 text-[10px] text-white shadow-none focus:ring-0 focus:ring-transparent focus:outline-none sm:min-w-[120px] sm:px-2.5 sm:pr-8 sm:text-xs md:h-[40px] md:min-w-[160px] md:px-3 md:pr-9 md:text-sm [&_svg]:text-[#7351FF]"
                      style={{ borderColor: '#7351FF' }}
                    >
                      <SelectValue
                        placeholder="Select Providers"
                        className={
                          selectedProviderId ? 'text-white' : 'text-[#FFFFFF66]'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      className="template14-provider-select z-[100] max-h-[200px] w-[var(--radix-select-trigger-width)] overflow-y-auto border bg-[#1E1451]"
                      style={{ borderColor: '#7351FF' }}
                      side="bottom"
                      align="end"
                      sideOffset={5}
                    >
                      {allProviders.map((provider) => {
                        // Use ID if available, otherwise use key as fallback
                        const providerIdentifier = provider.id || provider.key;
                        return (
                          <SelectItem
                            key={providerIdentifier}
                            value={String(providerIdentifier)}
                            className="text-white hover:bg-[#7351FF]"
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
            alt={t('curved_pattern_alt')}
            className="h-full w-full object-cover opacity-30"
          />
        </div>
      </div>

      {/* Category-based Games Slider - Shows providers from different category */}
      <div className="py-8">
        <CategoryGamesSlider category={category} />
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
    </>
  );
}
