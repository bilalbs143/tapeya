'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect,useMemo, useState } from 'react';

import LiveCasinoContainer from '@/app/(root)/live-casino/LiveCasinoContainer';
import SlotsPageContainer from '@/app/(root)/slots/SlotsPageContainer';
import TemplateRenderer from '@/dynamic-components/template-pages/TemplateRenderer';
import AnnouncementsPage from '@/dynamic-components/template22/announcements/AnnouncementsPage';
import LazyImage from '@/dynamic-components/template22/components/LazyImage/LazyImage';
import BettingManagementPage from '@/dynamic-components/template22/dashboard/BettingManagementPage';
import DepositPage from '@/dynamic-components/template22/dashboard/DepositPage';
import ProfilePage from '@/dynamic-components/template22/dashboard/ProfilePage';
import ReferralsPage from '@/dynamic-components/template22/dashboard/ReferralsPage';
import WithdrawalPage from '@/dynamic-components/template22/dashboard/WithdrawalPage';
import T22_LiveCasino from '@/dynamic-components/template22/live-casino/LiveCasinoPage';
import InquiryTab from '@/dynamic-components/template22/modals/customer-service/InquiryTab';
import NoteTab from '@/dynamic-components/template22/modals/customer-service/NoteTab';
import CouponsTab from '@/dynamic-components/template22/modals/transaction/CouponsTab';
import ExchangeTab from '@/dynamic-components/template22/modals/transaction/ExchangeTab';
import PointsTab from '@/dynamic-components/template22/modals/transaction/PointsTab';
import PromotionsPage from '@/dynamic-components/template22/promotions/PromotionsPage';
import T22_Slots from '@/dynamic-components/template22/slots/SlotsPage';
import { useTranslations } from '@/hooks/useTranslations';

// Same BASE_ICON_URL and icon filenames as Categories component
const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/';

// Categories – same list and icons as Categories component (template22)
const categories = [
  { key: 'home', icon: 'Home-up.png', label: 'home', display: 'Home', href: '/' },
  { key: 'togel', icon: 'Togel-up.png', label: 'togel', display: 'Togel', href: '/togel' },
  { key: 'slots', icon: 'Slots-up.png', label: 'slots', display: 'Slot', href: '/slots?category=slots' },
  { key: 'casino', icon: 'casino-up.png', label: 'casino', display: 'Live Casino', href: '/live-casino?q=live' },
  { key: 'sports', icon: 'Sports-up.png', label: 'sports', display: 'Sport', href: '/sports' },
  { key: 'fishing', icon: 'sabung-up.png', label: 'fishing', display: 'Sabung', href: '/fishing' },
  { key: 'other', icon: 'arcade-up.png', label: 'arcade', display: 'Arcade', href: '/slots?category=arcade' },
  { key: 'table', icon: 'interactive-up.png', label: 'table_games', display: 'Table Games', href: '/live-casino?q=table' },
  { key: 'promotions', icon: 'Promotion-up.png', label: 'promotions', display: 'Promosi', href: '/promotions' },
  { key: 'event', icon: 'Event-up.png', label: 'event', display: 'Event', href: '/promotions' },
];

function DashboardTabs() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

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
      {
        key: 'history',
        label: t('history') || 'History',
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
      {
        key: 'referral',
        label: t('referral') || t('referrals') || 'Referral',
      },
      {
        key: 'profile',
        label: t('profile') || 'Profile',
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

  const validSecondaryKeys = useMemo(() => {
    return new Set(secondaryTabs.map((tab) => tab.key));
  }, [secondaryTabs]);

  const [activePrimary, setActivePrimary] = useState('home');
  const [activeSecondary, setActiveSecondary] = useState('cm_inquiry');

  const isHomeTab = activePrimary === 'home';

  // Support deep-linking into dashboard/home inner tabs, e.g. /dashboard/home?tab=deposit
  useEffect(() => {
    const raw = (searchParams?.get('tab') || '').toLowerCase();
    if (!raw) return;

    const aliases = {
      // customer inquiry
      cm_inquiry: 'cm_inquiry',
      inquiry: 'cm_inquiry',
      'customer-inquiry': 'cm_inquiry',
      customer_inquiry: 'cm_inquiry',
      // notes
      note: 'notes',
      notes: 'notes',
      // history / bet history
      history: 'history',
      'bet-history': 'history',
      betting: 'history',
      // announcement
      announcement: 'announcement',
      announcements: 'announcement',
      // withdrawal/deposit
      withdraw: 'withdrawal',
      withdrawal: 'withdrawal',
      deposit: 'deposit',
      // promotions
      promotion: 'promotion',
      promotions: 'promotion',
      // referral
      referral: 'referral',
      referrals: 'referral',
      // profile
      profile: 'profile',
      profiles: 'profile',
      // points/coupons/convert
      points: 'points',
      coupons: 'coupons',
      convert: 'convert',
    };

    const nextSecondary = aliases[raw];
    if (!nextSecondary || !validSecondaryKeys.has(nextSecondary)) return;

    setActivePrimary('home');
    setActiveSecondary(nextSecondary);
  }, [searchParams, validSecondaryKeys]);

  // Handle redirect for categories that have no embedded tab view (fishing, togel, event)
  useEffect(() => {
    if (['fishing', 'togel', 'event'].includes(activePrimary)) {
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
        case 'history':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <BettingManagementPage embedded />
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
        case 'referral':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <ReferralsPage embedded />
            </div>
          );
        case 'profile':
          return (
            <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
              <ProfilePage embedded />
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

    if (activePrimary === 'other') {
      return (
        <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
          <T22_Slots categoryOverride="arcade" />
        </div>
      );
    }

    if (activePrimary === 'sports') {
      return (
        <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
          <TemplateRenderer pageKey="sports" />
        </div>
      );
    }

    if (activePrimary === 'table') {
      return (
        <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
          <T22_LiveCasino categoryOverride="table" />
        </div>
      );
    }

    if (activePrimary === 'promotions') {
      return (
        <div className="scrollbar-hide min-h-[300px] overflow-y-auto">
          <PromotionsPage embedded />
        </div>
      );
    }

    // For categories without embedded view (fishing, togel, event) – redirecting (handled by useEffect)
    if (['fishing', 'togel', 'event'].includes(activePrimary)) {
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
        className="w-full flex flex-col"
        style={{
          backgroundImage: 'linear-gradient(#272b30, #272b30 60%, #1e2125)',
        }}
      >
        <div className="flex flex-wrap mt-auto">
          {primaryTabs.map((tab) => {
            const isActive = tab.key === activePrimary;
            // Same enabled categories as Categories component (template22)
            const enabledTabs = ['home', 'slots', 'casino', 'promotions', 'sports', 'other', 'table'];
            const isDisabled = !enabledTabs.includes(tab.key);
            
            const baseButtonClasses =
              'flex items-center gap-2 text-[14px] font-medium transition-colors py-[10px] px-[15px] ml-[2px] mb-[2px]';
            const activeClasses =
              'bg-[#3e444c] text-white border border-[#1c1e22] rounded-t-[4px]';
            const inactiveClasses =
              'border border-transparent text-[#A0A0A0] hover:text-white';
            const disabledClasses =
              'border border-transparent text-[#A0A0A0] opacity-40 cursor-not-allowed';
            
            const commonProps = {
              key: tab.key,
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

            return (
              <button {...commonProps}>
                <div className="flex items-center gap-2">
                  {tab.icon && (
                    <LazyImage
                      src={`${BASE_ICON_URL}${tab.icon}`}
                      alt={tab.label}
                      width={16}
                      height={16}
                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 object-contain [filter:brightness(0)_invert(1)] ${
                        isDisabled ? 'opacity-40' : ''
                      }`}
                    />
                  )}
                  {tab.key !== 'home' && (
                    <span
                      className={`capitalize ${isActive && !isDisabled ? 'text-white' : ''}`}
                    >
                      {tab.label}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary (inner) tabs - shown only for Home */}
      {isHomeTab && (
        <div className="mt-4 flex flex-wrap">
          {secondaryTabs.map((tab) => {
            const isActive = tab.key === activeSecondary;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSecondary(tab.key)}
                className="flex items-center gap-2 text-white text-[14px] transition-all py-[10px] px-[15px] rounded-[4px] group ml-[2px] mb-[2px]"
                style={{
                  backgroundImage: isActive 
                    ? 'linear-gradient(#020202, #101112 40%, #191b1d)'
                    : 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
                  border: '1px solid rgba(0, 0, 0, 0.6)',
                  textShadow: '1px 1px 1px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(#020202, #101112 40%, #191b1d)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundImage = 'linear-gradient(#484e55, #3a3f44 60%, #313539)';
                  }
                }}
              >
                <span className="capitalize">
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content area for tabs */}
      <div className="min-h-[120px] rounded-[5px] border border-[#2A2A2A]">
        {renderContent()}
      </div>
    </section>
  );
}

export default DashboardTabs;

