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

import { LanguageSwitcher } from '@/dynamic-components/template16/components/LanguageSwitcher/LanguageSwitcher';
import LazyImage from '@/dynamic-components/template16/components/LazyImage/LazyImage';
import WalletDropdown from '@/dynamic-components/template16/components/WalletDropdown/WalletDropdown';
import { formatCurrency } from '@/helpers/formatting';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { usePopupData } from '@/hooks/usePopupData';
import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { useLanguage } from '@/providers/LanguageProvider';
import { fetchUserProfile, logoutUser } from '@/slices/auth/authAction';
import { openModal } from '@/slices/common/commonSlice';

const BASE_ICON_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/';

const sidebarCategories = [
  {
    key: 'home',
    icon: 'Home-1.svg',
    label: 'home',
    display: 'Home',
    href: '/',
  },
  {
    key: 'hot',
    icon: 'Hot-2.svg',
    label: 'hot_games',
    display: 'Hot Games',
    href: '/slot-providers?q=hot',
  },
  {
    key: 'slots',
    icon: 'Slots-3.svg',
    label: 'slots',
    display: 'Slot Games',
    href: '/slots?category=slots',
  },
  {
    key: 'casino',
    icon: 'Casino-4.svg',
    label: 'casino',
    display: 'Casino',
    href: '/live-casino?q=live',
  },
  {
    key: 'sports',
    icon: 'Sports-5.svg',
    label: 'sports',
    display: 'Sports',
    href: '/sports',
  },
  {
    key: 'fishing',
    icon: 'Fishing-6.svg',
    label: 'fishing',
    display: 'Fishing',
    href: '/fishing',
  },
  {
    key: 'other',
    icon: 'Other-7.svg',
    label: 'other',
    display: 'Other',
    href: '/other',
  },
  {
    key: 'togel',
    icon: 'Togel-8.svg',
    label: 'togel',
    display: 'Togel',
    href: '/togel',
  },
  {
    key: 'crash',
    icon: 'Crash-9.svg',
    label: 'crash_game',
    display: 'Crash',
    href: '/crash',
  },
  {
    key: 'promotions',
    icon: 'Promotions-10.svg',
    label: 'promotions',
    display: 'Promotions',
    href: '/promotions',
  },
  {
    key: 'bonus',
    icon: 'Bonus-11.svg',
    label: 'bonus',
    display: 'Bonus',
    href: '/bonus',
  },
  {
    key: 'more',
    icon: 'more-12.svg',
    label: 'more',
    display: 'More',
    href: '/more',
  },
];

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
  const [isBalanceRefreshing, setIsBalanceRefreshing] = useState(false);
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
    router.push('/register');
    closeMobileMenu();
  }, [router, closeMobileMenu]);

  const handleOpenTransaction = useCallback(() => {
    router.push('/transaction');
    closeMobileMenu();
  }, [router, closeMobileMenu]);

  const handleOpenReferrals = useCallback(
    (e) => {
      e?.preventDefault?.();
      closeMobileMenu();
      router.push('/dashboard/referrals');
    },
    [router, closeMobileMenu],
  );

  const handleOpenInquiry = useCallback(
    (e) => {
      e?.preventDefault?.();
      closeMobileMenu();
      router.push('/dashboard/customer-inquiry');
    },
    [router, closeMobileMenu],
  );

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

  const handleOpenReferralTab = useCallback(() => {
    router.push('/dashboard/referrals');
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

  const handleOpenAnnouncement = useCallback(() => {
    router.push('/announcements');
    closeMobileMenu();
  }, [router, closeMobileMenu]);

  const handleOpenNotes = useCallback(() => {
    router.push('/dashboard/note');
    closeMobileMenu();
  }, [router, closeMobileMenu]);

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
        className={`relative z-[100] bg-[#000304] ${
          isMobilePlatform ? 'pt-safe-top' : ''
        }`}
      >
        {/* 1px gradient bottom border */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#E8D25E]" />
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - Mobile Only */}
            <div className="flex items-center md:hidden">
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

            {/* Download Button Section - Desktop Only */}
            <div className="hidden items-center md:flex">
              <a
                href="https://thestaticfile.com/uploads/user12.apk"
                download
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open('https://thestaticfile.com/uploads/user12.apk', '_blank');
                }}
                className="group flex cursor-pointer items-center gap-2 rounded-[10px] bg-[#E8D25E] px-4 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
              >
                {/* Download Icon - Black circle with white arrow */}
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 15V3M12 15L8 11M12 15L16 11M3 17V21H21V17"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>{t('download_app') || 'Download App'}</span>
              </a>
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden items-center gap-4 md:flex">
              {/* Icons */}
              <div className="flex items-center gap-3">
                {/* Notification Icon */}
                <button
                  onClick={handleOpenAnnouncement}
                  className="flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-[6px] bg-[#0B0B0B] text-white transition-transform duration-200 hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="26"
                    viewBox="0 0 20 26"
                    fill="none"
                    className="h-[26px] w-[20px]"
                  >
                    <path
                      d="M9.7992 25.1875C11.22 25.1875 12.3825 24.025 12.3825 22.6042H7.21587C7.21587 23.2893 7.48804 23.9464 7.97251 24.4309C8.45698 24.9153 9.11406 25.1875 9.7992 25.1875ZM17.5492 17.4375V10.9792C17.5492 7.01375 15.4309 3.69417 11.7367 2.81583V1.9375C11.7367 0.865417 10.8713 0 9.7992 0C8.72712 0 7.8617 0.865417 7.8617 1.9375V2.81583C4.15462 3.69417 2.0492 7.00083 2.0492 10.9792V17.4375L0.38295 19.1038C-0.4308 19.9175 0.137533 21.3125 1.28712 21.3125H18.2984C19.448 21.3125 20.0292 19.9175 19.2155 19.1038L17.5492 17.4375Z"
                      fill="#E8D25E"
                    />
                  </svg>
                </button>

                {/* Notes Icon with Counter */}
                <button
                  onClick={handleOpenNotes}
                  className="relative flex h-[45px] w-[45px] cursor-pointer items-center justify-center rounded-[6px] bg-[#0B0B0B] text-white transition-transform duration-200 hover:scale-105"
                >
                  <svg
                    width="31"
                    height="26"
                    viewBox="0 0 31 26"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-[26px] w-[31px]"
                  >
                    <path
                      d="M8.2619 9C7.66201 9 7.08669 9.26339 6.6625 9.73223C6.23831 10.2011 6 10.837 6 11.5C6 12.163 6.23831 12.7989 6.6625 13.2678C7.08669 13.7366 7.66201 14 8.2619 14C8.8618 14 9.43712 13.7366 9.86131 13.2678C10.2855 12.7989 10.5238 12.163 10.5238 11.5C10.5238 10.837 10.2855 10.2011 9.86131 9.73223C9.43712 9.26339 8.8618 9 8.2619 9ZM15.5 9C14.9001 9 14.3248 9.26339 13.9006 9.73223C13.4764 10.2011 13.2381 10.837 13.2381 11.5C13.2381 12.163 13.4764 12.7989 13.9006 13.2678C14.3248 13.7366 14.9001 14 15.5 14C16.0999 14 16.6752 13.7366 17.0994 13.2678C17.5236 12.7989 17.7619 12.163 17.7619 11.5C17.7619 10.837 17.5236 10.2011 17.0994 9.73223C16.6752 9.26339 16.0999 9 15.5 9ZM20.4762 11.5C20.4762 10.837 20.7145 10.2011 21.1387 9.73223C21.5629 9.26339 22.1382 9 22.7381 9C23.338 9 23.9133 9.26339 24.3375 9.73223C24.7617 10.2011 25 10.837 25 11.5C25 12.163 24.7617 12.7989 24.3375 13.2678C23.9133 13.7366 23.338 14 22.7381 14C22.1382 14 21.5629 13.7366 21.1387 13.2678C20.7145 12.7989 20.4762 12.163 20.4762 11.5Z"
                      fill="#E8D25E"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M23.1276 0.331599C18.279 -0.0848256 13.4051 -0.109079 8.55271 0.25907L8.20534 0.286268C5.97431 0.455892 3.88924 1.46837 2.36769 3.12094C0.846146 4.7735 0.000463203 6.94416 0 9.19819V24.6413C0.000206097 24.8764 0.0609042 25.1074 0.176171 25.3118C0.291438 25.5162 0.457336 25.687 0.657677 25.8076C0.858018 25.9281 1.08596 25.9943 1.31925 25.9996C1.55255 26.005 1.78323 25.9493 1.98879 25.838L9.02606 22.0285C9.35414 21.8508 9.72087 21.7579 10.0933 21.7583H26.2485C28.2858 21.7583 30.0317 20.2896 30.397 18.2715C31.1385 14.1791 31.1961 9.99056 30.5698 5.8782L30.3862 4.66517C30.223 3.5935 29.7069 2.60821 28.9209 1.86764C28.1349 1.12707 27.1246 0.674205 26.0523 0.581822L23.1276 0.331599ZM8.75788 2.97163C13.4664 2.61312 18.1959 2.63616 22.9008 3.04053L25.8237 3.29257C26.7884 3.37598 27.5731 4.11395 27.7189 5.07858L27.9043 6.2898C28.4829 10.1037 28.4281 13.9879 27.7423 17.7837C27.6797 18.1362 27.4958 18.4552 27.2229 18.6847C26.9501 18.9141 26.6057 19.0394 26.2503 19.0385H10.0933C9.27545 19.0386 8.47033 19.243 7.74999 19.6332L2.69972 22.3675V9.19819C2.69981 7.63009 3.28788 6.1199 4.34617 4.97001C5.40446 3.82012 6.85485 3.11542 8.40692 2.99702L8.75788 2.97163Z"
                      fill="#E8D25E"
                    />
                  </svg>
                  {helpUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#D3AF37] px-1 text-[10px] font-bold leading-none text-black">
                      {helpUnreadCount > 99 ? '99+' : helpUnreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Language Switcher */}
              <div className="flex h-[40px] items-center rounded-[50px] border border-[#E8D25E] bg-transparent px-1">
                <LanguageSwitcher variant="dropdown" appearance="outline" />
              </div>

              {/* Buttons */}
              {!isAuth ? (
                <>
                  <button
                    onClick={handleOpenLoginModal}
                    className="group flex w-[100px] cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                  >
                    <span>{t('login')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenRegisterModal}
                    className="group flex w-[100px] cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                    data-hover="Register"
                  >
                    <span>{t('register')}</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-4">
                  {/* Transaction, Referrals, Inquiry Buttons */}
                  <button
                    type="button"
                    onClick={handleOpenTransaction}
                    className="group flex w-[150px] cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="19"
                      viewBox="0 0 18 19"
                      fill="none"
                    >
                      <path
                        d="M0.542969 10.751C0.542969 7.57793 0.542969 5.991 1.52912 5.00569C2.51528 4.02037 4.10137 4.01953 7.2744 4.01953H10.6401C13.8131 4.01953 15.4001 4.01953 16.3854 5.00569C17.3707 5.99184 17.3715 7.57793 17.3715 10.751C17.3715 13.924 17.3715 15.5109 16.3854 16.4962C15.3992 17.4815 13.8131 17.4824 10.6401 17.4824H7.2744C4.10137 17.4824 2.51444 17.4824 1.52912 16.4962C0.54381 15.5101 0.542969 13.924 0.542969 10.751Z"
                        stroke="#090A0B"
                        strokeWidth="1.08571"
                      />
                      <circle
                        cx="9.22873"
                        cy="4.88571"
                        r="4.61429"
                        fill="black"
                        stroke="#090A0B"
                        strokeWidth="0.542857"
                      />
                      <path
                        d="M8.82162 7.32861C8.82162 7.55347 9.0039 7.73576 9.22876 7.73576C9.45362 7.73576 9.6359 7.55347 9.6359 7.32861H9.22876H8.82162ZM9.51665 2.15501C9.35765 1.99601 9.09987 1.99601 8.94087 2.15501L6.34982 4.74605C6.19083 4.90505 6.19083 5.16283 6.34982 5.32183C6.50882 5.48083 6.76661 5.48083 6.92561 5.32183L9.22876 3.01869L11.5319 5.32183C11.6909 5.48083 11.9487 5.48083 12.1077 5.32183C12.2667 5.16283 12.2667 4.90505 12.1077 4.74605L9.51665 2.15501ZM9.22876 7.32861H9.6359V2.4429H9.22876H8.82162V7.32861H9.22876Z"
                        fill="#E8D25E"
                      />
                    </svg>
                    <span>{t('transaction')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenReferrals}
                    className="group flex w-[100px] cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                  >
                    <span>{t('referrals')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenInquiry}
                    className="group flex w-[100px] cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                  >
                    <span>{t('inquiry')}</span>
                  </button>

                  {/* <WalletDropdown variant="desktop" /> */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={toggleUserMenu}
                      ref={userButtonRef}
                      className="group flex h-[45px] cursor-pointer items-center gap-3 rounded-[5px] bg-[#000304] px-3 py-2 text-base font-medium text-white transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                    >
                      {/* User Icon - Circular with person silhouette */}
                      <span className="inline-flex h-[35px] w-[35px] flex-shrink-0 items-center justify-center rounded-full bg-[#E8D25E]">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <circle cx="12" cy="8" r="4" fill="#6B7D47" />
                          <path
                            d="M6 20C6 16 9 14 12 14C15 14 18 16 18 20"
                            stroke="#6B7D47"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      {/* Two lines of text */}
                      <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
                        <span className="max-w-[120px] truncate text-sm font-medium text-white">
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
                              className="text-[#E8D25E]"
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
                        className={`h-4 w-4 flex-shrink-0 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isUserMenuOpen && (
                      <div
                        className="absolute right-0 z-[1000] mt-2"
                        style={{ width: userButtonWidth || undefined }}
                      >
                        <div className="rounded-[0px] bg-[#E8D25E] p-[1px] shadow-xl">
                          <div className="rounded-[0px] bg-[#000304] p-[10px]">
                            <div className="rounded-[8px] bg-[#E8D25E] p-[1px]">
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
                                  className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#E8D25E]"
                                >
                                  <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-black">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-1.svg"
                                      alt={t('profile')}
                                      width={20}
                                      height={20}
                                      className="flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                    />
                                    <span className="truncate text-[12px] whitespace-nowrap">
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
                                  className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#E8D25E]"
                                >
                                  <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-black">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/referal.svg"
                                      alt={t('referrals')}
                                      width={22}
                                      height={22}
                                      className="flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                    />
                                    <span className="truncate text-[12px] whitespace-nowrap">
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
                                    handleOpenBettingHistory();
                                  }}
                                  className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-[#E8D25E]"
                                >
                                  <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-black">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-2.svg"
                                      alt={t('betting')}
                                      width={20}
                                      height={20}
                                      className="flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                    />
                                    <span className="truncate text-[12px] whitespace-nowrap capitalize">
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
                                  className="group flex w-full items-center justify-between px-3 py-2 text-white transition-all hover:bg-[#E8D25E]"
                                >
                                  <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-black">
                                    <Image
                                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-3.svg"
                                      alt={t('logout')}
                                      width={20}
                                      height={20}
                                      className="flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                    />
                                    <span className="truncate text-[12px] whitespace-nowrap">
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
              <div className="flex h-[40px] items-center rounded-[50px] border border-[#E8D25E] bg-transparent px-1">
                <LanguageSwitcher variant="dropdown" appearance="outline" />
              </div>

              <button
                onClick={toggleMobileMenu}
                className="relative flex h-[35px] w-[45px] cursor-pointer items-center justify-center rounded-[6px] bg-[#E8D25E] p-[1px] text-white transition-colors duration-200 hover:text-orange-400"
              >
                <div className="flex h-full w-full items-center justify-center rounded-[5px] bg-[#000304]">
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
            {/* Header with Download Button and Close Button */}
            <div className="border-b border-[#FFFFFF1A] p-4">
              <div className="flex items-center justify-between">
                {/* Download Button */}
                <a
                  href="https://thestaticfile.com/uploads/user12.apk"
                  download
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    window.open('https://thestaticfile.com/uploads/user12.apk', '_blank');
                  }}
                  className="group flex cursor-pointer items-center gap-1.5 rounded-[8px] bg-[#E8D25E] px-2.5 pt-1.5 pb-2 text-sm font-semibold text-black [box-shadow:inset_0_-4px_0_#876800] transition-all duration-200 hover:pb-1.5 hover:[box-shadow:0_0_8px_0_#876800_inset,0_0_16px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                >
                  {/* Download Icon - Black circle with white arrow */}
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-black">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 15V3M12 15L8 11M12 15L16 11M3 17V21H21V17"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-xs">
                    {t('download_app') || 'Download App'}
                  </span>
                </a>

                <button
                  onClick={toggleMobileMenu}
                  className="group flex h-8 w-8 cursor-pointer items-center justify-center rounded-sm bg-[#E8D25E] text-black transition-colors"
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
              <div className="px-0 py-0">
                <div className="flex items-center gap-3">
                  <div className="flex w-full items-center gap-3 rounded-[0px] bg-black px-3 py-3">
                    <button
                      onClick={handleOpenLoginModal}
                      className="group flex w-[170px] cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-[13px] font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                    >
                      <span>{t('login')}</span>
                    </button>

                    <button
                      onClick={handleOpenRegisterModal}
                      className="group flex w-[170px] cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-[13px] font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                      data-hover="Register"
                    >
                      <span>{t('register')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Transaction, Referrals, Inquiry Buttons for Authenticated Users */}
            {isAuth && (
              <div className="px-0 py-0">
                <div className="flex flex-col gap-3 px-4 pt-4">
                  <button
                    type="button"
                    onClick={handleOpenTransaction}
                    className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-[13px] font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="19"
                      viewBox="0 0 18 19"
                      fill="none"
                    >
                      <path
                        d="M0.542969 10.751C0.542969 7.57793 0.542969 5.991 1.52912 5.00569C2.51528 4.02037 4.10137 4.01953 7.2744 4.01953H10.6401C13.8131 4.01953 15.4001 4.01953 16.3854 5.00569C17.3707 5.99184 17.3715 7.57793 17.3715 10.751C17.3715 13.924 17.3715 15.5109 16.3854 16.4962C15.3992 17.4815 13.8131 17.4824 10.6401 17.4824H7.2744C4.10137 17.4824 2.51444 17.4824 1.52912 16.4962C0.54381 15.5101 0.542969 13.924 0.542969 10.751Z"
                        stroke="#090A0B"
                        strokeWidth="1.08571"
                      />
                      <circle
                        cx="9.22873"
                        cy="4.88571"
                        r="4.61429"
                        fill="black"
                        stroke="#090A0B"
                        strokeWidth="0.542857"
                      />
                      <path
                        d="M8.82162 7.32861C8.82162 7.55347 9.0039 7.73576 9.22876 7.73576C9.45362 7.73576 9.6359 7.55347 9.6359 7.32861H9.22876H8.82162ZM9.51665 2.15501C9.35765 1.99601 9.09987 1.99601 8.94087 2.15501L6.34982 4.74605C6.19083 4.90505 6.19083 5.16283 6.34982 5.32183C6.50882 5.48083 6.76661 5.48083 6.92561 5.32183L9.22876 3.01869L11.5319 5.32183C11.6909 5.48083 11.9487 5.48083 12.1077 5.32183C12.2667 5.16283 12.2667 4.90505 12.1077 4.74605L9.51665 2.15501ZM9.22876 7.32861H9.6359V2.4429H9.22876H8.82162V7.32861H9.22876Z"
                        fill="#E8D25E"
                      />
                    </svg>
                    <span>{t('transaction')}</span>
                  </button>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleOpenReferrals}
                      className="group flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-[13px] font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                    >
                      <span>{t('referrals')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleOpenInquiry}
                      className="group flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-[13px] font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                    >
                      <span>{t('inquiry')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Dropdown for Authenticated Users */}
            {isAuth && (
              <div className="px-4 py-4">
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="group flex w-full cursor-pointer items-center gap-3 rounded-[5px] border border-[#FFFFFF66] bg-[#000304] px-3 py-3 transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                  >
                    {/* User Icon - Circular with person silhouette */}
                    <span className="inline-flex h-[35px] w-[35px] flex-shrink-0 items-center justify-center rounded-full bg-[#E8D25E]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <circle cx="12" cy="8" r="4" fill="#6B7D47" />
                        <path
                          d="M6 20C6 16 9 14 12 14C15 14 18 16 18 20"
                          stroke="#6B7D47"
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
                            className="text-[#E8D25E]"
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
                      className={`h-4 w-4 flex-shrink-0 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 left-0 z-[1000] mt-2">
                      <div className="rounded-[0px] bg-[#E8D25E] p-[1px] shadow-xl">
                        <div className="rounded-[0px] bg-[#000304] p-[10px]">
                          <div className="rounded-[8px] bg-[#E8D25E] p-[1px]">
                            <div className="overflow-hidden rounded-[7px] bg-[#000304]">
                              <button
                                type="button"
                                onClick={() => {
                                  handleOpenProfileTab();
                                  setIsUserMenuOpen(false);
                                }}
                                className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-gradient-to-r hover:from-[#E8D25E] hover:via-[#E8D25E] hover:to-[#E8D25E]"
                              >
                                <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-black">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-1.svg"
                                    alt={t('profile')}
                                    width={20}
                                    height={20}
                                    className="flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                  />
                                  <span className="truncate whitespace-nowrap">
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
                                className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-gradient-to-r hover:from-[#E8D25E] hover:via-[#E8D25E] hover:to-[#E8D25E]"
                              >
                                <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-black">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/referal.svg"
                                    alt={t('referrals')}
                                    width={22}
                                    height={22}
                                    className="flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                  />
                                  <span className="truncate whitespace-nowrap">
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
                                  handleOpenBettingHistory();
                                }}
                                className="group flex w-full items-center justify-between border-b border-[#FFFFFF66] px-3 py-2 text-white transition-all hover:bg-gradient-to-r hover:from-[#E8D25E] hover:via-[#E8D25E] hover:to-[#E8D25E]"
                              >
                                <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-black">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-2.svg"
                                    alt={t('betting')}
                                    width={20}
                                    height={20}
                                    className="flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                  />
                                  <span className="truncate whitespace-nowrap capitalize">
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
                                className="group flex w-full items-center justify-between px-3 py-2 text-white transition-all hover:bg-gradient-to-r hover:from-[#E8D25E] hover:via-[#E8D25E] hover:to-[#E8D25E]"
                              >
                                <span className="flex min-w-0 flex-1 items-center gap-3 text-white group-hover:text-black">
                                  <Image
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/profile-3.svg"
                                    alt={t('logout')}
                                    width={20}
                                    height={20}
                                    className="flex-shrink-0 transition-all duration-200 group-hover:scale-110 group-hover:brightness-0"
                                  />
                                  <span className="truncate whitespace-nowrap">
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

            {/* Categories Grid */}
            <div className="px-4 pb-4">
              <div className="grid grid-cols-4 gap-4">
                {(() => {
                  const enabledCategoryKeys = [
                    'home',
                    'slots',
                    'casino',
                    'promotions',
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
                        <div className="flex h-6 w-6 items-center justify-center">
                          <LazyImage
                            src={`${BASE_ICON_URL}${category.icon}`}
                            alt={getLabel(category.label, category.display)}
                            width={24}
                            height={24}
                            className={`h-full w-full ${isEnabled ? '' : 'opacity-40'}`}
                          />
                        </div>
                        <span
                          className={`w-full truncate text-center text-[10px] font-bold ${
                            isEnabled ? 'text-white' : 'text-white opacity-40'
                          }`}
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
                          className="flex flex-col items-center gap-2 rounded-lg border border-[#E8D25E4D] p-2 transition-opacity duration-200 hover:opacity-80 active:scale-95"
                        >
                          {content}
                        </Link>
                      );
                    }

                    return (
                      <div
                        key={category.key}
                        className="flex cursor-not-allowed flex-col items-center gap-2 rounded-lg border border-[#E8D25E4D] p-2 opacity-60"
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
                    className="flex w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#E8D25E] px-6 py-3 text-base font-semibold text-black transition-colors duration-200"
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
