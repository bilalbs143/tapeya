'use client';

import { Capacitor } from '@capacitor/core';
import { useEffect, useState } from 'react';

/**
 * Hook to detect mobile platform and navigation bar state
 * @returns {object} Object containing platform detection and navigation bar info
 */
export const useMobilePlatform = () => {
  const [isMobilePlatform, setIsMobilePlatform] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [hasNavigationBar, setHasNavigationBar] = useState(false);
  const [navigationBarHeight, setNavigationBarHeight] = useState(0);

  useEffect(() => {
    // Check if running in Capacitor native platform (mobile APK)
    const isNative = Capacitor.isNativePlatform();
    setIsMobilePlatform(isNative);

    if (typeof window !== 'undefined') {
      // Detect platform
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isAndroidDevice = /android/i.test(userAgent);
      const isIOSDevice =
        /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;

      setIsAndroid(isAndroidDevice);
      setIsIOS(isIOSDevice);

      // Detect navigation bar presence and height
      const detectNavigationBar = () => {
        if (isAndroidDevice && isNative) {
          // For Android inside the APK (Capacitor WebView), use a combination of
          // visual viewport and screen/window deltas to infer the soft nav height.
          const vv = window.visualViewport;

          const windowHeight = window.innerHeight || 0;
          const screenHeight = window.screen?.height || 0;
          const availHeight = window.screen?.availHeight || 0;

          // Primary: visual viewport gap below layout viewport
          const vvHeight = vv?.height || windowHeight;
          const vvOffsetTop = vv?.offsetTop || 0;
          const rawGap = Math.max(
            0,
            Math.round(windowHeight - vvHeight - vvOffsetTop),
          );

          // Secondary signals
          const heightDifference = Math.max(0, screenHeight - windowHeight);
          const availDifference = Math.max(0, screenHeight - availHeight);
          const heightRatio =
            screenHeight > 0 ? windowHeight / screenHeight : 1;
          const systemUIHeight = Math.max(0, screenHeight - availHeight);

          // Determine presence using multiple heuristics. Lower thresholds so gesture bars are caught.
          const hasNavBar =
            rawGap >= 6 ||
            heightDifference > 24 ||
            availDifference > 12 ||
            heightRatio < 0.95 ||
            systemUIHeight > 8;

          // Choose the most reasonable height estimate
          let navBarHeight = 0;
          if (hasNavBar) {
            navBarHeight =
              rawGap ||
              heightDifference ||
              systemUIHeight ||
              availDifference ||
              0;
            // Clamp to a sane range
            navBarHeight = Math.max(10, Math.min(navBarHeight, 120));
          }

          setHasNavigationBar(hasNavBar);
          setNavigationBarHeight(navBarHeight);

          if (process.env.NODE_ENV === 'development') {
            console.log('Android Navigation Bar Detection (APK):', {
              windowHeight,
              screenHeight,
              availHeight,
              rawGap,
              heightDifference,
              availDifference,
              heightRatio,
              systemUIHeight,
              hasNavBar,
              navBarHeight,
            });
          }
        } else if (isIOSDevice) {
          // For iOS, use safe area insets
          const safeAreaBottom = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue(
              '--safe-area-inset-bottom',
            ) || '0',
          );
          setHasNavigationBar(safeAreaBottom > 0);
          setNavigationBarHeight(safeAreaBottom);
        } else {
          // For web browsers, no navigation bar
          setHasNavigationBar(false);
          setNavigationBarHeight(0);
        }
      };

      // Initial detection
      detectNavigationBar();

      // Listen for orientation changes and resize events
      const handleResize = () => {
        setTimeout(detectNavigationBar, 100); // Small delay to ensure accurate measurements
      };

      // Listen for system UI visibility changes (Android)
      const handleSystemUIChange = () => {
        setTimeout(detectNavigationBar, 200); // Longer delay for system UI changes
      };

      // Periodic check for navigation bar changes (Android only)
      let intervalId = null;
      if (isAndroidDevice && isNative) {
        intervalId = setInterval(() => {
          detectNavigationBar();
        }, 800); // Check frequently; keeps in sync with gesture bar visibility
      }

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      // Listen for system UI visibility changes on Android
      if (isAndroidDevice && isNative) {
        // Listen for fullscreen changes
        document.addEventListener('fullscreenchange', handleSystemUIChange);
        document.addEventListener(
          'webkitfullscreenchange',
          handleSystemUIChange,
        );
        document.addEventListener('mozfullscreenchange', handleSystemUIChange);
        document.addEventListener('MSFullscreenChange', handleSystemUIChange);

        // Listen for visibility changes
        document.addEventListener('visibilitychange', handleSystemUIChange);
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);

        if (isAndroidDevice && isNative) {
          document.removeEventListener(
            'fullscreenchange',
            handleSystemUIChange,
          );
          document.removeEventListener(
            'webkitfullscreenchange',
            handleSystemUIChange,
          );
          document.removeEventListener(
            'mozfullscreenchange',
            handleSystemUIChange,
          );
          document.removeEventListener(
            'MSFullscreenChange',
            handleSystemUIChange,
          );
          document.removeEventListener(
            'visibilitychange',
            handleSystemUIChange,
          );

          // Clear interval
          if (intervalId) {
            clearInterval(intervalId);
          }
        }
      };
    }
  }, []);

  return {
    isMobilePlatform,
    isAndroid,
    isIOS,
    hasNavigationBar,
    navigationBarHeight,
  };
};
