'use client';
import { joiResolver } from '@hookform/resolvers/joi';
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
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import SimpleImageCaptcha, { generateCaptchaCode } from '@/components/SimpleImageCaptcha/SimpleImageCaptcha';
import { LanguageSwitcher } from '@/dynamic-components/template21/components/LanguageSwitcher/LanguageSwitcher';
import LazyImage from '@/dynamic-components/template21/components/LazyImage/LazyImage';
import WalletDropdown from '@/dynamic-components/template21/components/WalletDropdown/WalletDropdown';
import { formatDateTimeWithSeconds } from '@/helpers/dateTime';
import { formatCurrency } from '@/helpers/formatting';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useMarquee } from '@/hooks/useMarquee';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { usePopupData } from '@/hooks/usePopupData';
import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/providers/LanguageProvider';
import { fetchUserProfile, loginUser, logoutUser } from '@/slices/auth/authAction';
import { openModal } from '@/slices/common/commonSlice';
import { Input } from '@/ui/Input';
import { loginSchema } from '@/validations/login.validation';

const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/';

const sidebarCategories = [
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
    key: 'promotions',
    icon: 'promotions-17.svg',
    label: 'promotions',
    display: 'Promotions',
    href: '/promotions',
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
    href: '/slots?category=arcade',
  },
  {
    key: 'table',
    icon: 'interactive-17.svg',
    label: 'table_games',
    display: 'Table Games',
    href: '/live-casino?q=table',
  },
];

// Simple selectors
const selectAuth = (state) => state.auth;

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isBalanceRefreshing, setIsBalanceRefreshing] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [captchaCode, setCaptchaCode] = useState(() => generateCaptchaCode());
  const [captchaInput, setCaptchaInput] = useState('');
  const [howToPlayReplayKey, setHowToPlayReplayKey] = useState(0);
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { isMobilePlatform } = useMobilePlatform();
  const { currentLocale } = useLanguage();
  const { openAuthModal } = useAuthModal();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { headerLogo } = useTemplate();

  // Simple selectors
  const auth = useSelector(selectAuth);
  const { loginLoader } = useSelector((state) => state.auth);

  const { isAuth, user } = auth;
  const { hasActivePopups } = usePopupData();

  // Inline login form for Template17
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: joiResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
    mode: 'onChange',
  });

  const handleInlineLogin = useCallback(
    async (data) => {
      try {
        const result = await dispatch(loginUser(data)).unwrap();
        if (result.data?.user && result.data?.auth) {
          reset();
          setCaptchaInput('');
          setCaptchaCode(generateCaptchaCode());
          router.push('/dashboard/home');
        }
      } catch (error) {
        console.error('Login failed:', error);
        setCaptchaInput('');
        setCaptchaCode(generateCaptchaCode());
        if (error?.message) {
          toast.error(t(error.message) || error.message);
        }
      }
    },
    [dispatch, reset, t, router],
  );

  // Handle validation errors and show in toast
  const handleValidationErrors = useCallback(
    (formErrors) => {
      const errorKeys = Object.keys(formErrors);
      if (errorKeys.length > 0) {
        // Show first validation error in toast
        const firstError = errorKeys[0];
        const errorMessage = formErrors[firstError]?.message;
        if (errorMessage) {
          toast.error(t(errorMessage) || errorMessage);
        }
      }
    },
    [t],
  );

  const handleLoginSubmit = useCallback(
    async (data, formErrors) => {
      if (formErrors) {
        handleValidationErrors(formErrors);
        return;
      }
      const userAnswer = String(captchaInput).trim().toUpperCase();
      if (userAnswer !== captchaCode) {
        toast.error(t('invalid_captcha') || 'Invalid captcha. Please try again.');
        setCaptchaInput('');
        setCaptchaCode(generateCaptchaCode());
        return;
      }
      setCaptchaInput('');
      setCaptchaCode(generateCaptchaCode());
      await handleInlineLogin(data);
    },
    [captchaCode, captchaInput, handleInlineLogin, handleValidationErrors, t],
  );

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
    router.push('/register');
    closeMobileMenu();
  }, [router, closeMobileMenu]);


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
    router.push('/dashboard/profile');
    setIsUserMenuOpen(false);
    closeMobileMenu();
  }, [router, closeMobileMenu]);

  const handleOpenBettingTab = useCallback(() => {
    openAuthModal({
      modal: 'customerService',
      props: { defaultTab: 'betting' },
    });
  }, [openAuthModal]);

  const handleOpenBettingHistory = useCallback(() => {
    router.push('/dashboard/betting-management');
    setIsUserMenuOpen(false);
    closeMobileMenu();
  }, [router, closeMobileMenu]);


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

  const userPoints = useMemo(() => {
    return user?.wallet?.points || 0;
  }, [user?.wallet?.points]);

  const holdingMoney = useMemo(() => {
    return user?.wallet?.holding_money || 0;
  }, [user?.wallet?.holding_money]);

  const sidebarApkSrc = useMemo(() => {
    if (currentLocale === 'id') {
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sidebar-apk-3.png';
    }
    if (currentLocale === 'ko') {
      return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sidebar-apk-3.png';
    }
    return 'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sidebar-apk-3.png';
  }, [currentLocale]);

  // Static announcements based on language
  const staticAnnouncements = {
    en: 'Welcome to casino and slot gaming – Enjoy smooth gameplay, instant crypto deposits and withdrawals, and 24/7 support for an unmatched online casino experience.',
    id: 'Selamat datang di kasino dan permainan slot – Nikmati permainan yang lancar, deposit dan penarikan kripto instan, serta dukungan 24/7 untuk pengalaman kasino online yang tak tertandingi.',
    ko: '카지노와 슬롯 게임에 오신 것을 환영합니다 – 부드러운 게임 플레이, 즉시 암호화폐 입출금, 그리고 24시간 연중무휴 지원으로 비교할 수 없는 온라인 카지노 경험을 즐기세요.',
    jp: 'カジノとスロットゲームへようこそ – スムーズなゲームプレイ、即時の暗号通貨の入出金、24時間年中無休のサポートで、比類のないオンラインカジノ体験をお楽しみください。',
    my: 'Selamat datang ke permainan kasino dan slot – Nikmati permainan lancar, deposit dan pengeluaran kripto segera, serta sokongan 24/7 untuk pengalaman kasino dalam talian yang tiada tandingan.',
    th: 'ยินดีต้อนรับสู่คาสิโนและเกมสล็อต – เพลิดเพลินกับการเล่นเกมที่ลื่นไหล ฝากและถอนคริปโตแบบทันที และการสนับสนุนตลอด 24/7 เพื่อประสบการณ์คาสิโนออนไลน์ที่ไม่มีใครเทียบได้',
    tw: '歡迎來到賭場和老虎機遊戲 – 享受流暢的遊戲玩法、即時加密貨幣存款和提款，以及 24/7 全天候支援，獲得無與倫比的線上賭場體驗。',
    vn: 'Chào mừng đến với casino và trò chơi slot – Tận hưởng lối chơi mượt mà, gửi và rút tiền crypto tức thì, cùng hỗ trợ 24/7 cho trải nghiệm casino trực tuyến vô song.',
  };

  const announcementText =
    staticAnnouncements[currentLocale] || staticAnnouncements.en;

  // Use custom marquee hook for desktop
  const desktopMarquee = useMarquee({
    speed: 25, // pixels per second
    pauseOnHover: true,
    direction: 'left',
  });

  // Inline styles for the marquee container
  const marqueeContainerStyle = {
    display: 'flex',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  };

  const marqueeContentStyle = {
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    wordBreak: 'keep-all',
    overflowWrap: 'normal',
    paddingRight: '50px',
    flexShrink: 0,
    minWidth: 'max-content',
    transform: `translateX(${desktopMarquee.position}px)`,
    transition: desktopMarquee.isPaused ? 'none' : 'none',
  };

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

  // Navigate to register page with referral code from query param
  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref && pathname !== '/register') {
      router.push(`/register?ref=${ref}`);
    }
  }, [searchParams, router, pathname]);

  // Update time every second
  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Open popup modal when there are active popups (skip if referral link is present)
  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (hasActivePopups && !ref) {
      dispatch(openModal('popup'));
    }
  }, [hasActivePopups, searchParams, dispatch]);



  const handleRefreshBalance = useCallback(
    async (e) => {
      e?.stopPropagation?.();
      if (isBalanceRefreshing) return;

      try {
        setIsBalanceRefreshing(true);
        await dispatch(fetchUserProfile()).unwrap();
      } catch (error) {
        console.error('Failed to refresh balance:', error);
      } finally {
        setIsBalanceRefreshing(false);
      }
    },
    [dispatch, isBalanceRefreshing],
  );

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`py-3 md:py-1 relative z-[100] border-b-2 border-[#a08540] bg-[#402f04] md:bg-[rgb(212,187,130)] ${
          isMobilePlatform ? 'pt-safe-top' : ''
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="relative flex items-center justify-between gap-4">
            {/* Left spacer - mobile only, for logo centering */}
            <div className="min-w-0 flex-1 md:hidden" aria-hidden />
            {/* Logo - Mobile Only, centered */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center md:static md:left-auto md:top-auto md:translate-x-0 md:translate-y-0 md:hidden">
              <Link href="/" className="inline-flex flex-shrink-0 items-center">
                <Image
                  src={headerLogo}
                  alt="Logo"
                  width={120}
                  height={28}
                  priority
                />
              </Link>
            </div>
            {/* Time and Announcement Section - Desktop Only */}
            <div className="hidden items-center gap-3 md:flex md:min-w-0 md:flex-1">
              {/* Time Display */}
              <div className="flex items-center flex-shrink-0">
                <span className="text-[12px] font-medium text-black whitespace-nowrap">
                  {formatDateTimeWithSeconds(now)}
                </span>
              </div>

              {/* Announcement Icon */}
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/announce-icon-3.svg"
                alt={t('announcement')}
                width={16}
                height={16}
                className="flex-shrink-0 brightness-0"
              />

              {/* Announcement Marquee */}
              <div
                className="relative flex-1 overflow-hidden min-w-0 max-w-full"
                ref={desktopMarquee.containerRef}
                onMouseEnter={desktopMarquee.handleMouseEnter}
                onMouseLeave={desktopMarquee.handleMouseLeave}
              >
                <div style={marqueeContainerStyle}>
                  <div
                    ref={desktopMarquee.contentRef}
                    style={marqueeContentStyle}
                    className="text-[12px] text-black"
                  >
                    {announcementText}
                  </div>
                  {desktopMarquee.needsDuplication && (
                    <div
                      style={marqueeContentStyle}
                      aria-hidden="true"
                      className="text-[12px] text-black"
                    >
                      {announcementText}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden items-center gap-1 md:flex md:flex-shrink-0">
              {/* Language Switcher */}
              <div className="flex h-[30px] items-center">
                <LanguageSwitcher variant="dropdown" appearance="outline" />
              </div>

              {/* How to Play icon - Template21 */}
              <div className="relative group overflow-visible">
                <button
                  type="button"
                  onClick={() => router.push('/how-to-play')}
                  onMouseEnter={() => setHowToPlayReplayKey((k) => k + 1)}
                  className="flex h-[36px] w-[36px] flex-shrink-0 items-center justify-center rounded-[3px] text-black transition-colors hover:bg-[rgb(212,187,130)]/10 focus:outline-none focus:ring-0"
                  aria-label={t('how_to_play_title')}
                >
                  <svg
                    key={howToPlayReplayKey}
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="h-6 w-6"
                  >
                    <path strokeDasharray={60} d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        dur="0.6s"
                        values="60;0"
                      />
                    </path>
                    <path
                      strokeDasharray={18}
                      strokeDashoffset={18}
                      d="M9 10c0 -1.66 1.34 -3 3 -3c1.66 0 3 1.34 3 3c0 0.98 -0.47 1.85 -1.2 2.4c-0.73 0.55 -1.3 0.6 -1.8 1.6"
                    >
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        begin="0.7s"
                        dur="0.3s"
                        to="0"
                      />
                    </path>
                    <path strokeDasharray={4} strokeDashoffset={4} d="M12 17v0.01">
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        begin="0.7s"
                        dur="0.2s"
                        to="0"
                      />
                    </path>
                  </svg>
                </button>
                <span
                  className="pointer-events-none absolute left-1/2 top-full z-[1001] mt-2 -translate-x-1/2 whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium text-[#1a1a1a] bg-white shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  role="tooltip"
                >
                  {t('how_to_play_title')}
                </span>
              </div>

              {/* Inline Login Form - Template17 Only */}
              {!isAuth ? (
                <form
                  onSubmit={handleSubmit(
                    (data) => handleLoginSubmit(data),
                    (formErrors) => handleLoginSubmit(undefined, formErrors),
                  )}
                  className="flex items-center gap-1"
                >
                  {/* Username/Email Input */}
                  <div className="relative">
                    <Controller
                      name="username"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          autoComplete="username"
                          placeholder={t('username') || 'Username'}
                          className="h-[30px] w-[100px] rounded-[3px] border border-transparent bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none"
                        />
                      )}
                    />
                  </div>

                  {/* Password Input */}
                  <div className="relative">
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="password"
                          autoComplete="current-password"
                          placeholder={t('password') || 'Password'}
                          className="h-[30px] w-[100px] rounded-[3px] border border-transparent bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none"
                        />
                      )}
                    />
                  </div>

                  {/* Image captcha: 2 letters + noisy bg */}
                  <SimpleImageCaptcha
                    code={captchaCode}
                    value={captchaInput}
                    onChange={setCaptchaInput}
                    width={60}
                    height={30}
                    inputWidth={60}
                    imageClassName="rounded-[3px] border border-transparent"
                    inputClassName="h-[30px] shrink-0 rounded-[3px] border border-transparent bg-white px-1 text-left text-sm text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none"
                  />

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loginLoader}
                    className="group flex h-[30px] w-auto min-w-0 cursor-pointer items-center justify-center rounded-[3px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-3 text-sm font-bold text-white shadow-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loginLoader ? t('processing') || 'Processing...' : t('login') || 'Login'}
                  </button>

                  {/* Register Button */}
                  <button
                    type="button"
                    onClick={handleOpenRegisterModal}
                    className="group flex h-[30px] w-auto min-w-0 cursor-pointer items-center justify-center gap-3 rounded-[3px] bg-[linear-gradient(#74cae3,#5bc0de_60%,#4ab9db)] px-3 text-sm font-bold text-white shadow-none transition-all duration-200"
                    data-hover="Register"
                  >
                    <span>{t('register')}</span>
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-4">
                  {/* <WalletDropdown variant="desktop" /> */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={toggleUserMenu}
                      ref={userButtonRef}
                      className="group flex h-[30px] cursor-pointer items-center gap-2 rounded-[3px] border border-[#ec4d49]/60 bg-transparent px-2 py-1.5 text-sm font-medium text-white transition-all hover:shadow-[0_0_10px_rgba(236,77,73,0.35)]"
                    >
                      {/* User Icon - Circular with person silhouette */}
                      <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#ec4d49]">
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                        >
                          <circle cx="12" cy="8" r="4" fill="#FFFFFF" />
                          <path
                            d="M6 20C6 16 9 14 12 14C15 14 18 16 18 20"
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      {/* Two lines of text */}
                      <div className="flex min-w-0 flex-1 flex-col items-start justify-center leading-tight">
                        <span className="max-w-[100px] truncate text-xs font-medium text-white">
                          {userDisplayName}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-white">
                            {isBalanceRefreshing
                              ? '....'
                              : formatCurrency(holdingMoney)}
                          </span>
                          {/* Refresh icon */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isBalanceRefreshing) {
                                handleRefreshBalance();
                              }
                            }}
                            className={`flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer ${
                              isBalanceRefreshing
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                            }`}
                          >
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="text-[#ec4d49]"
                            >
                              <path
                                d="M1 4V10H7"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M23 20V14H17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                      {/* Dropdown arrow */}
                      <Image
                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/drop-3.svg"
                        alt="Open profile menu"
                        width={12}
                        height={12}
                        className={`h-3 w-3 flex-shrink-0 transition-transform [filter:brightness(0)_invert(1)] ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isUserMenuOpen && (
                      <div
                        className="absolute right-0 z-[1000] mt-2"
                        style={{ width: userButtonWidth || undefined }}
                      >
                        <div className="rounded-[0px] bg-[#ec4d49] p-[1px] shadow-xl">
                          <div className="rounded-[0px] bg-[#121212] p-[10px]">
                            <div className="rounded-[8px] bg-[#ec4d49] p-[1px]">
                              <div className="overflow-hidden rounded-[7px] bg-[#121212]">
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
                                  className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#ec4d49]/30"
                                >
                                  <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-white">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-1.svg"
                                      alt={t('profile')}
                                      width={20}
                                      height={20}
                                      className="flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                                    />
                                    <span className="truncate text-[12px] whitespace-nowrap">
                                      {t('profile')}
                                    </span>
                                  </span>
                                  <span className="pl-2 text-[12px] text-white/80 group-hover:text-white">
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
                                    handleOpenBettingHistory();
                                  }}
                                  className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#ec4d49]/30"
                                >
                                  <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-white">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-2.svg"
                                      alt={t('betting')}
                                      width={20}
                                      height={20}
                                      className="flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                                    />
                                    <span className="truncate text-[12px] whitespace-nowrap capitalize">
                                      {t('betting') || 'Bet History'}
                                    </span>
                                  </span>
                                  <span className="pl-2 text-[12px] text-white/80 group-hover:text-white">
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
                                  className="group flex w-full items-center justify-between px-3 py-2 text-white transition-all hover:bg-[#ec4d49]/30"
                                >
                                  <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-white">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-3.svg"
                                      alt={t('logout')}
                                      width={20}
                                      height={20}
                                      className="flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                                    />
                                    <span className="truncate text-[12px] whitespace-nowrap">
                                      {t('logout')}
                                    </span>
                                  </span>
                                  <span className="pl-2 text-[12px] text-white/80 group-hover:text-white">
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

            {/* Mobile: How to Play icon, Menu button */}
            <div className="relative z-[1000] flex min-w-0 flex-1 items-center justify-end gap-3 md:hidden">
              <div className="relative group overflow-visible">
                <button
                  type="button"
                  onClick={() => router.push('/how-to-play')}
                  onMouseEnter={() => setHowToPlayReplayKey((k) => k + 1)}
                  className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[3px] text-white md:text-black transition-colors hover:bg-[rgb(212,187,130)]/10 focus:outline-none focus:ring-0"
                  aria-label={t('how_to_play_title')}
                >
                  <svg
                    key={howToPlayReplayKey}
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="h-4 w-4"
                  >
                    <path strokeDasharray={60} d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
                      <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="60;0" />
                    </path>
                    <path strokeDasharray={18} strokeDashoffset={18} d="M9 10c0 -1.66 1.34 -3 3 -3c1.66 0 3 1.34 3 3c0 0.98 -0.47 1.85 -1.2 2.4c-0.73 0.55 -1.3 0.6 -1.8 1.6">
                      <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.3s" to="0" />
                    </path>
                    <path strokeDasharray={4} strokeDashoffset={4} d="M12 17v0.01">
                      <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" to="0" />
                    </path>
                  </svg>
                </button>
                <span
                  className="pointer-events-none absolute left-1/2 top-full z-[1001] mt-2 -translate-x-1/2 whitespace-nowrap rounded px-3 py-1.5 text-sm font-medium text-[#1a1a1a] bg-white shadow-lg opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  role="tooltip"
                >
                  {t('how_to_play_title')}
                </span>
              </div>

              <button
                onClick={toggleMobileMenu}
                className="flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[3px] text-white transition-opacity duration-200 hover:opacity-90"
                aria-label="Open menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  className="h-4 w-4"
                  fill="currentColor"
                >
                  <g fill="currentColor">
                    <circle cx="5" cy="5" r="3"/>
                    <path d="M9.47 14H.53a.5.5 0 0 1-.5-.55a5 5 0 0 1 9.94 0a.5.5 0 0 1-.5.55"/>
                    <rect width="7" height="2" x="9" y="3" rx="1" ry="1"/>
                    <rect width="7" height="2" x="9" y="7" rx="1" ry="1"/>
                    <rect width="5" height="2" x="11" y="11" rx="1" ry="1"/>
                  </g>
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
          className={`absolute top-0 right-0 h-full w-80 border border-[#FFFFFF1A] bg-[#402f04] shadow-xl ${
            isMobilePlatform ? 'pt-safe-top' : ''
          }`}
        >
          <div
            className="flex h-full flex-col overflow-y-auto"
            style={{ paddingBottom: isMobilePlatform ? '48px' : undefined }}
          >
            {/* Header with Download APK Button, Language Switcher, and Close Button */}
            <div className="border-b border-[#FFFFFF1A] p-4">
              <div className="flex items-center justify-between gap-3">
                {/* Download APK Button and Language Switcher - Left Side */}
                <div className="flex items-center gap-2">
                  <a
                    href="https://thestaticfile.com/uploads/user14.apk"
                    download
                    className="flex h-[30px] cursor-pointer items-center justify-center rounded-[20px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-4 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:opacity-90"
                  >
                    {t('download_apk') || 'Download APK'}
                  </a>
                  <div className="flex h-[30px] items-center">
                    <LanguageSwitcher variant="dropdown" appearance="outline" />
                  </div>
                </div>
                {/* Close Button - Right Side */}
                <button
                  onClick={toggleMobileMenu}
                  className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] text-white shadow-none transition-colors hover:opacity-90"
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

            {/* Inline Login Form - Mobile - Template17 Only */}
            {!isAuth && (
              <div className="px-4 py-4">
                <form
                  onSubmit={handleSubmit(
                    (data) => handleLoginSubmit(data),
                    (formErrors) => handleLoginSubmit(undefined, formErrors),
                  )}
                  className="space-y-3"
                >
                  {/* Username/Email Input */}
                  <div>
                    <Controller
                      name="username"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          autoComplete="username"
                          placeholder={t('username') || 'Username'}
                          className="h-[30px] w-full rounded-[3px] border border-transparent bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none"
                        />
                      )}
                    />
                  </div>

                  {/* Password Input */}
                  <div>
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="password"
                          autoComplete="current-password"
                          placeholder={t('password') || 'Password'}
                          className="h-[30px] w-full rounded-[3px] border border-transparent bg-white px-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none"
                        />
                      )}
                    />
                  </div>

                  {/* Image captcha: 2 letters + noisy bg */}
                  <div className="flex items-center gap-2">
                    <SimpleImageCaptcha
                      code={captchaCode}
                      value={captchaInput}
                      onChange={setCaptchaInput}
                      width={60}
                      height={30}
                      inputWidth={60}
                      className="flex-1 min-w-0"
                      imageClassName="rounded-[3px] border border-transparent"
                      inputClassName="h-[30px] shrink-0 rounded-[3px] border border-transparent bg-white px-2 text-left text-sm text-gray-900 placeholder:text-gray-500 focus:border-transparent focus:outline-none"
                    />
                  </div>

                  {/* Login Button */}
                  <button
                    type="submit"
                    disabled={loginLoader}
                    className="flex h-[30px] w-full cursor-pointer items-center justify-center rounded-[3px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-3 text-sm font-bold text-white shadow-none transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loginLoader ? t('processing') : t('login')}
                  </button>

                  {/* Register Button */}
                  <button
                    type="button"
                    onClick={handleOpenRegisterModal}
                    className="flex h-[30px] w-full cursor-pointer items-center justify-center rounded-[3px] bg-[linear-gradient(#74cae3,#5bc0de_60%,#4ab9db)] px-3 text-sm font-bold text-white shadow-none transition-all duration-200"
                  >
                    <span>{t('register')}</span>
                  </button>
                </form>
              </div>
            )}


            {/* Profile Dropdown for Authenticated Users */}
            {isAuth && (
              <div className="px-4 py-4">
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-[5px] border border-[#ec4d49]/60 bg-[#121212] px-3 py-3 transition-all hover:shadow-[0_0_10px_rgba(236,77,73,0.35)]"
                  >
                    {/* User Icon - Circular with person silhouette */}
                    <span className="inline-flex h-[35px] w-[35px] flex-shrink-0 items-center justify-center rounded-full bg-[#ec4d49]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="12" cy="8" r="4" fill="#FFFFFF" />
                        <path
                          d="M6 20C6 16 9 14 12 14C15 14 18 16 18 20"
                          stroke="#FFFFFF"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    {/* Two lines of text */}
                    <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
                      <span className="truncate text-sm font-medium text-white">
                        {userDisplayName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-white">
                          {isBalanceRefreshing
                            ? '....'
                            : formatCurrency(holdingMoney)}
                        </span>
                        {/* Refresh icon */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isBalanceRefreshing) {
                              handleRefreshBalance();
                            }
                          }}
                          className={`flex items-center justify-center transition-opacity hover:opacity-80 cursor-pointer ${
                            isBalanceRefreshing
                              ? 'cursor-not-allowed opacity-50'
                              : ''
                          }`}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="text-[#ec4d49]"
                          >
                            <path
                              d="M1 4V10H7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M23 20V14H17"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                    {/* Dropdown arrow */}
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/drop-3.svg"
                      alt="Open profile menu"
                      width={15}
                      height={15}
                      className={`h-4 w-4 flex-shrink-0 transition-transform [filter:brightness(0)_invert(1)] ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 left-0 z-[1000] mt-2">
                      <div className="rounded-[0px] bg-[#ec4d49] p-[1px] shadow-xl">
                        <div className="rounded-[0px] bg-[#121212] p-[10px]">
                          <div className="rounded-[8px] bg-[#ec4d49] p-[1px]">
                            <div className="overflow-hidden rounded-[7px] bg-[#121212]">
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenProfileTab();
                                  setIsUserMenuOpen(false);
                                }}
                                className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#ec4d49]/30"
                              >
                                <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-white">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-1.svg"
                                    alt={t('profile')}
                                    width={20}
                                    height={20}
                                    className="flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                                  />
                                  <span className="truncate whitespace-nowrap">
                                    {t('profile')}
                                  </span>
                                </span>
                                <span className="pl-2 text-[12px] text-white/80 group-hover:text-white">
                                  &nbsp;
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenBettingHistory();
                                }}
                                className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#ec4d49]/30"
                              >
                                <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-white">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-2.svg"
                                    alt={t('betting')}
                                    width={20}
                                    height={20}
                                    className="flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                                  />
                                  <span className="truncate whitespace-nowrap capitalize">
                                    {t('betting') || 'Bet History'}
                                  </span>
                                </span>
                                <span className="pl-2 text-[12px] text-white/80 group-hover:text-white">
                                  &nbsp;
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleLogout();
                                  setIsUserMenuOpen(false);
                                }}
                                className="group flex w-full items-center justify-between px-3 py-2 text-white transition-all hover:bg-[#ec4d49]/30"
                              >
                                <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-white">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-3.svg"
                                    alt={t('logout')}
                                    width={20}
                                    height={20}
                                    className="flex-shrink-0 transition-all duration-200 group-hover:scale-110"
                                  />
                                  <span className="truncate whitespace-nowrap">
                                    {t('logout')}
                                  </span>
                                </span>
                                <span className="pl-2 text-[12px] text-white/80 group-hover:text-white">
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

            {/* Categories Grid */}
            <div className="px-4 pb-4">
              <div className="grid grid-cols-4 gap-4">
                {(() => {
                  // Match Categories.jsx enabled categories: Home, Slots, Casino, Promotions, Sports, Arcade, Table Games
                  const enabledCategoryKeys = [
                    'home',
                    'slots',
                    'casino',
                    'promotions',
                    'sports',
                    'other',
                    'table',
                  ];
                  // Sort categories: enabled ones first in specified order, then disabled ones
                  const sortedCategories = [...sidebarCategories].sort(
                    (a, b) => {
                      const aEnabled = enabledCategoryKeys.includes(a.key);
                      const bEnabled = enabledCategoryKeys.includes(b.key);

                      if (aEnabled && bEnabled) {
                        // Both enabled: sort by enabled order
                        return (
                          enabledCategoryKeys.indexOf(a.key) -
                          enabledCategoryKeys.indexOf(b.key)
                        );
                      }
                      if (aEnabled && !bEnabled) return -1;
                      if (!aEnabled && bEnabled) return 1;
                      // Both disabled: maintain original order
                      return (
                        sidebarCategories.indexOf(a) -
                        sidebarCategories.indexOf(b)
                      );
                    },
                  );

                  return sortedCategories.map((category) => {
                    const getLabel = (key, fallback) => {
                      const translated = t(key);
                      const text = translated === key ? fallback : translated;
                      if (!text) return '';
                      return (
                        text.charAt(0).toUpperCase() +
                        text.slice(1).toLowerCase()
                      );
                    };

                    const isEnabled = enabledCategoryKeys.includes(
                      category.key,
                    );

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
                            alt={getLabel(category.label, category.display)}
                            width={38}
                            height={38}
                            className="h-full w-full object-contain [filter:brightness(0)_invert(1)]"
                          />
                        </div>
                        <span
                          className={`w-full truncate text-center font-bold ${
                            isEnabled ? 'text-white' : 'text-white opacity-40'
                          }`}
                          style={{
                            fontSize: '10px',
                          }}
                        >
                          {getLabel(category.label, category.display)}
                        </span>
                      </>
                    );

                    if (isEnabled) {
                      return (
                        <Link
                          key={category.key}
                          href={category.href}
                          onClick={closeMobileMenu}
                          className="group flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-white bg-[#000304] p-2 transition-all duration-200 hover:opacity-80 active:scale-95 sm:gap-2"
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div
                        key={category.key}
                        className="flex h-full w-full cursor-not-allowed flex-col items-center justify-center gap-1.5 rounded-lg border border-white bg-[#000304] p-2 opacity-60 sm:gap-2"
                      >
                        {content}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Footer section: Logout fixed at bottom */}
            <div className="mt-auto space-y-3 p-4">
              {isAuth && (
                <div className="border-t border-[#6456bd54] pt-4">
                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center justify-center rounded-[10px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-6 py-3 text-base font-semibold text-white shadow-none transition-colors duration-200 hover:opacity-90"
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
