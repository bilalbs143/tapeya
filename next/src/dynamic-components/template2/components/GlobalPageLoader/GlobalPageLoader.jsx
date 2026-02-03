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

  // Memoize casino chip positions for floating animation
  const casinoChips = useMemo(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 18 + Math.random() * 22,
      animationDelay: Math.random() * 5,
      animationDuration: 4 + Math.random() * 4,
      rotation: Math.random() * 360,
      color: ['#51A2FF', '#3B82F6', '#6366F1'][i % 3],
    }));
  }, []);

  // Memoize sparkle positions
  const sparkles = useMemo(() => {
    return [...Array(30)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 3,
      animationDuration: 1 + Math.random() * 2,
    }));
  }, []);

  // Animated loading dots component
  const LoadingDots = () => (
    <div className="flex items-center space-x-2">
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #51A2FF, #3B82F6)',
          boxShadow: '0 0 10px rgba(81, 162, 255, 0.5)',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: '0ms',
        }}
      />
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
          boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: '150ms',
        }}
      />
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #6366F1, #51A2FF)',
          boxShadow: '0 0 10px rgba(81, 162, 255, 0.5)',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: '300ms',
        }}
      />
    </div>
  );

  // Casino Chip SVG Component
  const CasinoChip = ({
    size = 40,
    color = '#51A2FF',
    delay = 0,
    duration = 4,
  }) => (
    <div
      className="absolute"
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 0 10px rgba(81, 162, 255, 0.5))',
        }}
      >
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={color}
          stroke="#fff"
          strokeWidth="2"
        />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#fff"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        <circle
          cx="50"
          cy="50"
          r="25"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
        />
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45 * Math.PI) / 180;
          const x1 = 50 + Math.cos(angle) * 35;
          const y1 = 50 + Math.sin(angle) * 35;
          const x2 = 50 + Math.cos(angle) * 43;
          const y2 = 50 + Math.sin(angle) * 43;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#fff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </div>
  );

  // Dice SVG Component
  const Dice = () => (
    <div className="animate-spin" style={{ animationDuration: '3s' }}>
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="12"
          fill="url(#diceGradient)"
          stroke="#fff"
          strokeWidth="2"
        />
        <defs>
          <linearGradient id="diceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#51A2FF" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>
        <circle cx="30" cy="30" r="6" fill="#fff" />
        <circle cx="50" cy="50" r="6" fill="#fff" />
        <circle cx="70" cy="70" r="6" fill="#fff" />
        <circle cx="30" cy="70" r="6" fill="#fff" />
        <circle cx="70" cy="30" r="6" fill="#fff" />
      </svg>
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#000304] via-[#0A0D10] to-[#000304]">
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
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        @keyframes glow {
          0%,
          100% {
            opacity: 0.7;
            transform: translate(-50%, -50%) scale(1);
            box-shadow: 0 0 10px currentColor;
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.1);
            box-shadow: 0 0 20px currentColor;
          }
        }
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 0.8;
          }
        }
        @keyframes roulette {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes slotSpin {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-300%);
          }
        }
        @keyframes flip {
          0% {
            transform: rotateY(0deg);
          }
          50% {
            transform: rotateY(180deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
      `}</style>

      {/* Animated background gradient */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            background:
              'radial-gradient(circle at 20% 30%, rgba(81, 162, 255, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.18) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.12) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Floating casino chips */}
      <div className="pointer-events-none absolute inset-0">
        {casinoChips.map((chip) => (
          <div
            key={chip.id}
            style={{
              position: 'absolute',
              left: `${chip.left}%`,
              top: `${chip.top}%`,
              opacity: 0.4,
              animation: `float ${chip.animationDuration}s ease-in-out infinite`,
              animationDelay: `${chip.animationDelay}s`,
            }}
          >
            <CasinoChip size={chip.size} color={chip.color} />
          </div>
        ))}
      </div>

      {/* Sparkle effects */}
      <div className="pointer-events-none absolute inset-0">
        {sparkles.map((sparkle) => (
          <div
            key={sparkle.id}
            className="absolute h-1 w-1 rounded-full bg-white"
            style={{
              left: `${sparkle.left}%`,
              top: `${sparkle.top}%`,
              animation: `pulse ${sparkle.animationDuration}s ease-in-out infinite`,
              animationDelay: `${sparkle.animationDelay}s`,
            }}
          />
        ))}
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center space-y-8">
        {/* Casino roulette loader */}
        <div className="relative flex items-center justify-center">
          {/* Outer roulette wheel */}
          <div className="relative h-40 w-40 sm:h-44 sm:w-44 md:h-48 md:w-48">
            {/* Spinning gradient ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, #51A2FF, #6366F1, #3B82F6, #60A5FA, #51A2FF)',
                animation: 'roulette 3s linear infinite',
                boxShadow:
                  '0 0 40px rgba(81, 162, 255, 0.6), 0 0 60px rgba(99, 102, 241, 0.4), inset 0 0 20px rgba(0, 0, 0, 0.5)',
              }}
            />

            {/* Inner black ring */}
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-[#0A0D10] to-[#000304]" />

            {/* Casino chip pattern */}
            <div className="absolute inset-8 flex items-center justify-center">
              <div className="relative h-full w-full">
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30 * Math.PI) / 180;
                  const radius = 45;
                  const x = 50 + Math.cos(angle) * radius;
                  const y = 50 + Math.sin(angle) * radius;
                  const color =
                    i % 3 === 0
                      ? '#51A2FF'
                      : i % 3 === 1
                        ? '#6366F1'
                        : '#3B82F6';
                  return (
                    <div
                      key={i}
                      className="absolute h-3 w-3 rounded-full"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        backgroundColor: color,
                        color: color,
                        animation: 'glow 1.5s ease-in-out infinite',
                        animationDelay: `${i * 0.1}s`,
                      }}
                    />
                  );
                })}

                {/* Center dice */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Dice />
                </div>
              </div>
            </div>

            {/* Outer glow effect */}
            <div
              className="absolute inset-[-20px] rounded-full"
              style={{
                background:
                  'radial-gradient(circle, rgba(81, 162, 255, 0.3) 0%, transparent 70%)',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
          </div>
        </div>

        {/* Loading status text */}
        <div className="text-center">
          <div className="flex h-6 items-center justify-center text-lg font-semibold tracking-wide sm:text-xl">
            {isTranslationReady ? (
              <p className="bg-gradient-to-r from-[#51A2FF] via-[#6366F1] to-[#3B82F6] bg-clip-text text-transparent opacity-100 transition-opacity duration-500 ease-in-out">
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
