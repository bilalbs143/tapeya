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

import LazyImage from '@/dynamic-components/template6/components/LazyImage/LazyImage';
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
  const [bottomOffset, setBottomOffset] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
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

  // Enhanced positioning logic for all platforms
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

      updateAndroidOffset();

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

    // For iOS Chrome on website
    if (isWebsite && isIOS && isIOSChrome) {
      const calculateIOSChromeOffset = () => {
        try {
          const currentScrollY = window.scrollY || window.pageYOffset || 0;
          const scrollDirection =
            currentScrollY > lastScrollYRef.current ? 'down' : 'up';
          lastScrollYRef.current = currentScrollY;

          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          const isAtBottom =
            currentScrollY + windowHeight >= documentHeight - 10;
          const isNearTop = currentScrollY < 100;

          if (scrollDirection === 'down' || isAtBottom) {
            setBottomOffset(0);
          } else if (scrollDirection === 'up' && isNearTop) {
            setBottomOffset(44);
          } else {
            setBottomOffset(0);
          }
        } catch (error) {
          console.error('Error calculating iOS Chrome offset:', error);
          setBottomOffset(0);
        }
      };

      const handleScroll = () => {
        if (!isScrollingRef.current) {
          isScrollingRef.current = true;
          calculateIOSChromeOffset();

          if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
          }
          scrollTimeoutRef.current = setTimeout(() => {
            isScrollingRef.current = false;
            calculateIOSChromeOffset();
          }, 100);
        }
      };

      const handleResize = () => {
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
        resizeTimeoutRef.current = setTimeout(calculateIOSChromeOffset, 150);
      };

      calculateIOSChromeOffset();

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
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
    setIsTransitioning(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(false);
    }, 300);
  }, [dispatch]);

  const handleRegisterClick = useCallback(() => {
    setClickedButton('register');
    setTimeout(() => setClickedButton(null), 200);
    dispatch(openModal('register'));
    setIsTransitioning(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(false);
    }, 300);
  }, [dispatch]);

  const handleWithdrawalClick = useCallback(() => {
    setClickedButton('withdrawal');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/dashboard/withdrawal');
    setIsTransitioning(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(false);
    }, 300);
  }, [router]);

  const handleDepositClick = useCallback(() => {
    setClickedButton('deposit');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/dashboard/deposit');
    setIsTransitioning(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(false);
    }, 300);
  }, [router]);

  const handleSupportClick = useCallback(() => {
    openAuthModal('customerService');
  }, [openAuthModal]);

  const handleNotesClick = useCallback(() => {
    setClickedButton('notes');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/dashboard/coupon');
    setIsTransitioning(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(false);
    }, 300);
  }, [router]);

  const handleHomeClick = useCallback(() => {
    setClickedButton('home');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/');
    setIsTransitioning(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(false);
    }, 300);
  }, [router]);

  const handlePointsClick = useCallback(() => {
    setClickedButton('points');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/dashboard/coupons');
    setIsTransitioning(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(false);
    }, 300);
  }, [router]);

  const handleSlotClick = useCallback(() => {
    setClickedButton('slot');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/slot-providers');
    setIsTransitioning(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(false);
    }, 300);
  }, [router]);

  const handleCasinoClick = useCallback(() => {
    setClickedButton('casino');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/live-casino');
    setIsTransitioning(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsTransitioning(false);
    }, 300);
  }, [router]);

  const handleMainButtonClick = useCallback(() => {
    if (isExpanded) {
      // Closing - start exit animation
      setIsTransitioning(true);
      // Wait for transition to complete before hiding
      setTimeout(() => {
        setIsExpanded(false);
        setIsTransitioning(false);
      }, 300); // Match CSS transition duration
    } else {
      // Opening - show element first, then trigger enter animation
      setIsExpanded(true);
      // Small delay to ensure DOM update, then trigger animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 10);
    }
  }, [isExpanded]);

  // Fetch unread notes when authenticated
  useEffect(() => {
    if (isAuth) {
      dispatch(fetchUnreadNotes());
    }
  }, [isAuth, dispatch]);

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsTransitioning(true);
        setTimeout(() => {
          setIsExpanded(false);
          setIsTransitioning(false);
        }, 300);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Add blur effect to background when expanded
  useEffect(() => {
    if (isExpanded) {
      document.body.classList.add('floating-buttons-expanded');
    } else {
      document.body.classList.remove('floating-buttons-expanded');
    }

    return () => {
      document.body.classList.remove('floating-buttons-expanded');
    };
  }, [isExpanded]);

  const rabbitIconUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/floating-rabbit-6.svg';

  // Guest state (non-authenticated)
  if (!isAuth) {
    return (
      <>
        {/* Blur backdrop overlay */}
        <div className="floating-buttons-backdrop" />

        <div
          ref={containerRef}
          className="floating-buttons-container-new"
          style={{ bottom: `${bottomOffset}px` }}
        >
          {/* Closed State - Vertical red button with "open" text and rabbit icon */}
          {!isExpanded && (
            <button
              type="button"
              aria-label="Open Menu"
              onClick={handleMainButtonClick}
              className="floating-main-button-closed"
            >
              {/* Red vertical button with "open" text */}
              <div className="floating-open-button">
                <span className="floating-open-text">open</span>
              </div>
              {/* Rabbit icon peeking from behind on right side */}
              <div className="floating-rabbit-icon">
                <img
                  src={rabbitIconUrl}
                  alt="Rabbit"
                  className="floating-rabbit-image"
                />
              </div>
            </button>
          )}

          {/* Expanded State - Horizontal bar with Login and Register */}
          {isExpanded && (
            <div
              className={`floating-bar-expanded guest ${
                isTransitioning ? 'exiting' : ''
              }`}
            >
              {/* Close button on the left */}
              <button
                type="button"
                aria-label="Close Menu"
                onClick={handleMainButtonClick}
                className="floating-close-button"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M9 18L15 12L9 6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Login and Register buttons */}
              <div className="floating-bar-content">
                <button
                  type="button"
                  onClick={handleLoginClick}
                  className={`floating-bar-button floating-bar-button-login ${
                    clickedButton === 'login' ? 'clicked' : ''
                  }`}
                >
                  {t('login') || 'Login'}
                </button>
                <button
                  type="button"
                  onClick={handleRegisterClick}
                  className={`floating-bar-button floating-bar-button-register ${
                    clickedButton === 'register' ? 'clicked' : ''
                  }`}
                >
                  {t('register') || 'Register'}
                </button>
              </div>

              {/* Rabbit icon peeking from top-right */}
              <div className="floating-rabbit-peek">
                <img
                  src={rabbitIconUrl}
                  alt="Rabbit"
                  className="floating-rabbit-peek-image"
                />
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Authenticated state
  return (
    <>
      {/* Blur backdrop overlay */}
      <div className="floating-buttons-backdrop" />

      <div
        ref={containerRef}
        className="floating-buttons-container-new"
        style={{ bottom: `${bottomOffset}px` }}
      >
        {/* Closed State - Vertical red button with "open" text and rabbit icon */}
        {!isExpanded && (
          <button
            type="button"
            aria-label="Open Menu"
            onClick={handleMainButtonClick}
            className="floating-main-button-closed"
          >
            {/* Red vertical button with "open" text */}
            <div className="floating-open-button">
              <span className="floating-open-text">open</span>
            </div>
            {/* Rabbit icon peeking from behind on right side */}
            <div className="floating-rabbit-icon">
              <img
                src={rabbitIconUrl}
                alt="Rabbit"
                className="floating-rabbit-image"
              />
            </div>
          </button>
        )}

        {/* Expanded State - Horizontal bar with navigation items */}
        {isExpanded && (
          <div
            className={`floating-bar-expanded auth ${
              isTransitioning ? 'exiting' : ''
            }`}
          >
            {/* Close button on the left */}
            <button
              type="button"
              aria-label="Close Menu"
              onClick={handleMainButtonClick}
              className="floating-close-button"
            >
              <svg
                width="6"
                height="13"
                viewBox="0 0 6 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.5 0.5L4.37868 4.37868C5.55025 5.55025 5.55025 7.44975 4.37868 8.62132L0.5 12.5"
                  stroke="white"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* Navigation buttons inline */}
            <div className="floating-bar-content">
              <button
                type="button"
                onClick={handleHomeClick}
                className={`floating-nav-button ${
                  clickedButton === 'home' ? 'clicked' : ''
                }`}
              >
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/home-5.svg"
                  alt={t('home') || 'Home'}
                  className="floating-nav-icon"
                />
                <span className="floating-nav-text">{t('home') || 'Home'}</span>
              </button>

              <button
                type="button"
                onClick={handleCasinoClick}
                className={`floating-nav-button floating-nav-button-casino ${
                  clickedButton === 'casino' ? 'clicked' : ''
                }`}
              >
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-floating-icon.png"
                  alt={t('casino') || 'Casino'}
                  className="floating-nav-icon"
                />
                <span className="floating-nav-text">
                  {t('casino') || 'Casino'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleSlotClick}
                className={`floating-nav-button floating-nav-button-slot ${
                  clickedButton === 'slot' ? 'clicked' : ''
                }`}
              >
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-floating-icon.png"
                  alt={t('slot') || 'Slot'}
                  className="floating-nav-icon"
                />
                <span className="floating-nav-text capitalize">
                  {t('slot') || 'Slot'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleWithdrawalClick}
                className={`floating-nav-button ${
                  clickedButton === 'withdrawal' ? 'clicked' : ''
                }`}
              >
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/withdrawal-5.svg"
                  alt={t('withdrawal') || 'Withdraw'}
                  className="floating-nav-icon"
                />
                <span className="floating-nav-text">
                  {t('withdrawal') || 'Withdraw'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleDepositClick}
                className={`floating-nav-button ${
                  clickedButton === 'deposit' ? 'clicked' : ''
                }`}
              >
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/deposit-5.svg"
                  alt={t('deposit')}
                  className="floating-nav-icon"
                />
                <span className="floating-nav-text">{t('deposit')}</span>
              </button>

              <button
                type="button"
                onClick={handlePointsClick}
                className={`floating-nav-button ${
                  clickedButton === 'points' ? 'clicked' : ''
                }`}
              >
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/points-5.svg"
                  alt={t('points') || 'Points'}
                  className="floating-nav-icon"
                />
                <span className="floating-nav-text">
                  {t('points') || 'Points'}
                </span>
              </button>
            </div>

            {/* Rabbit icon peeking from top-right */}
            <div className="floating-rabbit-peek">
              <img
                src={rabbitIconUrl}
                alt="Rabbit"
                className="floating-rabbit-peek-image"
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingButtons;
