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

  // Different slot machine icons for variety
  const slotIconSets = [
    ['🍒', '7️⃣', '💎', '🪙', '⭐', '🔔'],
    ['🍋', '🍊', '🍇', '🍉', '🍓', '💰'],
    ['💎', '👑', '🎰', '💵', '🏆', '⚡'],
    ['🔥', '💫', '🌟', '✨', '💥', '🎯'],
    ['🍀', '🎲', '🎴', '🃏', '🎁', '💸'],
  ];

  // Slot Reel Component
  const SlotReel = ({ index }) => {
    const icons = slotIconSets[index % slotIconSets.length];

    return (
      <div className="relative mx-[3px] inline-block h-[65px] w-[50px] sm:mx-[5px] sm:h-[90px] sm:w-[70px]">
        {/* Reel container with neon frame */}
        <div
          className="relative h-full w-full overflow-hidden rounded-lg"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)',
            border: '3px solid #F45E2A',
            boxShadow: `
              0 0 20px rgba(244, 94, 42, 0.6),
              0 0 40px rgba(255, 215, 0, 0.3),
              inset 0 0 20px rgba(244, 94, 42, 0.1)
            `,
          }}
        >
          {/* Spinning icons */}
          <div
            className="absolute right-0 left-0 flex flex-col"
            style={{
              animation: `reelSpin${index} ${1.5 + index * 0.15}s linear infinite`,
              willChange: 'transform',
              top: '0',
            }}
          >
            {/* Repeat icons multiple times for seamless infinite loop */}
            {[...Array(4)].map((_, repeat) =>
              icons.map((icon, i) => (
                <div
                  key={`${repeat}-${i}`}
                  className="flex h-[65px] max-h-[65px] min-h-[65px] w-[50px] items-center justify-center text-2xl sm:h-[90px] sm:max-h-[90px] sm:min-h-[90px] sm:w-[70px] sm:text-3xl"
                >
                  {icon}
                </div>
              )),
            )}
          </div>
        </div>

        {/* Neon glow effect */}
        <div
          className="pointer-events-none absolute inset-0 rounded-lg"
          style={{
            animation: 'neonPulse 2s ease-in-out infinite',
            animationDelay: `${index * 0.2}s`,
          }}
        />
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
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#000000]"
      style={{
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#000000',
      }}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <style jsx global>{`
        @keyframes reelSpin0 {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-260px);
          }
        }
        @keyframes reelSpin1 {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-260px);
          }
        }
        @keyframes reelSpin2 {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-260px);
          }
        }
        @keyframes reelSpin3 {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-260px);
          }
        }
        @keyframes reelSpin4 {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-260px);
          }
        }

        @media (min-width: 640px) {
          @keyframes reelSpin0 {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(-360px);
            }
          }
          @keyframes reelSpin1 {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(-360px);
            }
          }
          @keyframes reelSpin2 {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(-360px);
            }
          }
          @keyframes reelSpin3 {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(-360px);
            }
          }
          @keyframes reelSpin4 {
            from {
              transform: translateY(0);
            }
            to {
              transform: translateY(-360px);
            }
          }
          .slot-machine-container {
            box-shadow:
              0 0 40px rgba(244, 94, 42, 0.6),
              0 0 80px rgba(255, 215, 0, 0.3),
              inset 0 0 40px rgba(244, 94, 42, 0.1) !important;
          }
        }
        @keyframes neonPulse {
          0%,
          100% {
            box-shadow:
              0 0 10px rgba(244, 94, 42, 0.4),
              0 0 20px rgba(255, 215, 0, 0.2),
              inset 0 0 10px rgba(244, 94, 42, 0.1);
          }
          50% {
            box-shadow:
              0 0 20px rgba(244, 94, 42, 0.8),
              0 0 40px rgba(255, 215, 0, 0.4),
              inset 0 0 20px rgba(244, 94, 42, 0.2);
          }
        }
        @keyframes slotGlow {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
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
        @keyframes progressShimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>

      {/* Casino neon background lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 30%, rgba(244, 94, 42, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(214, 19, 36, 0.15) 0%, transparent 50%)
          `,
          animation: 'slotGlow 3s ease-in-out infinite',
        }}
      />

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        {/* Slot Machine Container */}
        <div
          className="slot-machine-container relative rounded-xl border-[3px] p-4 sm:rounded-2xl sm:border-4 sm:p-8"
          style={{
            background: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
            borderColor: '#F45E2A',
            boxShadow: `
              0 0 30px rgba(244, 94, 42, 0.6),
              0 0 60px rgba(255, 215, 0, 0.3),
              inset 0 0 30px rgba(244, 94, 42, 0.1)
            `,
          }}
        >
          {/* Slot Reels */}
          <div className="flex items-center justify-center">
            {[...Array(5)].map((_, index) => (
              <SlotReel key={index} index={index} />
            ))}
          </div>

          {/* Decorative lights on machine */}
          <div className="mt-4 flex justify-center gap-2 sm:mt-6 sm:gap-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-2 w-2 rounded-full sm:h-3 sm:w-3"
                style={{
                  background:
                    i % 3 === 0
                      ? '#FFD700'
                      : i % 3 === 1
                        ? '#F45E2A'
                        : '#D61324',
                  boxShadow: `0 0 8px ${i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#F45E2A' : '#D61324'}`,
                  animation: `dotPulse 1.5s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Loading message */}
        <div className="mt-4 flex min-h-[24px] flex-col items-center justify-center px-4 text-center sm:mt-8 sm:min-h-[32px]">
          {isTranslationReady ? (
            <p
              className="text-xs font-bold tracking-[0.5px] sm:text-sm sm:tracking-normal md:text-base lg:text-lg"
              style={{
                background:
                  'linear-gradient(90deg, #F45E2A 0%, #FFD700 50%, #F45E2A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 0 15px rgba(244, 94, 42, 0.5))',
              }}
            >
              {t('preparing_casino_experience')}
            </p>
          ) : (
            <div className="flex items-center space-x-2">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: '#F45E2A',
                    boxShadow: '0 0 10px rgba(244, 94, 42, 0.6)',
                    animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalPageLoader;
