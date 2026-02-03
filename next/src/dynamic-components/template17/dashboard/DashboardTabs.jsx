'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect,useMemo, useState } from 'react';

import ArcadePageContainer from '@/app/(root)/arcade/ArcadePageContainer';
import LiveCasinoContainer from '@/app/(root)/live-casino/LiveCasinoContainer';
import SlotsPageContainer from '@/app/(root)/slots/SlotsPageContainer';
import SportsContainer from '@/app/(root)/sports/SportsContainer';
import AnnouncementsPage from '@/dynamic-components/template17/announcements/AnnouncementsPage';
import LazyImage from '@/dynamic-components/template17/components/LazyImage/LazyImage';
import DepositPage from '@/dynamic-components/template17/dashboard/DepositPage';
import WithdrawalPage from '@/dynamic-components/template17/dashboard/WithdrawalPage';
import InquiryTab from '@/dynamic-components/template17/modals/customer-service/InquiryTab';
import NoteTab from '@/dynamic-components/template17/modals/customer-service/NoteTab';
import CouponsTab from '@/dynamic-components/template17/modals/transaction/CouponsTab';
import ExchangeTab from '@/dynamic-components/template17/modals/transaction/ExchangeTab';
import PointsTab from '@/dynamic-components/template17/modals/transaction/PointsTab';
import PromotionsPage from '@/dynamic-components/template17/promotions/PromotionsPage';
import { useTranslations } from '@/hooks/useTranslations';

const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/';

// Categories from Categories component
const categories = [
  {
    key: 'home',
    icon: 'home-17.svg',
    label: 'home',
    display: 'Home',
    href: '/',
  },
  {
    key: 'slots',
    icon: 'slots-17.svg',
    label: 'slots',
    display: 'Slots',
    href: '/slots?category=slots',
  },
  {
    key: 'casino',
    icon: 'casino-17.svg',
    label: 'casino',
    display: 'Casino',
    href: '/live-casino?q=live',
  },
  {
    key: 'sports',
    icon: 'sports-17.svg',
    label: 'sports',
    display: 'Sports',
    href: '/sports',
  },
  {
    key: 'fishing',
    icon: 'coke-fight-17.svg',
    label: 'fishing',
    display: 'Fishing',
    href: '/fishing',
  },
  {
    key: 'togel',
    icon: 'interactive-17.svg',
    label: 'interactive',
    display: 'Interactive',
    href: '/togel',
  },
  {
    key: 'bonus',
    icon: 'bonus-17.svg',
    label: 'bonus',
    display: 'Bonus',
    href: '/bonus',
  },
  {
    key: 'other',
    icon: 'arcade-17.svg',
    label: 'arcade',
    display: 'Arcade',
    href: '/other',
  },
];

function DashboardTabs() {
  const { t } = useTranslations();
  const router = useRouter();

  const primaryTabs = useMemo(() => {
    const getLabel = (key, fallback) => {
      const translated = t(key);
      const text = translated === key ? fallback : translated;
      if (!text) return '';
      return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    return categories.map((category) => ({
      key: category.key,
      label: getLabel(category.label, category.display),
      icon: category.icon,
      href: category.href,
    }));
  }, [t]);

  const secondaryTabs = useMemo(
    () => [
      // Uses existing translated keys from common.json for all locales
      {
        key: 'cm_inquiry',
        label:
          t('customer_inquiry') ||
          t('inquiry') ||
          'CM Inquiry',
      },
      { key: 'notes', label: t('notes') || 'Notes' },
      {
        key: 'announcement',
        label:
          t('announcement') ||
          t('announcements') ||
          'Announcement',
      },
      { key: 'withdrawal', label: t('withdrawal') || 'Withdrawal' },
      { key: 'deposit', label: t('deposit') || 'Deposit' },
      {
        key: 'promotion',
        label:
          t('promotions_badge') ||
          t('promotion') ||
          'Promotion',
      },
      { key: 'points', label: t('points') || 'Points' },
      { key: 'coupons', label: t('coupons') || 'Coupons' },
      {
        key: 'convert',
        label:
          t('convert_points_coupons') ||
          'Convert Points and Coupon',
      },
    ],
    [t],
  );

  const [activePrimary, setActivePrimary] = useState('home');
  const [activeSecondary, setActiveSecondary] = useState('cm_inquiry');

  const isHomeTab = activePrimary === 'home';

  // Handle redirect for categories without containers
  useEffect(() => {
    if (['fishing', 'togel', 'bonus'].includes(activePrimary)) {
      const category = categories.find((cat) => cat.key === activePrimary);
      if (category) {
        router.push(category.href);
      }
    }
  }, [activePrimary, router]);

  const renderContent = () => {
    if (activePrimary === 'home') {
      switch (activeSecondary) {
        case 'cm_inquiry':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <InquiryTab activeTab="inquiry" />
            </div>
          );
        case 'notes':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <NoteTab />
            </div>
          );
        case 'announcement':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              {/* Reuse the full announcements view inside the dashboard tab */}
              <AnnouncementsPage embedded />
            </div>
          );
        case 'withdrawal':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <WithdrawalPage embedded />
            </div>
          );
        case 'deposit':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <DepositPage embedded />
            </div>
          );
        case 'promotion':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <PromotionsPage embedded />
            </div>
          );
        case 'points':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <PointsTab />
            </div>
          );
        case 'coupons':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <CouponsTab />
            </div>
          );
        case 'convert':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <ExchangeTab />
            </div>
          );
        default:
          return null;
      }
    }

    if (activePrimary === 'slots') {
      return <SlotsPageContainer />;
    }

    if (activePrimary === 'casino') {
      return <LiveCasinoContainer />;
    }

    if (activePrimary === 'sports') {
      return <SportsContainer />;
    }

    if (activePrimary === 'other') {
      return <ArcadePageContainer />;
    }

    // For categories without specific containers (fishing, togel, bonus)
    // Show redirecting message (navigation handled by useEffect)
    if (['fishing', 'togel', 'bonus'].includes(activePrimary)) {
      return (
        <div className="flex min-h-[300px] items-center justify-center">
          <p className="text-[#E0E0E0]">{t('redirecting') || 'Redirecting...'}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <section className="mt-6 w-full">
      {/* Primary (outer) tabs */}
      <div
        className="w-full border-b border-black bg-[#1E1E1E]"
        style={{
          boxShadow: '0 -8px 9px 0 rgba(0, 0, 0, 0.35) inset',
        }}
      >
        <div className="flex flex-wrap gap-1 px-2 pt-2 sm:px-3 sm:pt-3">
          {primaryTabs.map((tab) => {
            const isActive = tab.key === activePrimary;
            const enabledTabs = ['home', 'slots', 'casino', 'sports'];
            const isDisabled = !enabledTabs.includes(tab.key);
            
            const baseButtonClasses =
              'flex items-center gap-2 rounded-t-[5px] px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm transition-colors';
            const activeClasses =
              'border border-b-0 border-black bg-[#161616] text-[#E8D25E]';
            const inactiveClasses =
              'border border-transparent text-[#A0A0A0] hover:text-white';
            const disabledClasses =
              'border border-transparent text-[#A0A0A0] opacity-40 cursor-not-allowed';

            const commonProps = {
              type: 'button',
              onClick: isDisabled ? undefined : () => setActivePrimary(tab.key),
              disabled: isDisabled,
              className: `${baseButtonClasses} ${
                isDisabled
                  ? disabledClasses
                  : isActive
                  ? activeClasses
                  : inactiveClasses
              }`,
            };

            if (tab.key === 'home') {
              return (
                <button key={tab.key} {...commonProps}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="23"
                    viewBox="0 0 25 23"
                    fill="none"
                  >
                    <path
                      d="M10.0836 15.834H14.7502M0.750244 6.50071L12.1042 0.82371C12.2013 0.775234 12.3084 0.75 12.4169 0.75C12.5254 0.75 12.6325 0.775234 12.7296 0.82371L24.0836 6.50071M21.7502 10.0007V19.334C21.7502 19.9529 21.5044 20.5464 21.0668 20.984C20.6292 21.4215 20.0358 21.6674 19.4169 21.6674H5.41691C4.79807 21.6674 4.20458 21.4215 3.767 20.984C3.32941 20.5464 3.08358 19.9529 3.08358 19.334V10.0007"
                      stroke={isDisabled ? '#7A7A7A' : isActive ? '#E8D25E' : '#7A7A7A'}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={isDisabled ? 0.4 : 1}
                    />
                  </svg>
                </button>
              );
            }

            return (
              <button key={tab.key} {...commonProps}>
                <div className="flex items-center gap-2">
                  {tab.icon && (
                    <LazyImage
                      src={`${BASE_ICON_URL}${tab.icon}`}
                      alt={tab.label}
                      width={20}
                      height={20}
                      className={`h-4 w-4 sm:h-5 sm:w-5 object-contain ${
                        isDisabled ? 'opacity-40' : ''
                      }`}
                    />
                  )}
                  <span className={isActive && !isDisabled ? 'text-[#E8D25E]' : ''}>
                    {tab.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary (inner) tabs - shown only for Home */}
      {isHomeTab && (
        <div className="mt-4 flex flex-wrap gap-3">
          {secondaryTabs.map((tab) => {
            const isActive = tab.key === activeSecondary;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSecondary(tab.key)}
                className={`flex items-center gap-2 rounded-[5px] border bg-[#161616] px-4 py-2 text-xs font-medium sm:text-sm transition-colors ${
                  isActive
                    ? 'border-black text-[#E8D25E]'
                    : 'border-[#2A2A2A] text-[#E0E0E0] hover:border-[#E8D25E]'
                }`}
              >
                <span className={isActive ? 'text-[#E8D25E]' : ''}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content area for tabs */}
      <div className="mt-4 min-h-[120px] rounded-[5px] border border-[#2A2A2A] bg-[#161616] px-4 py-3">
        {renderContent()}
      </div>
    </section>
  );
}

export default DashboardTabs;

