'use client';

import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

export default function SportsGamesPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const category = searchParams.get('category') || 'sports'; // Track category from where user came

  const [searchQuery, setSearchQuery] = useState('');

  // Base URL for images
  const baseUrl = 'https://d3emlo5tm9es2f.cloudfront.net/next';

  // Determine page title based on category
  const pageTitle = useMemo(() => {
    switch (category) {
      case 'virtual':
        return t('virtual_sports', 'Virtual Sports');
      case 'sports':
      default:
        return t('sports', 'Sports');
    }
  }, [category, t]);

  // Handle back navigation to sports page with category preservation
  const handleBackClick = () => {
    router.push(`/sports?q=${category}`);
  };

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
        {/* Header */}
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
                onClick={handleBackClick}
                className="flex h-[32px] w-[32px] flex-shrink-0 items-center justify-center rounded-[5px] transition-colors hover:opacity-80 sm:h-[36px] sm:w-[36px] md:h-[40px] md:w-[40px]"
                style={{ backgroundColor: '#20C5FE' }}
                aria-label="Go back to sports"
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
                {pageTitle} {t('games', 'Games')}
              </h3>
            </div>

            {/* Right Side: Search */}
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
                  placeholder={t('search_games', 'Search Games')}
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
            </div>
          </div>
        </div>

        {/* Games Content - Currently showing placeholder text */}
        <div className="flex min-h-[400px] items-center justify-center">
          <div
            className="rounded-[5px] border px-8 py-6 text-center"
            style={{
              borderColor: '#00374A',
              background: 'transparent',
            }}
          >
            <p className="text-xl font-semibold text-[#20C5FE] md:text-2xl">
              {t('coming_soon', 'Coming Soon')}
            </p>
            <p className="mt-4 text-sm text-white md:text-base">
              {t('sports_games_coming_soon', 'Sports games will be available soon.')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
