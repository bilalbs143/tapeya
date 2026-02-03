'use client';

import React, { useEffect, useLayoutEffect, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';
import { checkAndClearCache } from '@/utils/versionManager';

const GlobalPageLoader = () => {
  // Check if this is the first load or a navigation
  const isFirstLoad = typeof window !== 'undefined' && !window.__gplHasShown;

  const { t, loading: translationLoading } = useTranslations();
  // Show loader immediately on first load, hide on subsequent navigations
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === 'undefined') return true; // SSR - show by default
    return !window.__gplHasShown; // Show if not shown before
  });
  const [isTranslationReady, setIsTranslationReady] = useState(false);

  // Modern Creative Loader Component
  const ModernLoader = () => {
    return (
      <div className="relative flex items-center justify-center">
        {/* Outer rotating rings */}
        <div className="absolute">
          {/* First ring - larger */}
          <div
            style={{
              width: '180px',
              height: '180px',
              borderRadius: '50%',
              border: '3px solid transparent',
              borderTopColor: '#2DFA1A',
              borderRightColor: '#2DFA1A',
              animation: 'spinForward 3s linear infinite',
              filter: 'drop-shadow(0 0 15px rgba(45, 250, 26, 0.6))',
            }}
          />
        </div>

        {/* Second ring - medium */}
        <div className="absolute">
          <div
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: '3px solid transparent',
              borderBottomColor: '#2DFA1A',
              borderLeftColor: '#2DFA1A',
              animation: 'spinBackward 2.5s linear infinite',
              filter: 'drop-shadow(0 0 12px rgba(45, 250, 26, 0.6))',
            }}
          />
        </div>

        {/* Third ring - small */}
        <div className="absolute">
          <div
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#2DFA1A',
              borderBottomColor: '#2DFA1A',
              animation: 'spinForward 2s linear infinite',
              filter: 'drop-shadow(0 0 10px rgba(45, 250, 26, 0.6))',
            }}
          />
        </div>

        {/* Central glowing orb with pulsing effect */}
        <div
          className="absolute"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2DFA1A 0%, #0A1414 100%)',
            boxShadow: `
              0 0 30px rgba(45, 250, 26, 0.8),
              0 0 60px rgba(45, 250, 26, 0.4),
              inset 0 0 20px rgba(45, 250, 26, 0.3)
            `,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        >
          {/* Inner highlight */}
          <div
            style={{
              position: 'absolute',
              top: '8px',
              left: '8px',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: 'rgba(45, 250, 26, 0.6)',
              filter: 'blur(2px)',
            }}
          />
        </div>

        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute"
            style={{
              animation: `orbit ${3 + i * 0.5}s linear infinite`,
              animationDelay: `${i * 0.6}s`,
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#2DFA1A',
                boxShadow: '0 0 10px #2DFA1A',
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  // Ensure loader shows immediately on first load
  useLayoutEffect(() => {
    if (typeof window !== 'undefined' && !window.__gplHasShown) {
      setIsLoading(true);
    }
  }, []);

  // Check for app version updates and clear cache if needed
  useEffect(() => {
    checkAndClearCache();
  }, []);

  // Handle translation loading state
  useEffect(() => {
    if (!translationLoading) {
      const timer = setTimeout(() => {
        setIsTranslationReady(true);
      }, 100);
      return () => clearTimeout(timer);
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
        setTimeout(() => {
          setIsLoading(false);
          // Mark that we've shown the loader once
          if (typeof window !== 'undefined') {
            window.__gplHasShown = true;
          }
        }, 300);
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
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
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

  // Always render the background immediately to prevent blank screen
  if (!isLoading) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#060D0D]"
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#060D0D',
      }}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        @keyframes spinForward {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes spinBackward {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(110px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(110px) rotate(-360deg);
          }
        }
        @keyframes dotPulse {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>

      {/* Modern gradient background */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 50% 50%, rgba(45, 250, 26, 0.12) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(45, 250, 26, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(45, 250, 26, 0.08) 0%, transparent 40%)
          `,
        }}
      />

      {/* Subtle animated gradient overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(45, 250, 26, 0.05) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8">
        {/* Modern Loader Container */}
        <div
          className="relative"
          style={{
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ModernLoader />
        </div>

        {/* Loading message */}
        <div className="mt-8 flex min-h-[24px] flex-col items-center justify-center text-center sm:mt-10">
          {isTranslationReady ? (
            <p
              className="text-sm font-semibold sm:text-base"
              style={{
                color: '#2DFA1A',
                textShadow: '0 0 10px rgba(45, 250, 26, 0.5)',
              }}
            >
              {t('preparing_casino_experience')}
            </p>
          ) : (
            <div className="flex items-center space-x-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="relative h-3 w-3 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #2DFA1A, #0A1414)',
                    boxShadow: `
                      0 0 15px rgba(45, 250, 26, 0.8),
                      0 0 30px rgba(45, 250, 26, 0.4)
                    `,
                    animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }}
                >
                  <div
                    className="absolute top-0.5 left-0.5 h-1 w-1 rounded-full bg-white opacity-60"
                    style={{ filter: 'blur(0.5px)' }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalPageLoader;
