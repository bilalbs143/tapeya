'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { LanguageSwitcher } from '@/dynamic-components/template14/components/LanguageSwitcher/LanguageSwitcher';
import LazyImage from '@/dynamic-components/template14/components/LazyImage/LazyImage';
import WalletButton from '@/dynamic-components/template14/components/WalletButton/WalletButton';
import WalletDropdown from '@/dynamic-components/template14/components/WalletDropdown/WalletDropdown';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { usePopupData } from '@/hooks/usePopupData';
import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/providers/LanguageProvider';
import { logoutUser } from '@/slices/auth/authAction';
import { openModal } from '@/slices/common/commonSlice';

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
  const pathname = usePathname();
  const { headerLogo } = useTemplate();

  // Simple selectors
  const auth = useSelector(selectAuth);
  const helpUnreadCount = useSelector(selectUnreadCount);
  const announcementUnreadCount = useSelector(selectAnnouncementUnreadCount);

  const { isAuth, user, userLoader } = auth;
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

  // Helper function to split text into letters for hover animation
  const splitIntoLetters = useCallback((text) => {
    return text.split('').map((char, index) => (
      <span key={index} style={{ display: 'inline-block' }}>
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, []);

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

  // Mobile header profile dropdown
  const [isMobileUserMenuOpen, setIsMobileUserMenuOpen] = useState(false);
  const mobileUserMenuRef = useRef(null);

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
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-new-banner-mob-7.webp';
    }
    if (currentLocale === 'ko') {
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-new-banner-mob-7.webp';
    }
    return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-new-banner-mob-7.webp';
  }, [currentLocale]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        mobileUserMenuRef.current &&
        !mobileUserMenuRef.current.contains(event.target)
      ) {
        setIsMobileUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isMobileUserMenuOpen) {
      // Use setTimeout to ensure click events on dropdown items are processed first
      setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 0);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen, isMobileUserMenuOpen]);

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
    if (!isAuth) {
      dispatch(openModal('login'));
      return;
    }
    router.push('/dashboard/deposit');
    closeMobileMenu();
  }, [isAuth, dispatch, router, closeMobileMenu]);

  const handleOpenWithdrawalTab = useCallback(() => {
    if (!isAuth) {
      dispatch(openModal('login'));
      return;
    }
    router.push('/dashboard/withdrawal/');
    closeMobileMenu();
  }, [isAuth, dispatch, router, closeMobileMenu]);

  const handleOpenAnnouncementModal = useCallback(() => {
    dispatch(openModal('announcement'));
    closeMobileMenu();
  }, [dispatch, closeMobileMenu]);

  const handleMobileNavigation = useCallback(
    (e, href) => {
      // Allow Home navigation without auth check
      if (
        href === '/' ||
        href === '/announcements' ||
        href === '/promotions' ||
        href === '/slot-providers' ||
        href === '/live-casino' ||
        href.startsWith('/sports')
      ) {
        closeMobileMenu();
        return; // Let the Link component handle navigation
      }

      // For dashboard routes, check authentication
      if (href.startsWith('/dashboard/')) {
        e.preventDefault();
        if (!isAuth) {
          dispatch(openModal('login'));
          closeMobileMenu();
        } else {
          router.push(href);
          closeMobileMenu();
        }
      }
    },
    [isAuth, dispatch, router, closeMobileMenu],
  );

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`relative z-[100] ${isMobilePlatform ? 'pt-safe-top' : ''}`}
      >
        {/* Desktop Navbar */}
        <div className="hidden bg-transparent lg:block">
          <div className="px-2 py-3 md:px-4 md:py-3">
            <div className="flex items-center justify-end gap-6">
              {/* Left Section - Desktop */}
              <div className="flex items-center gap-4">
                {/* Wallet Button - Only show if authenticated */}
                {isAuth && <WalletButton variant="desktop" />}

                {/* Buttons */}
                {!isAuth ? (
                  <>
                    <button
                      onClick={handleOpenLoginModal}
                      className="angled-button angled-button-pink h-[50px] w-[130px]"
                    >
                      <div className="angled-button-inner">
                        <span className="angled-button-text">Login</span>
                      </div>
                    </button>

                    <button
                      onClick={handleOpenRegisterModal}
                      className="angled-button angled-button-blue h-[50px] w-[130px]"
                    >
                      <div className="angled-button-inner">
                        <span className="angled-button-text">Register</span>
                      </div>
                    </button>
                  </>
                ) : null}
              </div>

              {/* Right Section - Desktop */}
              <div className="flex items-center gap-4">
                {/* Language Switcher */}
                {/* <div
                  className="angled-button angled-button-blue h-[50px]"
                  style={{ pointerEvents: 'auto' }}
                >
                  <div
                    className="angled-button-inner"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <LanguageSwitcher variant="dropdown" appearance="filled" />
                  </div>
                </div> */}

                {/* Profile - Only show if authenticated */}
                {isAuth && (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={toggleUserMenu}
                      ref={userButtonRef}
                      className="angled-button angled-button-blue h-[50px] w-[50px]"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <div
                        className="angled-button-inner"
                        style={{ pointerEvents: 'auto' }}
                      >
                        <span className="angled-button-text text-lg font-bold text-white">
                          {userInitial}
                        </span>
                      </div>
                    </button>

                    {isUserMenuOpen && (
                      <div
                        className="absolute right-0 z-[1000] mt-2"
                        style={{ width: '200px' }}
                      >
                        <div className="border border-[#7351ff] bg-[#0d1028] shadow-xl">
                          <div className="overflow-hidden rounded-[5px] p-3">
                            <Link
                              href="/dashboard/profile"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                              style={{
                                borderColor: '#7351FF',
                              }}
                            >
                              <span className="flex items-center gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                  className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                                >
                                  <path d="M10.4724 8.47335C11.1259 7.95912 11.603 7.25396 11.8372 6.45597C12.0713 5.65799 12.051 4.80686 11.7789 4.02099C11.5068 3.23513 10.9965 2.55361 10.3191 2.07125C9.64161 1.58889 8.83066 1.32968 7.99902 1.32968C7.16739 1.32968 6.35643 1.58889 5.67897 2.07125C5.00152 2.55361 4.49125 3.23513 4.21916 4.02099C3.94707 4.80686 3.9267 5.65799 4.16086 6.45597C4.39503 7.25396 4.87209 7.95912 5.52569 8.47335C4.40574 8.92204 3.42855 9.66625 2.69828 10.6266C1.96802 11.587 1.51206 12.7276 1.37902 13.9267C1.36939 14.0142 1.3771 14.1028 1.4017 14.1874C1.42631 14.272 1.46733 14.3508 1.52243 14.4196C1.6337 14.5583 1.79554 14.6472 1.97235 14.6667C2.14917 14.6861 2.32646 14.6345 2.46524 14.5233C2.60401 14.412 2.69291 14.2502 2.71235 14.0733C2.85874 12.7701 3.48015 11.5666 4.45783 10.6925C5.43552 9.81853 6.70095 9.33537 8.01235 9.33537C9.32376 9.33537 10.5892 9.81853 11.5669 10.6925C12.5446 11.5666 13.166 12.7701 13.3124 14.0733C13.3305 14.2372 13.4086 14.3885 13.5318 14.498C13.6549 14.6076 13.8142 14.6677 13.979 14.6667H14.0524C14.2271 14.6466 14.3868 14.5582 14.4967 14.4208C14.6066 14.2835 14.6578 14.1083 14.639 13.9333C14.5053 12.7308 14.0469 11.5873 13.3129 10.6255C12.5789 9.66363 11.597 8.91967 10.4724 8.47335ZM7.99902 8.00001C7.4716 8.00001 6.95603 7.84362 6.5175 7.5506C6.07897 7.25758 5.73718 6.8411 5.53534 6.35384C5.33351 5.86657 5.2807 5.33039 5.38359 4.81311C5.48649 4.29582 5.74046 3.82067 6.1134 3.44773C6.48634 3.07479 6.9615 2.82081 7.47878 2.71792C7.99606 2.61502 8.53224 2.66783 9.01951 2.86967C9.50678 3.0715 9.92325 3.41329 10.2163 3.85182C10.5093 4.29036 10.6657 4.80593 10.6657 5.33335C10.6657 6.04059 10.3847 6.71887 9.88464 7.21896C9.38454 7.71906 8.70626 8.00001 7.99902 8.00001Z" />
                                </svg>
                                <span className="text-[12px] text-white transition-colors group-hover:text-[#ed7af3]">
                                  {t('profile')}
                                </span>
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="6"
                                height="13"
                                viewBox="0 0 6 13"
                                fill="none"
                                className="text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path
                                  d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                  stroke="currentColor"
                                  strokeWidth="0.941399"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </Link>
                            <Link
                              href="/dashboard/referrals"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                              style={{
                                borderColor: '#7351FF',
                              }}
                            >
                              <span className="flex items-center gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="none"
                                  className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                                >
                                  <path
                                    d="M2 14V12.6667C2 11.9594 2.28095 11.2811 2.78105 10.781C3.28115 10.281 3.95942 10 4.66667 10H7.33333C7.97333 10 8.56 10.2253 9.02 10.6007M10.6667 2.08667C11.2403 2.23353 11.7487 2.56713 12.1118 3.03487C12.4748 3.50261 12.6719 4.07789 12.6719 4.67C12.6719 5.26211 12.4748 5.83739 12.1118 6.30513C11.7487 6.77287 11.2403 7.10647 10.6667 7.25333M10.6667 12.6667H14.6667M12.6667 10.6667V14.6667M3.33333 4.66667C3.33333 5.37391 3.61428 6.05219 4.11438 6.55228C4.61448 7.05238 5.29276 7.33333 6 7.33333C6.70724 7.33333 7.38552 7.05238 7.88562 6.55228C8.38571 6.05219 8.66667 5.37391 8.66667 4.66667C8.66667 3.95942 8.38571 3.28115 7.88562 2.78105C7.38552 2.28095 6.70724 2 6 2C5.29276 2 4.61448 2.28095 4.11438 2.78105C3.61428 3.28115 3.33333 3.95942 3.33333 4.66667Z"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className="text-[12px] text-white transition-colors group-hover:text-[#ed7af3]">
                                  {t('referrals')}
                                </span>
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="6"
                                height="13"
                                viewBox="0 0 6 13"
                                fill="none"
                                className="text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path
                                  d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                  stroke="currentColor"
                                  strokeWidth="0.941399"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </Link>
                            <Link
                              href="/dashboard/betting-management"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                              style={{
                                borderColor: '#7351FF',
                              }}
                            >
                              <span className="flex items-center gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  viewBox="0 0 16 16"
                                  fill="currentColor"
                                  className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                                >
                                  <path d="M8 2.5C11.0375 2.5 13.5 4.9625 13.5 8.00001C13.5 11.0375 11.0375 13.5 8 13.5C4.9625 13.5 2.5 11.0375 2.5 8.00001C2.5 7.84534 2.50633 7.69234 2.519 7.54101C2.52438 7.47554 2.51682 7.40966 2.49674 7.34712C2.47667 7.28457 2.44447 7.2266 2.40198 7.1765C2.3595 7.12641 2.30757 7.08517 2.24915 7.05514C2.19073 7.02512 2.12696 7.00689 2.0615 7.0015C1.99604 6.99612 1.93015 7.00368 1.86761 7.02376C1.80507 7.04384 1.7471 7.07604 1.697 7.11852C1.6469 7.161 1.60566 7.21294 1.57564 7.27136C1.54561 7.32978 1.52738 7.39354 1.522 7.459C1.50733 7.63767 1.5 7.81801 1.5 8.00001C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8.00001C14.5 4.41 11.59 1.5 8 1.5C6.32225 1.49803 4.70912 2.14687 3.5 3.31V2C3.5 1.8674 3.44732 1.74022 3.35355 1.64645C3.25979 1.55268 3.13261 1.5 3 1.5C2.86739 1.5 2.74021 1.55268 2.64645 1.64645C2.55268 1.74022 2.5 1.8674 2.5 2V4.50001C2.5 4.63261 2.55268 4.75979 2.64645 4.85356C2.74021 4.94733 2.86739 5.00001 3 5.00001H5.5C5.63261 5.00001 5.75979 4.94733 5.85355 4.85356C5.94732 4.75979 6 4.63261 6 4.50001C6 4.3674 5.94732 4.24022 5.85355 4.14645C5.75979 4.05268 5.63261 4 5.5 4H4.225C5.21 3.07 6.5385 2.5 8 2.5ZM8.5 4.50001C8.5 4.3674 8.44732 4.24022 8.35355 4.14645C8.25979 4.05268 8.13261 4 8 4C7.86739 4 7.74021 4.05268 7.64645 4.14645C7.55268 4.24022 7.5 4.3674 7.5 4.50001V8.00001C7.5 8.13261 7.55268 8.25979 7.64645 8.35356C7.74021 8.44733 7.86739 8.50001 8 8.50001H10.5C10.6326 8.50001 10.7598 8.44733 10.8536 8.35356C10.9473 8.25979 11 8.13261 11 8.00001C11 7.8674 10.9473 7.74022 10.8536 7.64645C10.7598 7.55268 10.6326 7.50001 10.5 7.50001H8.5V4.50001Z" />
                                </svg>
                                <span className="text-[12px] text-white capitalize transition-colors group-hover:text-[#ed7af3]">
                                  {t('betting') || 'Bet History'}
                                </span>
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="6"
                                height="13"
                                viewBox="0 0 6 13"
                                fill="none"
                                className="text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path
                                  d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                  stroke="currentColor"
                                  strokeWidth="0.941399"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </Link>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLogout();
                                setIsUserMenuOpen(false);
                              }}
                              className="group flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                              style={{
                                borderColor: '#7351FF',
                              }}
                            >
                              <span className="flex items-center gap-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="15"
                                  height="15"
                                  viewBox="0 0 15 15"
                                  fill="none"
                                  className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                                >
                                  <path
                                    d="M11.5 2.10001C10.2936 1.06524 8.75605 0.497528 7.16667 0.500008C3.48467 0.500008 0.5 3.48468 0.5 7.16668C0.5 10.8487 3.48467 13.8333 7.16667 13.8333C8.75605 13.8358 10.2936 13.2681 11.5 12.2333"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                  <path
                                    d="M11.168 4.5C11.168 4.5 13.8346 6.464 13.8346 7.16667C13.8346 7.86933 11.168 9.83333 11.168 9.83333M13.5013 7.16667H5.16797"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                                <span className="text-[12px] text-white transition-colors group-hover:text-[#ed7af3]">
                                  {t('logout')}
                                </span>
                              </span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="6"
                                height="13"
                                viewBox="0 0 6 13"
                                fill="none"
                                className="text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path
                                  d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                  stroke="currentColor"
                                  strokeWidth="0.941399"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navbar */}
        <div
          className="mx-2 mt-2 rounded-[5px] border px-3 py-3 lg:hidden"
          style={{
            backgroundColor: '#1E1451',
            borderColor: '#3E1D88',
            boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.25) inset',
          }}
        >
          <div className="grid grid-cols-3 items-center">
            {/* Mobile Hamburger Menu - Left */}
            <div className="flex justify-start">
              <button
                onClick={toggleMobileMenu}
                className="angled-button angled-button-blue h-[40px] w-[45px]"
              >
                <div className="angled-button-inner">
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

            {/* Logo - Center */}
            <div className="flex justify-center">
              <Link href="/" className="flex items-center">
                <Image
                  src={headerLogo}
                  alt="Artchip Logo"
                  width={80}
                  height={32}
                  priority
                  className="h-auto w-auto max-w-[60px]"
                />
              </Link>
            </div>

            {/* Mobile Profile/Login Button - Right (always visible) */}
            <div className="flex justify-end">
              {isAuth ? (
                <div className="relative" ref={mobileUserMenuRef}>
                  <button
                    onClick={() =>
                      setIsMobileUserMenuOpen(!isMobileUserMenuOpen)
                    }
                    className="angled-button angled-button-blue h-[40px] w-[40px]"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <div
                      className="angled-button-inner"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <span className="angled-button-text text-sm font-bold text-white">
                        {userInitial}
                      </span>
                    </div>
                  </button>

                  {isMobileUserMenuOpen && (
                    <div
                      className="absolute right-0 z-[1000] mt-2"
                      style={{ width: '200px' }}
                    >
                      <div className="border border-[#7351ff] bg-[#0d1028] shadow-xl">
                        <div className="overflow-hidden rounded-[5px] p-3">
                          <Link
                            href="/dashboard/profile"
                            onClick={() => {
                              setIsMobileUserMenuOpen(false);
                              closeMobileMenu();
                            }}
                            className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                            style={{
                              borderColor: '#7351FF',
                            }}
                          >
                            <span className="flex items-center gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path d="M10.4724 8.47335C11.1259 7.95912 11.603 7.25396 11.8372 6.45597C12.0713 5.65799 12.051 4.80686 11.7789 4.02099C11.5068 3.23513 10.9965 2.55361 10.3191 2.07125C9.64161 1.58889 8.83066 1.32968 7.99902 1.32968C7.16739 1.32968 6.35643 1.58889 5.67897 2.07125C5.00152 2.55361 4.49125 3.23513 4.21916 4.02099C3.94707 4.80686 3.9267 5.65799 4.16086 6.45597C4.39503 7.25396 4.87209 7.95912 5.52569 8.47335C4.40574 8.92204 3.42855 9.66625 2.69828 10.6266C1.96802 11.587 1.51206 12.7276 1.37902 13.9267C1.36939 14.0142 1.3771 14.1028 1.4017 14.1874C1.42631 14.272 1.46733 14.3508 1.52243 14.4196C1.6337 14.5583 1.79554 14.6472 1.97235 14.6667C2.14917 14.6861 2.32646 14.6345 2.46524 14.5233C2.60401 14.412 2.69291 14.2502 2.71235 14.0733C2.85874 12.7701 3.48015 11.5666 4.45783 10.6925C5.43552 9.81853 6.70095 9.33537 8.01235 9.33537C9.32376 9.33537 10.5892 9.81853 11.5669 10.6925C12.5446 11.5666 13.166 12.7701 13.3124 14.0733C13.3305 14.2372 13.4086 14.3885 13.5318 14.498C13.6549 14.6076 13.8142 14.6677 13.979 14.6667H14.0524C14.2271 14.6466 14.3868 14.5582 14.4967 14.4208C14.6066 14.2835 14.6578 14.1083 14.639 13.9333C14.5053 12.7308 14.0469 11.5873 13.3129 10.6255C12.5789 9.66363 11.597 8.91967 10.4724 8.47335ZM7.99902 8.00001C7.4716 8.00001 6.95603 7.84362 6.5175 7.5506C6.07897 7.25758 5.73718 6.8411 5.53534 6.35384C5.33351 5.86657 5.2807 5.33039 5.38359 4.81311C5.48649 4.29582 5.74046 3.82067 6.1134 3.44773C6.48634 3.07479 6.9615 2.82081 7.47878 2.71792C7.99606 2.61502 8.53224 2.66783 9.01951 2.86967C9.50678 3.0715 9.92325 3.41329 10.2163 3.85182C10.5093 4.29036 10.6657 4.80593 10.6657 5.33335C10.6657 6.04059 10.3847 6.71887 9.88464 7.21896C9.38454 7.71906 8.70626 8.00001 7.99902 8.00001Z" />
                              </svg>
                              <span className="text-[12px] text-white transition-colors group-hover:text-[#ed7af3]">
                                {t('profile')}
                              </span>
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="6"
                              height="13"
                              viewBox="0 0 6 13"
                              fill="none"
                              className="text-white transition-colors group-hover:!text-[#ed7af3]"
                            >
                              <path
                                d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                stroke="currentColor"
                                strokeWidth="0.941399"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Link>
                          <Link
                            href="/dashboard/referrals"
                            onClick={() => {
                              setIsMobileUserMenuOpen(false);
                              closeMobileMenu();
                            }}
                            className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                            style={{
                              borderColor: '#7351FF',
                            }}
                          >
                            <span className="flex items-center gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path
                                  d="M2 14V12.6667C2 11.9594 2.28095 11.2811 2.78105 10.781C3.28115 10.281 3.95942 10 4.66667 10H7.33333C7.97333 10 8.56 10.2253 9.02 10.6007M10.6667 2.08667C11.2403 2.23353 11.7487 2.56713 12.1118 3.03487C12.4748 3.50261 12.6719 4.07789 12.6719 4.67C12.6719 5.26211 12.4748 5.83739 12.1118 6.30513C11.7487 6.77287 11.2403 7.10647 10.6667 7.25333M10.6667 12.6667H14.6667M12.6667 10.6667V14.6667M3.33333 4.66667C3.33333 5.37391 3.61428 6.05219 4.11438 6.55228C4.61448 7.05238 5.29276 7.33333 6 7.33333C6.70724 7.33333 7.38552 7.05238 7.88562 6.55228C8.38571 6.05219 8.66667 5.37391 8.66667 4.66667C8.66667 3.95942 8.38571 3.28115 7.88562 2.78105C7.38552 2.28095 6.70724 2 6 2C5.29276 2 4.61448 2.28095 4.11438 2.78105C3.61428 3.28115 3.33333 3.95942 3.33333 4.66667Z"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[12px] text-white transition-colors group-hover:text-[#ed7af3]">
                                {t('referrals')}
                              </span>
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="6"
                              height="13"
                              viewBox="0 0 6 13"
                              fill="none"
                              className="text-white transition-colors group-hover:!text-[#ed7af3]"
                            >
                              <path
                                d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                stroke="currentColor"
                                strokeWidth="0.941399"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Link>
                          <Link
                            href="/dashboard/betting-management"
                            onClick={() => {
                              setIsMobileUserMenuOpen(false);
                              closeMobileMenu();
                            }}
                            className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                            style={{
                              borderColor: '#7351FF',
                            }}
                          >
                            <span className="flex items-center gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path d="M8 2.5C11.0375 2.5 13.5 4.9625 13.5 8.00001C13.5 11.0375 11.0375 13.5 8 13.5C4.9625 13.5 2.5 11.0375 2.5 8.00001C2.5 7.84534 2.50633 7.69234 2.519 7.54101C2.52438 7.47554 2.51682 7.40966 2.49674 7.34712C2.47667 7.28457 2.44447 7.2266 2.40198 7.1765C2.3595 7.12641 2.30757 7.08517 2.24915 7.05514C2.19073 7.02512 2.12696 7.00689 2.0615 7.0015C1.99604 6.99612 1.93015 7.00368 1.86761 7.02376C1.80507 7.04384 1.7471 7.07604 1.697 7.11852C1.6469 7.161 1.60566 7.21294 1.57564 7.27136C1.54561 7.32978 1.52738 7.39354 1.522 7.459C1.50733 7.63767 1.5 7.81801 1.5 8.00001C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8.00001C14.5 4.41 11.59 1.5 8 1.5C6.32225 1.49803 4.70912 2.14687 3.5 3.31V2C3.5 1.8674 3.44732 1.74022 3.35355 1.64645C3.25979 1.55268 3.13261 1.5 3 1.5C2.86739 1.5 2.74021 1.55268 2.64645 1.64645C2.55268 1.74022 2.5 1.8674 2.5 2V4.50001C2.5 4.63261 2.55268 4.75979 2.64645 4.85356C2.74021 4.94733 2.86739 5.00001 3 5.00001H5.5C5.63261 5.00001 5.75979 4.94733 5.85355 4.85356C5.94732 4.75979 6 4.63261 6 4.50001C6 4.3674 5.94732 4.24022 5.85355 4.14645C5.75979 4.05268 5.63261 4 5.5 4H4.225C5.21 3.07 6.5385 2.5 8 2.5ZM8.5 4.50001C8.5 4.3674 8.44732 4.24022 8.35355 4.14645C8.25979 4.05268 8.13261 4 8 4C7.86739 4 7.74021 4.05268 7.64645 4.14645C7.55268 4.24022 7.5 4.3674 7.5 4.50001V8.00001C7.5 8.13261 7.55268 8.25979 7.64645 8.35356C7.74021 8.44733 7.86739 8.50001 8 8.50001H10.5C10.6326 8.50001 10.7598 8.44733 10.8536 8.35356C10.9473 8.25979 11 8.13261 11 8.00001C11 7.8674 10.9473 7.74022 10.8536 7.64645C10.7598 7.55268 10.6326 7.50001 10.5 7.50001H8.5V4.50001Z" />
                              </svg>
                              <span className="text-[12px] text-white capitalize transition-colors group-hover:text-[#ed7af3]">
                                {t('betting') || 'Bet History'}
                              </span>
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="6"
                              height="13"
                              viewBox="0 0 6 13"
                              fill="none"
                              className="text-white transition-colors group-hover:!text-[#ed7af3]"
                            >
                              <path
                                d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                stroke="currentColor"
                                strokeWidth="0.941399"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              handleLogout();
                              setIsMobileUserMenuOpen(false);
                            }}
                            className="group flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                            style={{
                              borderColor: '#7351FF',
                            }}
                          >
                            <span className="flex items-center gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path
                                  d="M11.5 2.10001C10.2936 1.06524 8.75605 0.497528 7.16667 0.500008C3.48467 0.500008 0.5 3.48468 0.5 7.16668C0.5 10.8487 3.48467 13.8333 7.16667 13.8333C8.75605 13.8358 10.2936 13.2681 11.5 12.2333"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M11.168 4.5C11.168 4.5 13.8346 6.464 13.8346 7.16667C13.8346 7.86933 11.168 9.83333 11.168 9.83333M13.5013 7.16667H5.16797"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[12px] text-white transition-colors group-hover:text-[#ed7af3]">
                                {t('logout')}
                              </span>
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="6"
                              height="13"
                              viewBox="0 0 6 13"
                              fill="none"
                              className="text-white transition-colors group-hover:!text-[#ed7af3]"
                            >
                              <path
                                d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                stroke="currentColor"
                                strokeWidth="0.941399"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleOpenLoginModal}
                  className="angled-button angled-button-blue h-[40px] w-[40px]"
                  style={{ pointerEvents: 'auto' }}
                >
                  <div
                    className="angled-button-inner flex items-center justify-center"
                    style={{ pointerEvents: 'auto' }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="h-4 w-4 text-white"
                    >
                      <path
                        d="M10.4724 8.47335C11.1259 7.95912 11.603 7.25396 11.8372 6.45597C12.0713 5.65799 12.051 4.80686 11.7789 4.02099C11.5068 3.23513 10.9965 2.55361 10.3191 2.07125C9.64161 1.58889 8.83066 1.32968 7.99902 1.32968C7.16739 1.32968 6.35643 1.58889 5.67897 2.07125C5.00152 2.55361 4.49125 3.23513 4.21916 4.02099C3.94707 4.80686 3.9267 5.65799 4.16086 6.45597C4.39503 7.25396 4.87209 7.95912 5.52569 8.47335C4.40574 8.92204 3.42855 9.66625 2.69828 10.6266C1.96802 11.587 1.51206 12.7276 1.37902 13.9267C1.36939 14.0142 1.3771 14.1028 1.4017 14.1874C1.42631 14.272 1.46733 14.3508 1.52243 14.4196C1.6337 14.5583 1.79554 14.6472 1.97235 14.6667C2.14917 14.6861 2.32646 14.6345 2.46524 14.5233C2.60401 14.412 2.69291 14.2502 2.71235 14.0733C2.85874 12.7701 3.48015 11.5666 4.45783 10.6925C5.43552 9.81853 6.70095 9.33537 8.01235 9.33537C9.32376 9.33537 10.5892 9.81853 11.5669 10.6925C12.5446 11.5666 13.166 12.7701 13.3124 14.0733C13.3305 14.2372 13.4086 14.3885 13.5318 14.498C13.6549 14.6076 13.8142 14.6677 13.979 14.6667H14.0524C14.2271 14.6466 14.3868 14.5582 14.4967 14.4208C14.6066 14.2835 14.6578 14.1083 14.639 13.9333C14.5053 12.7308 14.0469 11.5873 13.3129 10.6255C12.5789 9.66363 11.597 8.91967 10.4724 8.47335ZM7.99902 8.00001C7.4716 8.00001 6.95603 7.84362 6.5175 7.5506C6.07897 7.25758 5.73718 6.8411 5.53534 6.35384C5.33351 5.86657 5.2807 5.33039 5.38359 4.81311C5.48649 4.29582 5.74046 3.82067 6.1134 3.44773C6.48634 3.07479 6.9615 2.82081 7.47878 2.71792C7.99606 2.61502 8.53224 2.66783 9.01951 2.86967C9.50678 3.0715 9.92325 3.41329 10.2163 3.85182C10.5093 4.29036 10.6657 4.80593 10.6657 5.33335C10.6657 6.04059 10.3847 6.71887 9.88464 7.21896C9.38454 7.71906 8.70626 8.00001 7.99902 8.00001Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer - Offcanvas */}
      <div
        className={`fixed top-0 left-0 z-[10000] h-full w-full transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Content */}
        <div
          className={`absolute top-0 left-0 h-full w-80 bg-[#1E1451] shadow-xl ${
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
                  className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm border border-[#3E1D88] transition-colors"
                  style={{
                    backgroundColor: '#3E1D88',
                    boxShadow: '4px 5px 16px 0 rgba(0, 0, 0, 0.25) inset',
                  }}
                >
                  <svg
                    className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90"
                    fill="white"
                    stroke="white"
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Auth Buttons under Header */}
            {!isAuth && (
              <div className="px-0 py-0">
                <div className="flex items-center gap-3">
                  <div className="flex w-full items-center gap-3 rounded-[0px] px-3 py-3">
                    <button
                      onClick={handleOpenLoginModal}
                      className="angled-button angled-button-pink h-[50px] flex-1"
                    >
                      <div className="angled-button-inner">
                        <span className="angled-button-text">Login</span>
                      </div>
                    </button>

                    <button
                      onClick={handleOpenRegisterModal}
                      className="angled-button angled-button-blue h-[50px] flex-1"
                    >
                      <div className="angled-button-inner">
                        <span className="angled-button-text">Register</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Wallet Dropdown for Authenticated Users - Mobile Only */}
            {isAuth && (
              <div className="px-4 pt-4">
                <WalletDropdown
                  variant="mobile"
                  closeMobileMenu={closeMobileMenu}
                />
              </div>
            )}

            {/* Navigation Menu Items - Same as Desktop Sidebar */}
            <div className="grid grid-cols-2 gap-x-0 gap-y-3 p-4">
              <Link
                href="/"
                onClick={(e) => handleMobileNavigation(e, '/')}
                className={`group template14-menu-item-angled ${pathname === '/' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-300 ${pathname === '/' ? 'stroke-[#ED7AF3]' : 'stroke-[#544591] group-hover:stroke-[#ED7AF3]'}`}
                      />
                      <path
                        d="M9 22V12H15V22"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-300 ${pathname === '/' ? 'stroke-[#ED7AF3]' : 'stroke-[#544591] group-hover:stroke-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('home') || 'Home'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/withdrawal"
                onClick={(e) =>
                  handleMobileNavigation(e, '/dashboard/withdrawal')
                }
                className={`group template14-menu-item-angled ${pathname === '/dashboard/withdrawal' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="21"
                      viewBox="0 0 22 21"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M21.5 8.9C21.5 5.18615 21.5 3.3287 20.3943 2.08865C20.2163 1.88944 20.0213 1.70606 19.8116 1.54055C18.4949 0.5 16.523 0.5 12.575 0.5H9.425C5.47805 0.5 3.5051 0.5 2.18735 1.5395C1.97665 1.7075 1.78275 1.89055 1.60565 2.08865C0.5 3.32765 0.5 5.18615 0.5 8.9C0.5 12.6138 0.5 14.4713 1.60565 15.7113C1.78275 15.9101 1.97665 16.0929 2.18735 16.2595C3.5051 17.3 5.47805 17.3 9.425 17.3H11"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-300 ${pathname === '/dashboard/withdrawal' ? 'stroke-[#ED7AF3]' : 'stroke-[#544591] group-hover:stroke-[#ED7AF3]'}`}
                      />
                      <path
                        d="M0.5 5.75H21.5"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        className={`transition-all duration-300 ${pathname === '/dashboard/withdrawal' ? 'stroke-[#ED7AF3]' : 'stroke-[#544591] group-hover:stroke-[#ED7AF3]'}`}
                      />
                      <path
                        d="M17.6094 11.6682C17.6094 11.392 17.3855 11.1682 17.1094 11.1682C16.8332 11.1682 16.6094 11.392 16.6094 11.6682L17.1094 11.6682L17.6094 11.6682ZM16.7558 20.6126C16.9511 20.8079 17.2677 20.8079 17.4629 20.6126L20.6449 17.4307C20.8402 17.2354 20.8402 16.9188 20.6449 16.7236C20.4496 16.5283 20.1331 16.5283 19.9378 16.7236L17.1094 19.552L14.2809 16.7236C14.0857 16.5283 13.7691 16.5283 13.5738 16.7236C13.3786 16.9188 13.3786 17.2354 13.5738 17.4307L16.7558 20.6126ZM17.1094 11.6682L16.6094 11.6682V20.2591L17.1094 20.2591L17.6094 20.2591V11.6682L17.1094 11.6682Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/dashboard/withdrawal' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/dashboard/withdrawal' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('withdrawal')}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/deposit"
                onClick={(e) => handleMobileNavigation(e, '/dashboard/deposit')}
                className={`group template14-menu-item-angled ${pathname === '/dashboard/deposit' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="21"
                      viewBox="0 0 22 21"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M21.5 8.9C21.5 5.18615 21.5 3.3287 20.3944 2.08865C20.2163 1.88944 20.0213 1.70606 19.8116 1.54055C18.4949 0.5 16.523 0.5 12.575 0.5H9.425C5.47805 0.5 3.5051 0.5 2.18735 1.5395C1.97665 1.7075 1.78275 1.89055 1.60565 2.08865C0.5 3.32765 0.5 5.18615 0.5 8.9C0.5 12.6138 0.5 14.4713 1.60565 15.7113C1.78275 15.9101 1.97665 16.0928 2.18735 16.2594C3.5051 17.3 5.47805 17.3 9.425 17.3H11"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-300 ${pathname === '/dashboard/deposit' ? 'stroke-[#ED7AF3]' : 'stroke-[#544591] group-hover:stroke-[#ED7AF3]'}`}
                      />
                      <path
                        d="M0.5 5.74998H21.5"
                        stroke="currentColor"
                        strokeLinejoin="round"
                        className={`transition-all duration-300 ${pathname === '/dashboard/deposit' ? 'stroke-[#ED7AF3]' : 'stroke-[#544591] group-hover:stroke-[#ED7AF3]'}`}
                      />
                      <path
                        d="M16.6094 20.2591C16.6094 20.5352 16.8332 20.7591 17.1094 20.7591C17.3855 20.7591 17.6094 20.5352 17.6094 20.2591L17.1094 20.2591L16.6094 20.2591ZM17.4629 11.3146C17.2677 11.1194 16.9511 11.1194 16.7558 11.3146L13.5738 14.4966C13.3786 14.6919 13.3786 15.0085 13.5738 15.2037C13.7691 15.399 14.0857 15.399 14.2809 15.2037L17.1094 12.3753L19.9378 15.2037C20.1331 15.399 20.4496 15.399 20.6449 15.2037C20.8402 15.0085 20.8402 14.6919 20.6449 14.4966L17.4629 11.3146ZM17.1094 20.2591L17.6094 20.2591L17.6094 11.6682L17.1094 11.6682L16.6094 11.6682L16.6094 20.2591L17.1094 20.2591Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/dashboard/deposit' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/dashboard/deposit' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('deposit') || 'Deposit'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/coupons"
                onClick={(e) => handleMobileNavigation(e, '/dashboard/coupons')}
                className={`group template14-menu-item-angled ${pathname === '/dashboard/coupons' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="23"
                      height="21"
                      viewBox="0 0 23 21"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M21 8.9C21 9.17614 21.2239 9.4 21.5 9.4C21.7761 9.4 22 9.17614 22 8.9H21.5H21ZM20.3944 2.08865L20.7675 1.7559L20.7672 1.75546L20.3944 2.08865ZM19.8116 1.54055L19.5016 1.93284L19.5019 1.93306L19.8116 1.54055ZM2.18735 1.5395L1.87768 1.14693L1.87564 1.14856L2.18735 1.5395ZM1.60565 2.08865L1.23289 1.75541L1.23259 1.75574L1.60565 2.08865ZM1.60565 15.7113L1.97899 15.3788L1.97885 15.3786L1.60565 15.7113ZM2.18735 16.2594L1.87723 16.6517L1.87749 16.6519L2.18735 16.2594ZM11 17.8C11.2761 17.8 11.5 17.5761 11.5 17.3C11.5 17.0239 11.2761 16.8 11 16.8V17.3V17.8ZM21.1853 17.9185C21.3809 17.7236 21.3814 17.407 21.1865 17.2114C20.9915 17.0158 20.6749 17.0153 20.4794 17.2103L20.8323 17.5644L21.1853 17.9185ZM13 14.1146C12.9994 13.8385 12.7751 13.6151 12.4989 13.6157C12.2228 13.6163 11.9994 13.8407 12 14.1168L12.5 14.1157L13 14.1146ZM19.9534 19.9489C19.8872 20.217 20.0509 20.488 20.319 20.5541C20.5871 20.6203 20.8581 20.4565 20.9243 20.1884L20.4388 20.0687L19.9534 19.9489ZM20.9242 18.1017L20.4403 17.9755L20.4387 17.9819L20.9242 18.1017ZM20.426 17.2955L20.3047 17.7806C20.3106 17.782 20.3165 17.7834 20.3224 17.7846L20.426 17.2955ZM18.5803 16.3187C18.3124 16.2517 18.0409 16.4146 17.9739 16.6825C17.9069 16.9504 18.0698 17.2218 18.3377 17.2888L18.459 16.8037L18.5803 16.3187ZM13.4516 11.4272C13.2561 11.6221 13.2556 11.9387 13.4506 12.1343C13.6456 12.3298 13.9622 12.3303 14.1577 12.1353L13.8047 11.7812L13.4516 11.4272ZM21.6376 15.2309C21.6382 15.5071 21.8625 15.7305 22.1386 15.7299C22.4148 15.7293 22.6382 15.505 22.6376 15.2289L22.1376 15.2299L21.6376 15.2309ZM14.6832 9.39676C14.7494 9.12866 14.5857 8.85769 14.3175 8.79154C14.0494 8.72539 13.7785 8.8891 13.7123 9.15721L14.1978 9.27698L14.6832 9.39676ZM13.7124 11.244L14.1964 11.3696L14.1979 11.3638L13.7124 11.244ZM14.2112 12.0501L14.3325 11.5651C14.3266 11.5636 14.3207 11.5623 14.3148 11.561L14.2112 12.0501ZM16.0563 13.027C16.3242 13.094 16.5957 12.9311 16.6627 12.6632C16.7297 12.3953 16.5668 12.1238 16.2989 12.0568L16.1776 12.5419L16.0563 13.027ZM21.5 8.9H22C22 7.05629 22.001 5.62595 21.8578 4.50339C21.7128 3.367 21.4136 2.48044 20.7675 1.7559L20.3944 2.08865L20.0212 2.4214C20.4808 2.93691 20.7343 3.5991 20.8658 4.62991C20.999 5.67455 21 7.02986 21 8.9H21.5ZM20.3944 2.08865L20.7672 1.75546C20.5699 1.5347 20.3538 1.33146 20.1213 1.14804L19.8116 1.54055L19.5019 1.93306C19.6889 2.08065 19.8628 2.24419 20.0215 2.42184L20.3944 2.08865ZM19.8116 1.54055L20.1216 1.14826C19.3592 0.545766 18.4311 0.268253 17.2362 0.133231C16.0505 -0.000749528 14.5373 0 12.575 0V0.5V1C14.5607 1 16.0074 1.00075 17.1239 1.12691C18.2311 1.25202 18.9473 1.49478 19.5016 1.93284L19.8116 1.54055ZM12.575 0.5V0H9.425V0.5V1H12.575V0.5ZM9.425 0.5V0C7.46325 0 5.95005 -0.000747502 4.76415 0.133092C3.56908 0.267967 2.64054 0.545158 1.87768 1.14694L2.18735 1.5395L2.49702 1.93206C3.05191 1.49434 3.76872 1.25178 4.8763 1.12678C5.99305 1.00075 7.4398 1 9.425 1V0.5ZM2.18735 1.5395L1.87564 1.14856C1.64332 1.3338 1.42895 1.5361 1.23289 1.75541L1.60565 2.08865L1.97841 2.42189C2.13655 2.245 2.30998 2.0812 2.49906 1.93044L2.18735 1.5395ZM1.60565 2.08865L1.23259 1.75574C0.58642 2.47985 0.287154 3.36655 0.142223 4.503C-0.000950873 5.62569 0 7.05629 0 8.9H0.5H1C1 7.02986 1.00095 5.67428 1.13419 4.62951C1.26567 3.5985 1.51923 2.93645 1.97871 2.42156L1.60565 2.08865ZM0.5 8.9H0C0 10.7437 -0.000951111 12.174 0.142224 13.2966C0.287163 14.433 0.586437 15.3196 1.23245 16.0441L1.60565 15.7113L1.97885 15.3786C1.51921 14.8631 1.26566 14.2009 1.13419 13.1701C1.00095 12.1254 1 10.7701 1 8.9H0.5ZM1.60565 15.7113L1.23231 16.0439C1.42888 16.2646 1.64397 16.4672 1.87723 16.6517L2.18735 16.2594L2.49747 15.8672C2.30933 15.7185 2.13662 15.5557 1.97899 15.3788L1.60565 15.7113ZM2.18735 16.2594L1.87749 16.6519C2.64036 17.2543 3.56895 17.5318 4.7641 17.6668C5.95003 17.8007 7.46326 17.8 9.425 17.8V17.3V16.8C7.43979 16.8 5.99307 16.7992 4.87635 16.6731C3.76885 16.548 3.05209 16.3052 2.49721 15.867L2.18735 16.2594ZM9.425 17.3V17.8H11V17.3V16.8H9.425V17.3ZM0.5 5.74999V6.24999H21.5V5.74999V5.24999H0.5V5.74999ZM20.8323 17.5644L20.4794 17.2103C19.8662 17.8214 19.0859 18.2374 18.2367 18.4057L18.3339 18.8962L18.4311 19.3866C19.474 19.1799 20.4323 18.6691 21.1853 17.9185L20.8323 17.5644ZM18.3339 18.8962L18.2367 18.4057C17.3875 18.574 16.5075 18.4872 15.7076 18.1561L15.5164 18.6181L15.3252 19.0801C16.3075 19.4867 17.3882 19.5933 18.4311 19.3866L18.3339 18.8962ZM15.5164 18.6181L15.7076 18.1561C14.9077 17.825 14.2237 17.2646 13.7419 16.5453L13.3265 16.8236L12.9111 17.1019C13.5028 17.9852 14.3428 18.6735 15.3252 19.0801L15.5164 18.6181ZM13.3265 16.8236L13.7419 16.5453C13.26 15.8261 13.0019 14.9804 13 14.1146L12.5 14.1157L12 14.1168C12.0023 15.18 12.3193 16.2187 12.9111 17.1019L13.3265 16.8236ZM20.4388 20.0687L20.9243 20.1884L21.4096 18.2214L20.9242 18.1017L20.4387 17.9819L19.9534 19.9489L20.4388 20.0687ZM20.9242 18.1017L21.408 18.2278C21.4474 18.0767 21.4557 17.9191 21.4325 17.7647L20.9381 17.839L20.4436 17.9133C20.4467 17.9341 20.4456 17.9552 20.4403 17.9755L20.9242 18.1017ZM20.9381 17.839L21.4325 17.7647C21.4093 17.6102 21.355 17.462 21.2729 17.3292L20.8475 17.592L20.4222 17.8548C20.4332 17.8727 20.4405 17.8926 20.4436 17.9133L20.9381 17.839ZM20.8475 17.592L21.2729 17.3292C21.1908 17.1963 21.0826 17.0815 20.9548 16.9916L20.6671 17.4006L20.3795 17.8095C20.3966 17.8216 20.4112 17.837 20.4222 17.8548L20.8475 17.592ZM20.6671 17.4006L20.9548 16.9916C20.827 16.9017 20.6824 16.8387 20.5296 16.8063L20.426 17.2955L20.3224 17.7846C20.3429 17.789 20.3623 17.7975 20.3795 17.8095L20.6671 17.4006ZM20.426 17.2955L20.5473 16.8104L18.5803 16.3187L18.459 16.8037L18.3377 17.2888L20.3047 17.7806L20.426 17.2955ZM13.8047 11.7812L14.1577 12.1353C14.7708 11.524 15.5512 11.1078 16.4005 10.9394L16.3032 10.449L16.206 9.95851C15.163 10.1654 14.2046 10.6764 13.4516 11.4272L13.8047 11.7812ZM16.3032 10.449L16.4005 10.9394C17.2498 10.771 18.1299 10.8578 18.9299 11.1889L19.1211 10.7269L19.3123 10.2649C18.3298 9.85828 17.249 9.75167 16.206 9.95851L16.3032 10.449ZM19.1211 10.7269L18.9299 11.1889C19.7299 11.52 20.414 12.0805 20.8959 12.7999L21.3113 12.5216L21.7267 12.2433C21.1349 11.3599 20.2948 10.6715 19.3123 10.2649L19.1211 10.7269ZM21.3113 12.5216L20.8959 12.7999C21.3777 13.5192 21.6358 14.3651 21.6376 15.2309L22.1376 15.2299L22.6376 15.2289C22.6354 14.1656 22.3185 13.1267 21.7267 12.2433L21.3113 12.5216ZM14.1978 9.27698L13.7123 9.15721L13.227 11.1242L13.7124 11.244L14.1979 11.3638L14.6832 9.39676L14.1978 9.27698ZM13.7124 11.244L13.2285 11.1184C13.1892 11.2695 13.181 11.427 13.2044 11.5815L13.6988 11.5067L14.1932 11.432C14.19 11.4112 14.1911 11.39 14.1964 11.3696L13.7124 11.244ZM13.6988 11.5067L13.2044 11.5815C13.2277 11.7359 13.2821 11.8839 13.3643 12.0167L13.7895 11.7537L14.2147 11.4906C14.2036 11.4727 14.1963 11.4528 14.1932 11.432L13.6988 11.5067ZM13.7895 11.7537L13.3643 12.0167C13.4464 12.1495 13.5547 12.2643 13.6824 12.3541L13.97 11.9451L14.2575 11.5361C14.2403 11.524 14.2258 11.5085 14.2147 11.4906L13.7895 11.7537ZM13.97 11.9451L13.6824 12.3541C13.8102 12.4439 13.9548 12.5069 14.1076 12.5393L14.2112 12.0501L14.3148 11.561C14.2942 11.5566 14.2748 11.5482 14.2575 11.5361L13.97 11.9451ZM14.2112 12.0501L14.0899 12.5352L16.0563 13.027L16.1776 12.5419L16.2989 12.0568L14.3325 11.5651L14.2112 12.0501Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/dashboard/coupons' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/dashboard/coupons' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('coupons') || 'Coupons'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/customer-inquiry"
                onClick={(e) =>
                  handleMobileNavigation(e, '/dashboard/customer-inquiry')
                }
                className={`group template14-menu-item-angled ${pathname === '/dashboard/customer-inquiry' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M15.7504 10.555C15.7504 10.209 15.7504 10.036 15.8024 9.882C15.9534 9.434 16.3524 9.261 16.7524 9.079C17.2004 8.874 17.4244 8.772 17.6474 8.754C17.8994 8.734 18.1524 8.788 18.3684 8.909C18.6544 9.069 18.8544 9.375 19.0584 9.623C20.0014 10.769 20.4734 11.342 20.6454 11.973C20.7854 12.483 20.7854 13.017 20.6454 13.526C20.3944 14.448 19.5994 15.22 19.0104 15.936C18.7094 16.301 18.5584 16.484 18.3684 16.591C18.1487 16.7128 17.8978 16.7668 17.6474 16.746C17.4244 16.728 17.2004 16.626 16.7514 16.421C16.3514 16.239 15.9534 16.066 15.8024 15.618C15.7504 15.464 15.7504 15.291 15.7504 14.946V10.555ZM5.7504 10.555C5.7504 10.119 5.7384 9.728 5.3864 9.422C5.2584 9.311 5.0884 9.234 4.7494 9.079C4.3004 8.875 4.0764 8.772 3.8534 8.754C3.1864 8.7 2.8274 9.156 2.4434 9.624C1.4994 10.769 1.0274 11.342 0.854396 11.974C0.715201 12.4823 0.715201 13.0187 0.854396 13.527C1.1064 14.448 1.9024 15.221 2.4904 15.936C2.8614 16.386 3.2164 16.797 3.8534 16.746C4.0764 16.728 4.3004 16.626 4.7494 16.421C5.0894 16.267 5.2584 16.189 5.3864 16.078C5.7384 15.772 5.7504 15.381 5.7504 14.946V10.555Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={`transition-all duration-300 ${pathname === '/dashboard/customer-inquiry' ? 'stroke-[#ED7AF3]' : 'stroke-[#544591] group-hover:stroke-[#ED7AF3]'}`}
                      />
                      <path
                        d="M18.75 9.25V7.75C18.75 3.884 15.168 0.75 10.75 0.75C6.332 0.75 2.75 3.884 2.75 7.75V9.25M18.75 16.25C18.75 20.75 14.75 20.75 10.75 20.75"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`transition-all duration-300 ${pathname === '/dashboard/customer-inquiry' ? 'stroke-[#ED7AF3]' : 'stroke-[#544591] group-hover:stroke-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/dashboard/customer-inquiry' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('customer_inquiry') || 'Customer Inq'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/dashboard/note"
                onClick={(e) => handleMobileNavigation(e, '/dashboard/note')}
                className={`group template14-menu-item-angled ${pathname === '/dashboard/note' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M0.75 18.04V2.75C0.75 2.21957 0.960714 1.71086 1.33579 1.33579C1.71086 0.960714 2.21957 0.75 2.75 0.75H16.75C17.2804 0.75 17.7891 0.960714 18.1642 1.33579C18.5393 1.71086 18.75 2.21957 18.75 2.75V12.75C18.75 13.2804 18.5393 13.7891 18.1642 14.1642C17.7891 14.5393 17.2804 14.75 16.75 14.75H5.711C5.41123 14.75 5.11531 14.8175 4.84511 14.9473C4.57491 15.0771 4.33735 15.266 4.15 15.5L1.819 18.414C1.74143 18.5112 1.63556 18.5819 1.51604 18.6164C1.39652 18.6508 1.26926 18.6472 1.15186 18.6061C1.03446 18.565 0.932729 18.4885 0.860735 18.3871C0.788741 18.2857 0.750045 18.1644 0.75 18.04Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={`transition-all duration-300 ${pathname === '/dashboard/note' ? 'stroke-[#ED7AF3]' : 'stroke-[#544591] group-hover:stroke-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/dashboard/note' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('notes') || 'Notes'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/announcements"
                onClick={(e) => handleMobileNavigation(e, '/announcements')}
                className={`group template14-menu-item-angled ${pathname === '/announcements' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="23"
                      viewBox="0 0 18 23"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M0 19.125V16.875H2.25V9C2.25 7.44375 2.71875 6.06113 3.65625 4.85213C4.59375 3.64313 5.8125 2.85075 7.3125 2.475V1.6875C7.3125 1.21875 7.47675 0.820503 7.80525 0.492752C8.13375 0.165002 8.532 0.000752557 9 2.55682e-06C9.468 -0.000747443 9.86662 0.163502 10.1959 0.492752C10.5251 0.822003 10.689 1.22025 10.6875 1.6875V2.475C12.1875 2.85 13.4062 3.64238 14.3438 4.85213C15.2812 6.06188 15.75 7.4445 15.75 9V16.875H18V19.125H0ZM9 22.5C8.38125 22.5 7.85175 22.2799 7.4115 21.8396C6.97125 21.3994 6.75075 20.8695 6.75 20.25H11.25C11.25 20.8688 11.0299 21.3986 10.5896 21.8396C10.1494 22.2806 9.6195 22.5008 9 22.5ZM4.5 16.875H13.5V9C13.5 7.7625 13.0594 6.70313 12.1781 5.82188C11.2969 4.94063 10.2375 4.5 9 4.5C7.7625 4.5 6.70313 4.94063 5.82188 5.82188C4.94063 6.70313 4.5 7.7625 4.5 9V16.875Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/announcements' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/announcements' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('announcement') || 'Announcement'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/promotions"
                onClick={(e) => handleMobileNavigation(e, '/promotions')}
                className={`group template14-menu-item-angled ${pathname === '/promotions' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 37 37"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/promotions' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                        d="M18.5 2.5C9.664 2.5 2.5 9.664 2.5 18.5C2.5 27.336 9.664 34.5 18.5 34.5C27.336 34.5 34.5 27.336 34.5 18.5C34.5 9.664 27.336 2.5 18.5 2.5ZM18.5 32C10.4919 32 4 25.5081 4 17.5C4 9.4919 10.4919 3 18.5 3C26.5081 3 33 9.4919 33 17.5C33 25.5081 26.5081 32 18.5 32Z"
                      />
                      <path
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/promotions' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                        d="M18.5 6C11.5964 6 6 11.5964 6 18.5C6 25.4036 11.5964 31 18.5 31C25.4036 31 31 25.4036 31 18.5C31 11.5964 25.4036 6 18.5 6ZM18.5 29.5C12.701 29.5 8 24.799 8 19C8 13.201 12.701 8.5 18.5 8.5C24.299 8.5 29 13.201 29 19C29 24.799 24.299 29.5 18.5 29.5Z"
                      />
                      <path
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/promotions' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                        d="M18.5 9.5C13.5294 9.5 9.5 13.5294 9.5 18.5C9.5 23.4706 13.5294 27.5 18.5 27.5C23.4706 27.5 27.5 23.4706 27.5 18.5C27.5 13.5294 23.4706 9.5 18.5 9.5ZM18.5 26C14.3579 26 11 22.6421 11 18.5C11 14.3579 14.3579 11 18.5 11C22.6421 11 26 14.3579 26 18.5C26 22.6421 22.6421 26 18.5 26Z"
                      />
                      <path
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/promotions' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                        d="M24 14.5L20 18.5L24 22.5L22.5 24L18.5 20L14.5 24L13 22.5L17 18.5L13 14.5L14.5 13L18.5 17L22.5 13L24 14.5Z"
                      />
                    </svg>
                    <span
                      className={`${pathname === '/promotions' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('promotions_badge') || 'Promotions'}
                    </span>
                  </div>
                </div>
              </Link>
              <Link
                href="/faq"
                onClick={(e) => handleMobileNavigation(e, '/faq')}
                className={`group template14-menu-item-angled ${pathname === '/faq' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M10 0C4.477 0 0 4.477 0 10C0 15.523 4.477 20 10 20C15.523 20 20 15.523 20 10C20 4.477 15.523 0 10 0ZM10 18C5.589 18 2 14.411 2 10C2 5.589 5.589 2 10 2C14.411 2 18 5.589 18 10C18 14.411 14.411 18 10 18Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/faq' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                      <path
                        d="M10 6C9.17157 6 8.5 6.67157 8.5 7.5C8.5 8.32843 9.17157 9 10 9C10.8284 9 11.5 8.32843 11.5 7.5C11.5 6.67157 10.8284 6 10 6Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/faq' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                      <path
                        d="M10 11C9.44772 11 9 11.4477 9 12V14C9 14.5523 9.44772 15 10 15C10.5523 15 11 14.5523 11 14V12C11 11.4477 10.5523 11 10 11Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/faq' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/faq' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('faq') || "FAQ's"}
                    </span>
                  </div>
                </div>
              </Link>
              <Link
                href="/slot-providers"
                onClick={(e) => handleMobileNavigation(e, '/slot-providers')}
                className={`group template14-menu-item-angled ${pathname === '/slot-providers' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="51"
                      height="31"
                      viewBox="0 0 51 31"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M8.71935 10.6903C8.47659 10.6279 8.34964 10.5698 8.22492 10.5676C7.36077 10.5564 6.49441 10.5408 5.63026 10.5587C4.94207 10.5721 4.78171 10.7461 4.67703 11.4244C4.61913 11.8105 4.51222 12.1898 4.47659 12.5758C4.43204 13.0712 4.13583 13.3568 3.70153 13.3746C2.68817 13.417 1.67035 13.4148 0.654762 13.3657C0.209327 13.3456 -0.0222984 12.9953 -2.6717e-05 12.5401C0.0400624 11.7257 0.0779243 10.9112 0.153648 10.099C0.29396 8.57725 0.485497 7.05771 0.607991 5.53593C0.708214 4.28192 0.888615 4.08333 2.16033 4.09003C6.02893 4.11457 9.8953 4.13019 13.7639 4.17482C14.2984 4.18151 14.432 3.96953 14.4499 3.48756C14.4833 2.65751 14.5545 1.82522 14.6414 0.999621C14.726 0.225346 14.9933 -1.925e-05 15.7639 -1.925e-05C18.1893 0.00221209 20.6147 0.0156001 23.0423 0.0156001C26.8597 0.0156001 30.677 0.0267568 34.4944 -0.00225059C35.2361 -0.00671327 35.7528 0.205264 36.1136 0.876897C36.53 1.6534 37.0156 2.39198 37.461 3.15286C37.5456 3.29567 37.6459 3.47195 37.6303 3.62144C37.5701 4.17705 37.8886 4.22391 38.314 4.21944C41.3496 4.19267 44.3875 4.17705 47.4231 4.15697C47.7795 4.15473 48.1358 4.16589 48.4922 4.15027C49.1314 4.11903 49.5946 4.35556 49.8997 4.9424C50.1737 5.46899 50.4899 5.97551 50.8173 6.47087C51.0801 6.86804 51.0467 7.21167 50.7995 7.59992C49.9554 8.93203 49.049 10.2329 48.3207 11.6275C46.9777 14.2002 46.1136 16.9448 45.6681 19.8232C45.363 21.7979 45.2249 23.7682 45.4387 25.7608C45.5167 26.4771 45.2628 26.7761 44.5278 26.8073C43.7149 26.843 42.8997 26.7984 42.0868 26.7961C40.3229 26.7894 38.559 26.7939 36.7951 26.7828C35.7528 26.7761 35.6013 26.6132 35.5857 25.5577C35.5389 22.3647 36.3363 19.3836 37.7928 16.5565C38.8129 14.5796 40.0824 12.7923 41.6392 11.2035C41.7438 11.0964 41.7683 10.9135 41.8307 10.764C41.6837 10.7171 41.5367 10.6345 41.3875 10.6279C40.608 10.5944 39.8285 10.5698 39.049 10.5609C38.334 10.552 38.0846 10.7684 37.9487 11.4847C37.873 11.8841 37.8173 12.2902 37.7349 12.6874C37.6458 13.1247 37.3496 13.3858 36.9198 13.3947C35.9554 13.4148 34.9866 13.4193 34.0245 13.3702C33.6236 13.3501 33.3363 13.0779 33.3764 12.6115C33.3986 12.3438 33.4655 12.0805 33.4744 11.8127C33.4788 11.6788 33.4009 11.5427 33.3608 11.4066C33.245 11.4825 33.069 11.5315 33.0222 11.6386C32.8552 12.0068 32.726 12.3951 32.5902 12.7789C31.7594 15.1307 30.9643 17.4959 30.5078 19.9549C29.9487 22.9716 29.6637 26.0129 29.8641 29.0855C29.8775 29.2729 29.8908 29.4581 29.9042 29.6456C29.9688 30.6854 29.7283 30.9933 28.6971 30.9955C25.1002 30.9955 21.5055 30.9754 17.9087 30.9464C17.2049 30.942 16.9822 30.701 16.951 29.9736C16.8508 27.7221 17.0334 25.5087 17.5768 23.3063C18.8619 18.0984 21.4788 13.6513 25.1202 9.77102C25.3764 9.49879 25.6681 9.26227 25.9198 8.98782C26.0089 8.88964 26.0712 8.72229 26.0579 8.5951C26.0534 8.53709 25.8396 8.45676 25.7216 8.45453C24.1269 8.42329 22.5345 8.38982 20.9398 8.38535C20.2205 8.38535 19.8686 8.64865 19.6882 9.3426C19.5234 9.98076 19.4298 10.639 19.3118 11.2883C19.1826 12.0024 18.951 12.2433 18.2294 12.2411C17.2984 12.2411 16.3652 12.1987 15.4343 12.1407C14.8864 12.1072 14.5902 12.2857 14.3697 12.828C13.4031 15.2133 12.6592 17.6633 12.294 20.2092C12.0356 22.0077 11.8997 23.824 12.1247 25.647C12.2294 26.4904 11.9376 26.8341 11.0935 26.8318C8.46545 26.8274 5.83516 26.8073 3.2071 26.7805C2.53227 26.7738 2.33628 26.5507 2.30287 25.7675C2.21378 23.6745 2.51668 21.6373 3.17369 19.6514C4.24273 16.4226 5.99997 13.6134 8.32959 11.1544C8.44318 11.0362 8.54117 10.9045 8.7238 10.6859L8.71935 10.6903ZM25.4187 1.66679C25.4187 1.66679 25.4187 1.67795 25.4187 1.68241C22.5523 1.68241 19.6837 1.6891 16.8173 1.67572C16.4165 1.67572 16.2516 1.78952 16.2138 2.21347C15.9977 4.58092 15.7461 6.94614 15.5234 9.31359C15.3875 10.7461 15.5256 10.8845 16.9822 10.7238C17.7884 10.6345 17.873 10.6301 17.9554 9.81341C18.147 7.89892 19.2427 6.73639 20.9176 6.72524C23.412 6.70739 25.9042 6.77879 28.3986 6.81895C28.8062 6.82565 29.1759 6.93722 29.3185 7.39241C29.4565 7.83421 29.2516 8.1533 28.9287 8.41436C26.6503 10.2552 24.7839 12.4642 23.1403 14.8763C20.3296 19.0021 18.7216 23.5295 18.579 28.55C18.5568 29.3064 18.5768 29.3265 19.3251 29.3265C22.0222 29.3265 24.7216 29.3265 27.4187 29.3265C28.1425 29.3265 28.167 29.2997 28.1002 28.5745C27.9131 26.5128 28.1581 24.4689 28.4009 22.4294C28.6793 20.082 29.196 17.7793 29.9087 15.5323C31.1158 11.7257 32.7438 8.10198 35.0846 4.85984C35.7572 3.92491 35.7505 3.28451 35.1314 2.41652C34.7683 1.90778 34.4075 1.65563 33.7706 1.66233C30.9888 1.6891 28.2049 1.67349 25.4231 1.67349L25.4187 1.66679ZM42.3496 5.83493C42.3496 5.85948 42.3496 5.88402 42.3496 5.90857C42.0779 5.90857 41.8062 5.91303 41.5345 5.90857C40.0601 5.87956 38.5835 5.8327 37.1091 5.8327C36.7795 5.8327 36.3318 5.88402 36.1447 6.09377C35.8218 6.45971 35.5323 6.9506 35.4543 7.42588C35.2427 8.71336 35.1425 10.0209 35.0222 11.324C35.0089 11.4646 35.1358 11.7034 35.2561 11.7547C35.8597 12.0046 36.2984 11.7547 36.432 11.1321C36.7216 9.78664 37.4833 9.01682 38.6503 9.00567C40.4476 8.98559 42.2472 9.01906 44.0445 9.03244C44.4521 9.03467 44.7817 9.18417 44.9265 9.59028C45.0712 9.99638 44.8931 10.3021 44.6058 10.5877C43.6837 11.5092 42.7127 12.3928 41.873 13.3858C39.1937 16.5521 37.5434 20.1735 37.2717 24.364C37.2205 25.1583 37.2784 25.2253 38.098 25.232C39.6748 25.2409 41.2539 25.2476 42.8307 25.2587C43.6147 25.2632 43.6258 25.2587 43.628 24.4711C43.628 21.4119 44.02 18.413 44.9599 15.4944C45.8752 12.6494 47.1269 9.97184 48.8619 7.52852C48.9955 7.34109 49.1202 7.04655 49.069 6.84796C48.8819 6.11385 48.4632 5.8394 47.6926 5.83716C45.9109 5.83716 44.1314 5.83716 42.3496 5.83716V5.83493ZM8.19596 5.77023C8.19596 5.77023 8.19596 5.75684 8.19596 5.74791C6.38082 5.74791 4.5679 5.75907 2.75276 5.73899C2.37414 5.73452 2.24719 5.87733 2.21824 6.22542C2.0757 7.89892 1.91534 9.57243 1.77503 11.2459C1.76167 11.4021 1.81735 11.69 1.87971 11.7034C2.18928 11.7614 2.52559 11.8015 2.82403 11.7301C2.95543 11.6989 3.08015 11.3999 3.1091 11.2058C3.32959 9.72862 4.14251 8.95881 5.63249 8.94988C7.32737 8.93873 9.02447 8.98335 10.7193 9.0079C11.1381 9.01459 11.5055 9.14624 11.6525 9.57466C11.7995 10.0031 11.5768 10.3244 11.2628 10.5966C9.11801 12.462 7.34073 14.6175 6.02002 17.1478C4.8218 19.4394 4.14919 21.8716 3.98438 24.4465C3.94429 25.0646 4.05565 25.1896 4.6904 25.1963C6.36968 25.2119 8.04897 25.1963 9.72603 25.2208C10.2316 25.2275 10.4075 25.0602 10.383 24.5403C10.2784 22.2866 10.5345 20.0597 11.0178 17.8663C11.559 15.4029 12.4543 13.0622 13.5768 10.8041C13.7394 10.4784 13.8418 10.1035 13.8819 9.73978C13.9977 8.64419 14.0712 7.54191 14.1581 6.44409C14.2071 5.82601 14.1781 5.77469 13.5389 5.77246C11.7594 5.7613 9.9777 5.76799 8.19819 5.76799L8.19596 5.77023Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/slot-providers' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/slot-providers' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('slots') || 'Slots'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/live-casino"
                onClick={(e) => handleMobileNavigation(e, '/live-casino')}
                className={`group template14-menu-item-angled ${pathname === '/live-casino' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="49"
                      height="49"
                      viewBox="0 0 49 49"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <g fill="#544591">
                        <path
                          d="M24.526 49C11.027 49.02.006 38.069 0 24.627-.006 11.021 10.898.012 24.39 0c13.673-.013 24.597 10.912 24.603 24.607C48.993 38.03 38.012 48.98 24.526 49Zm17.923-37.329c-.578.59-1.103 1.142-1.648 1.68-.5.493-1.213.506-1.713.02a294.911 294.911 0 0 1-3.49-3.49c-.447-.461-.428-1.188.02-1.655.383-.402.785-.791 1.18-1.187.163-.162.312-.33.487-.513C34.502 4.567 31.5 3.31 28.14 2.744c0 .818.013 1.583 0 2.342-.013.727-.506 1.22-1.232 1.22-1.61.006-3.211 0-4.82 0-.727 0-1.22-.48-1.239-1.213-.013-.493 0-.986 0-1.48v-.875c-3.373.577-6.383 1.83-9.211 3.834.558.525 1.07.992 1.563 1.485.714.701.694 1.33-.02 2.044a1419.34 1419.34 0 0 0-3.08 3.075c-.727.733-1.343.74-2.07.013-.493-.486-.986-.973-1.504-1.492-1.966 2.79-3.218 5.8-3.789 9.154h.435c.649 0 1.297-.013 1.946 0 .688.02 1.18.506 1.187 1.187.006 1.635.006 3.263 0 4.898 0 .688-.48 1.168-1.168 1.207-.194.013-.389 0-.583 0H2.776c.104 2.296 2.316 7.629 3.763 9.095.025-.006.051-.006.07-.026.507-.5 1.013-1.005 1.519-1.505.577-.577 1.271-.59 1.855-.006 1.122 1.109 2.238 2.231 3.353 3.354.286.285.442.636.357 1.018a1.828 1.828 0 0 1-.395.772c-.506.545-1.064 1.045-1.596 1.57 1.693 1.564 7.116 3.808 9.153 3.795v-2.199c.006-.85.486-1.31 1.336-1.317h4.43c1.135 0 1.531.402 1.531 1.55v2.018c3.373-.57 6.39-1.83 9.127-3.775-.046-.078-.059-.104-.078-.124-.487-.486-.967-.973-1.453-1.46-.63-.629-.63-1.297 0-1.933 1.07-1.07 2.14-2.147 3.217-3.211.649-.649 1.31-.642 1.96.02.499.505.992 1.012 1.517 1.55 1.985-2.81 3.243-5.82 3.808-9.18-.818 0-1.564.007-2.316 0-.752-.013-1.245-.5-1.245-1.245a595.754 595.754 0 0 1 0-4.82c0-.727.492-1.214 1.225-1.227.662-.013 1.324 0 1.985 0 .11 0 .22-.02.357-.026-.577-3.34-1.83-6.344-3.807-9.153v-.007Z"
                          className={`transition-all duration-300 ${pathname === '/live-casino' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                        />
                        <path
                          d="M10.716 24.458c.032-7.616 6.201-13.76 13.81-13.74 7.628.019 13.784 6.214 13.752 13.844-.033 7.61-6.228 13.753-13.83 13.72-7.615-.032-13.758-6.22-13.726-13.824h-.006Zm25.739.065c.026-6.572-5.32-11.93-11.93-11.976-6.57-.046-11.973 5.352-11.98 11.956 0 6.572 5.358 11.944 11.949 11.957 6.57.013 11.941-5.346 11.96-11.944v.007ZM19.395 9.368c-.084.467-.35.81-.765.921-.403.104-.85-.058-1.025-.434-.24-.513-.46-1.045-.649-1.577-.15-.428.039-.85.415-1.064.357-.208.889-.175 1.09.175.363.636.63 1.324.934 1.985v-.006ZM32.16 8.051c-.298.655-.55 1.336-.9 1.96-.196.35-.72.395-1.084.2-.383-.2-.59-.629-.448-1.05.188-.552.415-1.09.668-1.616.175-.376.636-.538 1.032-.428.389.11.674.5.74.934h-.007ZM19.31 39.678c-.012.058-.025.188-.077.31-.188.468-.37.942-.584 1.396a.898.898 0 0 1-1.135.48c-.448-.162-.714-.63-.558-1.097a13.57 13.57 0 0 1 .681-1.647c.182-.377.636-.513 1.044-.39.377.11.636.474.63.948ZM32.167 40.956c-.071.434-.33.791-.713.914-.39.13-.824.013-1.012-.357a12.745 12.745 0 0 1-.72-1.712c-.137-.403.09-.824.454-1.012.35-.182.869-.15 1.057.181.357.636.63 1.317.94 1.986h-.006ZM41.683 17.899c-.013.318-.194.603-.545.759-.402.182-.804.357-1.22.506-.505.188-.998-.02-1.2-.487-.194-.46 0-.973.494-1.193a16.59 16.59 0 0 1 1.22-.506c.635-.227 1.258.207 1.245.921h.006ZM41.683 31.088c.007.668-.525 1.129-1.096.967a8.762 8.762 0 0 1-1.473-.597c-.447-.227-.583-.727-.382-1.168a.89.89 0 0 1 1.109-.473c.46.162.921.356 1.362.564.311.15.467.434.48.707ZM10.346 18.275c-.006.669-.57 1.103-1.154.922a10.1 10.1 0 0 1-1.402-.578.874.874 0 0 1-.402-1.168.9.9 0 0 1 1.135-.486c.442.155.87.337 1.291.532.35.162.52.454.526.778h.006ZM7.31 31.134a.882.882 0 0 1 .552-.792c.402-.175.804-.357 1.22-.506.505-.188 1.005.032 1.193.493.188.467-.013.967-.5 1.194-.402.181-.804.357-1.22.506-.635.227-1.251-.214-1.245-.889v-.006Z"
                          className={`transition-all duration-300 ${pathname === '/live-casino' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                        />
                        <path
                          d="M25.739 29.083c.266.941.772 1.726 1.447 2.407.103.104.168.24.246.364-.15.038-.305.11-.454.11-1.66.006-3.315.006-4.975 0-.143 0-.286-.065-.428-.098.07-.123.123-.272.22-.37a6.45 6.45 0 0 0 1.53-2.413c-.077.026-.122.026-.155.052-1.381.96-2.9 1.077-4.067.299a4.093 4.093 0 0 1-1.732-4.204c.214-1.032.746-1.862 1.57-2.517 1.83-1.46 3.535-3.043 4.917-4.944.13-.175.246-.363.376-.545.169-.24.35-.266.519-.013 1.472 2.219 3.425 3.97 5.462 5.65 2.108 1.74 1.952 5.003-.28 6.54-1.076.74-2.73.7-3.885-.09-.104-.072-.207-.15-.311-.228Z"
                          className={`transition-all duration-300 ${pathname === '/live-casino' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                        />
                      </g>
                    </svg>
                    <span
                      className={`${pathname === '/live-casino' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('casino') || 'Casino'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/sports?q=sports"
                onClick={(e) => handleMobileNavigation(e, '/sports?q=sports')}
                className={`group template14-menu-item-angled ${pathname === '/sports' && searchParams?.get('q') !== 'virtual' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="366"
                      height="424"
                      viewBox="0 0 366 424"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M0.0256042 267.8C4.7556 275.82 9.1356 284.61 14.7456 292.52C31.7056 316.45 55.0356 332.93 80.3856 346.8C109.656 362.81 141.036 373.06 173.486 380.27C173.946 380.37 174.456 380.28 175.346 380.28C172.426 375.18 169.826 370.25 166.796 365.6C165.936 364.29 163.866 363.61 162.216 362.99C125.556 349.34 90.5756 332.42 58.9556 309.16C39.3756 294.76 21.4756 278.63 9.72561 256.81C3.8056 245.81 0.905604 233.24 1.1956 220.07C1.6156 220.4 2.1456 220.59 2.2256 220.89C7.2756 240.51 20.1056 254.87 34.5956 267.88C66.1756 296.25 103.076 316.05 141.506 333.29C146.646 335.6 151.896 337.67 157.596 340.05C156.986 333.01 156.576 326.48 155.706 320.02C155.566 318.97 153.506 317.89 152.126 317.34C127.316 307.31 102.366 297.61 77.6656 287.3C60.6556 280.2 44.9356 270.76 31.8756 257.53C13.0156 238.43 6.5056 215.89 13.7756 189.75C21.4156 162.28 38.5656 140.99 58.2556 121.34C52.5556 128.6 46.6456 135.71 41.2056 143.17C32.0256 155.76 24.4856 169.29 20.9956 184.61C15.3956 209.22 23.7756 229.41 41.4956 246.38C55.2556 259.55 71.4656 268.98 88.5956 276.98C110.526 287.22 133.486 294.32 157.106 299.32C159.956 290.67 162.746 282.21 165.576 273.61C155.656 271.55 145.526 269.73 135.546 267.3C117.386 262.88 99.6456 257.15 83.6756 247.19C78.0856 243.7 72.6956 239.49 68.2356 234.66C57.2556 222.77 56.1256 209.02 64.5656 193.75C65.5356 209.82 73.2456 221.61 85.4856 229.76C95.2256 236.25 105.856 241.72 116.706 246.14C134.366 253.32 153.166 256.25 172.116 257.94C173.506 258.06 175.456 257.44 176.366 256.45C180.386 252.05 184.126 247.4 188.476 242.24C180.376 241.59 172.696 241.12 165.056 240.32C145.296 238.26 125.786 234.91 107.706 226.21C91.7556 218.55 80.9856 206.36 80.4756 188.06C80.2256 178.95 81.7456 169.37 84.5456 160.66C93.1556 133.82 109.776 111.71 128.266 90.9297C153.886 62.1297 184.696 39.8297 217.486 20.0397C228.396 13.4497 239.186 6.65973 250.036 -0.0302734C250.306 0.349727 250.576 0.729727 250.846 1.11973C246.176 4.51973 241.556 7.99973 236.826 11.3097C215.136 26.4897 192.916 40.9397 173.516 59.1597C151.756 79.5997 132.546 102.04 119.016 128.86C112.746 141.28 108.426 154.17 109.506 168.57C110.906 187.08 121.326 198.4 137.346 205.5C153.496 212.67 170.736 215.51 188.166 217.3C195.446 218.05 202.836 217.97 210.066 219.04C221.966 220.8 233.096 217.12 244.526 215.25C292.956 207.33 340.576 234.51 358.576 280.14C382.786 341.54 344.996 410.25 280.106 421.94C251.366 427.12 224.536 421.4 200.366 404.46C197.956 402.77 195.216 401.43 192.466 400.34C160.176 387.58 127.486 375.74 95.6556 361.93C70.5156 351.03 47.6256 335.96 28.3456 316.04C15.5456 302.82 5.4156 287.97 0.495604 269.98C0.325604 269.34 0.105604 268.71 0.00560416 268.06C-0.0343958 267.77 0.155604 267.44 0.0756042 267.75L0.0256042 267.8ZM281.706 369.76C280.346 356.89 279.196 345.15 277.736 333.44C277.566 332.08 275.876 330.44 274.496 329.77C263.876 324.66 253.206 319.64 242.416 314.9C240.876 314.23 238.186 314.61 236.736 315.57C226.626 322.27 216.636 329.16 206.806 336.28C205.556 337.19 204.666 339.9 204.996 341.49C207.276 352.37 209.806 363.2 212.576 373.96C213.016 375.66 214.746 377.62 216.366 378.31C227.046 382.88 237.826 387.23 248.676 391.39C250.196 391.97 252.676 391.76 253.996 390.86C262.656 384.97 271.146 378.83 279.596 372.64C280.746 371.8 281.376 370.23 281.716 369.74L281.706 369.76ZM310.226 302.56C307.966 290.66 305.926 279.55 303.636 268.5C303.406 267.39 301.806 266.23 300.586 265.72C288.956 260.83 277.286 256.01 265.546 251.4C264.216 250.88 261.976 251.27 260.756 252.1C252.546 257.77 244.396 263.54 236.486 269.62C235.066 270.71 233.896 273.53 234.206 275.26C236.176 286.36 238.496 297.41 240.976 308.41C241.336 310 242.926 311.82 244.426 312.56C254.876 317.65 265.406 322.58 276.046 327.27C277.586 327.95 280.366 327.72 281.666 326.73C290.506 319.94 299.116 312.86 307.736 305.78C308.866 304.85 309.586 303.4 310.216 302.57L310.226 302.56ZM339.146 328.13C342.626 325.42 346.066 323.08 349.066 320.27C350.446 318.98 351.656 316.81 351.746 314.97C352.256 304.84 352.456 294.69 352.626 284.55C352.656 282.62 352.506 280.44 351.646 278.79C348.496 272.77 345.106 266.86 341.576 261.04C340.696 259.59 339.126 257.98 337.586 257.61C329.686 255.71 321.666 253.72 314.896 260.79C313.556 262.19 311.696 263.21 309.906 264.05C306.786 265.52 306.246 267.75 306.896 270.92C308.956 281 310.796 291.13 312.806 301.22C313.046 302.44 313.606 303.83 314.476 304.66C322.606 312.5 330.826 320.24 339.156 328.12L339.146 328.13ZM253.626 394.65C255.416 399.9 256.856 404.67 258.716 409.27C259.386 410.94 260.826 412.53 262.326 413.59C273.236 421.3 284.026 416.47 293.596 411.47C302.906 406.6 310.906 399.21 319.346 392.75C320.576 391.8 321.766 389.85 321.746 388.38C321.686 382.8 321.116 377.22 320.706 371.16C308.646 371.78 297.066 372.34 285.486 373C284.396 373.06 283.206 373.58 282.296 374.22C272.816 380.92 263.376 387.68 253.626 394.65ZM195.516 269.66C207.406 269.66 218.526 269.7 229.646 269.6C230.876 269.59 232.276 269.06 233.286 268.34C242.096 262.09 250.876 255.78 259.566 249.36C260.596 248.6 261.666 247.06 261.656 245.88C261.606 239.77 261.216 233.67 260.946 227.46C259.786 227.38 259.136 227.23 258.516 227.31C245.866 229.14 233.206 230.93 220.586 232.92C218.906 233.18 217.166 234.21 215.846 235.34C209.546 240.77 203.326 246.29 197.226 251.94C196.006 253.07 194.696 254.88 194.676 256.39C194.626 260.85 195.196 265.31 195.516 269.64V269.66ZM178.806 314.33C175.716 316.96 172.966 319.13 170.436 321.52C169.406 322.49 168.436 323.84 168.106 325.17C164.816 338.43 164.506 351.39 172.286 363.49C174.436 366.84 176.026 370.6 178.456 373.71C180.746 376.63 183.486 379.47 186.596 381.43C197.416 388.23 197.456 388.01 207.356 380.19C209.646 378.38 210.346 376.59 209.666 373.81C207.166 363.49 204.856 353.12 202.356 342.8C201.946 341.09 201.296 339.21 200.166 337.93C193.236 330.09 186.146 322.39 178.806 314.33ZM325.456 390.66C328.916 388.63 332.316 387.54 334.406 385.25C346.536 372 354.176 356.48 358.186 338.88C359.906 331.34 357.876 326.14 352.616 321.61C344.286 326.29 338.216 332.61 335.326 341.92C333.666 347.28 331.466 352.59 328.666 357.44C322.866 367.47 323.066 377.95 325.456 390.67V390.66ZM161.796 321.71C166.606 321.82 176.966 313.8 178.966 308.62C182.846 298.55 186.126 288.22 190.596 278.43C194.156 270.63 191.726 263.06 191.546 255.39C191.516 253.99 190.066 252.62 188.906 250.59C170.086 271.14 161.306 294.58 161.796 321.71ZM218.496 229.86C241.676 226.94 264.706 222.19 288.346 224.08C264.286 216.74 241.006 218.67 218.496 229.86ZM335.966 254.04C326.646 243.26 316.056 235.06 302.856 230.15C307.786 236.07 313.896 240.82 318.896 246.53C323.456 251.73 328.626 254.13 335.966 254.04ZM263.596 418.41C257.506 412.41 252.256 415.86 247.086 417.17C252.116 417.55 257.146 417.93 263.596 418.41Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/sports' && searchParams?.get('q') !== 'virtual' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/sports' && searchParams?.get('q') !== 'virtual' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('sports') || 'Sports'}
                    </span>
                  </div>
                </div>
              </Link>

              <Link
                href="/sports?q=virtual"
                onClick={(e) => handleMobileNavigation(e, '/sports?q=virtual')}
                className={`group template14-menu-item-angled ${pathname === '/sports' && searchParams?.get('q') === 'virtual' ? 'template14-menu-item-angled-active' : ''}`}
              >
                <div className="template14-menu-item-angled-inner">
                  <div className="template14-menu-item-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="328"
                      height="352"
                      viewBox="0 0 328 352"
                      fill="none"
                      className="h-5 w-5 flex-shrink-0 transition-all duration-300"
                    >
                      <path
                        d="M201.555 189.718C197.685 194.938 194.685 200.278 190.475 204.388C178.475 216.108 163.965 220.178 147.725 215.488C118.605 207.078 89.6053 198.238 60.5553 189.578C55.9253 188.198 52.4253 185.348 50.2953 181.018C48.9053 178.198 47.6753 175.268 46.6853 172.288C44.9053 166.928 42.1853 162.328 37.5953 158.868C35.1753 157.038 32.9853 154.898 30.5153 152.748C24.8553 158.818 19.2953 164.748 13.7953 170.728C13.1253 171.458 12.6853 172.438 12.2653 173.358C10.4953 177.298 11.7053 180.058 15.7553 181.528C24.8353 184.828 33.8953 188.148 42.9653 191.468C43.4353 191.638 43.8653 191.878 44.6353 192.238C43.3853 195.688 42.1553 199.068 40.8253 202.708C38.3253 201.878 36.0453 201.118 33.2853 200.198C31.5953 206.768 29.8953 213.198 28.3553 219.668C28.2053 220.308 28.8053 221.418 29.3953 221.908C34.3153 226.008 39.8453 228.568 46.4353 228.268C47.3553 228.228 48.2753 228.178 49.1853 228.218C52.3053 228.338 54.4453 230.298 54.7053 233.238C54.9853 236.368 53.2153 238.818 50.0353 239.358C42.2653 240.658 35.0853 238.818 28.3053 235.048C27.4253 234.558 26.5553 234.068 25.2353 233.318C24.6153 238.028 24.2253 242.438 23.3953 246.768C23.0153 248.748 21.9453 250.678 20.8453 252.428C18.3653 256.378 15.2353 259.968 13.1853 264.118C10.1953 270.158 11.4653 275.718 17.1353 279.408C22.0053 282.578 27.4553 285.238 33.0253 286.888C48.4153 291.458 64.3053 292.058 80.2553 291.498C89.2453 291.178 98.0953 290.018 106.785 287.608C113.825 285.658 119.535 281.848 123.965 276.068C129.045 269.438 133.815 262.538 139.265 256.218C143.145 251.708 147.825 247.858 152.335 243.928C153.455 242.948 155.275 242.508 156.835 242.348C159.485 242.068 161.285 243.568 162.215 245.988C163.165 248.468 162.635 251.028 160.455 252.238C150.955 257.508 145.755 266.698 139.245 274.728C134.835 280.178 130.595 285.878 125.485 290.618C118.205 297.358 108.615 299.278 99.1553 301.038C96.6553 301.508 94.1353 301.848 91.9153 302.208C91.9153 307.228 92.0453 312.098 91.8853 316.948C91.5953 325.698 91.1753 334.448 90.6853 343.188C90.5953 344.888 90.1453 346.628 89.5553 348.228C88.5753 350.868 85.6653 352.268 83.1253 351.578C80.2553 350.798 78.2153 348.208 78.7553 345.428C81.2153 332.898 80.4253 320.258 80.2453 307.628C80.1753 302.768 80.1653 302.958 75.2653 303.008C57.9853 303.198 40.8153 302.118 24.4053 296.108C19.6853 294.378 15.0153 292.018 10.9653 289.068C-0.0647087 281.018 -2.60472 269.708 3.56528 257.488C5.29528 254.068 7.63529 250.908 9.96529 247.838C11.4153 245.928 12.1953 244.018 12.6853 241.628C15.6053 227.398 18.8153 213.218 21.9253 199.018C22.1153 198.138 22.2753 197.258 22.4953 196.178C18.8753 194.838 15.3553 193.558 11.8553 192.218C0.77529 187.988 -3.17472 177.198 2.73528 166.888C4.13528 164.448 6.04528 162.258 7.95528 160.158C12.4853 155.188 17.2053 150.388 21.6853 145.378C22.3453 144.648 22.5453 142.948 22.1953 141.978C20.5653 137.488 20.5353 133.098 21.9253 128.528C26.5953 113.148 31.2853 97.7678 35.6653 82.2978C37.8853 74.4878 41.8153 68.6178 50.6353 66.6678C47.5253 64.0178 44.7653 61.7878 42.1453 59.4078C38.8653 56.4178 38.9653 52.7078 42.5053 50.0378C68.0653 30.7478 95.5353 15.0578 126.605 6.42783C158.885 -2.55217 190.975 -2.71217 222.525 9.70783C251.135 20.9678 273.385 40.1078 290.355 65.5378C304.435 86.6478 312.995 109.888 316.275 135.028C317.825 146.878 318.155 158.798 316.615 170.688C316.295 173.148 316.665 174.838 318.895 176.598C326.705 182.758 329.715 193.458 326.645 202.478C323.315 212.268 315.105 218.508 304.695 219.078C303.105 219.168 301.975 219.458 301.065 221.118C284.515 251.328 259.155 271.308 227.555 283.868C221.235 286.378 214.705 288.408 208.195 290.388C205.985 291.058 205.415 291.938 205.595 294.208C206.865 309.518 210.145 324.378 215.295 338.838C215.835 340.358 216.425 341.958 216.455 343.528C216.515 346.138 214.315 348.408 211.795 348.818C208.895 349.288 206.335 347.958 205.395 344.868C202.605 335.728 199.545 326.628 197.495 317.318C192.915 296.548 192.435 275.498 194.605 254.368C195.035 250.208 197.525 247.958 201.095 248.348C204.455 248.718 206.155 251.338 205.905 255.568C205.445 263.378 205.055 271.188 204.595 279.648C241.335 269.028 271.145 250.258 290.695 216.388C260.485 207.338 230.645 198.408 201.565 189.708L201.555 189.718ZM54.7753 55.1778C61.0753 60.5378 67.0153 65.6578 73.0453 70.6578C74.2553 71.6578 75.7453 72.4778 77.2453 72.9278C119.525 85.6378 161.825 98.2878 204.125 110.938C216.065 114.508 220.675 123.248 216.955 135.268C216.155 137.858 215.425 140.478 214.605 143.288C244.945 152.368 274.905 161.338 305.075 170.378C306.565 159.858 306.445 149.798 305.325 139.768C302.195 111.708 292.505 86.0778 275.035 63.8578C241.965 21.7878 198.645 5.38783 145.895 13.8678C127.865 16.7678 110.875 22.9978 94.5353 30.9978C80.7053 37.7678 67.6253 45.8078 54.7753 55.1778ZM123.455 195.658C137.895 195.198 150.535 185.938 154.905 171.808C160.135 154.898 165.125 137.918 170.185 120.948C171.945 115.028 170.715 112.888 164.675 111.078C128.715 100.318 92.7553 89.5678 56.7953 78.8178C51.2153 77.1478 48.8653 78.4178 47.2253 83.9078C42.5553 99.4978 37.9453 115.098 33.1353 130.648C31.9553 134.458 32.4653 137.648 34.9953 140.588C36.3253 142.128 37.5853 143.808 39.1953 145.008C49.0353 152.368 56.2553 161.498 59.4753 173.568C60.2953 176.648 62.6053 178.298 65.7253 179.208C80.6553 183.578 95.5353 188.158 110.465 192.538C114.735 193.788 119.135 194.628 123.475 195.648L123.455 195.658ZM204.085 178.378C205.165 178.758 205.995 179.098 206.855 179.348C236.285 188.168 265.695 197.028 295.155 205.728C298.115 206.598 301.375 206.798 304.495 206.758C309.785 206.688 314.135 203.108 315.535 198.198C316.855 193.598 315.015 188.078 310.785 185.288C308.445 183.748 305.765 182.558 303.085 181.748C276.405 173.688 249.685 165.738 222.985 157.748C219.145 156.598 215.295 155.458 211.295 154.268C208.835 162.498 206.485 170.368 204.085 178.368V178.378ZM143.085 202.268C145.715 203.078 147.845 203.758 149.995 204.378C167.725 209.458 185.285 200.288 190.775 182.708C196.205 165.328 201.265 147.838 206.445 130.388C207.695 126.178 206.215 123.608 201.925 122.298C196.285 120.568 190.645 118.868 184.995 117.178C184.265 116.958 183.495 116.908 182.825 116.798C182.245 119.418 181.875 121.838 181.185 124.168C176.195 140.928 171.145 157.678 166.115 174.428C163.205 184.108 157.815 192.058 149.625 198.028C147.675 199.448 145.565 200.668 143.085 202.268Z"
                        fill="currentColor"
                        className={`transition-all duration-300 ${pathname === '/sports' && searchParams?.get('q') === 'virtual' ? 'fill-[#ED7AF3]' : 'fill-[#544591] group-hover:fill-[#ED7AF3]'}`}
                      />
                    </svg>
                    <span
                      className={`${pathname === '/sports' && searchParams?.get('q') === 'virtual' ? 'text-white' : 'text-[#7D7D7D]'} truncate text-[12px] font-medium transition-colors duration-300 group-hover:text-white`}
                    >
                      {t('virtual_sports') || 'Virtual Sports'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Profile Dropdown for Authenticated Users */}
            {isAuth && (
              <div className="px-4">
                <div className="relative" ref={userMenuRef}>
                  <div className="angled-button angled-button-blue h-[50px] w-full">
                    <div className="angled-button-inner">
                      <button
                        onClick={toggleUserMenu}
                        className="group flex h-full w-full cursor-pointer items-center gap-0 border-none bg-transparent px-0 py-0 text-base font-medium text-white transition-all"
                      >
                        <div className="template14-profile-avatar-clipped">
                          <span className="template14-profile-avatar-initial">
                            {userInitial}
                          </span>
                        </div>
                        <span className="flex-1 truncate px-4 text-left">
                          {userDisplayName}
                        </span>
                        <div className="px-4">
                          <Image
                            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/drop-pink-7.svg"
                            alt="Open profile menu"
                            width={15}
                            height={15}
                            className={`h-3 w-3 brightness-100 filter transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </button>
                    </div>
                  </div>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 left-0 z-[1000] mt-2">
                      <div className="border border-[#7351ff] bg-[#0d1028] shadow-xl">
                        <div className="overflow-hidden rounded-[5px] p-3">
                          <Link
                            href="/dashboard/profile"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              closeMobileMenu();
                            }}
                            className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                            style={{
                              borderColor: '#7351FF',
                            }}
                          >
                            <span className="flex items-center gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path d="M10.4724 8.47335C11.1259 7.95912 11.603 7.25396 11.8372 6.45597C12.0713 5.65799 12.051 4.80686 11.7789 4.02099C11.5068 3.23513 10.9965 2.55361 10.3191 2.07125C9.64161 1.58889 8.83066 1.32968 7.99902 1.32968C7.16739 1.32968 6.35643 1.58889 5.67897 2.07125C5.00152 2.55361 4.49125 3.23513 4.21916 4.02099C3.94707 4.80686 3.9267 5.65799 4.16086 6.45597C4.39503 7.25396 4.87209 7.95912 5.52569 8.47335C4.40574 8.92204 3.42855 9.66625 2.69828 10.6266C1.96802 11.587 1.51206 12.7276 1.37902 13.9267C1.36939 14.0142 1.3771 14.1028 1.4017 14.1874C1.42631 14.272 1.46733 14.3508 1.52243 14.4196C1.6337 14.5583 1.79554 14.6472 1.97235 14.6667C2.14917 14.6861 2.32646 14.6345 2.46524 14.5233C2.60401 14.412 2.69291 14.2502 2.71235 14.0733C2.85874 12.7701 3.48015 11.5666 4.45783 10.6925C5.43552 9.81853 6.70095 9.33537 8.01235 9.33537C9.32376 9.33537 10.5892 9.81853 11.5669 10.6925C12.5446 11.5666 13.166 12.7701 13.3124 14.0733C13.3305 14.2372 13.4086 14.3885 13.5318 14.498C13.6549 14.6076 13.8142 14.6677 13.979 14.6667H14.0524C14.2271 14.6466 14.3868 14.5582 14.4967 14.4208C14.6066 14.2835 14.6578 14.1083 14.639 13.9333C14.5053 12.7308 14.0469 11.5873 13.3129 10.6255C12.5789 9.66363 11.597 8.91967 10.4724 8.47335ZM7.99902 8.00001C7.4716 8.00001 6.95603 7.84362 6.5175 7.5506C6.07897 7.25758 5.73718 6.8411 5.53534 6.35384C5.33351 5.86657 5.2807 5.33039 5.38359 4.81311C5.48649 4.29582 5.74046 3.82067 6.1134 3.44773C6.48634 3.07479 6.9615 2.82081 7.47878 2.71792C7.99606 2.61502 8.53224 2.66783 9.01951 2.86967C9.50678 3.0715 9.92325 3.41329 10.2163 3.85182C10.5093 4.29036 10.6657 4.80593 10.6657 5.33335C10.6657 6.04059 10.3847 6.71887 9.88464 7.21896C9.38454 7.71906 8.70626 8.00001 7.99902 8.00001Z" />
                              </svg>
                              <span className="text-[12px] text-white transition-colors group-hover:text-[#ed7af3]">
                                {t('profile')}
                              </span>
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="6"
                              height="13"
                              viewBox="0 0 6 13"
                              fill="none"
                              className="text-white transition-colors group-hover:!text-[#ed7af3]"
                            >
                              <path
                                d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                stroke="currentColor"
                                strokeWidth="0.941399"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Link>
                          <Link
                            href="/dashboard/referrals"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              closeMobileMenu();
                            }}
                            className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                            style={{
                              borderColor: '#7351FF',
                            }}
                          >
                            <span className="flex items-center gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path
                                  d="M2 14V12.6667C2 11.9594 2.28095 11.2811 2.78105 10.781C3.28115 10.281 3.95942 10 4.66667 10H7.33333C7.97333 10 8.56 10.2253 9.02 10.6007M10.6667 2.08667C11.2403 2.23353 11.7487 2.56713 12.1118 3.03487C12.4748 3.50261 12.6719 4.07789 12.6719 4.67C12.6719 5.26211 12.4748 5.83739 12.1118 6.30513C11.7487 6.77287 11.2403 7.10647 10.6667 7.25333M10.6667 12.6667H14.6667M12.6667 10.6667V14.6667M3.33333 4.66667C3.33333 5.37391 3.61428 6.05219 4.11438 6.55228C4.61448 7.05238 5.29276 7.33333 6 7.33333C6.70724 7.33333 7.38552 7.05238 7.88562 6.55228C8.38571 6.05219 8.66667 5.37391 8.66667 4.66667C8.66667 3.95942 8.38571 3.28115 7.88562 2.78105C7.38552 2.28095 6.70724 2 6 2C5.29276 2 4.61448 2.28095 4.11438 2.78105C3.61428 3.28115 3.33333 3.95942 3.33333 4.66667Z"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[12px] text-white transition-colors group-hover:text-[#ed7af3]">
                                {t('referrals')}
                              </span>
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="6"
                              height="13"
                              viewBox="0 0 6 13"
                              fill="none"
                              className="text-white/50 transition-colors group-hover:!text-[#7351FF]"
                            >
                              <path
                                d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                stroke="currentColor"
                                strokeWidth="0.941399"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Link>
                          <Link
                            href="/dashboard/betting-management"
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              closeMobileMenu();
                            }}
                            className="group mb-2 flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                            style={{
                              borderColor: '#7351FF',
                            }}
                          >
                            <span className="flex items-center gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="currentColor"
                                className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path d="M8 2.5C11.0375 2.5 13.5 4.9625 13.5 8.00001C13.5 11.0375 11.0375 13.5 8 13.5C4.9625 13.5 2.5 11.0375 2.5 8.00001C2.5 7.84534 2.50633 7.69234 2.519 7.54101C2.52438 7.47554 2.51682 7.40966 2.49674 7.34712C2.47667 7.28457 2.44447 7.2266 2.40198 7.1765C2.3595 7.12641 2.30757 7.08517 2.24915 7.05514C2.19073 7.02512 2.12696 7.00689 2.0615 7.0015C1.99604 6.99612 1.93015 7.00368 1.86761 7.02376C1.80507 7.04384 1.7471 7.07604 1.697 7.11852C1.6469 7.161 1.60566 7.21294 1.57564 7.27136C1.54561 7.32978 1.52738 7.39354 1.522 7.459C1.50733 7.63767 1.5 7.81801 1.5 8.00001C1.5 11.59 4.41 14.5 8 14.5C11.59 14.5 14.5 11.59 14.5 8.00001C14.5 4.41 11.59 1.5 8 1.5C6.32225 1.49803 4.70912 2.14687 3.5 3.31V2C3.5 1.8674 3.44732 1.74022 3.35355 1.64645C3.25979 1.55268 3.13261 1.5 3 1.5C2.86739 1.5 2.74021 1.55268 2.64645 1.64645C2.55268 1.74022 2.5 1.8674 2.5 2V4.50001C2.5 4.63261 2.55268 4.75979 2.64645 4.85356C2.74021 4.94733 2.86739 5.00001 3 5.00001H5.5C5.63261 5.00001 5.75979 4.94733 5.85355 4.85356C5.94732 4.75979 6 4.63261 6 4.50001C6 4.3674 5.94732 4.24022 5.85355 4.14645C5.75979 4.05268 5.63261 4 5.5 4H4.225C5.21 3.07 6.5385 2.5 8 2.5ZM8.5 4.50001C8.5 4.3674 8.44732 4.24022 8.35355 4.14645C8.25979 4.05268 8.13261 4 8 4C7.86739 4 7.74021 4.05268 7.64645 4.14645C7.55268 4.24022 7.5 4.3674 7.5 4.50001V8.00001C7.5 8.13261 7.55268 8.25979 7.64645 8.35356C7.74021 8.44733 7.86739 8.50001 8 8.50001H10.5C10.6326 8.50001 10.7598 8.44733 10.8536 8.35356C10.9473 8.25979 11 8.13261 11 8.00001C11 7.8674 10.9473 7.74022 10.8536 7.64645C10.7598 7.55268 10.6326 7.50001 10.5 7.50001H8.5V4.50001Z" />
                              </svg>
                              <span className="text-[12px] text-white capitalize transition-colors group-hover:text-[#ed7af3]">
                                {t('betting') || 'Bet History'}
                              </span>
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="6"
                              height="13"
                              viewBox="0 0 6 13"
                              fill="none"
                              className="text-white transition-colors group-hover:!text-[#ed7af3]"
                            >
                              <path
                                d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                stroke="currentColor"
                                strokeWidth="0.941399"
                                strokeLinecap="round"
                              />
                            </svg>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              handleLogout();
                              setIsUserMenuOpen(false);
                            }}
                            className="group flex w-full items-center justify-between rounded-[3px] border px-3 py-3 transition-all duration-200"
                            style={{
                              borderColor: '#7351FF',
                            }}
                          >
                            <span className="flex items-center gap-3">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="15"
                                height="15"
                                viewBox="0 0 15 15"
                                fill="none"
                                className="h-4 w-4 text-white transition-colors group-hover:!text-[#ed7af3]"
                              >
                                <path
                                  d="M11.5 2.10001C10.2936 1.06524 8.75605 0.497528 7.16667 0.500008C3.48467 0.500008 0.5 3.48468 0.5 7.16668C0.5 10.8487 3.48467 13.8333 7.16667 13.8333C8.75605 13.8358 10.2936 13.2681 11.5 12.2333"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M11.168 4.5C11.168 4.5 13.8346 6.464 13.8346 7.16667C13.8346 7.86933 11.168 9.83333 11.168 9.83333M13.5013 7.16667H5.16797"
                                  stroke="currentColor"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className="text-[12px] text-white transition-colors group-hover:text-[#ed7af3]">
                                {t('logout')}
                              </span>
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="6"
                              height="13"
                              viewBox="0 0 6 13"
                              fill="none"
                              className="text-white transition-colors group-hover:!text-[#ed7af3]"
                            >
                              <path
                                d="M0.46875 0.470703L4.7858 4.78776C5.52108 5.52304 5.52108 6.71516 4.7858 7.45044L0.46875 11.7675"
                                stroke="currentColor"
                                strokeWidth="0.941399"
                                strokeLinecap="round"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Footer section: Social buttons + Logout fixed at bottom */}
            <div className="mt-auto space-y-3 p-4">
              {/* Mobile gaming promotion */}
              <div className="relative mb-8">
                {/* Text overlay */}
                <div className="absolute top-[20%] left-[5%] z-10">
                  <h3 className="font-bring-race text-base leading-tight text-white uppercase">
                    Get the <br /> app
                  </h3>
                </div>

                {/* APK download link - banner image */}
                <a
                  href="https://thestaticfile.com/uploads/WDBOS188.apk"
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

              {/* Logout Button */}
              {isAuth && (
                <div className="mt-4">
                  <button
                    onClick={handleLogout}
                    className="group flex w-full cursor-pointer items-center justify-between px-4 py-3 text-base font-semibold text-white transition-colors duration-200"
                    style={{
                      borderRadius: '3px',
                      border: '1px solid #3E1D88',
                      background: 'rgba(51, 19, 105, 0.70)',
                      boxShadow: '4px 5px 16px 0 rgba(0, 0, 0, 0.25) inset',
                    }}
                  >
                    <span className="text-[#544591]">{t('logout')}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="8"
                      viewBox="0 0 16 8"
                      fill="none"
                      className="h-4 w-4 transition-all duration-200 group-hover:translate-x-0.5"
                    >
                      <path
                        d="M15.3536 4.03556C15.5488 3.8403 15.5488 3.52371 15.3536 3.32845L12.1716 0.146472C11.9763 -0.0487903 11.6597 -0.0487903 11.4645 0.146472C11.2692 0.341734 11.2692 0.658317 11.4645 0.853579L14.2929 3.68201L11.4645 6.51043C11.2692 6.7057 11.2692 7.02228 11.4645 7.21754C11.6597 7.4128 11.9763 7.4128 12.1716 7.21754L15.3536 4.03556ZM0 3.68201L4.37114e-08 4.18201L15 4.18201L15 3.68201L15 3.18201L-4.37114e-08 3.18201L0 3.68201Z"
                        fill="white"
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
