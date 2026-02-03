import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import LazyImage from '@/dynamic-components/template16/components/LazyImage/LazyImage';
import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';

const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/';

const categories = [
  {
    key: 'home',
    icon: 'Home-1.svg',
    label: 'home',
    display: 'Home',
    href: '/',
    desktopSize: 38,
    mobileSize: 30,
  },
  {
    key: 'slots',
    icon: 'Slots-3.svg',
    label: 'slots',
    display: 'Slots',
    href: '/slots?category=slots',
    desktopSize: 38,
    mobileSize: 30,
  },
  {
    key: 'casino',
    icon: 'Casino-4.svg',
    label: 'casino',
    display: 'Casino',
    href: '/live-casino?q=live',
    desktopSize: 38,
    mobileSize: 30,
  },
  {
    key: 'promotions',
    icon: 'Promotions-10.svg',
    label: 'promotions',
    display: 'Promotions',
    href: '/promotions',
    desktopSize: 36,
    mobileSize: 28,
  },
  {
    key: 'hot',
    icon: 'Hot-2.svg',
    label: 'hot_games',
    display: 'Hot',
    href: '/slot-providers?q=hot',
    desktopSize: 36,
    mobileSize: 28,
  },
  {
    key: 'sports',
    icon: 'Sports-5.svg',
    label: 'sports',
    display: 'Sports',
    href: '/sports',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'fishing',
    icon: 'Fishing-6.svg',
    label: 'fishing',
    display: 'Fishing',
    href: '/fishing',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'togel',
    icon: 'Togel-8.svg',
    label: 'togel',
    display: 'Togel',
    href: '/togel',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'crash',
    icon: 'Crash-9.svg',
    label: 'crash_game',
    display: 'Crash',
    href: '/crash',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'bonus',
    icon: 'Bonus-11.svg',
    label: 'bonus',
    display: 'Bonus',
    href: '/bonus',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'other',
    icon: 'Other-7.svg',
    label: 'other',
    display: 'Other',
    href: '/other',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'more',
    icon: 'more-12.svg',
    label: 'more',
    display: 'More',
    href: '/more',
    desktopSize: 28,
    mobileSize: 24,
  },
];

function Categories() {
  const { t } = useTranslations();
  const { headerLogo } = useTemplate();

  const getLabel = (key, fallback) => {
    const translated = t(key);
    const text = translated === key ? fallback : translated;
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Enabled categories: Home, Slot, Casino, Promotion
  const enabledCategoryKeys = ['home', 'slots', 'casino', 'promotions'];

  const CategoryItem = ({ category }) => {
    const isEnabled = enabledCategoryKeys.includes(category.key);

    const content = (
      <>
        <div
          className={`rounded-lg transition-all duration-200 ${
            isEnabled ? 'group-hover:scale-110' : 'opacity-40'
          }`}
          style={{
            height: 'clamp(24px, 3vw, 38px)',
            width: 'clamp(24px, 3vw, 38px)',
            minHeight: '24px',
            minWidth: '24px',
          }}
        >
          <LazyImage
            src={`${BASE_ICON_URL}${category.icon}`}
            alt={t(category.label) || category.label}
            width={38}
            height={38}
            className="h-full w-full object-contain"
          />
        </div>
        <span
          className={`font-bold whitespace-nowrap ${
            isEnabled ? 'text-white' : 'text-white opacity-40'
          }`}
          style={{
            fontSize: '13px',
          }}
        >
          {getLabel(category.label, category.display)}
        </span>
      </>
    );

    if (isEnabled) {
      return (
        <Link
          href={category.href}
          className="group flex flex-shrink-0 flex-col items-center gap-1.5 transition-all duration-200 hover:opacity-80 active:scale-95 sm:gap-2"
        >
          {content}
        </Link>
      );
    }

    return (
      <div className="flex flex-shrink-0 cursor-not-allowed flex-col items-center gap-1.5 sm:gap-2">
        {content}
      </div>
    );
  };

  return (
    <section className="border-b border-[#E8D25E] bg-[#000304]">
      <div className="container mx-auto px-2 py-2 sm:px-4 sm:py-3">
        <div className="flex items-center gap-3 sm:gap-6 md:gap-10 lg:gap-14">
          {/* Logo - Left Side */}
          <Link
            href="/"
            className="hidden flex-shrink-0 items-center md:inline-flex"
            style={{
              width: 'clamp(100px, 12vw, 150px)',
              height: 'auto',
            }}
          >
            <Image
              src={headerLogo}
              alt="Logo"
              width={150}
              height={35}
              priority
              className="h-auto w-full"
            />
          </Link>

          {/* Categories - Right Side */}
          <div className="scrollbar-hide min-w-0 flex-1 overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
            <div
              className="flex items-baseline gap-2 sm:gap-4 md:gap-8 lg:gap-14"
              style={{ width: 'max-content', marginLeft: 'auto', minWidth: 'min-content' }}
            >
              {categories.map((category) => (
                <CategoryItem key={category.key} category={category} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Categories;
