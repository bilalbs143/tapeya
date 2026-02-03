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

import { LanguageSwitcher } from '@/dynamic-components/template1/components/LanguageSwitcher/LanguageSwitcher';
import LazyImage from '@/dynamic-components/template1/components/LazyImage/LazyImage.jsx';
import WalletDropdown from '@/dynamic-components/template1/components/WalletDropdown/WalletDropdown';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { usePopupData } from '@/hooks/usePopupData';
import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/providers/LanguageProvider';
import { logoutUser } from '@/slices/auth/authAction';
import { openModal } from '@/slices/common/commonSlice';
import Tooltip from '@/ui/Tooltip.jsx';

// Simple selectors
const selectAuth = (state) => state.auth;
const selectUnreadCount = (state) => {
  const unread = state.website?.unreadNotesData;
  if (!Array.isArray(unread)) return 0;
  return unread.filter((note) => !note.read_at).length;
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
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sidebar-apk-indo.webp';
    }
    if (currentLocale === 'ko') {
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sidebar-apk-korean.webp';
    }
    return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sidebar-apk.webp';
  }, [currentLocale]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        className={`relative z-[100] border-b-2 border-[#42339F] bg-[#141943] ${
          isMobilePlatform ? 'pt-safe-top' : ''
        }`}
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center">
              <div className="flex items-center space-x-1">
                <Link href="/" className="inline-flex items-center">
                  <Image
                    src={headerLogo}
                    alt="KOKOBET777 Logo"
                    width={120}
                    height={28}
                    priority
                  />
                </Link>
              </div>
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden items-center gap-4 md:flex">
              {/* Wallet Dropdown - Only show when user is authenticated */}
              {isAuth && <WalletDropdown variant="desktop" />}

              {/* Circular Icons */}
              <div className="flex items-center gap-3">
                <Tooltip text={t('announcement')} position="bottom">
                  <button
                    onClick={() => dispatch(openModal('announcement'))}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200 hover:text-indigo-900"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/noti-icon.svg"
                      alt={t('notification')}
                      width={30}
                      height={30}
                      className="h-[30px] w-[30px] transition-transform duration-200 hover:scale-110 hover:rotate-[5deg]"
                    />
                  </button>
                </Tooltip>

                <Tooltip text={t('notes')} position="bottom">
                  <button
                    onClick={handleOpenCustomerServiceNotes}
                    className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200 hover:text-indigo-900"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/question-icon.svg"
                      alt={t('help')}
                      width={30}
                      height={30}
                      className="h-[30px] w-[30px] transition-transform duration-200 hover:scale-110 hover:rotate-[5deg]"
                    />
                    <span className="absolute -top-1 -right-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#FC7E09] px-1 text-[10px] leading-none text-white">
                      {helpUnreadCount > 99 ? '99+' : helpUnreadCount}
                    </span>
                  </button>
                </Tooltip>

                <Tooltip text={t('customer_inquiry')} position="bottom">
                  <button
                    onClick={handleOpenCustomerServiceModal}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200 hover:text-indigo-900"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user-chat-icon.svg"
                      alt={t('chat')}
                      width={30}
                      height={30}
                      className="h-[30px] w-[30px] transition-transform duration-200 hover:scale-110 hover:rotate-[5deg]"
                    />
                  </button>
                </Tooltip>

                <Tooltip text={t('withdrawal')} position="bottom">
                  <button
                    onClick={handleOpenWithdrawalTab}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200 hover:text-indigo-900"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/info-icon.svg"
                      alt={t('info')}
                      width={30}
                      height={30}
                      className="h-[30px] w-[30px] transition-transform duration-200 hover:scale-110 hover:rotate-[5deg]"
                    />
                  </button>
                </Tooltip>

                <Tooltip text={t('deposit')} position="bottom">
                  <button
                    onClick={handleOpenTransactionModal}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors duration-200 hover:text-indigo-900"
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/nav-pr-1.svg"
                      alt={t('wallet')}
                      width={30}
                      height={30}
                      className="h-[30px] w-[30px] transition-transform duration-200 hover:scale-110 hover:rotate-[5deg]"
                    />
                  </button>
                </Tooltip>
              </div>

              {/* Buttons */}
              {!isAuth ? (
                <>
                  <button
                    onClick={handleOpenLoginModal}
                    className="btn-hover-outline cursor-pointer rounded-full border border-[#FC7E09] bg-[#141943] px-8 py-2 text-base font-medium text-white transition-colors duration-200"
                  >
                    Login
                  </button>

                  <button
                    onClick={handleOpenRegisterModal}
                    className="btn-hover-fill cursor-pointer rounded-full px-6 py-2 text-base font-medium text-white"
                    data-hover="Register"
                  >
                    Register
                  </button>
                </>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="btn-hover-outline group flex cursor-pointer items-center gap-2 rounded-full border border-[#FC7E09] bg-[#141943] px-4 py-2 text-base font-medium text-white transition-colors duration-200"
                  >
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#5343B1] text-[12px] text-white">
                      {userInitial}
                    </span>
                    <span className="max-w-[140px] truncate">
                      {userDisplayName}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className={`h-4 w-4 text-[#FC7E09] transition-transform group-hover:text-white ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.47 8.47a.75.75 0 0 1 1.06 0L12 13.94l5.47-5.47a.75.75 0 1 1 1.06 1.06l-6 6a.75.75 0 0 1-1.06 0l-6-6a.75.75 0 0 1 0-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 z-[1000] mt-2 w-[200px] overflow-hidden rounded-[8px] border border-[#4B51A3] bg-[#302385] shadow-xl">
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenProfileTab();
                          setIsUserMenuOpen(false);
                        }}
                        className="group flex w-full items-center gap-3 px-3 py-2 text-white transition-colors hover:bg-[#FC7E09]"
                      >
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-1.svg"
                          alt={t('profile')}
                          width={20}
                          height={20}
                          className="transition-transform duration-200 group-hover:scale-110"
                        />
                        <span>{t('profile')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenReferralTab();
                          setIsUserMenuOpen(false);
                        }}
                        className="group flex w-full items-center gap-3 px-3 py-2 text-white transition-colors hover:bg-[#FC7E09]"
                      >
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/referal.svg"
                          alt={t('referrals')}
                          width={22}
                          height={22}
                          className="transition-transform duration-200 group-hover:scale-110"
                        />
                        <span>{t('referrals')}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenBettingTab();
                          setIsUserMenuOpen(false);
                        }}
                        className="group flex w-full items-center gap-3 px-3 py-2 text-white transition-colors hover:bg-[#FC7E09]"
                      >
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-2.svg"
                          alt={t('betting')}
                          width={20}
                          height={20}
                          className="transition-transform duration-200 group-hover:scale-110"
                        />
                        <span className="capitalize">
                          {t('betting') || 'Bet History'}
                        </span>
                      </button>
                      <div className="h-[1px] w-full bg-[#4B51A3]" />
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="group flex w-full items-center gap-3 px-3 py-2 text-white transition-colors hover:bg-[#FC7E09]"
                      >
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-3.svg"
                          alt={t('logout')}
                          width={20}
                          height={20}
                          className="transition-transform duration-200 group-hover:scale-110"
                        />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Button and Language Switcher */}
            <div className="relative z-[1000] flex items-center gap-3 md:hidden">
              <LanguageSwitcher variant="dropdown" />
              <button
                onClick={toggleMobileMenu}
                className="relative cursor-pointer text-white transition-colors duration-200 hover:text-orange-400"
              >
                <svg
                  className="h-8 w-8"
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
          className={`absolute top-0 right-0 h-full w-80 border border-[#6456bd54] bg-[#141943] shadow-xl ${
            isMobilePlatform ? 'pt-safe-top' : ''
          }`}
        >
          <div
            className="flex h-full flex-col overflow-y-auto"
            style={{ paddingBottom: isMobilePlatform ? '48px' : undefined }}
          >
            {/* Header with User Info and Close Button */}
            <div className="border-b border-[#6456bd54] p-4">
              <div className="flex items-center justify-between">
                {/* User Info - Only show when authenticated */}
                {isAuth ? (
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#5343B1] text-sm font-medium text-white">
                      {userInitial}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-base font-medium text-white">
                        {userDisplayName}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-base font-medium text-white">
                    {t('menu')}
                  </div>
                )}

                <button
                  onClick={toggleMobileMenu}
                  className="btn-hover-outline group flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-[#FC7E09] bg-transparent text-white"
                >
                  <svg
                    className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180"
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

            {/* Inline Auth Buttons under Header */}
            {!isAuth && (
              <div className="border-b border-[#6456bd54] px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleOpenLoginModal}
                    className="btn-hover-outline flex-1 cursor-pointer rounded-full border border-[#FC7E09] bg-[#141943] px-4 py-2 text-sm font-medium text-white transition-colors duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleOpenRegisterModal}
                    className="btn-hover-fill flex-1 cursor-pointer rounded-full px-4 py-2 text-sm font-medium text-white"
                    data-hover="Register"
                  >
                    Register
                  </button>
                </div>
              </div>
            )}

            {/* Menu Items under Header */}
            <div className="space-y-0 px-0 pb-4">
              <button
                onClick={handleOpenTransactionTab}
                className="flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#6456bd54] px-4 py-4 transition-colors hover:bg-white/5 focus:bg-[#FC7E09] focus:text-white focus:outline-none active:bg-[#FC7E09] active:text-white"
              >
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/nav-pr-1.svg"
                  alt={t('deposit')}
                  width={20}
                  height={20}
                />
                <span className="text-base font-medium text-white">
                  {t('deposit') || 'Deposit'}
                </span>
              </button>
              <button
                onClick={handleOpenWithdrawalTab}
                className="flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#6456bd54] px-4 py-4 transition-colors hover:bg-white/5 focus:bg-[#FC7E09] focus:text-white focus:outline-none active:bg-[#FC7E09] active:text-white"
              >
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/info-icon.svg"
                  alt={t('withdrawal')}
                  width={20}
                  height={20}
                />
                <span className="text-base font-medium text-white">
                  {t('withdrawal') || 'Withdrawal'}
                </span>
              </button>
              <button
                onClick={handleOpenCustomerServiceModal}
                className="flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#6456bd54] px-4 py-4 transition-colors hover:bg-white/5 focus:bg-[#FC7E09] focus:text-white focus:outline-none active:bg-[#FC7E09] active:text-white"
              >
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user-chat-icon.svg"
                  alt={t('customer_inquiry')}
                  width={20}
                  height={20}
                />
                <span className="text-base font-medium text-white">
                  {t('customer_inquiry') || 'Customer inquiry'}
                </span>
              </button>
              <button
                onClick={handleOpenCustomerServiceNotes}
                className="flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#6456bd54] px-4 py-4 transition-colors hover:bg-white/5 focus:bg-[#FC7E09] focus:text-white focus:outline-none active:bg-[#FC7E09] active:text-white"
              >
                <div className="relative">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/question-icon.svg"
                    alt={t('notes')}
                    width={24}
                    height={24}
                  />
                  <span className="absolute -top-1 -right-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#FC7E09] px-1 text-[10px] leading-none text-white">
                    {helpUnreadCount > 99 ? '99+' : helpUnreadCount}
                  </span>
                </div>
                <span className="text-base font-medium text-white">
                  {t('notes') || 'Notes'}
                </span>
              </button>
              <button
                onClick={handleOpenAnnouncementModal}
                className="flex w-full cursor-pointer items-center gap-3 rounded-none border-b border-[#6456bd54] px-4 py-4 transition-colors hover:bg-white/5 focus:bg-[#FC7E09] focus:text-white focus:outline-none active:bg-[#FC7E09] active:text-white"
              >
                <div className="relative">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/noti-icon.svg"
                    alt={t('announcement')}
                    width={22}
                    height={22}
                  />
                </div>
                <span className="text-base font-medium text-white">
                  {t('announcement') || 'Announcement'}
                </span>
              </button>
            </div>

            {/* Footer section: Social buttons + Logout fixed at bottom */}
            <div className="mt-auto space-y-3 p-4">
              {/* Simple button with localized sidebar-apk image */}
              <a
                href="https://thestaticfile.com/uploads/kokobet777.apk"
                download
                className="mb-8 block w-full"
              >
                <LazyImage
                  src={sidebarApkSrc}
                  alt="Sidebar APK"
                  width={25}
                  height={25}
                  className="animate-float h-auto w-full rounded-[10px] shadow-[0_0_20px_#FC7E09]"
                />
              </a>

              <div className="flex flex-col gap-3">
                <a
                  href="https://web.telegram.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[60px] bg-[#2F80ED] px-6 py-3 text-base font-semibold text-white transition-colors duration-200"
                >
                  <img
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/telegram.svg"
                    alt={t('telegram')}
                    className="h-6 w-6"
                  />
                  {t('telegram')}
                </a>
                <a
                  href="https://web.whatsapp.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-[60px] bg-[#21C942] px-6 py-3 text-base font-semibold text-white transition-colors duration-200"
                >
                  <img
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/whatsapp.svg"
                    alt={t('whatsapp')}
                    className="h-6 w-6"
                  />
                  {t('whatsapp')}
                </a>
              </div>

              {isAuth && (
                <div className="border-t border-[#6456bd54] pt-4">
                  <button
                    onClick={handleLogout}
                    className="btn-hover-outline w-full cursor-pointer rounded-full border border-[#FC7E09] bg-[#141943] px-6 py-3 text-base font-medium text-white transition-colors duration-200"
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
