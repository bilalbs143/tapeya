'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template21/components/LazyImage/LazyImage';
import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';

// Category icons: served from public (replace with your exact designs at CDN if needed)
const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/';
const BASE_LOGO_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next';

// Provider lists for hover preview (same as in SlotsPage, LiveCasinoPage, SportsPage)
const CASINO_PROVIDERS = [
  { key: 'evolution', name: 'Evolution', logo: `${BASE_LOGO_URL}/logos/Evolution-16.png`, href: '/live-casino?q=live' },
  { key: 'TOMHORN_7Mojos', name: '7 Mojos', logo: `${BASE_LOGO_URL}/logos/7mojos-16.png`, href: '/live-casino?q=live' },
  { key: 'TOMHORN_AbsoluteLive', name: 'Absolute Live', logo: `${BASE_LOGO_URL}/logos/Absolute-16.png`, href: '/live-casino?q=live' },
  { key: 'TOMHORN_VIVO', name: 'Vivo', logo: `${BASE_LOGO_URL}/logos/vivo-16.png`, href: '/live-casino?q=live' },
  { key: 'dream_gaming', name: 'Dream Gaming', logo: `${BASE_LOGO_URL}/logos/Dreamgaming-16.png`, href: '/live-casino?q=live' },
  { key: 'sa_game', name: 'Sa Game', logo: `${BASE_LOGO_URL}/logos/sagaming-16.png`, href: '/live-casino?q=live' },
  { key: 'agin', name: 'Agin', logo: `${BASE_LOGO_URL}/logos/AsiaGaming-16.png`, href: '/live-casino?q=live' },
  { key: 'sexy_ae', name: 'SEXYBCRT', logo: `${BASE_LOGO_URL}/logos/SexyGaming-16.png`, href: '/live-casino?q=live' },
];

const SLOTS_PROVIDERS = [
  { key: 'MICRO_Slot', name: 'Microgaming', logo: `${BASE_LOGO_URL}/logos/microgaming.png`, href: '/slots?category=slots' },
  { key: 'booongo', name: 'Booongo', logo: `${BASE_LOGO_URL}/logos/bongo.png`, href: '/slots?category=slots' },
  { key: 'PLAYNGO', name: 'Play n Go', logo: `${BASE_LOGO_URL}/logos/playgo-white.png`, href: '/slots?category=slots' },
  { key: 'habanero', name: 'Habanero', logo: `${BASE_LOGO_URL}/logos/habanero_white 3.png`, href: '/slots?category=slots' },
  { key: 'TOMHORN_SLOT', name: 'Tom Horn Gaming', logo: `${BASE_LOGO_URL}/logos/tomhorn.png`, href: '/slots?category=slots' },
  { key: 'cq9', name: 'CQ9', logo: `${BASE_LOGO_URL}/logos/cq9.png`, href: '/slots?category=slots' },
  { key: 'PGSoft', name: 'Pocket Soft Gaming', logo: `${BASE_LOGO_URL}/logos/Pocketsoft Games.png`, href: '/slots?category=slots' },
  { key: 'redtiger', name: 'Red Tiger', logo: `${BASE_LOGO_URL}/logos/Red Tiger.png`, href: '/slots?category=slots' },
  { key: 'netent', name: 'NetEnt', logo: `${BASE_LOGO_URL}/logos/netent.png`, href: '/slots?category=slots' },
  { key: 'evoplay', name: 'Evoplay', logo: `${BASE_LOGO_URL}/logos/evoplay.png`, href: '/slots?category=slots' },
  { key: 'nlc', name: 'NLC', logo: `${BASE_LOGO_URL}/logos/nlc.png`, href: '/slots?category=slots' },
  { key: 'btg', name: 'Big Time Gaming', logo: `${BASE_LOGO_URL}/logos/BTG_Logo.png`, href: '/slots?category=slots' },
];

const SPORTS_PROVIDERS = [
  { key: 'sports-1', name: 'SBO Sportsbook', logo: `${BASE_LOGO_URL}/logos/SBOBET.png`, href: '/sports' },
  { key: 'sports-2', name: 'SBO Sportsbook Wap', logo: `${BASE_LOGO_URL}/logos/SBOBET-wap.png`, href: '/sports' },
  { key: 'sports-3', name: 'Saba Sports', logo: `${BASE_LOGO_URL}/logos/SABA-SPORTS.png`, href: '/sports' },
  { key: 'sports-4', name: 'AFB Sports', logo: `${BASE_LOGO_URL}/logos/AFB.png`, href: '/sports' },
  { key: 'sports-5', name: 'BTI Sports', logo: `${BASE_LOGO_URL}/logos/BTI-SPORTS.png`, href: '/sports' },
  { key: 'sports-6', name: 'Panda Sports', logo: `${BASE_LOGO_URL}/logos/PANDA-SPORTS.png`, href: '/sports' },
  { key: 'sports-7', name: 'Lucky Sports', logo: `${BASE_LOGO_URL}/logos/lucky-white.png`, href: '/sports' },
  { key: 'sports-8', name: 'AP Gaming', logo: `${BASE_LOGO_URL}/logos/ap-gaming.png`, href: '/sports' },
  { key: 'virtual-sports-1', name: 'SBO Virtual Sports', logo: `${BASE_LOGO_URL}/logos/SBOBET-vs.png`, href: '/sports' },
];

const ARCADE_PROVIDERS = [
  { key: 'jdb_arcade', name: 'JDP Gaming', logo: `${BASE_LOGO_URL}/logos/JDP-white.png`, href: '/slots?category=arcade' },
  { key: 'hacksaw_arcade', name: 'Hacksaw', logo: `${BASE_LOGO_URL}/logos/Hacksaw.png`, href: '/slots?category=arcade' },
  { key: 'oriental', name: 'Oriental Game', logo: `${BASE_LOGO_URL}/logos/Oriental.png`, href: '/slots?category=arcade' },
  { key: 'fc_arcade', name: 'FC Arcade', logo: `${BASE_LOGO_URL}/logos/fc arcade-white.png`, href: '/slots?category=arcade' },
];

const TABLE_PROVIDERS = [
  { key: 'MICRO_Casino_Table', name: 'Microgaming', logo: `${BASE_LOGO_URL}/logos/microgaming.png`, href: '/live-casino?q=table' },
  { key: 'crypto_poker', name: 'Crypto in poker', logo: `${BASE_LOGO_URL}/logos/crypto-poker-white.png`, href: '/live-casino?q=table' },
];

const CATEGORIES_WITH_PREVIEW = ['slots', 'casino', 'sports', 'other', 'table'];

const PROVIDERS_BY_CATEGORY = {
  slots: SLOTS_PROVIDERS,
  casino: CASINO_PROVIDERS,
  sports: SPORTS_PROVIDERS,
  other: ARCADE_PROVIDERS,
  table: TABLE_PROVIDERS,
};

const CATEGORIES = [
  { key: 'home', icon: 'Home-up.png', label: 'home', display: 'Home', href: '/', desktopSize: 38, mobileSize: 30 },
  { key: 'togel', icon: 'Togel-up.png', label: 'togel', display: 'Togel', href: '/togel', desktopSize: 38, mobileSize: 30 },
  { key: 'slots', icon: 'Slots-up.png', label: 'slots', display: 'Slot', href: '/slots?category=slots', desktopSize: 38, mobileSize: 30 },
  { key: 'casino', icon: 'casino-up.png', label: 'casino', display: 'Live Casino', href: '/live-casino?q=live', desktopSize: 38, mobileSize: 30 },
  { key: 'sports', icon: 'Sports-up.png', label: 'sports', display: 'Sport', href: '/sports', desktopSize: 32, mobileSize: 24 },
  { key: 'fishing', icon: 'sabung-up.png', label: 'fishing', display: 'Sabung', href: '/fishing', desktopSize: 32, mobileSize: 24 },
  { key: 'other', icon: 'arcade-up.png', label: 'arcade', display: 'Arcade', href: '/slots?category=arcade', desktopSize: 32, mobileSize: 24 },
  { key: 'table', icon: 'interactive-up.png', label: 'table_games', display: 'Table Games', href: '/live-casino?q=table', desktopSize: 32, mobileSize: 24 },
  { key: 'promotions', icon: 'Promotion-up.png', label: 'promotions', display: 'Promosi', href: '/promotions', desktopSize: 36, mobileSize: 28 },
  { key: 'event', icon: 'Event-up.png', label: 'event', display: 'Event', href: '/promotions', desktopSize: 32, mobileSize: 24 },
];

const HOVER_LEAVE_DELAY_MS = 150;
const HOVER_ENTER_DELAY_MS = 80;

const ENABLED_CATEGORY_KEYS = ['home', 'slots', 'casino', 'promotions', 'sports', 'other', 'table'];

// Memoized category item – prevents re-mount and loader blink when parent re-renders (e.g. on hover)
const CategoryItem = React.memo(function CategoryItem({ category, isMobile, label, isEnabled, href, isActive }) {
  const content = (
    <>
      <div
        className={`transition-all duration-200 ${isMobile ? '' : 'rounded-lg'} ${
          isEnabled ? 'group-hover:scale-110' : 'opacity-40'
        }`}
        style={{
          height: isMobile ? '22px' : 'clamp(18px, 2.2vw, 26px)',
          width: isMobile ? '22px' : 'clamp(18px, 2.2vw, 26px)',
          minHeight: isMobile ? '22px' : '18px',
          minWidth: isMobile ? '22px' : '18px',
        }}
      >
        <LazyImage
          src={`${BASE_ICON_URL}${category.icon}`}
          alt={label || category.display}
          width={26}
          height={26}
          className="h-full w-full object-contain [filter:brightness(0)_invert(1)]"
          showLoadingIndicator={false}
        />
      </div>
      <span
        className={`font-bold uppercase whitespace-nowrap ${
          isEnabled ? 'text-white' : 'text-white opacity-40'
        }`}
        style={{ fontSize: isMobile ? '10px' : '11px' }}
      >
        {label}
      </span>
    </>
  );

  const boxStyle = isMobile
    ? {
      background:
          'linear-gradient(90deg, rgba(26,26,26,0.3) 0%, rgba(0,0,0,0.3) 10%, rgba(0,0,0,0.3) 100%), #a08540',
    }
    : undefined;

  const itemStyle = {
    minWidth: 72,
    padding: isMobile ? '12px 10px' : '25px 10px',
    height: '100%',
    ...boxStyle,
  };

  const effectiveHref = href ?? category.href;

  const activeBgStyle = isActive
    ? { background: 'linear-gradient(180deg, #0b0b0b 0%, rgba(255, 255, 255, 0) 100%)' }
    : undefined;

  if (isEnabled) {
    return (
      <Link
        href={effectiveHref}
        className={`categories-item-link group flex flex-shrink-0 flex-col items-center transition-all duration-200 hover:opacity-80 active:scale-95 [&:hover]:[background:linear-gradient(180deg,#0b0b0b_0%,rgba(255,255,255,0)_100%)] [&:active]:[background:linear-gradient(180deg,#0b0b0b_0%,rgba(255,255,255,0)_100%)] ${
          isActive ? 'active' : ''
        } ${isMobile ? 'gap-1.5' : 'gap-2 sm:gap-2.5'}`}
        style={{ ...itemStyle, ...activeBgStyle }}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`flex flex-shrink-0 cursor-not-allowed flex-col items-center ${
        isMobile ? 'gap-1.5' : 'gap-2 sm:gap-2.5'
      }`}
      style={itemStyle}
    >
      {content}
    </div>
  );
});

// Memoized provider card for hover panel – avoids loader flash by not showing loading indicator
const ProviderCard = React.memo(function ProviderCard({ provider }) {
  const href = `${provider.href}${provider.href.includes('?') ? '&' : '?'}provider=${encodeURIComponent(provider.key)}`;
  const invertFilter =
    provider.key !== 'sports-7' && provider.key !== 'PLAYNGO' && provider.key !== 'fc_arcade'
      ? '[filter:brightness(0)_invert(1)]'
      : '';

  return (
    <div
      className="flex flex-col items-center gap-3"
      style={{ minWidth: '100px' }}
    >
      <div
        className="flex h-12 w-24 items-center justify-center"
        style={{ minHeight: '48px' }}
      >
        <LazyImage
          src={provider.logo}
          alt={provider.name}
          width={96}
          height={48}
          className={`h-auto max-h-12 w-auto max-w-24 object-contain ${invertFilter}`}
          showLoadingIndicator={false}
        />
      </div>
      <Link
        href={href}
        className="whitespace-nowrap rounded border border-white bg-transparent px-4 py-2 text-center text-xs font-bold uppercase text-white transition-opacity hover:opacity-90 active:scale-95"
        style={{ minWidth: '120px' }}
      >
        {provider.name}
      </Link>
    </div>
  );
});

function Categories() {
  const { t } = useTranslations();
  const { headerLogo } = useTemplate();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobileSliderRef = useRef(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const hoverLeaveTimeoutRef = useRef(null);
  const hoverEnterTimeoutRef = useRef(null);
  const bodyOverflowXRef = useRef('');
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(min-width: 768px)');
    const update = (e) => setIsDesktop(e.matches);
    setIsDesktop(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const clearHoverLeaveTimeout = useCallback(() => {
    if (hoverLeaveTimeoutRef.current) {
      clearTimeout(hoverLeaveTimeoutRef.current);
      hoverLeaveTimeoutRef.current = null;
    }
  }, []);

  const clearHoverEnterTimeout = useCallback(() => {
    if (hoverEnterTimeoutRef.current) {
      clearTimeout(hoverEnterTimeoutRef.current);
      hoverEnterTimeoutRef.current = null;
    }
  }, []);

  const restoreBodyOverflowX = useCallback(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflowX = bodyOverflowXRef.current;
    }
  }, []);

  const scheduleHoverLeave = useCallback(() => {
    clearHoverLeaveTimeout();
    clearHoverEnterTimeout();
    hoverLeaveTimeoutRef.current = setTimeout(() => {
      restoreBodyOverflowX();
      setHoveredCategory(null);
      hoverLeaveTimeoutRef.current = null;
    }, HOVER_LEAVE_DELAY_MS);
  }, [clearHoverLeaveTimeout, clearHoverEnterTimeout, restoreBodyOverflowX]);

  useEffect(() => {
    return () => {
      clearHoverLeaveTimeout();
      clearHoverEnterTimeout();
      if (hoveredCategory && CATEGORIES_WITH_PREVIEW.includes(hoveredCategory)) {
        restoreBodyOverflowX();
      }
    };
  }, [clearHoverLeaveTimeout, clearHoverEnterTimeout, hoveredCategory, restoreBodyOverflowX]);

  useEffect(() => {
    if (!isDesktop && hoveredCategory) {
      clearHoverLeaveTimeout();
      clearHoverEnterTimeout();
      restoreBodyOverflowX();
      setHoveredCategory(null);
    }
  }, [isDesktop, hoveredCategory, clearHoverLeaveTimeout, clearHoverEnterTimeout, restoreBodyOverflowX]);

  const handleCategoryHoverEnter = useCallback(
    (categoryKey) => {
      clearHoverLeaveTimeout();
      clearHoverEnterTimeout();
      hoverEnterTimeoutRef.current = setTimeout(() => {
        if (typeof document !== 'undefined') {
          bodyOverflowXRef.current = document.body.style.overflowX;
          document.body.style.overflowX = 'hidden';
        }
        setHoveredCategory(categoryKey);
        hoverEnterTimeoutRef.current = null;
      }, HOVER_ENTER_DELAY_MS);
    },
    [clearHoverLeaveTimeout, clearHoverEnterTimeout],
  );

  const handleCategoryHoverLeave = useCallback(() => {
    clearHoverEnterTimeout();
    scheduleHoverLeave();
  }, [clearHoverEnterTimeout, scheduleHoverLeave]);

  const scrollCategories = useCallback((direction) => {
    const el = mobileSliderRef.current;
    if (!el) return;
    const step = el.clientWidth * 0.6;
    el.scrollBy({ left: direction === 'next' ? step : -step, behavior: 'smooth' });
  }, []);

  const getLabel = useCallback(
    (key, fallback) => {
      const translated = t(key);
      const text = translated === key ? fallback : translated;
      if (!text) return '';
      return text.toUpperCase();
    },
    [t],
  );

  const getCategoryLabelAndHref = useCallback(
    (category) => {
      if (category.key === 'home') {
        return {
          label: isAuth ? (t('user_area') || 'User Area').toUpperCase() : getLabel(category.label, category.display),
          href: '/',
        };
      }
      return { label: getLabel(category.label, category.display), href: null };
    },
    [isAuth, t, getLabel],
  );

  const isCategoryActive = useCallback(
    (effectiveHref) => {
      const path = (pathname || '/').replace(/\/$/, '') || '/';
      const effectivePath = (effectiveHref.split('?')[0] || '/').replace(/\/$/, '') || '/';
      if (path !== effectivePath) return false;
      const effectiveQuery = effectiveHref.includes('?') ? effectiveHref.split('?')[1] : '';
      if (!effectiveQuery) return true;
      const params = new URLSearchParams(effectiveQuery);
      for (const [key, value] of params) {
        if (searchParams?.get(key) !== value) return false;
      }
      return true;
    },
    [pathname, searchParams],
  );

  const categoriesContent = useMemo(() => {
    return (
      <div className="flex items-baseline" style={{ width: 'max-content', marginLeft: 'auto' }}>
        {CATEGORIES.map((category) => {
          const { label, href } = getCategoryLabelAndHref(category);
          const effectiveHref = href ?? category.href;
          const isEnabled = ENABLED_CATEGORY_KEYS.includes(category.key);
          const isActive = isCategoryActive(effectiveHref);

          if (isDesktop && CATEGORIES_WITH_PREVIEW.includes(category.key)) {
            return (
              <div
                key={category.key}
                className="relative flex flex-shrink-0 flex-col items-center"
                onMouseEnter={() => handleCategoryHoverEnter(category.key)}
                onMouseLeave={handleCategoryHoverLeave}
              >
                <CategoryItem category={category} isMobile={false} label={label} isEnabled={isEnabled} href={href} isActive={isActive} />
              </div>
            );
          }
          return (
            <CategoryItem key={category.key} category={category} isMobile={false} label={label} isEnabled={isEnabled} href={href} isActive={isActive} />
          );
        })}
      </div>
    );
  }, [isDesktop, getCategoryLabelAndHref, handleCategoryHoverEnter, handleCategoryHoverLeave, isCategoryActive]);

  const mobileCategoriesContent = useMemo(() => {
    return (
      <div className="flex items-center gap-0 px-1" style={{ width: 'max-content' }}>
        {CATEGORIES.map((category) => {
          const { label, href } = getCategoryLabelAndHref(category);
          const effectiveHref = href ?? category.href;
          const isEnabled = ENABLED_CATEGORY_KEYS.includes(category.key);
          const isActive = isCategoryActive(effectiveHref);
          return (
            <CategoryItem key={category.key} category={category} isMobile label={label} isEnabled={isEnabled} href={href} isActive={isActive} />
          );
        })}
      </div>
    );
  }, [getCategoryLabelAndHref, isCategoryActive]);

  const providers = hoveredCategory && PROVIDERS_BY_CATEGORY[hoveredCategory] ? PROVIDERS_BY_CATEGORY[hoveredCategory] : null;
  const showHoverPanel = isDesktop && hoveredCategory && CATEGORIES_WITH_PREVIEW.includes(hoveredCategory) && providers;

  return (
    <section className="bg-[#a08540] md:bg-[#402f04]">
      <div className="container mx-auto px-0 sm:px-4">
        <div className="relative">
          <div className="flex items-center gap-3 sm:gap-6 md:gap-10 lg:gap-14">
            <Link
              href="/"
              className="hidden flex-shrink-0 items-center md:inline-flex"
              style={{ width: 'clamp(100px, 12vw, 150px)', height: 'auto' }}
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

            <div className="flex min-w-0 flex-1 items-center md:hidden">
              <button
                type="button"
                onClick={() => scrollCategories('prev')}
                className="grid h-10 w-5 flex-shrink-0 place-items-center bg-[#a08540] text-black transition-opacity hover:opacity-90 active:opacity-80"
                aria-label="Previous categories"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-8 w-8" fill="currentColor" aria-hidden>
                  <path d="m13.15 16.15l-3.625-3.625q-.125-.125-.175-.25T9.3 12t.05-.275t.175-.25L13.15 7.85q.075-.075.163-.112T13.5 7.7q.2 0 .35.138T14 8.2v7.6q0 .225-.15.363t-.35.137q-.05 0-.35-.15"/>
                </svg>
              </button>
              <div
                ref={mobileSliderRef}
                className="categories-slider scrollbar-hide flex min-w-0 flex-1 items-center overflow-x-auto overflow-y-hidden p-[5px]"
              >
                {mobileCategoriesContent}
              </div>
              <button
                type="button"
                onClick={() => scrollCategories('next')}
                className="grid h-10 w-7 flex-shrink-0 place-items-center bg-[#a08540] text-black transition-opacity hover:opacity-90 active:opacity-80"
                aria-label="Next categories"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="h-8 w-7 rotate-180" fill="currentColor" aria-hidden>
                  <path d="m13.15 16.15l-3.625-3.625q-.125-.125-.175-.25T9.3 12t.05-.275t.175-.25L13.15 7.85q.075-.075.163-.112T13.5 7.7q.2 0 .35.138T14 8.2v7.6q0 .225-.15.363t-.35.137q-.05 0-.35-.15"/>
                </svg>
              </button>
            </div>

            <div className="scrollbar-hide hidden min-w-0 flex-1 overflow-x-auto md:block">
              {categoriesContent}
            </div>
          </div>

          {showHoverPanel && (
            <div
              className="absolute left-1/2 top-full z-50 hidden max-w-none -translate-x-1/2 overflow-x-hidden py-6 md:block"
              style={{
                background: 'rgba(0, 0, 0, .9)',
                width: '100vw',
                maxWidth: '100vw',
              }}
              onMouseEnter={clearHoverLeaveTimeout}
              onMouseLeave={scheduleHoverLeave}
              role="menu"
              tabIndex={0}
              aria-label={t(hoveredCategory === 'other' ? 'arcade' : hoveredCategory) || hoveredCategory}
            >
              <div className="mx-auto flex flex-wrap items-end justify-center gap-x-8 gap-y-6 px-4 sm:px-6">
                {providers.map((provider) => (
                  <ProviderCard key={provider.key} provider={provider} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default Categories;
