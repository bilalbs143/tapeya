'use client';

import { useRouter } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import LazyImage from '@/dynamic-components/template1/components/LazyImage/LazyImage.jsx';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useMobilePlatform } from '@/hooks/useMobilePlatform';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';
import { fetchUnreadNotes } from '@/website/websiteAction';

const FloatingButtons = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const { t } = useTranslations();
  const { openAuthModal } = useAuthModal();
  const {
    isMobilePlatform,
    isAndroid,
    isIOS,
    hasNavigationBar,
    navigationBarHeight,
  } = useMobilePlatform();
  const [clickedButton, setClickedButton] = useState(null);
  const [showGif, setShowGif] = useState(true);
  const [bottomOffset, setBottomOffset] = useState(0);
  const containerRef = useRef(null);
  const resizeTimeoutRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const isScrollingRef = useRef(false);

  // Detect iOS Chrome specifically
  const isIOSChrome = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || navigator.vendor;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isCriOS = /CriOS\//.test(ua);
    return isIOS && isCriOS;
  }, []);

  // Detect if we're on website (not APK)
  const isWebsite = useMemo(() => {
    return !isMobilePlatform;
  }, [isMobilePlatform]);

  // Enhanced positioning logic for all platforms - APPLIES TO BOTH GUEST AND AUTH STATES
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    // For Android APK - use existing navigation bar logic
    if (isMobilePlatform && isAndroid) {
      const updateAndroidOffset = () => {
        try {
          if (hasNavigationBar) {
            const buffer = 8;
            const calculatedOffset = Math.max(navigationBarHeight + buffer, 0);
            setBottomOffset(calculatedOffset);

            if (process.env.NODE_ENV === 'development') {
              console.log('Android APK FloatingButtons positioning:', {
                hasNavigationBar,
                navigationBarHeight,
                calculatedOffset,
              });
            }
          } else {
            setBottomOffset(0);
          }
        } catch (error) {
          console.error('Error updating Android APK offset:', error);
          setBottomOffset(0);
        }
      };

      const handleResize = () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = setTimeout(updateAndroidOffset, 150);
      };

      // Initial calculation
      updateAndroidOffset();

      // Set up event listeners
      window.addEventListener('resize', handleResize);
      document.addEventListener('visibilitychange', updateAndroidOffset);
      document.addEventListener('fullscreenchange', updateAndroidOffset);
      document.addEventListener('webkitfullscreenchange', updateAndroidOffset);

      return () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        window.removeEventListener('resize', handleResize);
        document.removeEventListener('visibilitychange', updateAndroidOffset);
        document.removeEventListener('fullscreenchange', updateAndroidOffset);
        document.removeEventListener(
          'webkitfullscreenchange',
          updateAndroidOffset,
        );
      };
    }

    // For iOS Chrome on website - use visualViewport to align with dynamic bottom bar
    if (isWebsite && isIOS && isIOSChrome) {
      const calculateIOSChromeOffset = () => {
        try {
          const vv = window.visualViewport;
          if (vv) {
            const layoutHeight = window.innerHeight;
            const visualHeight = vv.height;
            const visualOffsetTop = vv.offsetTop || 0;

            // Gap occupied by the browser's bottom bar when visible
            const rawGap = layoutHeight - (visualHeight + visualOffsetTop);

            // Snap tiny values to zero to ensure we stick flush when bar hides
            const browserUIGap = Math.max(0, Math.round(rawGap));

            // Read safe area as baseline (usually 0 on iOS Chrome)
            const safeAreaBottom = parseInt(
              getComputedStyle(document.documentElement).getPropertyValue(
                '--safe-area-inset-bottom',
              ) || '0',
              10,
            );

            if (browserUIGap <= 2) {
              // Bottom bar hidden -> stick to screen bottom
              setBottomOffset(0);
            } else {
              // Bottom bar visible -> lift exactly by its height (minus safe area)
              setBottomOffset(Math.max(0, browserUIGap - safeAreaBottom));
            }
          } else {
            // Fallback: no gap
            setBottomOffset(0);
          }
        } catch (error) {
          console.error('Error calculating iOS Chrome offset:', error);
          setBottomOffset(0);
        }
      };

      const handleScroll = () => {
        // visualViewport doesn't always fire while scrolling, so recompute here too
        if (!isScrollingRef.current) {
          isScrollingRef.current = true;
          calculateIOSChromeOffset();
          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
          scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
            calculateIOSChromeOffset();
          }, 100);
        }
      };

      const handleResize = () => {
        if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = setTimeout(calculateIOSChromeOffset, 120);
      };

      // Initial calculation
      calculateIOSChromeOffset();

      // Event listeners
      const vv = window.visualViewport;
      if (vv) {
        vv.addEventListener('resize', calculateIOSChromeOffset);
        vv.addEventListener('scroll', calculateIOSChromeOffset);
      }
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
        if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
        if (vv) {
          vv.removeEventListener('resize', calculateIOSChromeOffset);
          vv.removeEventListener('scroll', calculateIOSChromeOffset);
        }
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }

    // For other iOS browsers (Safari) on website
    if (isWebsite && isIOS) {
      const calculateSafariOffset = () => {
        try {
          const vv = window.visualViewport;
          if (vv) {
            const layoutHeight = window.innerHeight;
            const visualHeight = vv.height;
            const visualOffsetTop = vv.offsetTop || 0;

            const browserUIGap =
              layoutHeight - (visualHeight + visualOffsetTop);
            const safeAreaBottom = parseInt(
              getComputedStyle(document.documentElement).getPropertyValue(
                '--safe-area-inset-bottom',
              ) || '0',
              10,
            );

            if (browserUIGap > safeAreaBottom + 5) {
              setBottomOffset(browserUIGap - safeAreaBottom);
            } else {
              setBottomOffset(0);
            }
          } else {
            // Fallback for Safari without visualViewport
            const safeAreaBottom = parseInt(
              getComputedStyle(document.documentElement).getPropertyValue(
                '--safe-area-inset-bottom',
              ) || '0',
              10,
            );
            setBottomOffset(Math.max(safeAreaBottom, 0));
          }
        } catch (error) {
          console.error('Error calculating Safari offset:', error);
          setBottomOffset(0);
        }
      };

      const handleResize = () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = setTimeout(calculateSafariOffset, 150);
      };

      const vv = window.visualViewport;
      if (vv) {
        vv.addEventListener('resize', calculateSafariOffset);
        vv.addEventListener('scroll', calculateSafariOffset);
      }

      calculateSafariOffset();
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        if (vv) {
          vv.removeEventListener('resize', calculateSafariOffset);
          vv.removeEventListener('scroll', calculateSafariOffset);
        }
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }

    // For other browsers and platforms - default to 0 offset
    setBottomOffset(0);
    return undefined;
  }, [
    isMobilePlatform,
    isAndroid,
    isWebsite,
    isIOS,
    isIOSChrome,
    hasNavigationBar,
    navigationBarHeight,
  ]);

  // Unread notes counter
  const helpUnreadCount = useSelector((state) => {
    const unread = state.website?.unreadNotesData;
    if (!Array.isArray(unread)) return 0;
    const unreadNotes = unread.filter((note) => !note.read_at);
    return unreadNotes.length;
  });

  const handleLoginClick = useCallback(() => {
    setClickedButton('login');
    setTimeout(() => setClickedButton(null), 200);
    dispatch(openModal('login'));
  }, [dispatch]);

  const handleRegisterClick = useCallback(() => {
    setClickedButton('register');
    setTimeout(() => setClickedButton(null), 200);
    dispatch(openModal('register'));
  }, [dispatch]);

  const handleWithdrawalClick = useCallback(() => {
    openAuthModal({
      modal: 'transaction',
      props: { defaultTab: 'withdrawal' },
    });
  }, [openAuthModal]);

  const handleDepositClick = useCallback(() => {
    openAuthModal({
      modal: 'transaction',
      props: { defaultTab: 'deposit' },
    });
  }, [openAuthModal]);

  const handleSupportClick = useCallback(() => {
    openAuthModal('customerService');
  }, [openAuthModal]);

  const handleNotesClick = useCallback(() => {
    dispatch(
      openModal({ modal: 'customerService', props: { defaultTab: 'note' } }),
    );
  }, [dispatch]);

  const handleHomeClick = useCallback(() => {
    router.push('/');
  }, [router]);

  // CONSISTENT container style for BOTH guest and auth states
  const containerStyle = useMemo(() => {
    const baseStyle = {
      background: 'rgba(0, 6, 55, 0.90)',
      position: 'fixed',
      left: 0,
      right: 0,
      width: '100%',
      borderTop: '1px solid #FC7E09',
      zIndex: 10,
    };

    // iOS Chrome on website - dynamic positioning with smooth transition
    if (isWebsite && isIOS && isIOSChrome) {
      return {
        ...baseStyle,
        bottom: `${bottomOffset}px`,
        transition: 'bottom 150ms ease-out',
      };
    }

    // Android APK - fixed positioning with navigation bar offset
    if (isMobilePlatform && isAndroid) {
      return {
        ...baseStyle,
        bottom: `${bottomOffset}px`,
      };
    }

    // Other iOS browsers (Safari) on website
    if (isWebsite && isIOS) {
      return {
        ...baseStyle,
        bottom: `${bottomOffset}px`,
        transition: 'bottom 120ms ease-out',
      };
    }

    // Default - stick to bottom with safe area
    return {
      ...baseStyle,
      bottom: 0,
    };
  }, [
    isWebsite,
    isIOS,
    isIOSChrome,
    isMobilePlatform,
    isAndroid,
    bottomOffset,
  ]);

  const homeButtonOuterStyle = useMemo(
    () => ({
      background: 'rgba(252, 126, 9, 0.40)',
      filter: 'blur(4px)',
      width: '78px',
      height: '78px',
    }),
    [],
  );

  const homeButtonInnerStyle = useMemo(
    () => ({
      border: '1px solid #FCB000',
      background: 'rgba(252, 126, 9, 0.70)',
      boxShadow:
        '-3px -4px 4px 0 rgba(0, 0, 0, 0.25) inset, 0 4px 4px 0 rgba(0, 0, 0, 0.25), 4px 7px 4px 0 rgba(0, 0, 0, 0.25) inset',
      width: '65px',
      height: '65px',
    }),
    [],
  );

  // GIF animation cycle - show for 5 seconds, hide for 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setShowGif((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fetch unread notes when authenticated
  useEffect(() => {
    if (isAuth) {
      dispatch(fetchUnreadNotes());
    }
  }, [isAuth, dispatch]);

  // Guest state (non-authenticated) - USING SAME CONTAINER STYLE AND LOGIC
  if (!isAuth) {
    return (
      <div
        ref={containerRef}
        className="fixed right-0 left-0 z-10 md:hidden"
        style={containerStyle}
      >
        <div className="grid grid-cols-2 gap-0">
          <button
            type="button"
            aria-label="Login"
            onClick={handleLoginClick}
            className={`floating-auth-login flex h-[60px] w-full cursor-pointer items-center justify-center border-r border-[#FC7E09] text-[16px] font-medium text-white transition-all duration-150 active:scale-95 active:shadow-inner ${
              clickedButton === 'login' ? 'bg-[#5343B1]' : ''
            }`}
          >
            Login
          </button>

          <button
            type="button"
            aria-label="Register"
            onClick={handleRegisterClick}
            className={`floating-auth-register flex h-[60px] w-full cursor-pointer items-center justify-center text-[16px] font-medium text-white transition-all duration-150 active:scale-95 active:shadow-inner ${
              clickedButton === 'register' ? 'bg-[#f59333]' : ''
            }`}
          >
            Register
          </button>
        </div>
      </div>
    );
  }

  // Authenticated state - USING SAME CONTAINER STYLE AND LOGIC
  return (
    <div
      ref={containerRef}
      className="fixed right-0 left-0 z-10 md:hidden"
      style={containerStyle}
    >
      <div className="grid grid-cols-5 gap-0">
        <button
          type="button"
          aria-label={t('notes')}
          onClick={handleNotesClick}
          className="flex h-[75px] w-full cursor-pointer flex-col items-center justify-center text-[10px] font-medium text-white transition-all duration-150 hover:bg-[#FC7E09] focus:bg-[#FC7E09] active:scale-95 active:bg-[#FC7E09] active:shadow-inner"
        >
          <div className="relative">
            <LazyImage
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/question-icon.svg"
              alt={t('notes')}
              width={28}
              height={28}
            />
            {helpUnreadCount > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4 min-w-[16px] place-items-center rounded-full bg-[#FC7E09] px-1 text-[10px] leading-none text-white">
                {helpUnreadCount > 99 ? '99+' : helpUnreadCount}
              </span>
            )}
          </div>
          <span className="mt-1">{t('notes')}</span>
        </button>

        <button
          type="button"
          aria-label={t('withdrawal')}
          onClick={handleWithdrawalClick}
          className="flex h-[75px] w-full cursor-pointer flex-col items-center justify-center text-[10px] font-medium text-white transition-all duration-150 hover:bg-[#FC7E09] focus:bg-[#FC7E09] active:scale-95 active:bg-[#FC7E09] active:shadow-inner"
        >
          <LazyImage
            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/info-icon.svg"
            alt={t('withdrawal')}
            width={28}
            height={28}
          />
          <span className="mt-1">{t('withdrawal')}</span>
        </button>

        <button
          type="button"
          aria-label="Home"
          onClick={handleHomeClick}
          className="relative flex h-[75px] w-full cursor-pointer flex-col items-center justify-center text-[10px] font-medium text-white transition-all duration-150 active:scale-95 active:bg-[#FC7E09] active:shadow-inner"
        >
          {/* Outer blurry circle border */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rounded-full"
            style={homeButtonOuterStyle}
          />

          {/* Inner bordered circle */}
          <div
            className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 transform items-center justify-center rounded-full"
            style={homeButtonInnerStyle}
          >
            {/* WiFi Loader with smooth fade transition */}
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                showGif ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div id="wifi-loader">
                <svg className="circle-outer" viewBox="0 0 86 86">
                  <circle className="back" cx="43" cy="43" r="40" />
                  <circle className="front" cx="43" cy="43" r="40" />
                  <circle className="new" cx="43" cy="43" r="40" />
                </svg>
                <svg className="circle-middle" viewBox="0 0 60 60">
                  <circle className="back" cx="30" cy="30" r="27" />
                  <circle className="front" cx="30" cy="30" r="27" />
                </svg>
                <svg className="circle-inner" viewBox="0 0 34 34">
                  <circle className="back" cx="17" cy="17" r="14" />
                  <circle className="front" cx="17" cy="17" r="14" />
                </svg>
              </div>
            </div>

            {/* Default icon with smooth fade transition */}
            <div
              className={`flex items-center justify-center transition-opacity duration-500 ${
                showGif ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/floating-center.svg"
                alt={t('deposit')}
                width={37}
                height={32}
                className="animate-float"
              />
            </div>
          </div>
        </button>

        <button
          type="button"
          aria-label={t('deposit')}
          onClick={handleDepositClick}
          className="flex h-[75px] w-full cursor-pointer flex-col items-center justify-center text-[10px] font-medium text-white transition-all duration-150 hover:bg-[#FC7E09] focus:bg-[#FC7E09] active:scale-95 active:bg-[#FC7E09] active:shadow-inner"
        >
          <LazyImage
            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/nav-pr-1.svg"
            alt={t('deposit')}
            width={28}
            height={28}
          />
          <span className="mt-1">{t('deposit')}</span>
        </button>

        <button
          type="button"
          aria-label={t('support')}
          onClick={handleSupportClick}
          className="flex h-[75px] w-full cursor-pointer flex-col items-center justify-center text-[10px] font-medium text-white transition-all duration-150 hover:bg-[#FC7E09] focus:bg-[#FC7E09] active:scale-95 active:bg-[#FC7E09] active:shadow-inner"
        >
          <LazyImage
            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user-chat-icon.svg"
            alt={t('support')}
            width={28}
            height={28}
          />
          <span className="mt-1">{t('support')}</span>
        </button>
      </div>
    </div>
  );
};

export default FloatingButtons;
