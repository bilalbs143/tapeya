import Link from 'next/link';
import React from 'react';

import LazyImage from '@/dynamic-components/template12/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

function Categories() {
  const { t } = useTranslations();

  return (
    <section className="border-b border-[#E8D25E] bg-[#000304]">
      {/* Desktop Categories */}
      <div className="hidden md:block">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-14">
            {/* Slot */}
            <Link
              href="/slot-providers?q=slots"
              className="group flex w-[150px] flex-col items-center gap-2 transition-all duration-200 hover:opacity-80"
            >
              <div className="h-12 w-12 rounded-lg border border-[#E8D25E] p-1 transition-transform duration-200 group-hover:scale-110">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-cat-3.svg"
                  alt={t('slots')}
                  width={48}
                  height={48}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[16px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('slots')}
              </span>
            </Link>

            {/* Casino */}
            <Link
              href="/live-casino?q=live"
              className="group flex w-[150px] flex-col items-center gap-2 transition-all duration-200 hover:opacity-80"
            >
              <div className="h-12 w-12 rounded-lg border border-[#E8D25E] p-1 transition-transform duration-200 group-hover:scale-110">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-cat-3.svg"
                  alt={t('casino')}
                  width={48}
                  height={48}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[16px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('casino')}
              </span>
            </Link>

            {/* Arcade */}
            <Link
              href="/slot-providers?q=arcade"
              className="group flex w-[150px] flex-col items-center gap-2 transition-all duration-200 hover:opacity-80"
            >
              <div className="h-12 w-12 rounded-lg border border-[#E8D25E] p-1 transition-transform duration-200 group-hover:scale-110">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/archade-cat-3.svg"
                  alt={t('arcade') || 'Arcade'}
                  width={48}
                  height={48}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[16px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('arcade') || 'Arcade'}
              </span>
            </Link>

            {/* Table Games */}
            <Link
              href="/live-casino?q=table"
              className="group flex w-[150px] flex-col items-center gap-2 transition-all duration-200 hover:opacity-80"
            >
              <div className="h-12 w-12 rounded-lg border border-[#E8D25E] p-1 transition-transform duration-200 group-hover:scale-110">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/table-cat-3.svg"
                  alt={t('table_games') || 'Table Games'}
                  width={48}
                  height={48}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[16px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('table_games') || 'Table Games'}
              </span>
            </Link>

            {/* Hybrid Games */}
            <Link
              href="/slot-providers?q=hybrid"
              className="group flex w-[150px] flex-col items-center gap-2 transition-all duration-200 hover:opacity-80"
            >
              <div className="h-12 w-12 rounded-lg border border-[#E8D25E] p-1 transition-transform duration-200 group-hover:scale-110">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/hybrid-cat-3.svg"
                  alt={t('hybrid_games') || 'Hybrid Games'}
                  width={48}
                  height={48}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[16px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('hybrid_games') || 'Hybrid Games'}
              </span>
            </Link>

            {/* Sports */}
            <Link
              href="/sports"
              className="group flex w-[150px] flex-col items-center gap-2 transition-all duration-200 hover:opacity-80"
            >
              <div className="h-12 w-12 rounded-lg border border-[#E8D25E] p-1 transition-transform duration-200 group-hover:scale-110">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/sports-cat-12.png"
                  alt={t('sports') || 'Sports'}
                  width={48}
                  height={48}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[16px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('sports') || 'Sports'}
              </span>
            </Link>

            {/* Virtual Sports */}
            <Link
              href="/sports?q=virtual"
              className="group flex w-[150px] flex-col items-center gap-2 transition-all duration-200 hover:opacity-80"
            >
              <div className="h-12 w-12 rounded-lg border border-[#E8D25E] p-1 transition-transform duration-200 group-hover:scale-110">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/vsports-cat-12.png"
                  alt={t('virtual_sports') || 'Virtual Sports'}
                  width={48}
                  height={48}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[16px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('virtual_sports') || 'Virtual Sports'}
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Categories - All in one row */}
      <div className="block md:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-8 overflow-x-auto">
            {/* Slot */}
            <Link
              href="/slot-providers?q=slots"
              className="flex flex-shrink-0 flex-col items-center gap-2 transition-transform duration-150 active:scale-95 active:opacity-70"
            >
              <div className="h-10 w-10 rounded-lg border border-[#E8D25E] p-1">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-cat-3.svg"
                  alt={t('slots')}
                  width={40}
                  height={40}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[12px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('slots')}
              </span>
            </Link>

            {/* Casino */}
            <Link
              href="/live-casino?q=live"
              className="flex flex-shrink-0 flex-col items-center gap-2 transition-transform duration-150 active:scale-95 active:opacity-70"
            >
              <div className="h-10 w-10 rounded-lg border border-[#E8D25E] p-1">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-cat-3.svg"
                  alt={t('casino')}
                  width={40}
                  height={40}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[12px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('casino')}
              </span>
            </Link>

            {/* Arcade */}
            <Link
              href="/slot-providers?q=arcade"
              className="flex flex-shrink-0 flex-col items-center gap-2 transition-transform duration-150 active:scale-95 active:opacity-70"
            >
              <div className="h-10 w-10 rounded-lg border border-[#E8D25E] p-1">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/archade-cat-3.svg"
                  alt={t('arcade') || 'Arcade'}
                  width={40}
                  height={40}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[12px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('arcade') || 'Arcade'}
              </span>
            </Link>

            {/* Table Games */}
            <Link
              href="/live-casino?q=table"
              className="flex flex-shrink-0 flex-col items-center gap-2 transition-transform duration-150 active:scale-95 active:opacity-70"
            >
              <div className="h-10 w-10 rounded-lg border border-[#E8D25E] p-1">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/table-cat-3.svg"
                  alt={t('table_games') || 'Table Games'}
                  width={40}
                  height={40}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[12px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('table_games') || 'Table Games'}
              </span>
            </Link>

            {/* Hybrid Games */}
            <Link
              href="/slot-providers?q=hybrid"
              className="flex flex-shrink-0 flex-col items-center gap-2 transition-transform duration-150 active:scale-95 active:opacity-70"
            >
              <div className="h-10 w-10 rounded-lg border border-[#E8D25E] p-1">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/hybrid-cat-3.svg"
                  alt={t('hybrid_games') || 'Hybrid Games'}
                  width={40}
                  height={40}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[12px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('hybrid_games') || 'Hybrid Games'}
              </span>
            </Link>

            {/* Sports */}
            <Link
              href="/sports"
              className="flex flex-shrink-0 flex-col items-center gap-2 transition-transform duration-150 active:scale-95 active:opacity-70"
            >
              <div className="h-10 w-10 rounded-lg border border-[#E8D25E] p-1">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/sports-cat-12.png"
                  alt={t('sports') || 'Sports'}
                  width={40}
                  height={40}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[12px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('sports') || 'Sports'}
              </span>
            </Link>

            {/* Virtual Sports */}
            <Link
              href="/sports?q=virtual"
              className="flex flex-shrink-0 flex-col items-center gap-2 transition-transform duration-150 active:scale-95 active:opacity-70"
            >
              <div className="h-10 w-10 rounded-lg border border-[#E8D25E] p-1">
                <LazyImage
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/vsports-cat-12.png"
                  alt={t('virtual_sports') || 'Virtual Sports'}
                  width={40}
                  height={40}
                  className="h-full w-full"
                />
              </div>
              <span className="text-[12px] font-medium whitespace-nowrap text-[#E8D25E]">
                {t('virtual_sports') || 'Virtual Sports'}
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Categories;
