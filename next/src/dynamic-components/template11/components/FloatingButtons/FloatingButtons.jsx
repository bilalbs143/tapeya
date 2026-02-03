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

import LazyImage from '@/dynamic-components/template11/components/LazyImage/LazyImage';
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
              {/* <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/floating-logo.png"
                alt="Floating Logo"
                className="floating-logo floating-logo-rotator"
              /> */}
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
                className="mb-1 h-6 w-6 flex-shrink-0"
              >
                <path
                  fill="#636363"
                  className="transition-all duration-300"
                  d="m7.605 4.742.233-.001H9.155c.447-.002.893-.001 1.339 0a548.634 548.634 0 0 0 1.245 0H20.959l1.087-.001a372.1 372.1 0 0 1 2 0c.245 0 .49 0 .734.002l.213-.001c1.035.008 1.915.373 2.663 1.085.619.634 1.101 1.437 1.122 2.35l.004.174.004.188.004.193c.005.203.01.406.013.61l.01.413.022 1.014.19.07.253.095.25.094c1.024.425 1.755 1.181 2.218 2.182.172.42.279.763.266 1.219v.238c-.001.165-.005.33-.01.494.001.242.01.436.085.666.17.159.33.25.54.348.581.274.968.907 1.188 1.488.187.665.184 1.323.18 2.008-.002.203 0 .405 0 .608.002 1.02-.086 1.844-.68 2.703l-.126.194c-.325.334-.714.643-1.174.745l.004.157c.04 1.575-.047 2.68-1.174 3.872-.816.78-1.859 1.247-2.994 1.26l-.236.002-.252.002a1279.517 1279.517 0 0 1-2.177.013l-.252.004c-.475-.001-.774-.034-1.158-.324-.272-.349-.332-.617-.312-1.057.046-.335.168-.535.407-.768.461-.3.903-.29 1.435-.29l.48-.005c.25-.001.501-.003.752-.003.243 0 .486-.003.729-.006l.224.001c.635-.008 1.243-.156 1.705-.618.239-.324.366-.57.384-.972l.01-.185.008-.193a3332.242 3332.242 0 0 1 .032-.673l-.233.004c-.288.006-.577.009-.866.012l-.373.006c-1.061.02-1.887-.095-2.72-.817-.58-.597-.943-1.298-.95-2.141l-.003-.195v-.208l-.002-.217-.001-.454c-.001-.23-.003-.459-.006-.688v-.443c-.002-.068-.002-.136-.003-.206.003-.906.327-1.668.943-2.331.65-.614 1.415-.876 2.294-.864h.168l.523.005.358.002.87.007c-.008-.197-.018-.395-.028-.593l-.007-.169c-.03-.554-.154-.902-.565-1.284-.448-.353-.937-.492-1.504-.492h-.727l-.564-.001h-.918c-.444-.002-.889-.002-1.334-.002l-2.11-.003-.722-.002a3371.121 3371.121 0 0 0-2.238-.003h-.19l-3.04-.004c-1.04 0-2.082-.002-3.124-.004-.641-.002-1.283-.003-1.925-.002-.44 0-.88 0-1.321-.003h-.76c-2.237.005-2.237.005-3.131-.473.003 1.646.007 3.292.013 4.938l.007 2.292c0 .667.002 1.333.006 2l.002 1.057c0 .332.001.665.004.997v.365c-.012 1.03-.012 1.03.444 1.927.564.554 1.283.63 2.036.625l.26.002c.273.002.546.002.819.002.273 0 .547 0 .82.003h.509c.5.004.9.026 1.292.37l.102.128.106.129c.185.273.182.527.156.847-.13.38-.306.646-.65.867-.226.075-.386.083-.623.085l-.252.003a216.76 216.76 0 0 1-1.151.006c-.202 0-.403.002-.605.004-1.757.02-3.221-.057-4.56-1.346-.817-.89-1.131-1.87-1.13-3.058v-.21a310.88 310.88 0 0 1-.003-1.197 990.467 990.467 0 0 1-.002-2.206l-.002-2.352v-.763l-.003-2.453A1325.314 1325.314 0 0 1 3.01 11.7a324.706 324.706 0 0 1-.002-1.82c-.006-1.597.202-2.73 1.308-3.947.3-.292.644-.485 1.014-.676l.138-.072c.68-.333 1.385-.448 2.137-.443ZM5.71 7.949c-.247.405-.345.798-.27 1.269.161.541.5.878.968 1.174.467.238.876.251 1.39.248a185.771 185.771 0 0 0 1.612 0c.411 0 .822 0 1.233-.002l1.783-.001a2788.084 2788.084 0 0 0 5.701-.006h1.045l7.206-.008c.007-.34.012-.679.016-1.018l.006-.346c.032-.88.032-.88-.311-1.671-.123-.134-.123-.134-.258-.212l-.126-.084c-.221-.119-.404-.147-.65-.147l-.194-.001h-.213l-.226-.001-.754-.001-.539-.002-1.62-.003h-.764a3026.065 3026.065 0 0 0-3.198-.004h-.165c-.884 0-1.767-.003-2.651-.005-.908-.002-1.815-.004-2.723-.004-.51 0-1.019 0-1.528-.002-.48-.002-.959-.002-1.438-.002l-.528-.001h-.72l-.21-.002c-.735.007-1.396.258-1.874.832Zm21.246 10.406c-.116.233-.087.488-.09.745a577.997 577.997 0 0 0-.013 1.508l-.004.174c.002.38.072.596.324.898.18.09.305.083.507.086l.229.003c.345.004.69.007 1.036.008l.547.006c.262.004.525.006.788.007l.246.005c.458.002.458.002.852-.213.22-.322.216-.608.218-.986l.001-.171.001-.36.006-.547v-.349l.003-.165c0-.327-.038-.535-.243-.793-.22-.197-.36-.244-.653-.247l-.22-.004h-.235l-.243-.001-.51-.001c-.26 0-.52-.003-.78-.006h-.495l-.235-.004c-.475.004-.713.05-1.037.407Z"
                />
                <path
                  fill="#636363"
                  className="transition-all duration-300"
                  d="M18.378 23.97c.268.23.455.422.511.776.013.214.016.427.016.641l.004.237c.004.248.005.496.007.744l.006.506c.005.412.01.825.012 1.237l.179-.197.236-.257.117-.13c.381-.415.693-.725 1.279-.757.363.02.572.11.862.33.265.306.383.608.362 1.011-.085.387-.197.606-.47.89l-.105.109a855.674 855.674 0 0 0-.66.678c-.272.278-.546.555-.821.83l-.515.52-.33.332-.154.156c-.353.351-.681.635-1.204.636l-.174.004c-.6-.112-1.005-.599-1.417-1.012l-.205-.204-.426-.426c-.18-.182-.362-.362-.544-.542-.176-.173-.35-.348-.523-.522l-.197-.194c-.406-.41-.734-.773-.819-1.363.06-.415.206-.718.51-1.007.25-.16.451-.2.741-.208l.182-.008c.47.075.806.48 1.124.807l.13.132.312.32.003-.283a201.779 201.779 0 0 1 .022-1.494l.01-.65.002-.202c.01-.47.066-.901.374-1.277l.127-.1.126-.104c.409-.254.9-.168 1.31.04Z"
                />
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 37 37"
                fill="none"
                className="mb-1 h-5 w-5 flex-shrink-0"
              >
                <g
                  fill="#636363"
                  clipPath="url(#withdrawal-clip)"
                  className="transition-all duration-300"
                >
                  <path d="M3.622 4.615h.158a177.64 177.64 0 0 1 .906 0l1.047-.002h1.128a3076.502 3076.502 0 0 1 4.01-.003l4.264-.002H16.52c1.486 0 2.972-.002 4.458-.004a4255.683 4255.683 0 0 1 7.146-.004 933.377 933.377 0 0 1 3.304-.002 193.612 193.612 0 0 1 1.392 0c.628-.003 1.203.006 1.795.244l.198.072a3.901 3.901 0 0 1 1.993 2.154c.148.435.205.805.205 1.265a105.682 105.682 0 0 1 .002.8l.001.44.003 1.197.001.748.003 2.338c0 .9.003 1.801.006 2.702.002.695.003 1.391.003 2.087l.003 1.247c.002.39.002.781.001 1.172l.001.43c.002.197.001.392 0 .588l.003.173c-.003.269-.028.422-.176.65-.263.257-.483.248-.839.246-.18-.026-.18-.026-.4-.193-.233-.322-.223-.602-.222-.984v-.178L35.4 21.2v-.426l-.002-.918-.003-1.453-.001-.498-.001-.251a1817.11 1817.11 0 0 1-.006-3.384l-.005-2.281c-.002-.403-.003-.805-.002-1.208 0-.379-.001-.757-.003-1.136v-.416c.003-.918-.024-1.675-.684-2.381a2.359 2.359 0 0 0-1.586-.57l-.154-.001h-.518a774.922 774.922 0 0 1-1.4-.003l-1.107-.001-2.675-.003-1.26-.001-4.185-.003H20.448c-1.458 0-2.917-.003-4.375-.005-1.497-.003-2.994-.004-4.49-.004-.841 0-1.682 0-2.523-.003-.715-.001-1.431-.002-2.147-.001l-1.096-.001c-.335-.002-.67-.002-1.004 0l-.362-.001c-.861-.006-1.572.068-2.228.681a2.35 2.35 0 0 0-.576 1.505l-.004.26-.004.278-.004.286-.011.752-.012.767-.022 1.505h.16c1.287-.005 2.574-.009 3.862-.011l1.867-.005c.543-.002 1.086-.004 1.63-.004l.86-.003c.272-.001.543-.002.814-.001l.436-.003c1.197.004 2.26.3 3.139 1.144.758.831 1.113 1.772 1.118 2.89l.002.158.002.515v.178l.002.938c0 .321.002.642.004.962a142.583 142.583 0 0 1 .004 1.1c.01 1.342-.223 2.486-1.181 3.488-.782.712-1.697 1.093-2.76 1.093h-.267l-.29-.001H9.85l-.872-.001-1.649-.002-1.878-.002-3.862-.003c.003.543.007 1.087.013 1.63l.006.757c.002.291.005.582.01.873v.272c.012.75.167 1.348.688 1.905.382.324.886.57 1.39.57h.61l.726.001h.519a1044.14 1044.14 0 0 1 2.89.004c.201.002.403.002.605.002H9.2l1.723.004h.159c.85.002 1.701.003 2.552.003l2.62.005c.49.002.98.003 1.47.002.462 0 .923.001 1.384.003h.508c.231 0 .462 0 .693.002l.204-.002c.4.005.635.057.95.328.178.268.194.485.144.795-.216.398-.216.398-.433.506-.1.007-.199.01-.298.01h-.623l-.742.002h-.531c-.482.002-.963.002-1.445.002a2718.035 2718.035 0 0 0-3.402.003h-.812c-.87 0-1.74.002-2.61.004a1496.987 1496.987 0 0 1-4.186.004 334.38 334.38 0 0 1-1.935.002h-.71l-.207.001c-1.03-.007-1.901-.453-2.64-1.154-.607-.64-1.041-1.453-1.042-2.351l-.001-.228v-.516l-.002-.73v-.788a1491.781 1491.781 0 0 1-.003-2.799l-.002-2.98v-.966c0-1.038-.002-2.075-.004-3.113a2088.202 2088.202 0 0 1-.004-4.99 455.062 455.062 0 0 1-.002-2.307v-.846l-.001-.247c.003-.495.074-.914.245-1.378l.072-.198a3.901 3.901 0 0 1 2.154-1.993c.125-.042.25-.083.375-.122l.124-.039c.228-.046.447-.042.68-.043Zm-2.032 9.26v9.25l3.506.007a1278.963 1278.963 0 0 1 3.709.007l.827.001c.26.001.52.002.78.001l.419.002c.835-.002 1.578-.06 2.25-.596.626-.638.801-1.323.805-2.204v-.273l.001-.29v-.304l.001-.634a145.117 145.117 0 0 0 .004-1.73c.005-.897-.016-1.717-.595-2.442-.793-.778-1.65-.806-2.707-.803H9.497l-.834.001-1.579.002-2.134.002-3.36.003Z" />
                  <path d="M28.906 18.5c.173.123.173.123.359.301l.11.104.398.39.167.163a226.963 226.963 0 0 1 1.675 1.666 1960.178 1960.178 0 0 1 2.33 2.327 882.158 882.158 0 0 1 1.544 1.542 322.064 322.064 0 0 1 .832.83l.176.177.153.153c.289.329.39.577.376 1.008-.039.232-.146.358-.315.517-.19.095-.332.08-.546.08h-.53l-.28-.001-.741-.002-.756-.002-1.483-.003v.126c.007 1.013.012 2.025.015 3.038l.007 1.47c.003.472.005.945.005 1.418l.004.54c.002.253.002.506.002.759l.003.225c-.003.524-.096.936-.472 1.317l-.147.1-.147.103c-.288.171-.559.165-.883.166H30.6c-.177.002-.355.002-.532.003h-.37c-.26.002-.518.002-.777.002-.331 0-.662.002-.994.005a150.06 150.06 0 0 1-1.13.003h-.514l-.152.003c-.427-.004-.704-.133-1.028-.403-.425-.504-.502-.94-.493-1.59v-.24a326.548 326.548 0 0 0 .006-1.32c0-.426.003-.852.006-1.278a872.684 872.684 0 0 1 .02-4.447l-.156.002c-.488.008-.976.013-1.464.017-.251.002-.502.004-.753.008-.288.005-.577.007-.866.008l-.272.006c-.694 0-.694 0-.916-.215-.172-.257-.236-.435-.23-.752.04-.194.107-.275.241-.42l.14-.152c.297-.31.599-.615.902-.918l.222-.223.598-.597.626-.627a2600.598 2600.598 0 0 1 2.266-2.265 1714.638 1714.638 0 0 1 2.76-2.76l.165-.165c.296-.275.619-.28 1.001-.197Zm-.656 2.165-.144.143-.159.16-.167.166-.547.548-.38.378a1489.885 1489.885 0 0 0-1.816 1.817l-.782.783-.377.376a372.176 372.176 0 0 0-.685.685l-.144.144-.125.126c-.096.084-.096.084-.088.17l.252.001c.31.003.619.008.928.013l.402.005c.192.001.385.005.577.008h.18c.384.01.608.079.913.334.089.177.082.295.084.493l.002.224.001.246a286.048 286.048 0 0 0 .007.961l.006.734.01 1.39c.003.58.008 1.16.012 1.739l.022 3.101h4.553l.008-1.884.008-1.33.01-1.725a388.36 388.36 0 0 1 .01-2.088c0-.27.003-.539.005-.808v-.241c.008-.674.008-.674.248-.957.265-.209.612-.17.934-.174l.188-.005.595-.01.403-.01.988-.018a15.688 15.688 0 0 0-.96-1.04l-.153-.155-.499-.498-.348-.348a1242.33 1242.33 0 0 0-1.658-1.659l-.717-.716-.344-.345-.48-.478-.144-.145c-.312-.36-.312-.36-.629-.111ZM9.511 15.919c.698.502 1.162 1.204 1.311 2.06.112.998-.138 1.838-.754 2.628a3.147 3.147 0 0 1-2.072 1.018c-.982.02-1.784-.206-2.515-.885-.718-.75-.892-1.556-.876-2.56.034-.825.458-1.52 1.04-2.083 1.106-.94 2.678-.94 3.866-.178Zm-2.966 1.6c-.325.428-.394.811-.33 1.342.132.45.409.756.795 1.012.404.185.798.2 1.224.077.382-.155.634-.472.871-.8.13-.386.145-.846.026-1.238a2.017 2.017 0 0 0-.965-.884c-.634-.133-1.183.003-1.621.492Z" />
                </g>
                <defs>
                  <clipPath id="withdrawal-clip">
                    <path fill="#fff" d="M0 0h37v37H0z" />
                  </clipPath>
                </defs>
              </svg>
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 33 37"
                fill="none"
                className="mb-1 h-6 w-6 flex-shrink-0"
              >
                <g clipPath="url(#customer-clip)">
                  <path
                    fill="#636363"
                    className="transition-all duration-300"
                    d="m15.644-.017.186-.002c1.382-.013 2.711.007 4.066.308l.185.04a15.426 15.426 0 0 1 7.212 3.829c.152.141.306.276.467.408.276.235.503.505.736.782l.183.207c.795.907 1.425 1.907 1.985 2.972l.081.154c.823 1.581 1.327 3.288 1.581 5.05l.038.257c.06.56.046 1.125.047 1.687l.002.393.003 1.287a326596.596 326596.596 0 0 0 .018 9.348c.015 2.086-.68 3.866-2.131 5.383a6.939 6.939 0 0 1-4.887 2.04 132.608 132.608 0 0 1-.898-.003c-.323 0-.646-.002-.969-.004l-.99-.003c-.647-.001-1.294-.004-1.94-.007l-.066.204c-.353 1.035-1.106 1.783-2.063 2.275a4.714 4.714 0 0 1-3.304.295c-1.196-.447-2.129-1.222-2.683-2.38-.464-1.019-.535-2.316-.14-3.37.537-1.206 1.322-2.021 2.525-2.57 1.15-.438 2.443-.35 3.554.147a4.565 4.565 0 0 1 2.177 2.364v.145a619.84 619.84 0 0 0 2.526-.03 182.474 182.474 0 0 0 1.21-.015c1.483-.023 2.748-.264 3.866-1.31a4.717 4.717 0 0 0 .998-1.608l-.159.035c-1.242.228-2.477.017-3.527-.686-.927-.721-1.587-1.646-1.806-2.818a7.585 7.585 0 0 1-.021-.674l-.002-.197-.002-.638a199414.193 199414.193 0 0 1-.002-1.385c0-.398-.002-.796-.005-1.195l-.002-.924-.001-.44c-.01-1.418.225-2.567 1.238-3.632.885-.862 1.91-1.277 3.137-1.267l.21-.002c.39.001.717.036 1.086.165-.534-3.586-2.114-6.801-5.068-9.007a13.606 13.606 0 0 0-5.483-2.411l-.253-.052c-3.243-.571-6.683.266-9.385 2.117-2.872 2.024-4.815 5.038-5.421 8.505-.046.282-.084.564-.116.848.067-.024.135-.047.205-.07 1.08-.308 2.26-.08 3.24.408 1.06.614 1.781 1.573 2.124 2.742.08.332.089.65.088.99l.002.197a113.282 113.282 0 0 1 .003 1.086l.001.937c0 .399.002.797.005 1.195.001.308.002.616.001.924l.002.44c.01 1.418-.225 2.567-1.239 3.632-.95.927-2.019 1.28-3.322 1.276-1.221-.023-2.215-.532-3.061-1.4C.838 26.042.579 25 .582 23.79l-.001-.3-.001-.813v-.682c-.002-.538-.002-1.076-.001-1.614 0-.551 0-1.102-.002-1.654a448.214 448.214 0 0 1-.003-2.276c-.004-1.21.015-2.395.244-3.588l.046-.243c.035-.175.074-.347.117-.52l.046-.188a15.537 15.537 0 0 1 3.735-6.809c.14-.151.275-.305.406-.464.234-.277.505-.503.781-.737l.208-.183c.906-.794 1.907-1.425 2.972-1.985l.153-.08c1.94-1.01 4.166-1.65 6.362-1.671ZM3.813 17.915c-.3.444-.33.861-.331 1.392l-.001.15a134.153 134.153 0 0 0-.002.836v.72l-.002.919a200.184 200.184 0 0 0-.002 1.049c-.025 1.082-.025 1.082.45 2.023.31.283.594.387 1.013.406.418-.02.707-.114 1.011-.406.39-.476.442-.923.444-1.53l.001-.15a131.9 131.9 0 0 0 .002-.836v-.72l.002-.919A197.743 197.743 0 0 0 6.4 19.8c.026-1.082.026-1.082-.45-2.023-.31-.283-.594-.387-1.013-.406-.488.023-.812.164-1.124.544Zm23.125 0c-.3.444-.33.861-.331 1.392l-.001.15v.492l-.002.344v.72l-.002.919a186.836 186.836 0 0 0-.002 1.049c-.026 1.082-.026 1.082.45 2.023.31.283.594.387 1.012.406.419-.02.708-.114 1.012-.406.39-.476.442-.923.444-1.53l.001-.15a160.918 160.918 0 0 0 .002-.836v-.72l.002-.919a186.757 186.757 0 0 0 .002-1.049c.026-1.082.026-1.082-.45-2.023-.31-.283-.594-.387-1.012-.406-.49.023-.813.164-1.125.544ZM15.272 31.91c-.211.379-.214.767-.145 1.188.141.393.404.675.768.878.396.142.814.142 1.21 0 .364-.203.627-.485.768-.878.07-.421.066-.81-.145-1.188-.267-.358-.558-.58-1.004-.653-.64-.031-1.066.138-1.453.653Z"
                  />
                </g>
                <defs>
                  <clipPath id="customer-clip">
                    <path fill="#fff" d="M0 0h33v37H0z" />
                  </clipPath>
                </defs>
              </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 37 37"
                  fill="none"
                  className="mb-1 h-6 w-6 flex-shrink-0"
                >
                  <path
                    fill="#636363"
                    className="transition-all duration-300"
                    d="M23.509 2.213c.872.72.965 1.943 1.134 2.99l.269-.004c.332-.006.664-.01.996-.012l.43-.006c.206-.003.413-.005.62-.006l.192-.005c.507 0 .884.128 1.268.464l.118.143.121.142c.212.307.267.572.267.942v.855l-.001.84v.907l-.001 1.57c-.002.757-.002 1.514-.002 2.27a4522.482 4522.482 0 0 1-.006 7.263v.222a7522226.768 7522226.768 0 0 0-.008 10.286l.196-.045.257-.06.254-.06c.243-.054.486-.1.732-.14l.259-.043.27-.043.43-.07a313.035 313.035 0 0 0 2.2-.357l.254-.042.222-.036c.202-.043.377-.098.563-.188.201-.403.043-.981-.03-1.408l-.034-.202-.113-.67-.08-.481-.221-1.313-.234-1.391a3040.566 3040.566 0 0 0-.795-4.734l-.025-.146-.121-.727-.625-3.717-.047-.28-.186-1.099a874.95 874.95 0 0 1-.543-3.252l-.249-1.494-.19-1.15a123.158 123.158 0 0 0-.165-1c-.022-.141-.046-.281-.07-.421l-.04-.235c-.073-.233-.162-.336-.351-.489-.16-.039-.16-.039-.325-.036-.229-.017-.311-.026-.506-.158a.98.98 0 0 1-.18-.6c.115-.256.197-.35.433-.507.526-.074 1.002-.01 1.445.29.858.71.868 1.893 1.039 2.926l.07.424.193 1.152.205 1.23.393 2.355.56 3.356.085.51.042.255.255 1.53a1154.89 1154.89 0 0 0 1.13 6.688l.246 1.437a290.283 290.283 0 0 1 .221 1.288c.35 1.997.35 1.997-.064 2.708-.457.64-1.098.776-1.842.903l-.178.029-.195.033-.644.107-.464.077-1.264.21-1.345.225-2.28.38-3.692.615-.836.14c-.092.014-.183.03-.278.046l-1.66.276c-1.77.294-3.537.59-5.305.891l-.737.126-.24.04-.469.08a550.97 550.97 0 0 0-2.155.37c-.123.02-.247.042-.371.064-1.88.328-1.88.328-2.533-.12-.332-.302-.653-.626-.723-1.084.01-.28.034-.448.19-.682.244-.16.39-.158.677-.113.29.224.423.469.578.795.504.252 1.444-.062 1.98-.154l.28-.047.752-.127a1493.835 1493.835 0 0 0 3.977-.672l3.49-.59h-.28c-2.189-.003-4.378-.007-6.568-.013l-.808-.002h-.163l-2.606-.005c-.891 0-1.782-.002-2.674-.005a477.5 477.5 0 0 0-1.65-.003c-.421 0-.843-.002-1.265-.004h-.519c-.236 0-.472 0-.709-.002l-.207.001c-.513-.007-.896-.129-1.285-.47l-.118-.143-.122-.142c-.211-.306-.267-.572-.267-.941l-.002-.262V29.023l-.002-.905a936.552 936.552 0 0 1-.003-3.216l-.002-4.088v-.222a1622.563 1622.563 0 0 0-.003-3.8l-.003-3.672c0-.687 0-1.374-.002-2.061V9.303l-.001-.895v-.82c0-.146 0-.291-.002-.437.005-.594.066-1 .47-1.46l.142-.118.142-.12c.285-.198.54-.268.885-.268h.223a7475.783 7475.783 0 0 0 .504 0l.714.001h.771l1.335.002 1.93.002c1.044 0 2.088 0 3.132.002l3.042.003h1.13l7.804.008c-.05-.256-.104-.512-.158-.768l-.043-.218c-.096-.443-.193-.721-.522-1.037-.285-.166-.541-.173-.867-.145-.338.126-.521.28-.723.578-.072.216-.075.345-.067.57.002.276-.005.487-.15.731-.265.177-.486.196-.794.145-.235-.17-.308-.302-.362-.579-.075-.755.108-1.444.59-2.039.924-.899 2.22-.926 3.263-.228ZM2.457 6.576c-.133.265-.163.48-.163.775l-.001.251v1.375l-.001.87a886.483 886.483 0 0 0-.002 3.085v4.349c0 1.145 0 2.29-.002 3.433a2477.842 2477.842 0 0 0-.003 5.502 543.397 543.397 0 0 0 0 2.544v.786l-.001.42c-.007.59-.007.59.245 1.108.268.135.487.163.784.163l.258.001h1.408l.89.002h3.162l.204.001h4.252c1.172 0 2.345 0 3.517.002a2554.749 2554.749 0 0 0 5.636.003 583.794 583.794 0 0 0 2.606 0h.806l.43.001.258-.001h.223c.257-.034.425-.103.642-.244.15-.256.163-.483.163-.775l.002-.251-.001-.276v-.293l.001-.806.001-.869v-1.703l.001-1.383v-4.349c0-1.145.001-2.289.003-3.433a2434.187 2434.187 0 0 0 .002-5.502 525.302 525.302 0 0 0 0-2.544c.002-.262.001-.524 0-.786 0-.14 0-.28.002-.42.002-.586.002-.586-.246-1.108-.284-.174-.56-.161-.887-.159h-.149l-.468.005-.319.002-.778.007c.044.675.197 1.318.355 1.974.18.79.328 1.626-.099 2.358-.291.387-.65.565-1.123.655-.57.057-.992-.057-1.464-.375-.384-.393-.531-.867-.642-1.395l-.038-.172a61.79 61.79 0 0 1-.076-.357l-.118-.54c-.299-1.368-.299-1.368-.192-1.786.176-.168.262-.214.506-.244.25.031.328.068.506.244.076.223.076.223.131.496l.031.149c.033.156.064.313.095.47l.127.614.031.151c.064.31.131.62.204.928l.049.204c.05.186.05.186.222.37.247.11.371.098.627.014.146-.068.146-.068.217-.217a4.48 4.48 0 0 0-.124-1.227l-.038-.181-.122-.565-.082-.384c-.12-.598-.12-.598-.284-1.184-2.635-.005-5.27-.008-7.905-.01l-.933-.002h-.187c-1.003 0-2.006-.002-3.008-.004-1.03-.002-2.058-.004-3.087-.004l-1.905-.003a397.433 397.433 0 0 0-2.059-.003H3.73l-.24-.002c-.55.002-.55.002-1.033.245Z"
                  />
                </svg>
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
                stroke="#DFA336"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M18 6L6 18"
                stroke="#DFA336"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        ) : (
          <div className="floating-main-button-inner with-gif">
            {/* <img
              src="https://art-chip.s3.ap-southeast-1.amazonaws.com/next/icons/floating-logo-11.png"
              alt="Floating Logo"
              className="floating-logo floating-logo-rotator"
            /> */}
          </div>
        )}
      </button>
    </div>
  );
};

export default FloatingButtons;
