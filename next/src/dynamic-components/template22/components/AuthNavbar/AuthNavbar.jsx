'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { formatCurrency } from '@/helpers/formatting';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchUserProfile, logoutUser } from '@/slices/auth/authAction';

function AuthNavbar() {
  const [isBalanceRefreshing, setIsBalanceRefreshing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [howToPlayReplayKey, setHowToPlayReplayKey] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { isMobilePlatform } = useMobilePlatform();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentHomeTab = (searchParams?.get('tab') || '').toLowerCase();

  const auth = useSelector((state) => state.auth);
  const { isAuth, user } = auth;

  const userButtonRef = useRef(null);
  const [userButtonWidth, setUserButtonWidth] = useState(0);

  // Helper function to capitalize translation text (title case)
  const getCapitalizedLabel = (translationKey, fallback) => {
    const translated = t(translationKey);
    const text = translated === translationKey ? fallback : translated;
    if (!text) return '';
    // Convert to title case (capitalize first letter of each word)
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Navigation items for left side with icons
  const navigationItems = [
    {
      label: getCapitalizedLabel('user_area', 'USER AREA'),
      href: '/dashboard/home',
      isText: false,
    },
    {
      label: getCapitalizedLabel('history', 'HISTORY'),
      href: '/dashboard/home',
      icon: 'calendar',
      homeTab: 'history',
    },
    {
      label: getCapitalizedLabel('deposit', 'DEPOSIT'),
      href: '/dashboard/home',
      icon: 'deposit',
      homeTab: 'deposit',
    },
    {
      label: getCapitalizedLabel('withdrawal', 'WITHDRAW'),
      href: '/dashboard/home',
      icon: 'withdraw',
      homeTab: 'withdrawal',
    },
    {
      label: getCapitalizedLabel('inquiry', 'INQUIRY'),
      href: '/dashboard/home',
      icon: 'raken',
      homeTab: 'cm_inquiry',
    },
    {
      label: getCapitalizedLabel('notes', 'NOTES'),
      href: '/dashboard/home',
      icon: 'memo',
      homeTab: 'notes',
    },
    {
      label: getCapitalizedLabel('promotions_badge', 'PROMOTIONS'),
      href: '/dashboard/home',
      icon: 'promotions',
      homeTab: 'promotion',
    },
    {
      label: getCapitalizedLabel('referral', 'REFERRAL'),
      href: '/dashboard/home',
      icon: 'referral',
      homeTab: 'referral',
    },
    {
      label: getCapitalizedLabel('profile', 'PROFILE'),
      href: '/dashboard/home',
      icon: 'profile',
      homeTab: 'profile',
      mobileOnly: true, // Only show in mobile sidebar
    },
  ];

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleLogout = useCallback(() => {
    dispatch(logoutUser());
    closeMobileMenu();
    router.push('/');
  }, [dispatch, router, closeMobileMenu]);

  const userDisplayName = useMemo(() => {
    return user?.name || user?.username || t('profile');
  }, [user?.name, user?.username, t]);

  const holdingMoney = useMemo(() => {
    return user?.wallet?.holding_money || 0;
  }, [user?.wallet?.holding_money]);

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


  // Keep profile dropdown width equal to trigger button
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

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format time display (compact for navbar): "30 Jan 01:01 GMT+5"
  const formatTimeDisplay = useCallback(() => {
    const date = currentTime;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const offset = -date.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60);
    const offsetMinutes = Math.abs(offset) % 60;
    const offsetSign = offset >= 0 ? '+' : '-';
    const gmtOffset = offsetMinutes > 0
      ? `GMT${offsetSign}${offsetHours}:${String(offsetMinutes).padStart(2, '0')}`
      : `GMT${offsetSign}${offsetHours}`;
    return `${day} ${month} ${hours}:${minutes} ${gmtOffset}`;
  }, [currentTime]);

  // Icon components
  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'calendar':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 20 21" fill="none" className="flex-shrink-0">
            <path d="M12.75 2.75V0.75M12.75 2.75V4.75M12.75 2.75H8.25M0.75 8.75V17.75C0.75 18.2804 0.960714 18.7891 1.33579 19.1642C1.71086 19.5393 2.21957 19.75 2.75 19.75H16.75C17.2804 19.75 17.7891 19.5393 18.1642 19.1642C18.5393 18.7891 18.75 18.2804 18.75 17.75V8.75M0.75 8.75H18.75M0.75 8.75V4.75C0.75 4.21957 0.960714 3.71086 1.33579 3.33579C1.71086 2.96071 2.21957 2.75 2.75 2.75H4.75M18.75 8.75V4.75C18.75 4.21957 18.5393 3.71086 18.1642 3.33579C17.7891 2.96071 17.2804 2.75 16.75 2.75H16.25M4.75 0.75V4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'deposit':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 19 19" fill="none" className="flex-shrink-0">
            <path d="M0.571411 11.3162C0.571411 7.97615 0.571411 6.3057 1.60947 5.26853C2.64753 4.23135 4.3171 4.23047 7.65712 4.23047H11.2C14.54 4.23047 16.2105 4.23047 17.2476 5.26853C18.2848 6.30658 18.2857 7.97615 18.2857 11.3162C18.2857 14.6562 18.2857 16.3267 17.2476 17.3638C16.2096 18.401 14.54 18.4019 11.2 18.4019H7.65712C4.3171 18.4019 2.64664 18.4019 1.60947 17.3638C0.572297 16.3258 0.571411 14.6562 0.571411 11.3162Z" stroke="currentColor" strokeWidth="1.14286"/>
            <circle cx="9.71427" cy="5.14286" r="4.85714" fill="#171717" stroke="currentColor" strokeWidth="0.571429"/>
            <path d="M10.1428 2.57129C10.1428 2.3346 9.95093 2.14272 9.71423 2.14272C9.47754 2.14272 9.28566 2.3346 9.28566 2.57129L9.71423 2.57129L10.1428 2.57129ZM9.41119 8.01719C9.57855 8.18456 9.84991 8.18456 10.0173 8.01719L12.7447 5.28978C12.9121 5.12241 12.9121 4.85106 12.7447 4.68369C12.5773 4.51632 12.306 4.51632 12.1386 4.68369L9.71423 7.10805L7.28987 4.68369C7.1225 4.51632 6.85114 4.51632 6.68378 4.68369C6.51641 4.85106 6.51641 5.12241 6.68378 5.28978L9.41119 8.01719ZM9.71423 2.57129L9.28566 2.57129L9.28566 7.71415L9.71423 7.71415L10.1428 7.71415L10.1428 2.57129L9.71423 2.57129Z" fill="currentColor"/>
          </svg>
        );
      case 'withdraw':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 19 19" fill="none" className="flex-shrink-0">
            <path d="M0.571411 11.3162C0.571411 7.97615 0.571411 6.3057 1.60947 5.26853C2.64753 4.23135 4.3171 4.23047 7.65712 4.23047H11.2C14.54 4.23047 16.2105 4.23047 17.2476 5.26853C18.2848 6.30658 18.2857 7.97615 18.2857 11.3162C18.2857 14.6562 18.2857 16.3267 17.2476 17.3638C16.2096 18.401 14.54 18.4019 11.2 18.4019H7.65712C4.3171 18.4019 2.64664 18.4019 1.60947 17.3638C0.572297 16.3258 0.571411 14.6562 0.571411 11.3162Z" stroke="currentColor" strokeWidth="1.14286"/>
            <circle cx="9.71427" cy="5.14286" r="4.85714" fill="#171717" stroke="currentColor" strokeWidth="0.571429"/>
            <path d="M10.1428 2.57129C10.1428 2.3346 9.95093 2.14272 9.71423 2.14272C9.47754 2.14272 9.28566 2.3346 9.28566 2.57129L9.71423 2.57129L10.1428 2.57129ZM9.41119 8.01719C9.57855 8.18456 9.84991 8.18456 10.0173 8.01719L12.7447 5.28978C12.9121 5.12241 12.9121 4.85106 12.7447 4.68369C12.5773 4.51632 12.306 4.51632 12.1386 4.68369L9.71423 7.10805L7.28987 4.68369C7.1225 4.51632 6.85114 4.51632 6.68378 4.68369C6.51641 4.85106 6.51641 5.12241 6.68378 5.28978L9.41119 8.01719ZM9.71423 2.57129L9.28566 2.57129L9.28566 7.71415L9.71423 7.71415L10.1428 7.71415L10.1428 2.57129L9.71423 2.57129Z" fill="currentColor"/>
          </svg>
        );
      case 'raken':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 22 22" fill="none" className="flex-shrink-0">
            <path
              d="M15.7504 10.555C15.7504 10.209 15.7504 10.036 15.8024 9.882C15.9534 9.434 16.3524 9.261 16.7524 9.079C17.2004 8.874 17.4244 8.772 17.6474 8.754C17.8994 8.734 18.1524 8.788 18.3684 8.909C18.6544 9.069 18.8544 9.375 19.0584 9.623C20.0014 10.769 20.4734 11.342 20.6454 11.973C20.7854 12.483 20.7854 13.017 20.6454 13.526C20.3944 14.448 19.5994 15.22 19.0104 15.936C18.7094 16.301 18.5584 16.484 18.3684 16.591C18.1487 16.7128 17.8978 16.7668 17.6474 16.746C17.4244 16.728 17.2004 16.626 16.7514 16.421C16.3514 16.239 15.9534 16.066 15.8024 15.618C15.7504 15.464 15.7504 15.291 15.7504 14.946V10.555ZM5.7504 10.555C5.7504 10.119 5.7384 9.728 5.3864 9.422C5.2584 9.311 5.0884 9.234 4.7494 9.079C4.3004 8.875 4.0764 8.772 3.8534 8.754C3.1864 8.7 2.8274 9.156 2.4434 9.624C1.4994 10.769 1.0274 11.342 0.854396 11.974C0.715201 12.4823 0.715201 13.0187 0.854396 13.527C1.1064 14.448 1.9024 15.221 2.4904 15.936C2.8614 16.386 3.2164 16.797 3.8534 16.746C4.0764 16.728 4.3004 16.626 4.7494 16.421C5.0894 16.267 5.2584 16.189 5.3864 16.078C5.7384 15.772 5.7504 15.381 5.7504 14.946V10.555Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M18.75 9.25V7.75C18.75 3.884 15.168 0.75 10.75 0.75C6.332 0.75 2.75 3.884 2.75 7.75V9.25M18.75 16.25C18.75 20.75 14.75 20.75 10.75 20.75"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'memo':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="-1.5 -1.5 23 23" fill="none" className="flex-shrink-0">
            <path
              d="M0.75 18.04V2.75C0.75 2.21957 0.960714 1.71086 1.33579 1.33579C1.71086 0.960714 2.21957 0.75 2.75 0.75H16.75C17.2804 0.75 17.7891 0.960714 18.1642 1.33579C18.5393 1.71086 18.75 2.21957 18.75 2.75V12.75C18.75 13.2804 18.5393 13.7891 18.1642 14.1642C17.7891 14.5393 17.2804 14.75 16.75 14.75H5.711C5.41123 14.75 5.11531 14.8175 4.84511 14.9473C4.57491 15.0771 4.33735 15.266 4.15 15.5L1.819 18.414C1.74143 18.5112 1.63556 18.5819 1.51604 18.6164C1.39652 18.6508 1.26926 18.6472 1.15186 18.6061C1.03446 18.565 0.932729 18.4885 0.860735 18.3871C0.788741 18.2857 0.750045 18.1644 0.75 18.04Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        );
      case 'promotions':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            <path d="M20 12V21.4C20 21.4788 19.9845 21.5568 19.9543 21.6296C19.9242 21.7024 19.88 21.7685 19.8243 21.8243C19.7685 21.88 19.7024 21.9242 19.6296 21.9543C19.5568 21.9845 19.4788 22 19.4 22H4.6C4.52121 22 4.44319 21.9845 4.37039 21.9543C4.29759 21.9242 4.23145 21.88 4.17574 21.8243C4.12002 21.7685 4.07583 21.7024 4.04567 21.6296C4.01552 21.5568 4 21.4788 4 21.4V12M12 22V7M12 7H7.5C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C11 2 12 7 12 7ZM12 7H16.5C17.163 7 17.7989 6.73661 18.2678 6.26777C18.7366 5.79893 19 5.16304 19 4.5C19 3.83696 18.7366 3.20107 18.2678 2.73223C17.7989 2.26339 17.163 2 16.5 2C13 2 12 7 12 7ZM21.4 7H2.6C2.44087 7 2.28826 7.06321 2.17574 7.17574C2.06321 7.28826 2 7.44087 2 7.6V11.4C2 11.5591 2.06321 11.7117 2.17574 11.8243C2.28826 11.9368 2.44087 12 2.6 12H21.4C21.5591 12 21.7117 11.9368 21.8243 11.8243C21.9368 11.7117 22 11.5591 22 11.4V7.6C22 7.44087 21.9368 7.28826 21.8243 7.17574C21.7117 7.06321 21.5591 7 21.4 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'referral':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            className="flex-shrink-0"
          >
            <g
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.128a4 4 0 0 1 0 7.744M22 21v-2a4 4 0 0 0-3-3.87" />
              <circle cx="9" cy="7" r="4" />
            </g>
          </svg>
        );
      case 'profile':
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 16 18"
            fill="none"
            className="flex-shrink-0"
          >
            <path
              d="M0.75 16.75V15.75C0.75 13.8935 1.4875 12.113 2.80025 10.8003C4.11301 9.4875 5.89348 8.75 7.75 8.75M7.75 8.75C9.60652 8.75 11.387 9.4875 12.6997 10.8003C14.0125 12.113 14.75 13.8935 14.75 15.75V16.75M7.75 8.75C8.81087 8.75 9.82828 8.32857 10.5784 7.57843C11.3286 6.82828 11.75 5.81087 11.75 4.75C11.75 3.68913 11.3286 2.67172 10.5784 1.92157C9.82828 1.17143 8.81087 0.75 7.75 0.75C6.68913 0.75 5.67172 1.17143 4.92157 1.92157C4.17143 2.67172 3.75 3.68913 3.75 4.75C3.75 5.81087 4.17143 6.82828 4.92157 7.57843C5.67172 8.32857 6.68913 8.75 7.75 8.75Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <nav
        className={`relative z-[100] overflow-hidden border border-black/60 ${
          isMobilePlatform ? 'pt-safe-top' : ''
        }`}
        style={{
          backgroundImage: 'linear-gradient(#484e55, #3a3f44 60%, #313539)',
        }}
      >
        <div className="container mx-auto min-w-0 overflow-hidden px-2 sm:px-4">
          <div className="relative flex min-w-0 items-center justify-between gap-1 overflow-hidden" style={{ minHeight: '56px' }}>
            {/* Download APK Button - Mobile Only */}
            <div className="flex items-center md:hidden py-3">
              <a
                href="https://thestaticfile.com/uploads/user14.apk"
                download
                className="flex h-[40px] cursor-pointer items-center justify-center rounded-[20px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-4 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:opacity-90"
              >
                {t('download_apk') || 'Download APK'}
              </a>
            </div>

            {/* Navigation Links - Desktop Only */}
            <div className="hidden min-w-0 flex-1 items-center gap-0 overflow-hidden md:flex relative shrink flex-nowrap" style={{ height: '56px' }}>
              {(() => {
                const desktopItems = navigationItems.filter((item) => !item.mobileOnly);
                return desktopItems.map((item, index) => {
                  if (item.isText) {
                    return (
                      <div key={index} className="relative flex items-center h-full">
                        <span className="flex items-center px-2 text-[12px] font-bold text-[#E8D25E] [text-shadow:1px_1px_1px_rgba(0,0,0,0.3)]">
                          {item.label}
                        </span>
                        {index < desktopItems.length - 1 && (
                          <span 
                            className="absolute top-0 bottom-0 right-0 w-px bg-[#2F2F2F]" 
                            style={{ height: '56px' }}
                          />
                        )}
                      </div>
                    );
                  }
                  // Special handling for User Area - it should look like text but be a link
                  const isUserArea = item.href === '/dashboard/home' && index === 0;
                  if (isUserArea) {
                    const isActive = pathname === item.href;
                    return (
                      <div key={index} className="relative flex items-center h-full">
                        <Link
                          href={item.href}
                          className={`flex items-center px-2 text-[12px] font-bold text-[#ec4d49] transition-colors hover:opacity-80 [text-shadow:1px_1px_1px_rgba(0,0,0,0.3)] ${
                            isActive ? 'opacity-100' : ''
                          }`}
                        >
                          {item.label}
                        </Link>
                        <span 
                          className="absolute top-0 bottom-0 right-0 w-px bg-[#2F2F2F]" 
                          style={{ height: '56px' }}
                        />
                      </div>
                    );
                  }
                  const href = item.homeTab
                    ? `/dashboard/home?tab=${item.homeTab}`
                    : item.href;
                  const isActive = item.homeTab
                    ? pathname === '/dashboard/home' && currentHomeTab === item.homeTab
                    : pathname === item.href;
                  return (
                    <div key={index} className="relative flex items-center h-full group">
                      <Link
                        href={href}
                        className={`flex items-center gap-1.5 px-2 text-[12px] font-medium transition-all [text-shadow:1px_1px_1px_rgba(0,0,0,0.3)] h-full ${
                          isActive 
                            ? 'text-[#E8D25E]' 
                            : 'text-white'
                        }`}
                        style={!isActive ? {
                          backgroundImage: 'linear-gradient(#020202, #101112 40%, #191b1d)',
                          backgroundSize: '100% 0%',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'bottom',
                        } : {}}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundSize = '100% 100%';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.backgroundSize = '100% 0%';
                          }
                        }}
                      >
                        <span className="flex-shrink-0">{renderIcon(item.icon)}</span>
                        <span>{item.label}</span>
                      </Link>
                      {/* Add separator after all items */}
                      <span 
                        className="absolute top-0 bottom-0 right-0 w-px bg-[#2F2F2F]"
                        style={{ height: '56px' }}
                      />
                    </div>
                  );
                });
              })()}
            </div>

            {/* Right Section - Desktop */}
            <div className="hidden min-w-0 items-center gap-0 md:flex md:flex-shrink-0 relative overflow-visible" style={{ height: '56px' }}>
              <span className="absolute top-0 bottom-0 left-0 w-px bg-[#2F2F2F]" style={{ height: '56px' }} />
              {/* How to Play icon - Template21 */}
              <div className="relative flex items-center h-full group px-2">
                <button
                  type="button"
                  onClick={() => router.push('/how-to-play')}
                  onMouseEnter={() => setHowToPlayReplayKey((k) => k + 1)}
                  className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg text-[#ec4d49] transition-colors hover:bg-[#ec4d49]/10 focus:outline-none focus:ring-0"
                  aria-label={t('how_to_play_title')}
                >
                  <svg
                    key={howToPlayReplayKey}
                    xmlns="http://www.w3.org/2000/svg"
                    width={28}
                    height={28}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="h-5 w-5"
                  >
                    <path
                      strokeDasharray={60}
                      d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z"
                    >
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
                    <path
                      strokeDasharray={4}
                      strokeDashoffset={4}
                      d="M12 17v0.01"
                    >
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
              <span className="h-6 w-px flex-shrink-0 bg-[#2F2F2F]" />
              {/* Username - direct link to Profile page (no dropdown) */}
              <div className="relative flex min-w-0 items-center h-full group">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/home?tab=profile')}
                  className="flex cursor-pointer items-center gap-1.5 px-2 text-[12px] font-medium text-white transition-all h-full min-w-0 [text-shadow:1px_1px_1px_rgba(0,0,0,0.3)]"
                  style={{
                    backgroundImage: 'linear-gradient(#020202, #101112 40%, #191b1d)',
                    backgroundSize: '100% 0%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'bottom',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundSize = '100% 100%';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundSize = '100% 0%';
                  }}
                >
                  {/* User Icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 16 18"
                    fill="none"
                    className="flex-shrink-0"
                  >
                    <path
                      d="M0.75 16.75V15.75C0.75 13.8935 1.4875 12.113 2.80025 10.8003C4.11301 9.4875 5.89348 8.75 7.75 8.75M7.75 8.75C9.60652 8.75 11.387 9.4875 12.6997 10.8003C14.0125 12.113 14.75 13.8935 14.75 15.75V16.75M7.75 8.75C8.81087 8.75 9.82828 8.32857 10.5784 7.57843C11.3286 6.82828 11.75 5.81087 11.75 4.75C11.75 3.68913 11.3286 2.67172 10.5784 1.92157C9.82828 1.17143 8.81087 0.75 7.75 0.75C6.68913 0.75 5.67172 1.17143 4.92157 1.92157C4.17143 2.67172 3.75 3.68913 3.75 4.75C3.75 5.81087 4.17143 6.82828 4.92157 7.57843C5.67172 8.32857 6.68913 8.75 7.75 8.75Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">{userDisplayName}</span>
                </button>
              </div>
              {/* Sign-Out Button */}
              <div className="relative flex items-center h-full group">
                <span className="absolute top-0 bottom-0 left-0 w-px bg-[#2F2F2F]" style={{ height: '56px' }} />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-2 text-[12px] font-medium text-white transition-all h-full [text-shadow:1px_1px_1px_rgba(0,0,0,0.3)]"
                  style={{
                    backgroundImage: 'linear-gradient(#020202, #101112 40%, #191b1d)',
                    backgroundSize: '100% 0%',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'bottom',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundSize = '100% 100%';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundSize = '100% 0%';
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
                    <path d="M5 18L5 6C5 4.93913 5.42143 3.92172 6.17157 3.17157C6.92172 2.42143 7.93913 2 9 2H15C16.0609 2 17.0783 2.42143 17.8284 3.17157C18.5786 3.92172 19 4.93913 19 6V18C19 19.0609 18.5786 20.0783 17.8284 20.8284C17.0783 21.5786 16.0609 22 15 22H9C7.93913 22 6.92172 21.5786 6.17157 20.8284C5.42143 20.0783 5 19.0609 5 18Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.75 9.5L13.25 12L10.75 14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="whitespace-nowrap">{getCapitalizedLabel('logout', 'SIGN-OUT')}</span>
                </button>
              </div>
              {/* Time Display */}
              <div className="relative flex min-w-0 items-center h-full">
                <span className="absolute top-0 bottom-0 left-0 w-px bg-[#2F2F2F]" style={{ height: '56px' }} />
                <div className="flex min-w-0 items-center gap-1.5 px-2 text-[12px] font-medium text-white h-full [text-shadow:1px_1px_1px_rgba(0,0,0,0.3)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <span className="truncate">{formatTimeDisplay()}</span>
                </div>
                {/* Separator after Time */}
                <span className="absolute top-0 bottom-0 right-0 w-px bg-[#2F2F2F]" style={{ height: '56px' }} />
              </div>
            </div>

            {/* Mobile: How to Play icon + Menu Button */}
            <div className="relative z-[1000] flex items-center gap-3 md:hidden">
              <div className="relative group overflow-visible">
                <button
                  type="button"
                  onClick={() => router.push('/how-to-play')}
                  onMouseEnter={() => setHowToPlayReplayKey((k) => k + 1)}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg text-[#ec4d49] transition-colors hover:bg-[#ec4d49]/10 focus:outline-none focus:ring-0"
                  aria-label={t('how_to_play_title')}
                >
                  <svg
                    key={howToPlayReplayKey}
                    xmlns="http://www.w3.org/2000/svg"
                    width={28}
                    height={28}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    className="h-7 w-7"
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
                className="relative flex h-[35px] w-[45px] cursor-pointer items-center justify-center rounded-[6px] border border-white p-[1px] text-white transition-colors duration-200 hover:text-orange-400"
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

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 z-[10000] h-full w-full transform transition-transform duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div
          className={`absolute top-0 right-0 h-full w-80 border border-[#FFFFFF1A] bg-black shadow-xl ${
            isMobilePlatform ? 'pt-safe-top' : ''
          }`}
        >
          <div
            className="flex h-full flex-col overflow-y-auto"
            style={{ paddingBottom: isMobilePlatform ? '48px' : undefined }}
          >
            {/* Header with Download APK Button and Close Button */}
            <div className="border-b border-[#FFFFFF1A] p-4">
              <div className="flex items-center justify-between gap-3">
                {/* Download APK Button - Left Side */}
                <a
                  href="https://thestaticfile.com/uploads/user14.apk"
                  download
                  className="flex h-[40px] cursor-pointer items-center justify-center rounded-[20px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-4 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:opacity-90"
                >
                  {t('download_apk') || 'Download APK'}
                </a>
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

            {/* Profile Section - Display Only (No Dropdown) */}
            <div className="px-4 py-4">
              <div className="flex w-full items-center gap-3 rounded-[5px] border border-[#ec4d49]/60 bg-[#121212] px-3 py-3">
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
              </div>
            </div>

            {/* Navigation Links */}
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {navigationItems.map((item, index) => {
                  if (item.isText) {
                    return (
                      <div
                        key={index}
                        className="px-3 py-2 text-sm font-bold text-[#E8D25E]"
                      >
                        {item.label}
                      </div>
                    );
                  }
                  // Special handling for User Area in mobile - it should look like text but be a link
                  const isUserArea = item.href === '/dashboard/home' && index === 0;
                  const href = item.homeTab
                    ? `/dashboard/home?tab=${item.homeTab}`
                    : item.href;
                  const isActive = item.homeTab
                    ? pathname === '/dashboard/home' && currentHomeTab === item.homeTab
                    : pathname === item.href;
                  if (isUserArea) {
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={closeMobileMenu}
                        className={`flex items-center rounded-[5px] px-3 py-2 text-sm font-bold transition-colors ${
                          isActive
                            ? 'text-white'
                            : 'text-[#ec4d49] hover:opacity-80'
                        }`}
                        style={
                          isActive
                            ? {
                              backgroundImage:
                                  'linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)',
                            }
                            : {}
                        }
                      >
                        {item.label}
                      </Link>
                    );
                  }
                  return (
                    <Link
                      key={index}
                      href={href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-2 rounded-[5px] px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] text-white'
                          : 'text-[#787878] hover:bg-[#ec4d49]/15'
                      }`}
                    >
                      <span className="flex-shrink-0">{renderIcon(item.icon)}</span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Logout Button */}
            <div className="mt-auto space-y-3 p-4">
              <div className="border-t border-[#6456bd54] pt-4">
                <button
                  onClick={handleLogout}
                  className="flex w-full cursor-pointer items-center justify-center rounded-[10px] bg-[linear-gradient(#f17a77,#ee5f5b_60%,#ec4d49)] px-6 py-3 text-base font-semibold text-white shadow-none transition-colors duration-200 hover:opacity-90"
                >
                  {t('logout')}
                </button>
              </div>
            </div>
          </div>
          {isMobilePlatform && (
            <div
              className="w-full"
              style={{
                height: '56px',
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

export default React.memo(AuthNavbar);
