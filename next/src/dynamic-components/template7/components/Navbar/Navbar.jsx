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

import { LanguageSwitcher } from '@/dynamic-components/template7/components/LanguageSwitcher/LanguageSwitcher';
import LazyImage from '@/dynamic-components/template7/components/LazyImage/LazyImage';
import WalletButton from '@/dynamic-components/template7/components/WalletButton/WalletButton';
import WalletDropdown from '@/dynamic-components/template7/components/WalletDropdown/WalletDropdown';
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
      if (href === '/' || href === '/announcements') {
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
                  width={100}
                  height={40}
                  priority
                  className="h-auto w-auto"
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
                className={`group template7-menu-item-angled ${pathname === '/' ? 'template7-menu-item-angled-active' : ''}`}
              >
                <div className="template7-menu-item-angled-inner">
                  <div className="template7-menu-item-content">
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
                className={`group template7-menu-item-angled ${pathname === '/dashboard/withdrawal' ? 'template7-menu-item-angled-active' : ''}`}
              >
                <div className="template7-menu-item-angled-inner">
                  <div className="template7-menu-item-content">
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
                className={`group template7-menu-item-angled ${pathname === '/dashboard/deposit' ? 'template7-menu-item-angled-active' : ''}`}
              >
                <div className="template7-menu-item-angled-inner">
                  <div className="template7-menu-item-content">
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
                className={`group template7-menu-item-angled ${pathname === '/dashboard/coupons' ? 'template7-menu-item-angled-active' : ''}`}
              >
                <div className="template7-menu-item-angled-inner">
                  <div className="template7-menu-item-content">
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
                className={`group template7-menu-item-angled ${pathname === '/dashboard/customer-inquiry' ? 'template7-menu-item-angled-active' : ''}`}
              >
                <div className="template7-menu-item-angled-inner">
                  <div className="template7-menu-item-content">
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
                className={`group template7-menu-item-angled ${pathname === '/dashboard/note' ? 'template7-menu-item-angled-active' : ''}`}
              >
                <div className="template7-menu-item-angled-inner">
                  <div className="template7-menu-item-content">
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
                className={`group template7-menu-item-angled ${pathname === '/announcements' ? 'template7-menu-item-angled-active' : ''}`}
              >
                <div className="template7-menu-item-angled-inner">
                  <div className="template7-menu-item-content">
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
                href="/faq"
                onClick={(e) => handleMobileNavigation(e, '/faq')}
                className={`group template7-menu-item-angled ${pathname === '/faq' ? 'template7-menu-item-angled-active' : ''}`}
              >
                <div className="template7-menu-item-angled-inner">
                  <div className="template7-menu-item-content">
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
                        <div className="template7-profile-avatar-clipped">
                          <span className="template7-profile-avatar-initial">
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
                  href="https://thestaticfile.com/uploads/user07.apk"
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
