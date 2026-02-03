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

import LazyImage from '@/dynamic-components/template4/components/LazyImage/LazyImage';
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
  const [isExpanded, setIsExpanded] = useState(false);
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

    // For iOS Chrome on website - aggressive bottom sticking with scroll detection
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

          // Always stick to bottom when scrolling down or at bottom
          if (scrollDirection === 'down' || isAtBottom) {
            setBottomOffset(0);
          }
          // When scrolling up, only add offset if we're near the top
          else if (scrollDirection === 'up' && isNearTop) {
            setBottomOffset(44); // iOS Chrome bottom bar height
          }
          // Default to bottom when not near top
          else {
            setBottomOffset(0);
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('iOS Chrome FloatingButtons positioning:', {
              currentScrollY,
              scrollDirection,
              isAtBottom,
              isNearTop,
              bottomOffset,
            });
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

          // Debounce scroll events
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

      // Initial calculation
      calculateIOSChromeOffset();

      // Event listeners
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
    setIsExpanded(false);
  }, [dispatch]);

  const handleRegisterClick = useCallback(() => {
    setClickedButton('register');
    setTimeout(() => setClickedButton(null), 200);
    dispatch(openModal('register'));
    setIsExpanded(false);
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

  const handleMainButtonClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

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

  // Close expanded menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsExpanded(false);
      }
    };

    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isExpanded]);

  // Guest state (non-authenticated) - New floating button design
  if (!isAuth) {
    return (
      <div ref={containerRef} className="floating-buttons-container">
        {/* Expanding backdrop behind buttons (guest) */}
        <div
          className={`floating-backdrop guest ${isExpanded ? 'expanded' : ''}`}
        />
        {/* Login Button - appears upward */}
        <div
          className={`floating-button-wrapper upward floating-button-login ${
            isExpanded ? 'expanded' : 'collapsed'
          }`}
        >
          <button
            type="button"
            aria-label="Login"
            onClick={handleLoginClick}
            className={`floating-button ${
              clickedButton === 'login' ? 'clicked' : ''
            }`}
          >
            <div className="floating-button-inner">
              <div className="floating-button-content">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="floating-button-icon"
                >
                  <path
                    d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-5-4l5-5-5-5m5 5H3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="floating-button-text">Sign In</span>
              </div>
            </div>
          </button>
        </div>

        {/* Register Button - appears downward */}
        <div
          className={`floating-button-wrapper downward floating-button-register ${
            isExpanded ? 'expanded' : 'collapsed'
          }`}
        >
          <button
            type="button"
            aria-label="Register"
            onClick={handleRegisterClick}
            className={`floating-button ${
              clickedButton === 'register' ? 'clicked' : ''
            }`}
          >
            <div className="floating-button-inner">
              <div className="floating-button-content">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="floating-button-icon"
                >
                  <path
                    d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 8v6m3-3h-6"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="floating-button-text">Register</span>
              </div>
            </div>
          </button>
        </div>

        {/* Main Button */}
        <button
          type="button"
          aria-label={isExpanded ? 'Close' : 'Menu'}
          onClick={handleMainButtonClick}
          className="floating-main-button"
        >
          <span className="rotating-gradient-border" aria-hidden="true" />
          {isExpanded ? (
            <div className="floating-main-button-inner">
              <svg
                className="floating-close-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M6 6l12 12"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M18 6L6 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          ) : (
            <div className="floating-main-button-inner with-gif">
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/floating-logo-4.svg"
                alt="Floating Logo"
                className="floating-logo floating-logo-rotator"
              />
            </div>
          )}
        </button>
      </div>
    );
  }

  // Authenticated state - New floating button design
  return (
    <div ref={containerRef} className="floating-buttons-container">
      {/* Expanding backdrop behind buttons (auth) */}
      <div
        className={`floating-backdrop auth ${isExpanded ? 'expanded' : ''}`}
      />
      {/* Deposit Button - appears upward */}
      <div
        className={`floating-button-wrapper upward floating-button-deposit ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <button
          type="button"
          aria-label={t('deposit')}
          onClick={handleDepositClick}
          className={`floating-button ${
            clickedButton === 'deposit' ? 'clicked' : ''
          }`}
        >
          <div className="floating-button-inner">
            <div className="floating-button-content">
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/with-4.svg"
                alt={t('deposit')}
                width="30"
                height="30"
                className="floating-button-icon"
              />
              <span className="floating-button-text">{t('deposit')}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Withdrawal Button - appears upward */}
      <div
        className={`floating-button-wrapper upward floating-button-withdrawal ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <button
          type="button"
          aria-label={t('withdrawal')}
          onClick={handleWithdrawalClick}
          className={`floating-button ${
            clickedButton === 'withdrawal' ? 'clicked' : ''
          }`}
        >
          <div className="floating-button-inner">
            <div className="floating-button-content">
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/info-icon-4.svg"
                alt={t('withdrawal')}
                width="20"
                height="20"
                className="floating-button-icon"
              />
              <span className="floating-button-text">{t('withdrawal')}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Inquiry Button - appears downward */}
      <div
        className={`floating-button-wrapper downward floating-button-support ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <button
          type="button"
          aria-label={t('support')}
          onClick={handleSupportClick}
          className={`floating-button ${
            clickedButton === 'support' ? 'clicked' : ''
          }`}
        >
          <div className="floating-button-inner">
            <div className="floating-button-content">
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user-chat-icon-4.svg"
                alt={t('support')}
                width="20"
                height="20"
                className="floating-button-icon"
              />
              <span className="floating-button-text">{t('support')}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Notes Button - appears downward */}
      <div
        className={`floating-button-wrapper downward floating-button-notes ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <button
          type="button"
          aria-label={t('notes')}
          onClick={handleNotesClick}
          className={`floating-button ${
            clickedButton === 'notes' ? 'clicked' : ''
          }`}
        >
          <div className="floating-button-inner">
            <div className="floating-button-content">
              <div className="relative">
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/question-icon-4.svg"
                  alt={t('notes')}
                  width="20"
                  height="20"
                  className="floating-button-icon"
                />
                <span className="floating-notes-badge">
                  {helpUnreadCount > 99 ? '99+' : helpUnreadCount}
                </span>
              </div>
              <span className="floating-button-text">{t('notes')}</span>
            </div>
          </div>
        </button>
      </div>

      {/* Main Button */}
      <button
        type="button"
        aria-label={isExpanded ? 'Close' : 'Menu'}
        onClick={handleMainButtonClick}
        className="floating-main-button"
      >
        <span className="rotating-gradient-border" aria-hidden="true" />
        {isExpanded ? (
          <div className="floating-main-button-inner">
            <svg
              className="floating-close-icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18 6L6 18"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          <div className="floating-main-button-inner with-gif">
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/floating-logo-4.svg"
              alt="Floating Logo"
              className="floating-logo floating-logo-rotator"
            />
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingButtons;
