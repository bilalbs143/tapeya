'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';

const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/';
const WHATSAPP_URL = 'https://web.whatsapp.com';

const DASHBOARD_DEPOSIT_TAB = '/dashboard/home?tab=deposit';
const DASHBOARD_INQUIRY_TAB = '/dashboard/home?tab=customer-inquiry';

export default function MobileLeftSidebar() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuth = useSelector((state) => state.auth.isAuth);

  const currentTab = (searchParams?.get('tab') || '').toLowerCase();

  const isActive = (href, tabMatch) => {
    if (!pathname) return false;
    if (href === '/') return pathname === '/';
    if (tabMatch && pathname.startsWith('/dashboard')) {
      // Dashboard tab aliases: customer-inquiry -> cm_inquiry in URL
      if (tabMatch === 'customer-inquiry') return currentTab === 'customer-inquiry' || currentTab === 'cm_inquiry';
      return currentTab === tabMatch;
    }
    return pathname.startsWith(href);
  };

  const linkClass = (href, tabMatch) =>
    `mobile-left-sidebar-btn ${isActive(href, tabMatch) ? 'mobile-left-sidebar-btn-active' : ''}`;

  return (
    <aside
      className="mobile-left-sidebar"
      aria-label={t('quick_links') || 'Quick links'}
    >
      <Link href="/" className={linkClass('/')}>
        <Image
          src={`${BASE_ICON_URL}mobile-side-home.png`}
          alt=""
          width={24}
          height={24}
          className="flex-shrink-0 object-contain"
        />
        <span>{t('home') || 'Home'}</span>
      </Link>

      <Link href="/promotions" className={linkClass('/promotions')}>
        <Image
          src={`${BASE_ICON_URL}mobile-side-promotion.png`}
          alt=""
          width={24}
          height={24}
          className="flex-shrink-0 object-contain"
        />
        <span>{t('promotions') || 'Promotions'}</span>
      </Link>

      <Link href={DASHBOARD_DEPOSIT_TAB} className={linkClass('/dashboard/home', 'deposit')}>
        <Image
          src={`${BASE_ICON_URL}mobile-side-deposit.png`}
          alt=""
          width={24}
          height={24}
          className="flex-shrink-0 object-contain"
        />
        <span>{t('deposit') || 'Deposit'}</span>
      </Link>

      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mobile-left-sidebar-btn"
      >
        <Image
          src={`${BASE_ICON_URL}mobile-side-whatsapp.png`}
          alt=""
          width={24}
          height={24}
          className="flex-shrink-0 object-contain"
        />
        <span>{t('whatsapp') || 'Whatsapp'}</span>
      </a>

      <Link
        href={isAuth ? DASHBOARD_INQUIRY_TAB : '/contact-us'}
        className={linkClass(isAuth ? '/dashboard/home' : '/contact-us', isAuth ? 'customer-inquiry' : null)}
      >
        <Image
          src={`${BASE_ICON_URL}mobile-side-inquiry.png`}
          alt=""
          width={24}
          height={24}
          className="flex-shrink-0 object-contain"
        />
        <span>{t('inquiry') || 'Inquiry'}</span>
      </Link>
    </aside>
  );
}
