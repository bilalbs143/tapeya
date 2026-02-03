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
    setClickedButton('withdrawal');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/dashboard/withdrawal');
    setIsExpanded(false);
  }, [router]);

  const handleDepositClick = useCallback(() => {
    setClickedButton('deposit');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/dashboard/deposit');
    setIsExpanded(false);
  }, [router]);

  const handleSupportClick = useCallback(() => {
    openAuthModal('customerService');
    setIsExpanded(false);
  }, [openAuthModal]);

  const handleNotesClick = useCallback(() => {
    setClickedButton('notes');
    setTimeout(() => setClickedButton(null), 200);
    dispatch(
      openModal({ modal: 'customerService', props: { defaultTab: 'note' } }),
    );
    setIsExpanded(false);
  }, [dispatch]);

  const handleHomeClick = useCallback(() => {
    setClickedButton('home');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/');
    setIsExpanded(false);
  }, [router]);

  const handlePointsClick = useCallback(() => {
    setClickedButton('points');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/dashboard/coupons');
    setIsExpanded(false);
  }, [router]);

  const handleSlotClick = useCallback(() => {
    setClickedButton('slot');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/slots');
    setIsExpanded(false);
  }, [router]);

  const handleCasinoClick = useCallback(() => {
    setClickedButton('casino');
    setTimeout(() => setClickedButton(null), 200);
    router.push('/live-casino');
    setIsExpanded(false);
  }, [router]);

  const handleMainButtonClick = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  // Helper function to capitalize text (first letter uppercase, rest lowercase)
  const capitalize = useCallback((str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }, []);

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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 37 37"
                fill="none"
                className="floating-button-icon"
                width="25"
                height="25"
              >
                <path
                  fill="#2DFA1A"
                  d="m7.605 4.742.233-.001H9.155c.447-.002.893-.001 1.339 0a548.634 548.634 0 0 0 1.245 0H20.959l1.087-.001a372.1 372.1 0 0 1 2 0c.245 0 .49 0 .734.002l.213-.001c1.035.008 1.915.373 2.663 1.085.619.634 1.101 1.437 1.122 2.35l.004.174.004.188.004.193c.005.203.01.406.013.61l.01.413.022 1.014.19.07.253.095.25.094c1.024.425 1.755 1.181 2.218 2.182.172.42.279.763.266 1.219v.238c-.001.165-.005.33-.01.494.001.242.01.436.085.666.17.159.33.25.54.348.581.274.968.907 1.188 1.488.187.665.184 1.323.18 2.008-.002.203 0 .405 0 .608.002 1.02-.086 1.844-.68 2.703l-.126.194c-.325.334-.714.643-1.174.745l.004.157c.04 1.575-.047 2.68-1.174 3.872-.816.78-1.859 1.247-2.994 1.26l-.236.002-.252.002a1279.517 1279.517 0 0 1-2.177.013l-.252.004c-.475-.001-.774-.034-1.158-.324-.272-.349-.332-.617-.312-1.057.046-.335.168-.535.407-.768.461-.3.903-.29 1.435-.29l.48-.005c.25-.001.501-.003.752-.003.243 0 .486-.003.729-.006l.224.001c.635-.008 1.243-.156 1.705-.618.239-.324.366-.57.384-.972l.01-.185.008-.193a3332.242 3332.242 0 0 1 .032-.673l-.233.004c-.288.006-.577.009-.866.012l-.373.006c-1.061.02-1.887-.095-2.72-.817-.58-.597-.943-1.298-.95-2.141l-.003-.195v-.208l-.002-.217-.001-.454c-.001-.23-.003-.459-.006-.688v-.443c-.002-.068-.002-.136-.003-.206.003-.906.327-1.668.943-2.331.65-.614 1.415-.876 2.294-.864h.168l.523.005.358.002.87.007c-.008-.197-.018-.395-.028-.593l-.007-.169c-.03-.554-.154-.902-.565-1.284-.448-.353-.937-.492-1.504-.492h-.727l-.564-.001h-.918c-.444-.002-.889-.002-1.334-.002l-2.11-.003-.722-.002a3371.121 3371.121 0 0 0-2.238-.003h-.19l-3.04-.004c-1.04 0-2.082-.002-3.124-.004-.641-.002-1.283-.003-1.925-.002-.44 0-.88 0-1.321-.003h-.76c-2.237.005-2.237.005-3.131-.473.003 1.646.007 3.292.013 4.938l.007 2.292c0 .667.002 1.333.006 2l.002 1.057c0 .332.001.665.004.997v.365c-.012 1.03-.012 1.03.444 1.927.564.554 1.283.63 2.036.625l.26.002c.273.002.546.002.819.002.273 0 .547 0 .82.003h.509c.5.004.9.026 1.292.37l.102.128.106.129c.185.273.182.527.156.847-.13.38-.306.646-.65.867-.226.075-.386.083-.623.085l-.252.003a216.76 216.76 0 0 1-1.151.006c-.202 0-.403.002-.605.004-1.757.02-3.221-.057-4.56-1.346-.817-.89-1.131-1.87-1.13-3.058v-.21a310.88 310.88 0 0 1-.003-1.197 990.467 990.467 0 0 1-.002-2.206l-.002-2.352v-.763l-.003-2.453A1325.314 1325.314 0 0 1 3.01 11.7a324.706 324.706 0 0 1-.002-1.82c-.006-1.597.202-2.73 1.308-3.947.3-.292.644-.485 1.014-.676l.138-.072c.68-.333 1.385-.448 2.137-.443ZM5.71 7.949c-.247.405-.345.798-.27 1.269.161.541.5.878.968 1.174.467.238.876.251 1.39.248a185.771 185.771 0 0 0 1.612 0c.411 0 .822 0 1.233-.002l1.783-.001a2788.084 2788.084 0 0 0 5.701-.006h1.045l7.206-.008c.007-.34.012-.679.016-1.018l.006-.346c.032-.88.032-.88-.311-1.671-.123-.134-.123-.134-.258-.212l-.126-.084c-.221-.119-.404-.147-.65-.147l-.194-.001h-.213l-.226-.001-.754-.001-.539-.002-1.62-.003h-.764a3026.065 3026.065 0 0 0-3.198-.004h-.165c-.884 0-1.767-.003-2.651-.005-.908-.002-1.815-.004-2.723-.004-.51 0-1.019 0-1.528-.002-.48-.002-.959-.002-1.438-.002l-.528-.001h-.72l-.21-.002c-.735.007-1.396.258-1.874.832Zm21.246 10.406c-.116.233-.087.488-.09.745a577.997 577.997 0 0 0-.013 1.508l-.004.174c.002.38.072.596.324.898.18.09.305.083.507.086l.229.003c.345.004.69.007 1.036.008l.547.006c.262.004.525.006.788.007l.246.005c.458.002.458.002.852-.213.22-.322.216-.608.218-.986l.001-.171.001-.36.006-.547v-.349l.003-.165c0-.327-.038-.535-.243-.793-.22-.197-.36-.244-.653-.247l-.22-.004h-.235l-.243-.001-.51-.001c-.26 0-.52-.003-.78-.006h-.495l-.235-.004c-.475.004-.713.05-1.037.407Z"
                />
                <path
                  fill="#2DFA1A"
                  d="M18.378 23.97c.268.23.455.422.511.776.013.214.016.427.016.641l.004.237c.004.248.005.496.007.744l.006.506c.005.412.01.825.012 1.237l.179-.197.236-.257.117-.13c.381-.415.693-.725 1.279-.757.363.02.572.11.862.33.265.306.383.608.362 1.011-.085.387-.197.606-.47.89l-.105.109a855.674 855.674 0 0 0-.66.678c-.272.278-.546.555-.821.83l-.515.52-.33.332-.154.156c-.353.351-.681.635-1.204.636l-.174.004c-.6-.112-1.005-.599-1.417-1.012l-.205-.204-.426-.426c-.18-.182-.362-.362-.544-.542-.176-.173-.35-.348-.523-.522l-.197-.194c-.406-.41-.734-.773-.819-1.363.06-.415.206-.718.51-1.007.25-.16.451-.2.741-.208l.182-.008c.47.075.806.48 1.124.807l.13.132.312.32.003-.283a201.779 201.779 0 0 1 .022-1.494l.01-.65.002-.202c.01-.47.066-.901.374-1.277l.127-.1.126-.104c.409-.254.9-.168 1.31.04Z"
                />
              </svg>
              <span className="floating-button-text">
                {capitalize(t('deposit'))}
              </span>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 37 37"
                fill="none"
                className="floating-button-icon"
                width="25"
                height="25"
              >
                <g fill="#2DFA1A" clipPath="url(#withdrawal-clip)">
                  <path d="M3.622 4.615h.158a177.64 177.64 0 0 1 .906 0l1.047-.002h1.128a3076.502 3076.502 0 0 1 4.01-.003l4.264-.002H16.52c1.486 0 2.972-.002 4.458-.004a4255.683 4255.683 0 0 1 7.146-.004 933.377 933.377 0 0 1 3.304-.002 193.612 193.612 0 0 1 1.392 0c.628-.003 1.203.006 1.795.244l.198.072a3.901 3.901 0 0 1 1.993 2.154c.148.435.205.805.205 1.265a105.682 105.682 0 0 1 .002.8l.001.44.003 1.197.001.748.003 2.338c0 .9.003 1.801.006 2.702.002.695.003 1.391.003 2.087l.003 1.247c.002.39.002.781.001 1.172l.001.43c.002.197.001.392 0 .588l.003.173c-.003.269-.028.422-.176.65-.263.257-.483.248-.839.246-.18-.026-.18-.026-.4-.193-.233-.322-.223-.602-.222-.984v-.178L35.4 21.2v-.426l-.002-.918-.003-1.453-.001-.498-.001-.251a1817.11 1817.11 0 0 1-.006-3.384l-.005-2.281c-.002-.403-.003-.805-.002-1.208 0-.379-.001-.757-.003-1.136v-.416c.003-.918-.024-1.675-.684-2.381a2.359 2.359 0 0 0-1.586-.57l-.154-.001h-.518a774.922 774.922 0 0 1-1.4-.003l-1.107-.001-2.675-.003-1.26-.001-4.185-.003H20.448c-1.458 0-2.917-.003-4.375-.005-1.497-.003-2.994-.004-4.49-.004-.841 0-1.682 0-2.523-.003-.715-.001-1.431-.002-2.147-.001l-1.096-.001c-.335-.002-.67-.002-1.004 0l-.362-.001c-.861-.006-1.572.068-2.228.681a2.35 2.35 0 0 0-.576 1.505l-.004.26-.004.278-.004.286-.011.752-.012.767-.022 1.505h.16c1.287-.005 2.574-.009 3.862-.011l1.867-.005c.543-.002 1.086-.004 1.63-.004l.86-.003c.272-.001.543-.002.814-.001l.436-.003c1.197.004 2.26.3 3.139 1.144.758.831 1.113 1.772 1.118 2.89l.002.158.002.515v.178l.002.938c0 .321.002.642.004.962a142.583 142.583 0 0 1 .004 1.1c.01 1.342-.223 2.486-1.181 3.488-.782.712-1.697 1.093-2.76 1.093h-.267l-.29-.001H9.85l-.872-.001-1.649-.002-1.878-.002-3.862-.003c.003.543.007 1.087.013 1.63l.006.757c.002.291.005.582.01.873v.272c.012.75.167 1.348.688 1.905.382.324.886.57 1.39.57h.61l.726.001h.519a1044.14 1044.14 0 0 1 2.89.004c.201.002.403.002.605.002H9.2l1.723.004h.159c.85.002 1.701.003 2.552.003l2.62.005c.49.002.98.003 1.47.002.462 0 .923.001 1.384.003h.508c.231 0 .462 0 .693.002l.204-.002c.4.005.635.057.95.328.178.268.194.485.144.795-.216.398-.216.398-.433.506-.1.007-.199.01-.298.01h-.623l-.742.002h-.531c-.482.002-.963.002-1.445.002a2718.035 2718.035 0 0 0-3.402.003h-.812c-.87 0-1.74.002-2.61.004a1496.987 1496.987 0 0 1-4.186.004 334.38 334.38 0 0 1-1.935.002h-.71l-.207.001c-1.03-.007-1.901-.453-2.64-1.154-.607-.64-1.041-1.453-1.042-2.351l-.001-.228v-.516l-.002-.73v-.788a1491.781 1491.781 0 0 1-.003-2.799l-.002-2.98v-.966c0-1.038-.002-2.075-.004-3.113a2088.202 2088.202 0 0 1-.004-4.99 455.062 455.062 0 0 1-.002-2.307v-.846l-.001-.247c.003-.495.074-.914.245-1.378l.072-.198a3.901 3.901 0 0 1 2.154-1.993c.125-.042.25-.083.375-.122l.124-.039c.228-.046.447-.042.68-.043Zm-2.032 9.26v9.25l3.506.007a1278.963 1278.963 0 0 1 3.709.007l.827.001c.26.001.52.002.78.001l.419.002c.835-.002 1.578-.06 2.25-.596.626-.638.801-1.323.805-2.204v-.273l.001-.29v-.304l.001-.634a145.117 145.117 0 0 0 .004-1.73c.005-.897-.016-1.717-.595-2.442-.793-.778-1.65-.806-2.707-.803H9.497l-.834.001-1.579.002-2.134.002-3.36.003Z" />
                  <path d="M28.906 18.5c.173.123.173.123.359.301l.11.104.398.39.167.163a226.963 226.963 0 0 1 1.675 1.666 1960.178 1960.178 0 0 1 2.33 2.327 882.158 882.158 0 0 1 1.544 1.542 322.064 322.064 0 0 1 .832.83l.176.177.153.153c.289.329.39.577.376 1.008-.039.232-.146.358-.315.517-.19.095-.332.08-.546.08h-.53l-.28-.001-.741-.002-.756-.002-1.483-.003v.126c.007 1.013.012 2.025.015 3.038l.007 1.47c.003.472.005.945.005 1.418l.004.54c.002.253.002.506.002.759l.003.225c-.003.524-.096.936-.472 1.317l-.147.1-.147.103c-.288.171-.559.165-.883.166H30.6c-.177.002-.355.002-.532.003h-.37c-.26.002-.518.002-.777.002-.331 0-.662.002-.994.005a150.06 150.06 0 0 1-1.13.003h-.514l-.152.003c-.427-.004-.704-.133-1.028-.403-.425-.504-.502-.94-.493-1.59v-.24a326.548 326.548 0 0 0 .006-1.32c0-.426.003-.852.006-1.278a872.684 872.684 0 0 1 .02-4.447l-.156.002c-.488.008-.976.013-1.464.017-.251.002-.502.004-.753.008-.288.005-.577.007-.866.008l-.272.006c-.694 0-.694 0-.916-.215-.172-.257-.236-.435-.23-.752.04-.194.107-.275.241-.42l.14-.152c.297-.31.599-.615.902-.918l.222-.223.598-.597.626-.627a2600.598 2600.598 0 0 1 2.266-2.265 1714.638 1714.638 0 0 1 2.76-2.76l.165-.165c.296-.275.619-.28 1.001-.197Zm-.656 2.165-.144.143-.159.16-.167.166-.547.548-.38.378a1489.885 1489.885 0 0 0-1.816 1.817l-.782.783-.377.376a372.176 372.176 0 0 0-.685.685l-.144.144-.125.126c-.096.084-.096.084-.088.17l.252.001c.31.003.619.008.928.013l.402.005c.192.001.385.005.577.008h.18c.384.01.608.079.913.334.089.177.082.295.084.493l.002.224.001.246a286.048 286.048 0 0 0 .007.961l.006.734.01 1.39c.003.58.008 1.16.012 1.739l.022 3.101h4.553l.008-1.884.008-1.33.01-1.725a388.36 388.36 0 0 1 .01-2.088c0-.27.003-.539.005-.808v-.241c.008-.674.008-.674.248-.957.265-.209.612-.17.934-.174l.188-.005.595-.01.403-.01.988-.018a15.688 15.688 0 0 0-.96-1.04l-.153-.155-.499-.498-.348-.348a1242.33 1242.33 0 0 0-1.658-1.659l-.717-.716-.344-.345-.48-.478-.144-.145c-.312-.36-.312-.36-.629-.111ZM9.511 15.919c.698.502 1.162 1.204 1.311 2.06.112.998-.138 1.838-.754 2.628a3.147 3.147 0 0 1-2.072 1.018c-.982.02-1.784-.206-2.515-.885-.718-.75-.892-1.556-.876-2.56.034-.825.458-1.52 1.04-2.083 1.106-.94 2.678-.94 3.866-.178Zm-2.966 1.6c-.325.428-.394.811-.33 1.342.132.45.409.756.795 1.012.404.185.798.2 1.224.077.382-.155.634-.472.871-.8.13-.386.145-.846.026-1.238a2.017 2.017 0 0 0-.965-.884c-.634-.133-1.183.003-1.621.492Z" />
                </g>
                <defs>
                  <clipPath id="withdrawal-clip">
                    <path fill="#fff" d="M0 0h37v37H0z" />
                  </clipPath>
                </defs>
              </svg>
              <span className="floating-button-text">
                {capitalize(t('withdrawal'))}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Points Button - appears upward */}
      <div
        className={`floating-button-wrapper upward floating-button-points ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <button
          type="button"
          aria-label={t('points')}
          onClick={handlePointsClick}
          className={`floating-button ${
            clickedButton === 'points' ? 'clicked' : ''
          }`}
        >
          <div className="floating-button-inner">
            <div className="floating-button-content">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 37 37"
                fill="none"
                className="floating-button-icon"
                width="25"
                height="25"
              >
                <path
                  fill="#2DFA1A"
                  d="M19.326 3.762c.61.315.894.932 1.177 1.524l.115.237c.123.253.244.506.366.76l.253.52.377.778a170.112 170.112 0 0 0 1.317 2.664l.11.218c.07.154.07.154.156.232a19.976 19.976 0 0 0 .818.125 272.696 272.696 0 0 0 1.101.16l1.921.277a307.099 307.099 0 0 1 1.621.234 101.996 101.996 0 0 1 .812.117c.708.107 1.254.313 1.708.878.303.43.342.949.258 1.461-.225.675-.718 1.124-1.215 1.604l-.232.228c-.349.343-.704.675-1.073.997a44 44 0 0 0-1.352 1.231c-.126.118-.253.234-.382.348-.71.598-.71.598-1.135 1.397-.015.385.093.743.196 1.11.111.433.174.875.245 1.315.046.281.095.562.144.843l.06.345.121.699a222.91 222.91 0 0 1 .205 1.18c.314 1.778.314 1.778-.212 2.592-.369.398-.849.586-1.382.637-.813-.034-1.523-.497-2.227-.867a177.753 177.753 0 0 1-1.698-.88c-.431-.226-.864-.45-1.296-.674l-.237-.124-.451-.23c-.22-.116-.22-.116-.44-.254-.401-.247-.401-.247-.856-.26a4.7 4.7 0 0 0-.627.326l-.228.125c-.153.085-.306.171-.457.258-.241.139-.486.268-.733.395l-.494.26c-.5.265-1.002.524-1.504.785-.51.265-1.02.533-1.527.805-.56.3-1.124.352-1.753.232-.42-.157-.736-.486-.95-.869-.369-.87-.08-1.856.077-2.755l.101-.587.214-1.246.25-1.45.1-.578.06-.355.028-.16c.05-.29.088-.566.064-.858a3.438 3.438 0 0 0-.398-.43l-.11-.106c-.202-.192-.41-.375-.622-.557-.344-.3-.665-.622-.986-.947l-.189-.189a834.53 834.53 0 0 0-1.37-1.378l-.178-.18a11.661 11.661 0 0 0-.888-.82 1.705 1.705 0 0 1-.345-.46l-.105-.182c-.217-.441-.21-.903-.076-1.368.175-.474.466-.797.906-1.044.369-.156.77-.197 1.163-.256l.298-.046c.68-.104 1.36-.173 2.044-.23 2.302-.063 2.302-.063 4.264-.988.362-.493.52-1.073.644-1.664.088-.404.273-.752.465-1.115l.185-.39a125.725 125.725 0 0 1 .892-1.828l.216-.436.126-.255c.54-.943 1.52-1.347 2.55-.88Z"
                />
                <path
                  fill="#2DFA1A"
                  d="M19.326 3.762c.61.315.894.932 1.177 1.524a173.548 173.548 0 0 1 .481.997l.253.52.377.778a170.034 170.034 0 0 0 1.317 2.664l.11.218c.07.154.07.154.156.232a19.976 19.976 0 0 0 .818.125 290.834 290.834 0 0 0 1.101.16l1.921.277a307.099 307.099 0 0 1 1.621.234 101.996 101.996 0 0 1 .812.117c.704.106 1.25.313 1.708.87.15.225.212.409.258.674l-.29-.072-.072.145-.144-.073-.073.145c-.175.059-.175.059-.392.113-.281.068-.281.068-.547.176l-.145-.072-.072.144-.144-.072-.073.144-.144-.072-.072.145c-.156.051-.156.051-.357.1-.354.088-.677.208-1.01.357-.151.049-.151.049-.368-.024l-.072.145-.145-.072v.144c-.27.081-.27.081-.433 0l-.072.145c-.122.054-.122.054-.28.103l-.177.056c-.266.079-.534.15-.802.22-.191.051-.191.051-.382.137-.055.02-.11.04-.166.062l-.145-.072v.144l-.701.225-.223.071-1.22.39-.499.16-.25.08c-.441.14-.881.282-1.32.427l-.695.226-.316.104-.436.142-.242.08c-.6.116-1.16-.121-1.724-.307l-.263-.086-.688-.224a469.81 469.81 0 0 0-1.473-.48c-.5-.163-1-.313-1.506-.455a20.59 20.59 0 0 1-.733-.225l-.261-.085-.272-.088-.294-.095-.606-.197a536.363 536.363 0 0 0-4.733-1.515l-.156-.05a9.059 9.059 0 0 0-.684-.194c.022-.425.21-.719.506-1.011.475-.389.983-.464 1.577-.55l.296-.046a31.324 31.324 0 0 1 2.041-.226c2.301-.063 2.301-.063 4.264-.988.362-.493.52-1.073.644-1.664.088-.404.273-.752.464-1.115l.186-.39a125.725 125.725 0 0 1 .892-1.828l.216-.436.126-.255c.54-.943 1.52-1.347 2.55-.88Z"
                />
                <path
                  fill="#2DFA1A"
                  d="M18.572 3.758c.61.048 1.02.302 1.446.722.15.19.268.377.374.595l.089.182.095.197.1.208.215.441.562 1.154.113.233c.345.706.693 1.41 1.044 2.112l.08.16.218.436.122.245c.079.171.079.171.167.252a19.976 19.976 0 0 0 .818.125 272.696 272.696 0 0 0 1.101.16l1.921.277a328.373 328.373 0 0 1 1.621.234 101.996 101.996 0 0 1 .812.117c.704.106 1.25.313 1.708.87.15.225.212.409.258.674l-.29-.072-.072.145-.144-.073-.073.145c-.175.059-.175.059-.392.113-.281.068-.281.068-.547.176l-.145-.072-.072.144-.144-.072-.073.144-.144-.072-.072.145c-.156.051-.156.051-.357.1-.354.088-.677.208-1.01.357-.151.049-.151.049-.368-.024l-.072.145-.145-.072v.144c-.27.081-.27.081-.433 0l-.072.145c-.122.054-.122.054-.28.103l-.177.056c-.266.079-.534.15-.802.22-.191.051-.191.051-.382.137l-.166.062-.145-.072v.144c-1.204.386-2.408.772-3.613 1.156l-.214.069a438.862 438.862 0 0 1-1.868.593l-.248.079c-.2.054-.2.054-.416.054a2685.424 2685.424 0 0 1-.041-2.629c-.04-2.496-.034-4.99-.004-7.486a588.529 588.529 0 0 0 .02-1.83l.004-.38a152.307 152.307 0 0 1 .007-.682c.006-.354.006-.354.086-.434ZM18.572 17.344c.109.137.209.275.307.42l.196.28.107.152c.2.282.405.56.61.837l.13.176c.383.519.77 1.035 1.157 1.55l.402.537c.203.271.409.542.615.811.461.603.921 1.205 1.358 1.825.229.324.469.638.712.951.229.296.45.596.67.9.225.312.454.622.683.933l.128.174.125.17.122.166a13.201 13.201 0 0 0 .374.48l.11.137.071.124c-.072.217-.072.217-.266.338-.68.247-1.25.155-1.889-.138-.37-.18-.733-.37-1.097-.562a177.753 177.753 0 0 1-1.698-.88c-.431-.225-.864-.449-1.296-.673l-.237-.123c-.15-.078-.3-.155-.451-.231-.22-.116-.22-.116-.44-.254-.401-.247-.401-.247-.856-.26-.222.093-.42.202-.627.326l-.228.125c-.153.085-.306.171-.457.258a19.27 19.27 0 0 1-.733.395l-.494.26c-.5.265-1.002.524-1.504.785-.51.265-1.02.533-1.527.805a2.363 2.363 0 0 1-1.771.214c-.137-.06-.137-.06-.327-.168 0-.25.039-.296.185-.49l.123-.165.134-.177.28-.373.146-.193c.224-.3.446-.6.667-.901l.129-.175c.243-.33.483-.661.72-.995.407-.573.825-1.136 1.242-1.7l.39-.531c.395-.537.79-1.072 1.191-1.604.302-.4.598-.804.89-1.21.34-.473.682-.944 1.026-1.414l.127-.176c.541-.736.541-.736.771-.736Z"
                />
                <path
                  fill="#2DFA1A"
                  d="M29.195 2.53c.109.121.109.121.145.288-.028.371-.148.574-.37.868l-.198.267-.11.148c-.225.311-.439.63-.655.949l-.28.413-.137.201c-.212.311-.425.622-.64.932a103.418 103.418 0 0 0-.824 1.211c-.239.35-.239.35-.4.431-.248.027-.248.027-.505 0-.15-.153-.15-.153-.217-.361.08-.316.209-.555.393-.822l.156-.229.085-.122.275-.4a300.013 300.013 0 0 1 .907-1.318 1783.613 1783.613 0 0 1 .708-1.032c1.069-1.564 1.069-1.564 1.667-1.425ZM8.31 2.818c.144.117.244.222.362.362l.144.157c.342.372.667.757.985 1.15a46.06 46.06 0 0 0 .66.79l.307.36c1.58 1.859 1.58 1.859 1.612 2.168-.023.216-.023.216-.1.352-.221.129-.393.107-.645.081-.185-.146-.185-.146-.352-.347l-.093-.11a36.917 36.917 0 0 0-1.362-1.639 48.802 48.802 0 0 1-.918-1.098 56.69 56.69 0 0 0-.686-.816 87.793 87.793 0 0 1-.275-.326l-.166-.192c-.17-.234-.16-.392-.123-.675.156-.268.36-.263.65-.217ZM30.188 20.198l.227.077a227.871 227.871 0 0 1 1.216.418 488.51 488.51 0 0 1 1.736.598c.257.088.513.177.77.267l.21.072c.58.207.58.207.774.483-.004.262-.004.262-.072.506-.241.16-.332.158-.61.115-.417-.096-.82-.244-1.223-.385l-.302-.104a216.86 216.86 0 0 0-2.059-.711l-.295-.102c-1.688-.582-1.688-.582-1.943-.836-.048-.444-.048-.444.113-.65.453-.187 1.024.102 1.458.252ZM8.166 19.945c.14.122.14.122.217.29.013.216.013.216-.072.433-.373.255-.832.388-1.257.529a370.835 370.835 0 0 0-.817.275l-.86.29-.214.072c-.425.143-.848.29-1.27.441l-.291.104c-.175.062-.349.125-.523.19-.077.026-.154.054-.233.082l-.198.072c-.232.05-.396.029-.625-.032-.144-.158-.144-.158-.216-.36.018-.211.018-.211.144-.434.247-.143.515-.221.786-.308a280.226 280.226 0 0 0 .7-.234c.5-.166.996-.343 1.493-.52a1023.391 1023.391 0 0 1 2.01-.71l.222-.08c.642-.222.642-.222 1.004-.1ZM18.464 27.646c.253.032.253.032.375.104.152.232.125.481.123.75v.186a301.326 301.326 0 0 0 0 1.038v2.036a183.628 183.628 0 0 1 .001 1.3l-.001.589.001.177c-.005.39-.005.39-.124.572-.212.126-.39.102-.628.073-.2-.178-.217-.29-.244-.558a61.015 61.015 0 0 1 0-5.347l-.002-.172c.003-.231.015-.4.123-.607.123-.11.123-.11.376-.14ZM15.031 8.238l.145.073a285.577 285.577 0 0 1-.688 1.396l-.25.509-.079.16c-.123.247-.195.38-.429.536a7.599 7.599 0 0 1-.478.086l-.146.023a97.94 97.94 0 0 1-.82.123 338.128 338.128 0 0 1-1.61.242l-.87.131-.171.026c-.53.08-1.06.16-1.591.227l-.21.028-.364.044c-.513.066-1.035.236-1.395.624l-.12.124a1.553 1.553 0 0 0-.246.418l.072.144h-.217c.022-.425.21-.719.506-1.011.475-.389.983-.465 1.577-.55l.297-.046a29.271 29.271 0 0 1 2.038-.221c2.341-.059 2.341-.059 4.298-1.059.422-.605.634-1.304.751-2.027ZM20.668 5.998h.145l.087.175a3298.912 3298.912 0 0 0 2.005 4.017l.123.249c.08.175.08.175.17.256a19.976 19.976 0 0 0 .817.125 290.834 290.834 0 0 0 1.101.16l1.921.277a328.373 328.373 0 0 1 1.621.234 101.996 101.996 0 0 1 .812.117c.678.103 1.222.296 1.677.822l-.073.144c-.049-.05-.049-.05-.098-.103l-.141-.136-.135-.135c-.52-.336-1.203-.392-1.806-.47l-.227-.031a497.435 497.435 0 0 1-1.88-.253 42.766 42.766 0 0 1-1.852-.3 4.89 4.89 0 0 0-.935-.09c-.327 0-.57-.017-.875-.144-.152-.176-.242-.372-.339-.582l-.09-.183a39.309 39.309 0 0 1-.192-.397c-.141-.293-.289-.583-.436-.873-.155-.306-.308-.613-.461-.92a626.49 626.49 0 0 0-.585-1.17l-.108-.215-.098-.197-.087-.174c-.061-.13-.061-.13-.061-.203ZM19.331 3.767c.301.173.501.347.687.641l-.073.217-.09-.119c-.353-.437-.627-.634-1.187-.698-.462-.021-.803.04-1.18.311-.392.379-.652.804-.894 1.287l-.101.198a59.401 59.401 0 0 0-.956 1.984h-.144c.112-.375.272-.713.446-1.061a1954.044 1954.044 0 0 1 .825-1.662c.271-.538.562-.928 1.122-1.185a2.076 2.076 0 0 1 1.545.087Z"
                />
                <path
                  fill="#2DFA1A"
                  d="m6.143 12.213.144.072-.11.119-.143.157-.142.155c-.132.145-.132.145-.11.364l-.218.072c.028-.388.145-.54.434-.795l.145-.144Z"
                />
              </svg>
              <span className="floating-button-text">
                {capitalize(t('points'))}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Slot Button - appears downward */}
      <div
        className={`floating-button-wrapper downward floating-button-slot ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <button
          type="button"
          aria-label={t('slot')}
          onClick={handleSlotClick}
          className={`floating-button ${
            clickedButton === 'slot' ? 'clicked' : ''
          }`}
        >
          <div className="floating-button-inner">
            <div className="floating-button-content">
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-floating-icon.png"
                alt={t('slot')}
                width="20"
                height="20"
                className="floating-button-icon"
              />
              <span className="floating-button-text">
                {capitalize(t('slot'))}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Casino Button - appears downward */}
      <div
        className={`floating-button-wrapper downward floating-button-casino ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <button
          type="button"
          aria-label={t('casino')}
          onClick={handleCasinoClick}
          className={`floating-button ${
            clickedButton === 'casino' ? 'clicked' : ''
          }`}
        >
          <div className="floating-button-inner">
            <div className="floating-button-content">
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-floating-icon.png"
                alt={t('casino')}
                width="20"
                height="20"
                className="floating-button-icon"
              />
              <span className="floating-button-text">
                {capitalize(t('casino'))}
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Home Button - appears downward */}
      <div
        className={`floating-button-wrapper downward floating-button-home ${
          isExpanded ? 'expanded' : 'collapsed'
        }`}
      >
        <button
          type="button"
          aria-label={t('home')}
          onClick={handleHomeClick}
          className={`floating-button ${
            clickedButton === 'home' ? 'clicked' : ''
          }`}
        >
          <div className="floating-button-inner">
            <div className="floating-button-content">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 35 36"
                fill="none"
                className="floating-button-icon"
                width="25"
                height="25"
              >
                <path
                  d="M31.715 8.64566L19.4536 1.36305C18.7827 0.962411 18.0077 0.75 17.2168 0.75C16.426 0.75 15.651 0.962411 14.9801 1.36305L2.72064 8.68732C2.02358 9.10779 1.47034 9.71413 1.1291 10.4316C0.787861 11.1491 0.673526 11.9465 0.800184 12.7254L3.96306 30.8902C4.13024 31.8412 4.64751 32.7035 5.4214 33.3215C6.19528 33.9395 7.17473 34.2723 8.18276 34.2598H26.3305C27.3388 34.2727 28.3187 33.9401 29.093 33.3221C29.8673 32.7041 30.3848 31.8415 30.5521 30.8902L33.715 12.7254C33.8422 11.9321 33.7195 11.1207 33.3626 10.3944C33.0058 9.66811 32.4308 9.05995 31.7112 8.64747M10.8873 25.5823H23.5483"
                  stroke="#2DFA1A"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="floating-button-text">
                {capitalize(t('home'))}
              </span>
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
