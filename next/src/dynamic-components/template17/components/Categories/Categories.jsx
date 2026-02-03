import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template17/components/LazyImage/LazyImage';
import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';

const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/';

const categories = [
  {
    key: 'home',
    icon: 'home-17.svg',
    label: 'home',
    display: 'Home',
    href: '/',
    desktopSize: 38,
    mobileSize: 30,
  },
  {
    key: 'slots',
    icon: 'slots-17.svg',
    label: 'slots',
    display: 'Slots',
    href: '/slots?category=slots',
    desktopSize: 38,
    mobileSize: 30,
  },
  {
    key: 'casino',
    icon: 'casino-17.svg',
    label: 'casino',
    display: 'Casino',
    href: '/live-casino?q=live',
    desktopSize: 38,
    mobileSize: 30,
  },
  {
    key: 'sports',
    icon: 'sports-17.svg',
    label: 'sports',
    display: 'Sports',
    href: '/sports',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'promotions',
    icon: 'promotions-17.svg',
    label: 'promotions',
    display: 'Promotions',
    href: '/promotions',
    desktopSize: 36,
    mobileSize: 28,
  },
  {
    key: 'fishing',
    icon: 'coke-fight-17.svg',
    label: 'fishing',
    display: 'Fishing',
    href: '/fishing',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'togel',
    icon: 'interactive-17.svg',
    label: 'interactive',
    display: 'Interactive',
    href: '/togel',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'bonus',
    icon: 'bonus-17.svg',
    label: 'bonus',
    display: 'Bonus',
    href: '/bonus',
    desktopSize: 32,
    mobileSize: 24,
  },
  {
    key: 'other',
    icon: 'arcade-17.svg',
    label: 'arcade',
    display: 'Arcade',
    href: '/other',
    desktopSize: 32,
    mobileSize: 24,
  },
];

function Categories() {
  const { t } = useTranslations();
  const { headerLogo } = useTemplate();
  const router = useRouter();
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const { isAuth } = auth || {};

  const getLabel = (key, fallback) => {
    const translated = t(key);
    const text = translated === key ? fallback : translated;
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  // Enabled categories: Home, Slot, Casino, Sports, Promotions
  const enabledCategoryKeys = ['home', 'slots', 'casino', 'promotions', 'sports'];

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
      // Special handling for Home: authenticated dashboard route (/dashboard/home)
      if (category.key === 'home') {
        const handleHomeClick = () => {
          if (isAuth) {
            router.push('/dashboard/home');
          } else {
            dispatch(
              openModal({
                modal: 'login',
                props: { redirectUrl: '/dashboard/home' },
              }),
            );
          }
        };

        return (
          <button
            type="button"
            onClick={handleHomeClick}
            className="group flex flex-shrink-0 flex-col items-center gap-1.5 transition-all duration-200 hover:opacity-80 active:scale-95 sm:gap-2"
          >
            {content}
          </button>
        );
      }

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
          <div className="scrollbar-hide min-w-0 flex-1 overflow-x-auto">
            <div
              className="flex items-baseline gap-2 sm:gap-4 md:gap-8 lg:gap-14"
              style={{ width: 'max-content', marginLeft: 'auto' }}
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
