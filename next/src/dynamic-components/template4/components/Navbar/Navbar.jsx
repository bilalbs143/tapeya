'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LanguageSwitcher } from '@/dynamic-components/template4/components/LanguageSwitcher/LanguageSwitcher';
import LazyImage from '@/dynamic-components/template4/components/LazyImage/LazyImage';
import WalletDropdown from '@/dynamic-components/template4/components/WalletDropdown/WalletDropdown';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { usePopupData } from '@/hooks/usePopupData';
import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/providers/LanguageProvider';
import { logoutUser } from '@/slices/auth/authAction';
import { openModal } from '@/slices/common/commonSlice';
import Tooltip from '@/ui/Tooltip';

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
  const { headerLogo } = useTemplate();

  // Simple selectors
  const auth = useSelector(selectAuth);
  const helpUnreadCount = useSelector(selectUnreadCount);
  const announcementUnreadCount = useSelector(selectAnnouncementUnreadCount);

  const { isAuth, user } = auth;
  const { hasActivePopups } = usePopupData();

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
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sidbar-apk-4-up.webp';
    }
    if (currentLocale === 'ko') {
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sidbar-apk-4-up.webp';
    }
    return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sidbar-apk-4-up.webp';
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

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`relative z-[100] bg-[#000304] ${
          isMobilePlatform ? 'pt-safe-top' : ''
        }`}
      >
        {/* 1px gradient bottom border */}

        <div className="px-2 py-3 md:px-6 md:py-6">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex items-center space-x-1">
                <Link href="/" className="inline-flex items-center">
                  <Image
                    src={headerLogo}
                    alt="Artchip Logo"
                    width={120}
                    height={28}
                    priority
                  />
                </Link>
              </div>
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden items-center gap-4 md:flex">
              {/* Circular Icons */}
              <div className="flex items-center gap-3">
                <Tooltip text={t('announcement')} position="bottom">
                  <button
                    onClick={() => dispatch(openModal('announcement'))}
                    className="group flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-[5px] border-2 border-[#03c72c4d] bg-[#0A1818] text-white transition-transform duration-200 hover:scale-105"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/noti-icon-4.svg"
                      alt={t('notification')}
                      width={25}
                      height={25}
                      className="h-[22px] w-[22px] transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                    />
                  </button>
                </Tooltip>

                <Tooltip text={t('notes')} position="bottom">
                  <button
                    onClick={handleOpenCustomerServiceNotes}
                    className="group relative flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-[5px] border-2 border-[#03c72c4d] bg-[#0A1818] text-white transition-transform duration-200 hover:scale-105"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/question-icon-4.svg"
                      alt={t('help')}
                      width={25}
                      height={25}
                      className="h-[22px] w-[22px] transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                    />
                    <span className="absolute -top-1 -right-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#55BC55] px-1 text-[10px] leading-none font-bold text-black">
                      {helpUnreadCount > 99 ? '99+' : helpUnreadCount}
                    </span>
                  </button>
                </Tooltip>

                <Tooltip text={t('customer_inquiry')} position="bottom">
                  <button
                    onClick={handleOpenCustomerServiceModal}
                    className="group flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-[5px] border-2 border-[#03c72c4d] bg-[#0A1818] text-white transition-transform duration-200 hover:scale-105"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user-chat-icon-4.svg"
                      alt={t('chat')}
                      width={25}
                      height={25}
                      className="h-[24px] w-[24px] transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                    />
                  </button>
                </Tooltip>

                <Tooltip text={t('withdrawal')} position="bottom">
                  <button
                    onClick={handleOpenWithdrawalTab}
                    className="group flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-[5px] border-2 border-[#03c72c4d] bg-[#0A1818] text-white transition-transform duration-200 hover:scale-105"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/info-icon-4.svg"
                      alt={t('info')}
                      width={25}
                      height={25}
                      className="h-[25px] w-[25px] transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                    />
                  </button>
                </Tooltip>

                <Tooltip text={t('deposit')} position="bottom">
                  <button
                    onClick={handleOpenTransactionModal}
                    className="group flex h-[50px] w-[50px] cursor-pointer items-center justify-center rounded-[5px] border-2 border-[#03c72c4d] bg-[#0A1818] text-white transition-transform duration-200 hover:scale-105"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/with-4.svg"
                      alt={t('wallet')}
                      width={25}
                      height={25}
                      className="h-[25px] w-[25px] transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                    />
                  </button>
                </Tooltip>
              </div>

              {/* Buttons */}
              {!isAuth ? (
                <>
                  <button
                    onClick={handleOpenLoginModal}
                    className="outline-hover-effect group flex w-[130px] cursor-pointer items-center justify-center gap-3 rounded-[5px] border-2 border-[#03c72c4d] bg-[#060D0D] px-3 py-3 text-base font-semibold text-white transition-colors"
                  >
                    <span>Login</span>
                  </button>

                  <button
                    onClick={handleOpenRegisterModal}
                    className="filled-hover-effect group flex w-[130px] cursor-pointer items-center justify-center gap-3 rounded-[5px] border-2 border-[#55BC55] bg-[#55BC55] px-3 py-3 text-base font-semibold text-white transition-colors"
                    data-hover="Register"
                  >
                    <span>Register</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  <WalletDropdown variant="desktop" />
                  <div className="relative" ref={userMenuRef}>
                    <div className="inline-flex items-stretch rounded-[6px] border-2 border-[#03c72c4d]">
                      <button
                        onClick={toggleUserMenu}
                        ref={userButtonRef}
                        className="group flex h-[50px] cursor-pointer items-center gap-2 rounded-[6px] bg-[#0A1818] px-4 py-2 text-base font-medium text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                      >
                        <span className="inline-flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#55BC55] text-[12px] text-white">
                          {userInitial}
                        </span>
                        <span className="max-w-[140px] truncate">
                          {userDisplayName}
                        </span>
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/drop-4.svg"
                          alt="Open profile menu"
                          width={15}
                          height={15}
                          className={`h-3 w-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                        />
                      </button>
                    </div>

                    {isUserMenuOpen && (
                      <div className="absolute right-0 z-[1000] mt-2 w-[150px]">
                        <div className="rounded-[0px] bg-[#03c72c4d] p-[2px] shadow-xl">
                          <div className="rounded-[0px] bg-[#000304] p-[10px]">
                            <div className="rounded-[8px] bg-[#5AB25A] p-[1px]">
                              <div className="overflow-hidden rounded-[7px] bg-[#000304]">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      'Profile dropdown item clicked',
                                    );
                                    handleOpenProfileTab();
                                    setIsUserMenuOpen(false);
                                  }}
                                  className="group flex w-full items-center justify-between border-b border-[#5AB25A] px-3 py-2 text-white transition-all hover:bg-[#55BC55]"
                                >
                                  <span className="flex items-center gap-3 text-white group-hover:text-black">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-1.svg"
                                      alt={t('profile')}
                                      width={20}
                                      height={20}
                                      className="transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                    />
                                    <span className="text-[12px]">
                                      {t('profile')}
                                    </span>
                                  </span>
                                  <span className="pl-2 text-[12px] text-white/80 group-hover:text-black">
                                    &nbsp;
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      'Referrals dropdown item clicked',
                                    );
                                    handleOpenReferralTab();
                                    setIsUserMenuOpen(false);
                                  }}
                                  className="group flex w-full items-center justify-between border-b border-[#5AB25A] px-3 py-2 text-white transition-all hover:bg-[#55BC55]"
                                >
                                  <span className="flex items-center gap-3 text-white group-hover:text-black">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/referal.svg"
                                      alt={t('referrals')}
                                      width={22}
                                      height={22}
                                      className="transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                    />
                                    <span className="text-[12px]">
                                      {t('referrals')}
                                    </span>
                                  </span>
                                  <span className="pl-2 text-[12px] text-white/80 group-hover:text-black">
                                    &nbsp;
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log(
                                      'Betting dropdown item clicked',
                                    );
                                    handleOpenBettingTab();
                                    setIsUserMenuOpen(false);
                                  }}
                                  className="group flex w-full items-center justify-between border-b border-[#5AB25A] px-3 py-2 text-white transition-all hover:bg-[#55BC55]"
                                >
                                  <span className="flex items-center gap-3 text-white group-hover:text-black">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-2.svg"
                                      alt={t('betting')}
                                      width={20}
                                      height={20}
                                      className="transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                    />
                                    <span className="text-[12px] capitalize">
                                      {t('betting') || 'Bet History'}
                                    </span>
                                  </span>
                                  <span className="pl-2 text-[12px] text-white/80 group-hover:text-black">
                                    &nbsp;
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Logout dropdown item clicked');
                                    handleLogout();
                                    setIsUserMenuOpen(false);
                                  }}
                                  className="group flex w-full items-center justify-between px-3 py-2 text-white transition-all hover:bg-[#55BC55]"
                                >
                                  <span className="flex items-center gap-3 text-white group-hover:text-black">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-3.svg"
                                      alt={t('logout')}
                                      width={20}
                                      height={20}
                                      className="transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                    />
                                    <span className="text-[12px]">
                                      {t('logout')}
                                    </span>
                                  </span>
                                  <span className="pl-2 text-[12px] text-white/80 group-hover:text-black">
                                    &nbsp;
                                  </span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button and Language Switcher */}
            <div className="relative z-[1000] flex items-center gap-3 md:hidden">
              <div className="flex h-[40px] items-center rounded-[5px] border border-[#03c72c4d] bg-transparent px-1">
                <LanguageSwitcher variant="dropdown" />
              </div>

              <button
                onClick={toggleMobileMenu}
                className="relative flex h-[40px] w-[45px] cursor-pointer items-center justify-center rounded-[5px] border border-[#03c72c4d] text-white transition-colors duration-200 hover:text-[#03c72c4d]"
              >
                <div className="flex h-full w-full items-center justify-center rounded-[5px] bg-transparent">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer - Offcanvas */}
      <div
        className={`fixed top-0 right-0 z-[10000] h-full w-full transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Content */}
        <div
          className={`absolute top-0 right-0 h-full w-80 border border-[#FFFFFF1A] bg-black shadow-xl ${
            isMobilePlatform ? 'pt-safe-top' : ''
          }`}
        >
          <div
            className="flex h-full flex-col overflow-y-auto"
            style={{ paddingBottom: isMobilePlatform ? '48px' : undefined }}
          >
            {/* Header with Menu Title and Close Button */}
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-base font-medium text-white">
                  {t('menu')}
                </div>

                <button
                  onClick={toggleMobileMenu}
                  className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm bg-[#55BC55] text-black transition-colors"
                >
                  <svg
                    className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Auth Buttons under Header */}
            {!isAuth && (
              <div className="border-b border-[#FFFFFF1A] px-0 py-0">
                <div className="flex items-center gap-3">
                  <div className="flex w-full items-center gap-3 rounded-[0px] bg-black px-3 py-3">
                    <button
                      onClick={handleOpenLoginModal}
                      className="outline-hover-effect group flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-[5px] border-2 border-[#03c72c4d] bg-[#060D0D] px-3 py-3 text-base font-semibold text-white transition-colors"
                    >
                      <span>Login</span>
                    </button>

                    <button
                      onClick={handleOpenRegisterModal}
                      className="filled-hover-effect group flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-[5px] border-2 border-[#55BC55] bg-[#55BC55] px-3 py-3 text-base font-semibold text-white transition-colors"
                      data-hover="Register"
                    >
                      <span>Register</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Dropdown for Authenticated Users */}
            {isAuth && (
              <div className="border-b border-[#03c72c4d] px-4 py-4">
                <div className="relative" ref={userMenuRef}>
                  <div className="w-full rounded-[6px] border-2 border-[#03c72c4d]">
                    <button
                      onClick={toggleUserMenu}
                      className="group flex h-[50px] w-full cursor-pointer items-center gap-2 rounded-[6px] bg-[#0A1818] px-4 py-2 text-base font-medium text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                    >
                      <span className="inline-flex h-[29px] w-[29px] items-center justify-center rounded-full bg-[#55BC55] text-[12px] text-white">
                        {userInitial}
                      </span>
                      <span className="flex-1 truncate text-left">
                        {userDisplayName}
                      </span>
                      <Image
                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/drop-4.svg"
                        alt="Open profile menu"
                        width={15}
                        height={15}
                        className={`h-3 w-3 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                  </div>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 left-0 z-[1000] mt-2">
                      <div className="rounded-[0px] bg-[#03c72c4d] p-[2px] shadow-xl">
                        <div className="rounded-[0px] bg-[#000304] p-[10px]">
                          <div className="rounded-[8px] bg-[#03c72c4d] p-[1px]">
                            <div className="overflow-hidden rounded-[7px] bg-[#000304]">
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenProfileTab();
                                  setIsUserMenuOpen(false);
                                }}
                                className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#55BC55]"
                              >
                                <span className="flex items-center gap-3 text-white group-hover:text-black">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-1.svg"
                                    alt={t('profile')}
                                    width={20}
                                    height={20}
                                    className="transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                  />
                                  <span className="text-[12px]">
                                    {t('profile')}
                                  </span>
                                </span>
                                <span className="pl-2 text-[12px] text-white/80 group-hover:text-black">
                                  &nbsp;
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenReferralTab();
                                  setIsUserMenuOpen(false);
                                }}
                                className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#55BC55]"
                              >
                                <span className="flex items-center gap-3 text-white group-hover:text-black">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/referal.svg"
                                    alt={t('referrals')}
                                    width={22}
                                    height={22}
                                    className="transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                  />
                                  <span className="text-[12px]">
                                    {t('referrals')}
                                  </span>
                                </span>
                                <span className="pl-2 text-[12px] text-white/80 group-hover:text-black">
                                  &nbsp;
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenBettingTab();
                                  setIsUserMenuOpen(false);
                                }}
                                className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#55BC55]"
                              >
                                <span className="flex items-center gap-3 text-white group-hover:text-black">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-2.svg"
                                    alt={t('betting')}
                                    width={20}
                                    height={20}
                                    className="transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                  />
                                  <span className="text-[12px] capitalize">
                                    {t('betting') || 'Bet History'}
                                  </span>
                                </span>
                                <span className="pl-2 text-[12px] text-white/80 group-hover:text-black">
                                  &nbsp;
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleLogout();
                                  setIsUserMenuOpen(false);
                                }}
                                className="group flex w-full items-center justify-between px-3 py-2 text-white transition-all hover:bg-[#55BC55]"
                              >
                                <span className="flex items-center gap-3 text-white group-hover:text-black">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-3.svg"
                                    alt={t('logout')}
                                    width={20}
                                    height={20}
                                    className="transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                  />
                                  <span className="text-[12px]">
                                    {t('logout')}
                                  </span>
                                </span>
                                <span className="pl-2 text-[12px] text-white/80 group-hover:text-black">
                                  &nbsp;
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Menu Items under Header */}
            <div className="space-y-0 px-0 pb-4">
              <button
                onClick={handleOpenTransactionTab}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#03c72c4d] px-4 py-4 transition-colors hover:bg-white/5 focus:outline-none"
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/with-4.svg"
                    alt={t('deposit')}
                    width={20}
                    height={20}
                    className="h-7 w-7 transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                  />
                </div>
                <span className="text-base font-medium text-white">
                  {t('deposit') || 'Deposit'}
                </span>
              </button>
              <button
                onClick={handleOpenWithdrawalTab}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#03c72c4d] px-4 py-4 transition-colors hover:bg-white/5 focus:outline-none"
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/info-icon-4.svg"
                    alt={t('withdrawal')}
                    width={20}
                    height={20}
                    className="h-7 w-7 transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                  />
                </div>
                <span className="text-base font-medium text-white">
                  {t('withdrawal') || 'Withdrawal'}
                </span>
              </button>
              <button
                onClick={handleOpenCustomerServiceModal}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#03c72c4d] px-4 py-4 transition-colors hover:bg-white/5 focus:outline-none"
              >
                <div className="flex h-8 w-8 items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user-chat-icon-4.svg"
                    alt={t('customer_inquiry')}
                    width={25}
                    height={25}
                    className="h-7 w-7 transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                  />
                </div>
                <span className="text-base font-medium text-white">
                  {t('customer_inquiry') || 'Customer Inquiry'}
                </span>
              </button>
              <button
                onClick={handleOpenCustomerServiceNotes}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#03c72c4d] px-4 py-4 transition-colors hover:bg-white/5 focus:outline-none"
              >
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/question-icon-4.svg"
                    alt={t('notes')}
                    width={20}
                    height={20}
                    className="h-6 w-6 transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                  />
                  <span className="absolute -top-1 -right-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#55BC55] px-1 text-[10px] leading-none font-bold text-black">
                    {helpUnreadCount > 99 ? '99+' : helpUnreadCount}
                  </span>
                </div>
                <span className="text-base font-medium text-white">
                  {t('notes') || 'Notes'}
                </span>
              </button>
              <button
                onClick={handleOpenAnnouncementModal}
                className="group flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#03c72c4d] px-4 py-4 transition-colors hover:bg-white/5 focus:outline-none"
              >
                <div className="relative flex h-8 w-8 items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/noti-icon-4.svg"
                    alt={t('announcement')}
                    width={20}
                    height={20}
                    className="h-7 w-7 transition-all duration-200 group-hover:brightness-0 group-hover:invert"
                  />
                </div>
                <span className="text-base font-medium text-white">
                  {t('announcement') || 'Announcements'}
                </span>
              </button>
            </div>

            {/* Footer section: Social buttons + Logout fixed at bottom */}
            <div className="mt-auto space-y-3 p-4">
              {/* Mobile gaming promotion */}
              <div className="relative mb-8">
                {/* Text overlay */}
                <div className="absolute top-[22%] left-[5%] z-10 text-center">
                  <h3 className="mb-3 text-sm leading-tight font-bold text-white">
                    {t('footer_mobile_title_line1')}
                    <br />
                    {t('footer_mobile_title_line2')}
                  </h3>
                </div>

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
                <div className="border-t border-[#6456bd54] pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#55BC55] px-6 py-3 text-base font-semibold text-black transition-colors duration-200"
                  >
                    {t('logout')}
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
