'use client';

import React, { useEffect, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';
import { checkAndClearCache } from '@/utils/versionManager';

const GlobalPageLoader = () => {
  // Check if this is the first load or a navigation
  const isFirstLoad = typeof window !== 'undefined' && !window.__gplHasShown;

  const { t, loading: translationLoading } = useTranslations();
  const [isLoading, setIsLoading] = useState(isFirstLoad);
  const [isTranslationReady, setIsTranslationReady] = useState(false);
  const [progress, setProgress] = useState(0);

  // Dancing particles
  const particles = React.useMemo(() => {
    return [...Array(80)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      color:
        i % 3 === 0
          ? '#20C5FE'
          : i % 3 === 1
            ? '#00374A'
            : 'rgba(32, 197, 254, 0.3)',
      animationDuration: 4 + Math.random() * 6,
      animationDelay: Math.random() * 4,
    }));
  }, []);

  // 3D Dice Component
  const Dice3D = () => (
    <div
      className="relative flex h-16 w-16 items-center justify-center rounded-lg sm:h-20 sm:w-20"
      style={{
        background: 'linear-gradient(135deg, #0F131C, #00374A)',
        border: '2px solid #20C5FE',
        boxShadow:
          '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 25px rgba(32, 197, 254, 0.5), inset 0 0 20px rgba(32, 197, 254, 0.15)',
      }}
    >
      {/* Dice dots showing 5 */}
      <div className="relative h-full w-full">
        {/* Top-left dot */}
        <div
          className="absolute top-[15%] left-[15%] h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
          style={{
            background: '#20C5FE',
            boxShadow: '0 0 10px rgba(32, 197, 254, 1)',
          }}
        />
        {/* Top-right dot */}
        <div
          className="absolute top-[15%] right-[15%] h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
          style={{
            background: '#20C5FE',
            boxShadow: '0 0 10px rgba(32, 197, 254, 1)',
          }}
        />
        {/* Center dot */}
        <div
          className="absolute top-1/2 left-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-3 sm:w-3"
          style={{
            background: '#20C5FE',
            boxShadow: '0 0 10px rgba(32, 197, 254, 1)',
          }}
        />
        {/* Bottom-left dot */}
        <div
          className="absolute bottom-[15%] left-[15%] h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
          style={{
            background: '#20C5FE',
            boxShadow: '0 0 10px rgba(32, 197, 254, 1)',
          }}
        />
        {/* Bottom-right dot */}
        <div
          className="absolute right-[15%] bottom-[15%] h-2.5 w-2.5 rounded-full sm:h-3 sm:w-3"
          style={{
            background: '#20C5FE',
            boxShadow: '0 0 10px rgba(32, 197, 254, 1)',
          }}
        />
      </div>
    </div>
  );

  // Animated loading dots component
  const LoadingDots = () => (
    <div className="flex items-center space-x-2">
      <div
        className="h-2 w-2 rounded-full"
        style={{
          background: '#20C5FE',
          boxShadow: '0 0 10px rgba(32, 197, 254, 0.6)',
          animation: 'dotPulse 1.4s ease-in-out infinite',
          animationDelay: '0ms',
        }}
      />
      <div
        className="h-2 w-2 rounded-full"
        style={{
          background: '#20C5FE',
          boxShadow: '0 0 10px rgba(32, 197, 254, 0.6)',
          animation: 'dotPulse 1.4s ease-in-out infinite',
          animationDelay: '200ms',
        }}
      />
      <div
        className="h-2 w-2 rounded-full"
        style={{
          background: '#20C5FE',
          boxShadow: '0 0 10px rgba(32, 197, 254, 0.6)',
          animation: 'dotPulse 1.4s ease-in-out infinite',
          animationDelay: '400ms',
        }}
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

  // Simulate progress bar
  useEffect(() => {
    if (!isFirstLoad) {
      return;
    }

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    return () => {
      clearInterval(progressInterval);
    };
  }, [isFirstLoad]);

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
        setProgress(100);
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
      setProgress(100);
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

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#00111A]">
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes spinReverse {
          0% {
            transform: rotate(360deg);
          }
          100% {
            transform: rotate(0deg);
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
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        @keyframes glow {
          0%,
          100% {
            filter: drop-shadow(0 0 20px rgba(32, 197, 254, 0.4));
          }
          50% {
            filter: drop-shadow(0 0 35px rgba(32, 197, 254, 0.7));
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-20px) translateX(10px);
          }
          66% {
            transform: translateY(-10px) translateX(-10px);
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.3);
          }
        }
        @keyframes progressShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>

      {/* Background gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(32, 197, 254, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* Dancing particles background */}
      <div className="pointer-events-none absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: particle.color,
              boxShadow: `0 0 8px ${particle.color}`,
              animation: `float ${particle.animationDuration}s ease-in-out infinite, twinkle ${particle.animationDuration * 1.2}s ease-in-out infinite`,
              animationDelay: `${particle.animationDelay}s`,
            }}
          />
        ))}
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center px-4 py-8 sm:py-12">
        {/* Circular spinner container with 3D dice */}
        <div className="relative mb-6 flex h-36 w-36 items-center justify-center sm:mb-10 sm:h-48 sm:w-48">
          {/* Outer rotating circle */}
          <div
            className="absolute h-36 w-36 rounded-full sm:h-48 sm:w-48"
            style={{
              border: '3px solid transparent',
              borderTopColor: '#20C5FE',
              borderRightColor: '#20C5FE',
              animation: 'spin 2s linear infinite',
              boxShadow: '0 0 40px rgba(32, 197, 254, 0.3)',
            }}
          />

          {/* Middle rotating circle - reverse direction */}
          <div
            className="absolute h-28 w-28 rounded-full sm:h-36 sm:w-36"
            style={{
              border: '2px solid transparent',
              borderBottomColor: 'rgba(32, 197, 254, 0.4)',
              borderLeftColor: 'rgba(32, 197, 254, 0.4)',
              animation: 'spinReverse 3s linear infinite',
            }}
          />

          {/* 3D Dice in center */}
          <div
            style={{
              animation: 'glow 2s ease-in-out infinite',
            }}
          >
            <Dice3D />
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5 w-[270px] sm:mb-8">
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{
              background: 'rgba(15, 19, 28, 0.6)',
              border: '1px solid rgba(32, 197, 254, 0.3)',
            }}
          >
            <div
              className="relative h-full transition-all duration-300 ease-out"
              style={{
                width: `${progress}%`,
                background:
                  'linear-gradient(90deg, #20C5FE 0%, #FFFFFF 50%, #20C5FE 100%)',
                boxShadow:
                  '0 0 15px rgba(32, 197, 254, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.5)',
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)',
                  animation: 'progressShimmer 2s ease-in-out infinite',
                }}
              />
            </div>
          </div>
        </div>

        {/* Loading message with gradient */}
        <div className="flex min-h-[32px] flex-col items-center justify-center px-4 text-center sm:min-h-[40px]">
          {isTranslationReady ? (
            <p
              className="text-sm font-bold tracking-wide sm:text-base md:text-lg"
              style={{
                background:
                  'linear-gradient(90deg, #20C5FE 0%, #FFFFFF 50%, #20C5FE 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 15px rgba(32, 197, 254, 0.5))',
              }}
            >
              {t('preparing_casino_experience')}
            </p>
          ) : (
            <LoadingDots />
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalPageLoader;
