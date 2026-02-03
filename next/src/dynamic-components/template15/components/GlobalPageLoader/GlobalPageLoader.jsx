'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';
import { checkAndClearCache } from '@/utils/versionManager';

const GlobalPageLoader = () => {
  // Check if this is the first load or a navigation
  const isFirstLoad = typeof window !== 'undefined' && !window.__gplHasShown;

  const { t, loading: translationLoading } = useTranslations();
  // Initialize as true immediately to show loader right away
  const [isLoading, setIsLoading] = useState(true);
  const [isTranslationReady, setIsTranslationReady] = useState(false);

  // Card suits for floating animation
  const cardSuits = ['♠', '♥', '♦', '♣'];

  // Memoize theme-colored dots positions
  const themeDots = useMemo(() => {
    return [...Array(100)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      color: i % 3 === 0 ? '#CBBC91' : '#DFA336',
      glowSize: 4 + Math.random() * 8,
      animationDuration: 2 + Math.random() * 3,
      animationDelay: Math.random() * 3,
    }));
  }, []);

  // Memoize floating card suits
  const floatingSuits = useMemo(() => {
    return [...Array(12)].map((_, i) => ({
      id: i,
      suit: cardSuits[i % cardSuits.length],
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 20 + Math.random() * 30,
      animationDuration: 3 + Math.random() * 4,
      animationDelay: Math.random() * 2,
      rotation: Math.random() * 360,
    }));
  }, []);

  // Animated loading dots component with template15 theme colors
  const LoadingDots = () => (
    <div className="flex items-center space-x-2">
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #CBBC91, #DFA336)',
          boxShadow:
            '0 0 15px rgba(203, 188, 145, 0.6), 0 0 25px rgba(223, 163, 54, 0.4)',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: '0ms',
        }}
      />
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #DFA336, #CBBC91)',
          boxShadow:
            '0 0 15px rgba(223, 163, 54, 0.6), 0 0 25px rgba(203, 188, 145, 0.4)',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: '150ms',
        }}
      />
      <div
        className="h-3 w-3 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #CBBC91, #DFA336)',
          boxShadow:
            '0 0 15px rgba(203, 188, 145, 0.6), 0 0 25px rgba(223, 163, 54, 0.4)',
          animation: 'bounce 1s ease-in-out infinite',
          animationDelay: '300ms',
        }}
      />
    </div>
  );

  // Poker Chip Component
  const PokerChip = () => (
    <div className="relative">
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #CBBC91, #DFA336)',
          animation: 'chipRotate 3s linear infinite',
          boxShadow:
            '0 0 30px rgba(203, 188, 145, 0.6), 0 0 60px rgba(223, 163, 54, 0.3)',
        }}
      />
      {/* Middle ring */}
      <div
        className="absolute inset-2 rounded-full"
        style={{
          background: '#121212',
        }}
      />
      {/* Inner circle */}
      <div
        className="absolute inset-6 rounded-full"
        style={{
          background: 'linear-gradient(135deg, #DFA336, #CBBC91)',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5)',
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

  useEffect(() => {
    // Skip timer logic if this is not the first load
    if (!isFirstLoad) {
      setIsLoading(false);
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
      style={{
        backgroundColor: '#18181a',
        backgroundImage: "url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Background+Image.png')",
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        opacity: 1,
        visibility: 'visible',
      }}
    >
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
        @keyframes chipRotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes floatUp {
          0% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.3;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100px) rotate(360deg);
            opacity: 0;
          }
        }
        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
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
            0 0 20px rgba(203, 188, 145, 0.4),
            0 0 40px rgba(223, 163, 54, 0.2);
          }
          50% {
            box-shadow:
              0 0 30px rgba(203, 188, 145, 0.6),
              0 0 60px rgba(223, 163, 54, 0.4);
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
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in;
        }
      `}</style>

      {/* Theme-colored dots background */}
      <div className="pointer-events-none absolute inset-0">
        {themeDots.map((dot) => (
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

      {/* Floating card suits */}
      <div className="pointer-events-none absolute inset-0">
        {floatingSuits.map((suit) => (
          <div
            key={suit.id}
            className="absolute"
            style={{
              left: `${suit.left}%`,
              top: `${suit.top}%`,
              fontSize: `${suit.size}px`,
              color: suit.id % 2 === 0 ? '#CBBC91' : '#DFA336',
              animation: `floatUp ${suit.animationDuration}s ease-in-out infinite`,
              animationDelay: `${suit.animationDelay}s`,
              transform: `rotate(${suit.rotation}deg)`,
              textShadow: '0 0 20px currentColor',
              opacity: 0.4,
            }}
          >
            {suit.suit}
          </div>
        ))}
      </div>

      {/* Main loader content */}
      <div
        className="relative z-10 flex flex-col items-center"
        style={{
          opacity: 1,
          animation: 'fadeIn 0.2s ease-in',
        }}
      >
        {/* Central Poker Chip */}
        <div className="relative mb-12 sm:mb-14">
          {/* Pulse rings */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '3px solid #CBBC91',
              animation: 'pulseRing 2s ease-out infinite',
              opacity: 0.6,
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '3px solid #DFA336',
              animation: 'pulseRing 2s ease-out infinite',
              animationDelay: '0.5s',
              opacity: 0.4,
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              border: '3px solid #CBBC91',
              animation: 'pulseRing 2s ease-out infinite',
              animationDelay: '1s',
              opacity: 0.2,
            }}
          />

          {/* Poker Chip */}
          <div className="relative h-32 w-32 sm:h-40 sm:w-40">
            <PokerChip />
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 sm:w-80 mb-4 sm:mb-6">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/40 sm:h-2">
            <div
              className="h-full"
              style={{
                background:
                  'linear-gradient(90deg, #CBBC91, #DFA336, #CBBC91)',
                boxShadow: '0 0 15px rgba(203, 188, 145, 0.6)',
                animation: 'shimmer 2s ease-in-out infinite',
                width: '65%',
              }}
            />
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
                    'linear-gradient(90deg, #CBBC91, #DFA336, #CBBC91)',
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
