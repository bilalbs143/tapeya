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

  // Slot machine symbols
  const slotSymbols = ['💎', '👑', '⭐', '🎰', '💰', '🍀', '7️⃣'];

  // Memoize green dots positions
  const greenDots = useMemo(() => {
    return [...Array(100)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      color: i % 3 === 0 ? '#03C72C' : '#55BC55',
      glowSize: 4 + Math.random() * 8,
      animationDuration: 2 + Math.random() * 3,
      animationDelay: Math.random() * 3,
    }));
  }, []);

  // Animated loading dots component with green theme
  const LoadingDots = () => (
    <div className="flex items-center space-x-2">
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #03C72C, #55BC55)',
          boxShadow:
            '0 0 15px rgba(3, 199, 44, 0.6), 0 0 25px rgba(85, 188, 85, 0.4)',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: '0ms',
        }}
      />
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #55BC55, #03C72C)',
          boxShadow:
            '0 0 15px rgba(85, 188, 85, 0.6), 0 0 25px rgba(3, 199, 44, 0.4)',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: '150ms',
        }}
      />
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #03C72C, #55BC55)',
          boxShadow:
            '0 0 15px rgba(3, 199, 44, 0.6), 0 0 25px rgba(85, 188, 85, 0.4)',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: '300ms',
        }}
      />
    </div>
  );

  // Slot Machine Reel Component
  const SlotReel = ({ delay = 0, speed = 1, offset = 0 }) => {
    // Rotate symbols based on offset to show different symbols in each reel
    const rotatedSymbols = [
      ...slotSymbols.slice(offset),
      ...slotSymbols.slice(0, offset),
    ];

    return (
      <div
        className="relative h-28 w-20 overflow-hidden rounded-md sm:h-40 sm:w-32 sm:rounded-lg"
        style={{
          background:
            'linear-gradient(180deg, #060D0D 0%, #0A0A0A 50%, #060D0D 100%)',
          boxShadow:
            'inset 0 0 20px rgba(0, 0, 0, 0.9), 0 4px 12px rgba(0, 0, 0, 0.5)',
          border: '2px solid #03C72C',
        }}
      >
        {/* Spinning symbols */}
        <div
          style={{
            animation: `slotSpin ${speed}s linear infinite`,
            animationDelay: `${delay}s`,
          }}
        >
          {[...rotatedSymbols, ...rotatedSymbols].map((symbol, i) => (
            <div
              key={i}
              className="flex h-28 items-center justify-center text-3xl sm:h-40 sm:text-6xl"
              style={{
                textShadow: '0 0 20px rgba(3, 199, 44, 0.8)',
              }}
            >
              {symbol}
            </div>
          ))}
        </div>

        {/* Top gradient overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-10 sm:h-14"
          style={{
            background:
              'linear-gradient(180deg, rgba(0, 0, 0, 0.95) 0%, transparent 100%)',
          }}
        />

        {/* Bottom gradient overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-10 sm:h-14"
          style={{
            background:
              'linear-gradient(0deg, rgba(0, 0, 0, 0.95) 0%, transparent 100%)',
          }}
        />

        {/* Center win line */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2"
          style={{
            height: '2px',
            boxShadow: '0 0 15px rgba(3, 199, 44, 0.6)',
            background:
              'linear-gradient(90deg, transparent, #03C72C 20%, #03C72C 80%, transparent)',
          }}
        />
      </div>
    );
  };

  // Diamond particle component
  const DiamondParticle = ({ size = 8 }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 2 L6 8 L10 18 L14 8 Z"
        fill="url(#diamondGradient)"
        stroke="#03C72C"
        strokeWidth="0.5"
      />
      <defs>
        <linearGradient
          id="diamondGradient"
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor="#03C72C" />
          <stop offset="50%" stopColor="#55BC55" />
          <stop offset="100%" stopColor="#03C72C" />
        </linearGradient>
      </defs>
    </svg>
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#000000] via-[#0A0A0A] to-[#1A1410]">
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
            animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
          }
          50% {
            transform: translateY(-25%);
            animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
          }
        }
        @keyframes slotSpin {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-30px) rotate(180deg);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) scaleX(0.5);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%) scaleX(0.5);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes glow {
          0%,
          100% {
            box-shadow:
              0 0 20px rgba(3, 199, 44, 0.4),
              0 0 40px rgba(85, 188, 85, 0.2);
          }
          50% {
            box-shadow:
              0 0 30px rgba(3, 199, 44, 0.6),
              0 0 60px rgba(85, 188, 85, 0.4);
          }
        }
        @keyframes slideIn {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes rotateHue {
          0% {
            filter: hue-rotate(0deg) brightness(1);
          }
          50% {
            filter: hue-rotate(10deg) brightness(1.2);
          }
          100% {
            filter: hue-rotate(0deg) brightness(1);
          }
        }
        @keyframes gradientShift {
          0%,
          100% {
            transform: translate(0%, 0%) scale(1);
            opacity: 0.4;
          }
          50% {
            transform: translate(10%, 10%) scale(1.1);
            opacity: 0.6;
          }
        }
        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes rayRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
      `}</style>

      {/* Green dots background */}
      <div className="pointer-events-none absolute inset-0">
        {greenDots.map((dot) => (
          <div
            key={dot.id}
            className="absolute"
            style={{
              left: `${dot.left}%`,
              top: `${dot.top}%`,
              width: `${dot.size}px`,
              height: `${dot.size}px`,
              borderRadius: '50%',
              background: dot.color,
              boxShadow: `0 0 ${dot.glowSize}px ${dot.color}`,
              animation: `twinkle ${dot.animationDuration}s ease-in-out infinite`,
              animationDelay: `${dot.animationDelay}s`,
            }}
          />
        ))}
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center space-y-6 sm:space-y-8">
        {/* Slot Machine Container */}
        <div
          className="relative rounded-xl p-4 sm:rounded-2xl sm:p-8"
          style={{
            background:
              'linear-gradient(135deg, #060D0D 0%, #0A0A0A 50%, #060D0D 100%)',
            boxShadow:
              '0 10px 40px rgba(0, 0, 0, 0.6), 0 0 40px rgba(3, 199, 44, 0.2)',
            border: '2px solid #03C72C',
          }}
        >
          {/* Slot Machine Header */}
          <div className="mb-3 text-center sm:mb-5">
            <div className="mb-2 flex items-center justify-center gap-1.5 text-lg sm:mb-3 sm:gap-2 sm:text-3xl">
              <span
                className="text-xl sm:text-2xl"
                style={{
                  animation: 'bounce 1s ease-in-out infinite',
                  textShadow: '0 0 20px rgba(3, 199, 44, 0.9)',
                }}
              >
                🎰
              </span>
              <span
                className="text-lg font-bold tracking-wider sm:text-2xl"
                style={{
                  background:
                    'linear-gradient(90deg, #03C72C, #55BC55, #03C72C)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                JACKPOT
              </span>
              <span
                className="text-xl sm:text-2xl"
                style={{
                  animation: 'bounce 1s ease-in-out infinite',
                  animationDelay: '0.3s',
                  textShadow: '0 0 20px rgba(3, 199, 44, 0.9)',
                }}
              >
                🎰
              </span>
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full overflow-hidden rounded-full bg-black/80 sm:h-1.5">
              <div
                className="h-full"
                style={{
                  background:
                    'linear-gradient(90deg, #03C72C, #55BC55, #03C72C)',
                  boxShadow: '0 0 10px rgba(3, 199, 44, 0.5)',
                  animation: 'shimmer 2s ease-in-out infinite',
                  width: '60%',
                }}
              />
            </div>
          </div>

          {/* Slot Machine Reels */}
          <div className="flex gap-2 sm:gap-4">
            <SlotReel delay={0} speed={1.2} offset={0} />
            <SlotReel delay={0} speed={1.2} offset={2} />
            <SlotReel delay={0} speed={1.2} offset={4} />
          </div>

          {/* Bottom decoration */}
          <div className="mt-3 flex items-center justify-center gap-1.5 sm:mt-5 sm:gap-2">
            {['💎', '👑', '⭐'].map((symbol, i) => (
              <div
                key={i}
                className="text-xl sm:text-3xl"
                style={{
                  animation: 'bounce 1.2s ease-in-out infinite',
                  animationDelay: `${i * 0.2}s`,
                  textShadow: '0 0 15px rgba(3, 199, 44, 0.8)',
                }}
              >
                {symbol}
              </div>
            ))}
          </div>
        </div>

        {/* Loading status text */}
        <div className="text-center">
          <div className="flex h-6 items-center justify-center text-sm font-semibold tracking-wide sm:text-lg md:text-xl">
            {isTranslationReady ? (
              <p
                className="opacity-100 transition-opacity duration-500 ease-in-out"
                style={{
                  background:
                    'linear-gradient(90deg, #03C72C, #55BC55, #03C72C)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'slideIn 0.5s ease-out',
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
    </div>
  );
};

export default GlobalPageLoader;
