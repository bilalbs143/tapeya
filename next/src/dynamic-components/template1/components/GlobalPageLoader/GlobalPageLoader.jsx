'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';
import { checkAndClearCache } from '@/utils/versionManager';

const GlobalPageLoader = () => {
  // Check if this is the first load or a navigation
  const isFirstLoad = typeof window !== 'undefined' && !window.__gplHasShown;

  const { t, loading: translationLoading } = useTranslations();
  const [isLoading, setIsLoading] = useState(isFirstLoad);
  const [isTranslationReady, setIsTranslationReady] = useState(false);

  // Memoize particle positions to prevent re-rendering and jerky movement
  const particlePositions = useMemo(() => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: i % 3 === 0 ? 'h-3 w-3' : i % 3 === 1 ? 'h-2 w-2' : 'h-1 w-1',
      animationDelay: Math.random() * 3,
      animationDuration: 1.5 + Math.random() * 2.5,
    }));
  }, []); // Empty dependency array ensures positions are calculated only once

  // Animated loading dots component
  const LoadingDots = ({ color = '#6b5bb8' }) => (
    <div className="flex items-center space-x-1">
      <div
        className="h-2 w-2 animate-bounce rounded-full"
        style={{ backgroundColor: color, animationDelay: '0ms' }}
      />
      <div
        className="h-2 w-2 animate-bounce rounded-full"
        style={{ backgroundColor: color, animationDelay: '150ms' }}
      />
      <div
        className="h-2 w-2 animate-bounce rounded-full"
        style={{ backgroundColor: color, animationDelay: '300ms' }}
      />
    </div>
  );

  // Check for app version updates and clear cache if needed
  useEffect(() => {
    checkAndClearCache();
  }, []);

  // Handle translation loading state
  useEffect(() => {
    if (!translationLoading) {
      // Add a small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsTranslationReady(true);
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [translationLoading]);

  useEffect(() => {
    // Skip timer logic if this is not the first load
    if (!isFirstLoad) {
      return;
    }

    let isPageReady = false;
    let isMinTimeReached = false;

    // Function to hide loader when both conditions are met
    const hideLoader = () => {
      if (isPageReady && isMinTimeReached) {
        setIsLoading(false);
        // Mark that we've shown the loader once
        if (typeof window !== 'undefined') {
          window.__gplHasShown = true;
        }
      }
    };

    // Set minimum loading time of 2 seconds
    const timerId = setTimeout(() => {
      isMinTimeReached = true;
      hideLoader();
    }, 2000);

    // Set maximum loading time of 10 seconds to prevent infinite loading
    const maxTimerId = setTimeout(() => {
      console.warn('Loading timeout reached, forcing loader to hide');
      setIsLoading(false);
    }, 10000);

    // Check if page is ready (DOM loaded and all resources loaded)
    const checkPageReady = () => {
      if (document.readyState === 'complete') {
        isPageReady = true;
        hideLoader();
      }
    };

    // Check initial page state
    if (document.readyState === 'complete') {
      isPageReady = true;
      hideLoader();
    } else {
      // Listen for when all resources are loaded
      window.addEventListener('load', checkPageReady);

      // Also listen for DOMContentLoaded as a fallback
      document.addEventListener('DOMContentLoaded', () => {
        // Add a small delay to ensure everything is truly ready
        setTimeout(() => {
          isPageReady = true;
          hideLoader();
        }, 100);
      });
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
      if (maxTimerId) {
        clearTimeout(maxTimerId);
      }
      window.removeEventListener('load', checkPageReady);
      document.removeEventListener('DOMContentLoaded', checkPageReady);
    };
  }, [isFirstLoad]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#141943]">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#5343b1]/20 via-[#312577]/20 to-[#1c1d40]/20" />
        <div
          className="absolute top-0 left-0 h-full w-full opacity-30"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%235343b1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center space-y-5 sm:space-y-6">
        {/* Logo/App name */}
        <div className="mb-8 text-center sm:mb-8">
          <h1 className="mb-3 bg-gradient-to-r from-cyan-300 via-blue-100 via-purple-200 to-purple-700 bg-clip-text text-3xl font-bold text-transparent sm:text-3xl md:text-4xl">
            KOKOBET777
          </h1>
          <div className="flex h-5 items-center justify-center text-sm font-medium text-[#6b5bb8] sm:text-sm md:text-base">
            {isTranslationReady ? (
              <p className="opacity-100 transition-opacity duration-500 ease-in-out">
                {t('loading_gaming_experience')}
              </p>
            ) : (
              <LoadingDots color="#6b5bb8" />
            )}
          </div>
        </div>

        {/* Animated loader */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="relative h-20 w-20 sm:h-20 sm:w-20 md:h-24 md:w-24">
            <div
              className="absolute inset-0 rounded-full border-3 border-transparent sm:border-4"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent, #5343b1, #6b5bb8, #312577, transparent)',
                animation: 'spin 2s linear infinite',
              }}
            />

            {/* Inner pulsing circle */}
            <div
              className="absolute inset-3 animate-pulse rounded-full bg-gradient-to-br from-[#5343b1] to-[#312577] sm:inset-3"
              style={{
                boxShadow: '0 0 25px #5343b1 sm:0 0 30px #5343b1',
              }}
            />

            {/* Center dot */}
            <div
              className="absolute inset-5 animate-ping rounded-full bg-white sm:inset-6"
              style={{
                animationDuration: '1.5s',
              }}
            />
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-56 overflow-hidden rounded-full bg-[#1c1d40] sm:h-2 sm:w-64 md:w-80">
          <div
            className="h-full animate-pulse rounded-full bg-gradient-to-r from-[#5343b1] via-[#FC7E09] to-[#8b7bd8]"
            style={{
              animationDuration: '2s',
            }}
          />
        </div>

        {/* Loading text */}
        <div className="text-center">
          <div className="flex h-5 items-center justify-center text-sm font-medium text-[#8b7bd8] sm:text-sm md:text-base">
            {isTranslationReady ? (
              <p className="opacity-100 transition-opacity duration-500 ease-in-out">
                {t('preparing_casino_experience')}
              </p>
            ) : (
              <LoadingDots color="#8b7bd8" />
            )}
          </div>
        </div>
      </div>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0">
        {particlePositions.map((particle) => (
          <div
            key={particle.id}
            className={`absolute animate-pulse rounded-full ${particle.size} bg-[#5343b1]`}
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GlobalPageLoader;
