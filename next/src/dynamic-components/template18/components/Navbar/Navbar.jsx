'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LanguageSwitcher } from '@/dynamic-components/template15/components/LanguageSwitcher/LanguageSwitcher';
import LazyImage from '@/dynamic-components/template15/components/LazyImage/LazyImage';
import WalletDropdown from '@/dynamic-components/template15/components/WalletDropdown/WalletDropdown';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { usePopupData } from '@/hooks/usePopupData';
import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/providers/LanguageProvider';
import { logoutUser } from '@/slices/auth/authAction';
import { openModal } from '@/slices/common/commonSlice';
import Tooltip from '@/ui/Tooltip';

// Generate unique filter ID for wallet glow effect
const walletGlowFilterId = `wallet-glow-filter-${Math.random().toString(36).substr(2, 9)}`;

// Simple selectors
const selectAuth = (state) => state.auth;
const selectUnreadCount = (state) => {
  const unread = state.website?.unreadNotesData;
  if (!Array.isArray(unread)) return 0;
  return unread.filter((note) => !note.read_at).length;
};
const selectAnnouncementUnreadCount = (state) => {
  const announcements = state.website?.allAnnouncementsData;
  if (!Array.isArray(announcements)) return 0;
  return announcements.filter((announcement) => !announcement.read_at).length;
};

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { isMobilePlatform } = useMobilePlatform();
  const { currentLocale } = useLanguage();
  const { openAuthModal } = useAuthModal();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { headerLogo } = useTemplate();

  // Simple selectors
  const auth = useSelector(selectAuth);
  const helpUnreadCount = useSelector(selectUnreadCount);
  const announcementUnreadCount = useSelector(selectAnnouncementUnreadCount);

  const { isAuth, user } = auth;
  const { hasActivePopups } = usePopupData();

  const [isDesktopMenuOpen, setIsDesktopMenuOpen] = useState(false);
  const toggleDesktopMenu = useCallback(() => setIsDesktopMenuOpen((p) => !p), []);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const toggleUserDropdown = useCallback(() => setIsUserDropdownOpen((p) => !p), []);

  // Memoized callback functions to prevent unnecessary rerenders
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleOpenLoginModal = useCallback(() => {
    dispatch(openModal('login'));
    closeMobileMenu();
  }, [dispatch, closeMobileMenu]);

  const handleOpenRegisterModal = useCallback(() => {
    dispatch(openModal('register'));
    closeMobileMenu();
  }, [dispatch, closeMobileMenu]);

  const handleOpenCustomerServiceModal = useCallback(() => {
    openAuthModal('customerService');
    closeMobileMenu();
  }, [openAuthModal, closeMobileMenu]);

  const handleOpenCustomerServiceNotes = useCallback(() => {
    openAuthModal({
      modal: 'customerService',
      props: { defaultTab: 'note' },
    });
    closeMobileMenu();
  }, [openAuthModal, closeMobileMenu]);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    closeMobileMenu();
  }, [dispatch, closeMobileMenu]);

  const handleOpenProfileTab = useCallback(() => {
    openAuthModal({
      modal: 'customerService',
      props: { defaultTab: 'profile' },
    });
  }, [openAuthModal]);

  const handleOpenBettingTab = useCallback(() => {
    openAuthModal({
      modal: 'customerService',
      props: { defaultTab: 'betting' },
    });
  }, [openAuthModal]);

  const handleOpenReferralTab = useCallback(() => {
    openAuthModal({
      modal: 'customerService',
      props: { defaultTab: 'referrals' },
    });
  }, [openAuthModal]);

  // User dropdown (desktop)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const userButtonRef = useRef(null);
  const [userButtonWidth, setUserButtonWidth] = useState(0);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  // Memoize expensive computed values
  const userInitial = useMemo(() => {
    return (user?.name || user?.username || 'U').slice(0, 1).toUpperCase();
  }, [user?.name, user?.username]);

  const userDisplayName = useMemo(() => {
    return user?.name || user?.username || t('profile');
  }, [user?.name, user?.username, t]);

  const sidebarApkSrc = useMemo(() => {
    if (currentLocale === 'id') {
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mob-sidenavbar.png';
    }
    if (currentLocale === 'ko') {
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mob-sidenavbar.png';
    }
    return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/mob-sidenavbar.png';
  }, [currentLocale]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      // Use setTimeout to ensure click events on dropdown items are processed first
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  // Keep profile dropdown width equal to the trigger button
  useEffect(() => {
    if (!userButtonRef.current) return;
    const el = userButtonRef.current;
    const updateWidth = () => setUserButtonWidth(el.offsetWidth || 0);
    updateWidth();
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(updateWidth);
      ro.observe(el);
      window.addEventListener('resize', updateWidth);
      return () => {
        ro.disconnect();
        window.removeEventListener('resize', updateWidth);
      };
    } else {
      window.addEventListener('resize', updateWidth);
      return () => window.removeEventListener('resize', updateWidth);
    }
  }, [userDisplayName]);

  // Open register modal with referral code from query param
  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      dispatch(openModal({ modal: 'register', props: { referralCode: ref } }));
    }
  }, [searchParams, dispatch]);

  // Open popup modal when there are active popups (skip if referral link is present)
  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (hasActivePopups && !ref) {
      dispatch(openModal('popup'));
    }
  }, [hasActivePopups, searchParams, dispatch]);

  // Close desktop mega menu on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (isDesktopMenuOpen) {
        setIsDesktopMenuOpen(false);
      }
    };

    if (isDesktopMenuOpen) {
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [isDesktopMenuOpen]);

  const handleOpenTransactionModal = useCallback(() => {
    openAuthModal('transaction');
    closeMobileMenu();
  }, [openAuthModal, closeMobileMenu]);

  const handleOpenTransactionTab = useCallback(() => {
    openAuthModal({ modal: 'transaction', props: { defaultTab: 'deposit' } });
    closeMobileMenu();
  }, [openAuthModal, closeMobileMenu]);

  const handleOpenWithdrawalTab = useCallback(() => {
    openAuthModal({
      modal: 'transaction',
      props: { defaultTab: 'withdrawal' },
    });
    closeMobileMenu();
  }, [openAuthModal, closeMobileMenu]);

  const handleOpenAnnouncementModal = useCallback(() => {
    dispatch(openModal('announcement'));
    closeMobileMenu();
  }, [dispatch, closeMobileMenu]);

  const handleOpenFAQ = useCallback(() => {
    router.push('/dashboard/faqs');
    closeMobileMenu();
  }, [router, closeMobileMenu]);

  const handleOpenFavorites = useCallback(() => {
    router.push('/dashboard/coupons');
    closeMobileMenu();
  }, [router, closeMobileMenu]);

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`relative z-[100] ${isMobilePlatform ? 'pt-safe-top' : ''}`}
      >
        {/* 1px gradient bottom border */}

        <div className="relative px-2 py-3 md:px-6 md:py-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Desktop (Hamburger + Logo) */}
            <div className="relative hidden items-center gap-6 md:flex">
              {/* Desktop Hamburger */}
              <button
                onClick={toggleDesktopMenu}
                className="flex h-12 w-12 items-center justify-center rounded-full border border-[#FFB7034D] bg-[#14213D] transition-colors hover:bg-[#14213D4D]"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 7H20M4 12H20M4 17H20"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Desktop Dropdown Menu */}
              {isDesktopMenuOpen && (
                <>
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 z-[80]"
                    onClick={toggleDesktopMenu}
                  />

                  {/* Dropdown wrapper */}
                  <div className="fixed top-[110px] left-1/2 z-[90] -translate-x-1/2">
                    <div
                      className="rounded-[20px] bg-gradient-to-b from-[#080E1B] to-[#14213D] shadow-[0_40px_120px_rgba(0,0,0,0.85)]"
                      style={{
                        width: '1920px',
                        height: '403px',
                      }}
                    >
                      {/* OUTER PADDING (same as before) */}
                      <div className="h-full py-[40px]">
                        {/* ================= CENTER CONTAINER (IMAGE JESA) ================= */}
                        <div className="mx-auto h-full max-w-[1400px] px-[80px]">
                          {/* CONTENT */}
                          <div className="flex h-full gap-[60px]">
                            {/* ================= LEFT : OUR MENU ================= */}
                            <div className="flex-1">
                              <h3 className="mb-[22px] text-[15px] font-semibold text-white">
                                Our Menu
                              </h3>

                              <div className="grid grid-cols-3 gap-[16px]">
                                {/* Home */}
                                <Link href="/">
                                  <button className="flex h-[54px] w-full items-center justify-between rounded-[10px] bg-[#FFB703] px-5">
                                    <div className="flex items-center gap-3">
                                      <div className="flex h-6 w-6 items-center justify-center">
                                        <Image
                                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Home-12.svg"
                                          alt={t('Home')}
                                          width={22}
                                          height={22}
                                          className="brightness-0 invert"
                                        />
                                      </div>
                                      <span className="text-[15px] font-bold text-white">
                                        {t('Home') || 'Home'}
                                      </span>
                                    </div>
                                    <svg
                                      width="10"
                                      height="17"
                                      viewBox="0 0 10 17"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        d="M1 1L8.5 8.5L1 16"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      />
                                    </svg>
                                  </button>
                                </Link>

                                {/* Deposit */}
                                <button
                                  onClick={handleOpenTransactionTab}
                                  className="group flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#FFB703] hover:bg-[#ffffff05]"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center">
                                      <Image
                                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Deposit-12.svg"
                                        alt={t('deposit')}
                                        width={22}
                                        height={22}
                                        className="opacity-60 transition-all group-hover:opacity-100"
                                      />
                                    </div>
                                    <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                                      {t('deposit') || 'Deposit'}
                                    </span>
                                  </div>
                                  <svg
                                    width="10"
                                    height="17"
                                    viewBox="0 0 10 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-[#888] transition-colors group-hover:stroke-white"
                                  >
                                    <path
                                      d="M1 1L8.5 8.5L1 16"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>

                                {/* withdrawal */}
                                <button
                                  onClick={handleOpenWithdrawalTab}
                                  className="group flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#FFB703] hover:bg-[#ffffff05]"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center">
                                      <img
                                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Group+40.svg"
                                        alt={t('withdrawal')}
                                        width={22}
                                        height={22}
                                        className="opacity-60 transition-all group-hover:opacity-100"
                                      />
                                    </div>
                                    <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                                      {t('withdrawal') || 'Withdrawal'}
                                    </span>
                                  </div>
                                  <svg
                                    width="10"
                                    height="17"
                                    viewBox="0 0 10 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-[#888] transition-colors group-hover:stroke-white"
                                  >
                                    <path
                                      d="M1 1L8.5 8.5L1 16"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>

                                {/* Customer Inquiry */}
                                <button
                                  onClick={handleOpenCustomerServiceModal}
                                  className="group flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#FFB703] hover:bg-[#ffffff05]"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center">
                                      <Image
                                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Cm-Inquiry-12.svg"
                                        alt={t('customer_inquiry')}
                                        width={22}
                                        height={22}
                                        className="opacity-60 transition-all group-hover:opacity-100"
                                      />
                                    </div>
                                    <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                                      {t('customer_inquiry') ||
                                        'Customer Inquiry'}
                                    </span>
                                  </div>
                                  <svg
                                    width="10"
                                    height="17"
                                    viewBox="0 0 10 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-[#888] transition-colors group-hover:stroke-white"
                                  >
                                    <path
                                      d="M1 1L8.5 8.5L1 16"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>

                                {/* Notes */}
                                <button
                                  onClick={handleOpenCustomerServiceNotes}
                                  className="group flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#FFB703] hover:bg-[#ffffff05]"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center">
                                      <Image
                                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Notes-12.svg"
                                        alt={t('notes')}
                                        width={22}
                                        height={22}
                                        className="opacity-60 transition-all group-hover:opacity-100"
                                      />
                                    </div>
                                    <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                                      {t('notes') || 'Notes'}
                                    </span>
                                    {helpUnreadCount > 0 && (
                                      <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-[#FFB703] px-1.5 text-[10px] font-bold text-black">
                                        {helpUnreadCount > 99
                                          ? '99+'
                                          : helpUnreadCount}
                                      </span>
                                    )}
                                  </div>
                                  <svg
                                    width="10"
                                    height="17"
                                    viewBox="0 0 10 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-[#888] transition-colors group-hover:stroke-white"
                                  >
                                    <path
                                      d="M1 1L8.5 8.5L1 16"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>

                                {/* Announcements */}
                                <button
                                  onClick={handleOpenAnnouncementModal}
                                  className="group flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#FFB703] hover:bg-[#ffffff05]"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center">
                                      <Image
                                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Announcements-12.svg"
                                        alt={t('announcement')}
                                        width={22}
                                        height={22}
                                        className="opacity-60 transition-all group-hover:opacity-100"
                                      />
                                    </div>
                                    <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                                      {t('announcement') || 'Announcements'}
                                    </span>
                                    {announcementUnreadCount > 0 && (
                                      <span className="grid h-5 min-w-[20px] place-items-center rounded-full bg-[#FFB703] px-1.5 text-[10px] font-bold text-black">
                                        {announcementUnreadCount > 99
                                          ? '99+'
                                          : announcementUnreadCount}
                                      </span>
                                    )}
                                  </div>
                                  <svg
                                    width="10"
                                    height="17"
                                    viewBox="0 0 10 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-[#888] transition-colors group-hover:stroke-white"
                                  >
                                    <path
                                      d="M1 1L8.5 8.5L1 16"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>

                                <button
                                  onClick={handleOpenTransactionTab}
                                  className="group flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#FFB703] hover:bg-[#ffffff05]"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 items-center justify-center">
                                      <Image
                                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Points-and-Coupons-12.svg"
                                        alt="Faqs"
                                        width={22}
                                        height={22}
                                        className="opacity-60 transition-all group-hover:opacity-100"
                                      />
                                    </div>
                                    <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                                      Points & Coupons
                                    </span>
                                  </div>
                                  <svg
                                    width="10"
                                    height="17"
                                    viewBox="0 0 10 17"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="stroke-[#888] transition-colors group-hover:stroke-white"
                                  >
                                    <path
                                      d="M1 1L8.5 8.5L1 16"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {/* ================= RIGHT : DOWNLOAD APK ================= */}
                            <div className="w-[320px]">
                              <h3 className="mb-[16px] text-[15px] font-semibold text-white">
                                Download APK
                              </h3>

                              <div
                                className="relative mb-10 h-[250px] rounded-[5px] p-[16px]"
                                style={{
                                  backgroundImage:
                                    "url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Mega+Menu+Download.png')",
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center',
                                  backgroundRepeat: 'no-repeat',
                                }}
                              >
                                {/* CONTENT */}
                                <div className="absolute top-12 left-4 z-20 text-left">
                                  <div className="text-[19px] leading-tight font-bold text-[white]">
                                    Scan to Download
                                  </div>
                                  <div className="text-[19px] leading-tight font-bold text-[white]">
                                    APK
                                  </div>
                                </div>
                                <img
                                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Frame+1707486226.png"
                                  alt="QR"
                                  className="absolute bottom-3 left-4 z-20 h-[126px] w-[123px]"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Logo */}
              <Link href="/" className="inline-flex items-center">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Artchip-18.png"
                  alt="Artchip Logo"
                  width={140}
                  height={32}
                  priority
                />
              </Link>
            </div>

            {/* Right Section - Desktop (New Pills Layout) */}
            {/* Right Section - Desktop (High-Fidelity Pills Layout) */}
            <div className="relative hidden items-center gap-3 md:flex">
              {/* Language Selector */}
              <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#FFB7034D] bg-[#14213D] transition-all hover:bg-[#1C2C4E]">
                <div className="h-6 w-6 overflow-hidden rounded-full border border-[#FFB7034D]">
                  <img
                    src="https://flagcdn.com/us.svg"
                    alt="US"
                    className="h-full w-full scale-150 object-cover"
                  />
                </div>
              </button>

              {/* Notification Bell */}
              {isAuth && (
                <button
                  onClick={handleOpenAnnouncementModal}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#FFB7034D] bg-[#14213D] transition-all hover:bg-[#1C2C4E]"
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFB703"
                    strokeWidth="1.5"
                  >
                    <path
                      d="M12.02 2.90997C8.70997 2.90997 6.01997 5.59997 6.01997 8.90997V11.8C6.01997 12.41 5.75997 13.34 5.44997 13.86L4.29997 15.77C3.58997 16.96 4.07997 18.26 5.37997 18.26H18.65C19.96 18.26 20.45 16.95 19.74 15.77L18.59 13.86C18.28 13.34 18.02 12.41 18.02 11.8V8.90997C18.02 5.60997 15.32 2.90997 12.01 2.90997H12.02Z"
                      strokeLinecap="round"
                    />
                    <path
                      d="M15.02 19.06C15.02 20.71 13.67 22.05 12.02 22.05C11.2 22.05 10.44 21.72 9.90002 21.19C9.36002 20.65 9.02002 19.9 9.02002 19.06"
                      strokeLinecap="round"
                    />
                  </svg>
                  {announcementUnreadCount > 0 && (
                    <div className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full border border-[#14213D] bg-red-500" />
                  )}
                </button>
              )}

              {/* Balance & Deposit Pill */}
              {isAuth && (
                <div className="relative flex h-[49px] items-center justify-between gap-4 rounded-full border border-[#FFB7034D] bg-[#14213D] pl-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/ph_coins-light.png"
                      alt="Balance"
                      width={26}
                      height={26}
                      className="opacity-100 brightness-0 invert"
                    />
                    <span className="text-[16px] font-bold whitespace-nowrap text-white">
                      {user?.balance ? `${user.balance} IDR` : '0 IDR'}
                    </span>
                  </div>
                  <button
                    onClick={handleOpenTransactionTab}
                    className="z-20 -mr-0.5 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#FFB703] text-black shadow-[0_0_20px_rgba(255,183,3,0.4)] transition-transform hover:scale-105 active:scale-95"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M12 5V19"
                        stroke="#14213D"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M5 12H19"
                        stroke="#14213D"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              )}

              {/* User Profile Pill */}
              {isAuth && (
                <div className="relative">
                  <button
                    onClick={toggleUserDropdown}
                    className="group relative flex h-[49px] items-center gap-4 rounded-full border border-[#FFB7034D] bg-[#14213D] pr-5 transition-all hover:bg-[#1C2C4E]"
                  >
                    {/* Overlapping Gold Avatar */}
                    <div className="z-20 -ml-0.5 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#FFB703] text-white shadow-[0_0_20px_rgba(255,183,3,0.4)] transition-transform">
                      <span className="text-[22px] font-extrabold">
                        {userInitial || 'A'}
                      </span>
                    </div>
                    <span className="text-[16px] font-bold text-white">
                      {userDisplayName || 'Artchip'}
                    </span>
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={`transition-transform duration-200 ${isUserDropdownOpen ? 'rotate-180' : ''}`}
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="#FFB703"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* User Dropdown Menu */}
                  {isUserDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-[90] cursor-default"
                        onClick={toggleUserDropdown}
                      />
                      <div className="absolute top-[calc(100%+12px)] right-0 z-[100] w-[280px] rounded-[9px] border border-[#FFB7034D] bg-[#14213D] p-2 shadow-2xl backdrop-blur-md">
                        {/* 1. Profile */}
                        <button
                          onClick={handleOpenProfileTab}
                          className="group flex w-full items-center justify-between rounded-[8px] px-4 py-3 transition-colors hover:bg-[#FFB7030D]"
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="stroke-[#FFB703]"
                            >
                              <path
                                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="text-[15px] font-bold text-white">
                              Profile
                            </span>
                          </div>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="stroke-[#666] transition-colors group-hover:stroke-[#FFB703]"
                          >
                            <path
                              d="M9 18L15 12L9 6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <div className="mx-2 my-1 h-[1px] bg-[#FFB7030F]" />

                        {/* 2. Betting Management */}
                        <button
                          onClick={() => {
                            openAuthModal('transactionHistory');
                            closeMobileMenu();
                            setIsUserDropdownOpen(false);
                          }}
                          className="group flex w-full items-center justify-between rounded-[8px] px-4 py-3 transition-colors hover:bg-[#FFB7030D]"
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="stroke-[#FFB703]"
                            >
                              <rect
                                x="2"
                                y="5"
                                width="20"
                                height="14"
                                rx="2"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <line
                                x1="2"
                                y1="10"
                                x2="22"
                                y2="10"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="text-[15px] font-bold text-white">
                              Betting Management
                            </span>
                          </div>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="stroke-[#666] transition-colors group-hover:stroke-[#FFB703]"
                          >
                            <path
                              d="M9 18L15 12L9 6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>

                        <div className="mx-2 my-1 h-[1px] bg-[#FFB7030F]" />

                        {/* 3. Signout */}
                        <button
                          onClick={handleLogout}
                          className="group flex w-full items-center justify-between rounded-[8px] px-4 py-3 transition-colors hover:bg-[#FFB7030D]"
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="stroke-[#FFB703]"
                            >
                              <path
                                d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M16 17L21 12L16 7"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M21 12H9"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <span className="text-[15px] font-bold text-white">
                              Signout
                            </span>
                          </div>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="stroke-[#666] transition-colors group-hover:stroke-[#FFB703]"
                          >
                            <path
                              d="M9 18L15 12L9 6"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Unauthenticated State: Login & Register */}
              {!isAuth && (
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleOpenLoginModal}
                    className="h-[42px] rounded-full border border-[#FFB7034D] bg-[#14213D] px-8 text-[14px] font-bold text-white shadow-lg shadow-[#0F5146]/20 transition-all hover:bg-[#1F2A5A] active:scale-95"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleOpenRegisterModal}
                    className="h-[42px] rounded-full bg-[#FFB703] px-8 text-[14px] font-bold text-white transition-all hover:bg-[#E6A600] active:scale-95"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>

            <div className="relative z-[1000] flex w-full items-center justify-between md:hidden">
              {/* Left Side: Hamburger + Logo */}
              <div className="flex items-center gap-3">
                {/* Hamburger Menu Button */}
                <button
                  onClick={toggleMobileMenu}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-[#FFB7034D] bg-[#14213D] transition-colors hover:bg-[#14213D4D]"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7H20M4 12H20M4 17H20"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Logo */}
                <Link href="/" className="inline-flex items-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Artchip-18.png"
                    alt="Artchip Logo"
                    width={110}
                    height={26}
                    priority
                  />
                </Link>
              </div>

              {/* Right Section: Language & Avatar (Mobile Fidelity) */}
              <div className="flex items-center gap-2">
                {/* Language Selector Circle */}
                <button className="flex h-11 w-11 items-center justify-center rounded-full border border-[#FFB7034D] bg-[#14213D] transition-all">
                  <div className="h-6 w-6 overflow-hidden rounded-full border border-[#FFB7034D]">
                    <img
                      src="https://flagcdn.com/us.svg"
                      alt="US"
                      className="h-full w-full scale-150 object-cover"
                    />
                  </div>
                </button>

                {/* Avatar Button */}
                {isAuth && (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={toggleUserMenu}
                      className="flex h-11 w-11 items-center justify-center rounded-full border border-[#FFB7034D] bg-[#14213D] text-[18px] font-extrabold text-white shadow-[0_0_15px_rgba(255,183,3,0.2)] transition-all"
                    >
                      {userInitial || 'A'}
                    </button>
                    {isUserMenuOpen && (
                      <div className="absolute top-[calc(100%+8px)] right-0 z-[1000] w-[240px]">
                        <div className="rounded-[16px] border border-[#FFB7034D] bg-[#14213D] p-2 shadow-2xl backdrop-blur-md">
                          {/* Profile */}
                          <button
                            onClick={() => {
                              handleOpenProfileTab();
                              setIsUserMenuOpen(false);
                            }}
                            className="group flex w-full items-center justify-between rounded-[8px] px-4 py-3 transition-colors hover:bg-[#FFB7030D]"
                          >
                            <div className="flex items-center gap-3">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-[#FFB703]"
                              >
                                <path
                                  d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[15px] font-bold text-white">
                                Profile
                              </span>
                            </div>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="stroke-[#666] transition-colors group-hover:stroke-[#FFB703]"
                            >
                              <path
                                d="M9 18L15 12L9 6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <div className="mx-2 my-1 h-[1px] bg-[#FFB7030F]" />

                          {/* Betting Management */}
                          <button
                            onClick={() => {
                              openAuthModal('transactionHistory');
                              setIsUserMenuOpen(false);
                            }}
                            className="group flex w-full items-center justify-between rounded-[8px] px-4 py-3 transition-colors hover:bg-[#FFB7030D]"
                          >
                            <div className="flex items-center gap-3">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-[#FFB703]"
                              >
                                <rect
                                  x="2"
                                  y="5"
                                  width="20"
                                  height="14"
                                  rx="2"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <line
                                  x1="2"
                                  y1="10"
                                  x2="22"
                                  y2="10"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[15px] font-bold text-white">
                                Betting Management
                              </span>
                            </div>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="stroke-[#666] transition-colors group-hover:stroke-[#FFB703]"
                            >
                              <path
                                d="M9 18L15 12L9 6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>

                          <div className="mx-2 my-1 h-[1px] bg-[#FFB7030F]" />

                          {/* Signout */}
                          <button
                            onClick={() => {
                              handleLogout();
                              setIsUserMenuOpen(false);
                            }}
                            className="group flex w-full items-center justify-between rounded-[8px] px-4 py-3 transition-colors hover:bg-[#FFB7030D]"
                          >
                            <div className="flex items-center gap-3">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-[#FFB703]"
                              >
                                <circle
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M12 8L16 12L12 16"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M8 12H16"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[15px] font-bold text-white">
                                Signout
                              </span>
                            </div>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              className="stroke-[#666] transition-colors group-hover:stroke-[#FFB703]"
                            >
                              <path
                                d="M9 18L15 12L9 6"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer - Offcanvas */}
      <div
        className={`fixed top-0 left-0 z-[10000] h-full w-full transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Content */}
        <div
          className={`absolute top-0 left-0 h-full w-80 border border-[#FFFFFF1A] shadow-xl ${
            isMobilePlatform ? 'pt-safe-top' : ''
          }`}
          style={{
            background: 'linear-gradient(180deg, #080E1B 0%, #14213D 100%)',
          }}
        >
          <div
            className="flex h-full flex-col overflow-y-auto"
            style={{ paddingBottom: isMobilePlatform ? '48px' : undefined }}
          >
            {/* Header with Logo and Close Button */}
            <div className="flex items-center justify-between px-6 py-6">
              <div className="flex items-center">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Artchip-18.png"
                  alt="Artchip Logo"
                  width={110}
                  height={26}
                  priority
                />
              </div>

              <button
                onClick={toggleMobileMenu}
                className="group flex h-9 w-9 cursor-pointer items-center justify-center rounded-[6px] border border-[#FFB7034D] bg-transparent text-white transition-colors hover:bg-[#FFB7034D] hover:text-black"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Auth Buttons (Visitor State) */}
            {!isAuth && (
              <div className="mb-4 border-b border-[#FFFFFF1A] px-0 py-0">
                <div className="flex items-center gap-3">
                  <div className="flex w-full items-center gap-3 rounded-[0px] px-3 py-3">
                    <button
                      onClick={handleOpenLoginModal}
                      className="outline-hover-effect group flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-[30px] border-1 border-[#FFB7034D] bg-[#14213D] px-3 py-3 text-base font-semibold text-white transition-colors"
                    >
                      <span>Login</span>
                    </button>

                    <button
                      onClick={handleOpenRegisterModal}
                      className="filled-hover-effect group flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-[40px] bg-[#FFB703] px-3 py-3 text-base font-semibold text-white transition-colors"
                      data-hover="Register"
                    >
                      <span>Register</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Balance & Deposit Section (Authenticated State) */}
            {isAuth && (
              <div className="relative mx-4 mb-6 flex h-[62px] items-center justify-between rounded-full border border-[#FFB7034D] bg-[#14213D] pl-6 shadow-lg">
                <div className="flex items-center gap-5">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/ph_coins-light.png"
                    alt="Balance"
                    width={30}
                    height={30}
                    className="opacity-90 brightness-0 invert"
                  />
                  <span className="text-[22px] font-extrabold text-white">
                    {user?.balance ? `${user.balance} IDR` : '0 IDR'}
                  </span>
                </div>
                <button
                  onClick={handleOpenTransactionTab}
                  className="z-20 -mr-0.5 flex h-[55px] w-[55px] items-center justify-center rounded-full bg-[#FFB703] text-black shadow-[0_0_20px_rgba(255,183,3,0.4)] transition-transform hover:scale-105 active:scale-95"
                >
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  >
                    <line x1="12" y1="6" x2="12" y2="18" />
                    <line x1="6" y1="12" x2="18" y2="12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Menu Items */}
            <div className="flex flex-col gap-3 px-4 pb-4">
              {/* Deposit */}
              <button
                onClick={handleOpenTransactionTab}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#CBBC91] hover:bg-[#ffffff05]"
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Deposit-12.svg"
                    alt={t('deposit')}
                    width={22}
                    height={22}
                    className="opacity-60 transition-all group-hover:opacity-100"
                  />
                </div>
                <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                  {t('deposit') || 'Deposit'}
                </span>
              </button>

              {/* Withdrawal */}
              <button
                onClick={handleOpenWithdrawalTab}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#CBBC91] hover:bg-[#ffffff05]"
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <img
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Group+40.svg"
                    alt={t('withdrawal')}
                    width={22}
                    height={22}
                    className="opacity-60 transition-all group-hover:opacity-100"
                  />
                </div>
                <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                  {t('withdrawal') || 'Withdrawal'}
                </span>
              </button>

              {/* Customer Inquiry */}
              <button
                onClick={handleOpenCustomerServiceModal}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#CBBC91] hover:bg-[#ffffff05]"
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Cm-Inquiry-12.svg"
                    alt={t('customer_inquiry')}
                    width={22}
                    height={22}
                    className="opacity-60 transition-all group-hover:opacity-100"
                  />
                </div>
                <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                  {t('customer_inquiry') || 'Customer Inquiry'}
                </span>
              </button>

              {/* Notes */}
              <button
                onClick={handleOpenCustomerServiceNotes}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#CBBC91] hover:bg-[#ffffff05]"
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Notes-12.svg"
                    alt={t('notes')}
                    width={22}
                    height={22}
                    className="opacity-60 transition-all group-hover:opacity-100"
                  />
                </div>
                <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                  {t('notes') || 'Notes'}
                </span>
                {helpUnreadCount > 0 && (
                  <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-[#CBBC91] px-1.5 text-[10px] font-bold text-black">
                    {helpUnreadCount > 99 ? '99+' : helpUnreadCount}
                  </span>
                )}
              </button>

              {/* Announcements */}
              <button
                onClick={handleOpenAnnouncementModal}
                className="group flex w-full cursor-pointer items-center gap-4 rounded-[8px] border border-[#2A2A2A] bg-transparent px-5 py-4 transition-colors hover:border-[#CBBC91] hover:bg-[#ffffff05]"
              >
                <div className="flex h-6 w-6 items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Announcements-12.svg"
                    alt={t('announcement')}
                    width={22}
                    height={22}
                    className="opacity-60 transition-all group-hover:opacity-100"
                  />
                </div>
                <span className="text-[15px] font-bold text-[#888] group-hover:text-white">
                  {t('announcement') || 'Announcements'}
                </span>
                {announcementUnreadCount > 0 && (
                  <span className="ml-auto grid h-5 min-w-[20px] place-items-center rounded-full bg-[#CBBC91] px-1.5 text-[10px] font-bold text-black">
                    {announcementUnreadCount > 99
                      ? '99+'
                      : announcementUnreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Footer section: Social buttons + Logout fixed at bottom */}
            <div className="mt-auto space-y-3 p-4">
              {/* Mobile gaming promotion */}
              <div className="relative left-1 mb-8">
                {/* Text overlay */}
                <div className="absolute top-[17%] left-[5%] z-10 text-center">
                  <h3 className="mb-3 text-sm leading-tight font-bold text-white">
                    {t('footer_mobile_title_line1')}
                    <br />
                    {t('footer_mobile_title_line2')}
                  </h3>
                </div>

                {/* QR CODE — SAME JAGAH, SAME SIZE */}
                <img
                  src="https://your-qr-code.png" // ← sirf apna QR yahan lagao
                  alt="QR Code"
                  className="absolute top-[45%] left-[6%] z-10"
                />

                {/* APK download link */}
                <a
                  href="https://thestaticfile.com/uploads/user04.apk"
                  download
                  className="block w-full"
                >
                  <LazyImage
                    src={sidebarApkSrc}
                    alt="Sidebar APK"
                    width={25}
                    height={25}
                    className="animate-float h-auto w-full"
                  />
                </a>
              </div>

              {isAuth && (
                <div className="pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center justify-between rounded-[8px] border border-[#636363] px-6 py-4 text-base font-medium text-white transition-colors duration-200"
                  >
                    <span>{t('logout')}</span>
                    <svg
                      className="h-5 w-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          {isMobilePlatform && (
            <div
              className="w-full"
              style={{
                height: '48px',
                background: 'rgba(0, 6, 55, 0.90)',
                borderTop: '1px solid #FC7E09',
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default React.memo(Navbar);
