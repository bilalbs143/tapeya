'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';
import { checkAndClearCache } from '@/utils/versionManager';

const GlobalPageLoader = () => {
  // Show the loader only on the very first load
  const isFirstLoad = typeof window !== 'undefined' && !window.__gplHasShown;

  const { t, loading: translationLoading } = useTranslations();
  const [isLoading, setIsLoading] = useState(isFirstLoad);
  const [isTranslationReady, setIsTranslationReady] = useState(false);

  const nebulaParticles = useMemo(() => {
    const colors = ['#7E92B5', '#5E6C8B', '#3B4E6D'];
    return [...Array(90)].map((_, index) => ({
      id: index,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      color: colors[index % colors.length],
      glow: 4 + Math.random() * 6,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 3,
    }));
  }, []);

  const LoadingDots = () => (
    <div className="flex items-center space-x-2">
      {['#7E92B5', '#5E6C8B', '#3B4E6D'].map((color, index) => (
        <div
          key={color}
          className="h-3 w-3 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${color}, #030712)`,
            boxShadow: `0 0 10px ${color}30, 0 0 20px ${color}20`,
            animation: 'bounce 0.8s ease-in-out infinite',
            animationDelay: `${index * 150}ms`,
          }}
        />
      ))}
    </div>
  );

  const orbitBands = [
    {
      size: 250,
      duration: 8,
      delay: 0,
      gradient: 'linear-gradient(120deg, #6C7BA0, #4D5670)',
    },
    {
      size: 200,
      duration: 9,
      delay: 0.8,
      gradient: 'linear-gradient(120deg, #4D5670, #2A384F)',
    },
    {
      size: 160,
      duration: 7,
      delay: 0.4,
      gradient: 'linear-gradient(120deg, #2A384F, #5A6B8B)',
    },
  ];

  const OrbitalRing = ({ size, gradient, duration, delay }) => (
    <div
      className="absolute rounded-full border border-transparent"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderImage: `${gradient} 1`,
        borderImageSlice: 1,
        borderImageRepeat: 'stretch',
        animation: `ringSpin ${duration}s linear infinite`,
        animationDelay: `${delay}s`,
      }}
    />
  );

  const NebulaCore = () => (
    <div className="relative flex h-[220px] w-[220px] items-center justify-center sm:h-[280px] sm:w-[280px]">
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 30% 30%, rgba(126, 146, 181, 0.4), transparent 55%)',
          filter: 'blur(10px)',
          opacity: 0.75,
        }}
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, rgba(90, 107, 139, 0.35), transparent 60%)',
          filter: 'blur(25px)',
          opacity: 0.6,
        }}
      />
      {orbitBands.map((band) => (
        <OrbitalRing
          key={`${band.size}-${band.duration}`}
          size={band.size}
          gradient={band.gradient}
          duration={band.duration}
          delay={band.delay}
        />
      ))}
      <div
        className="absolute inset-8 rounded-full border border-white/10"
        style={{
          boxShadow: '0 0 25px rgba(255, 255, 255, 0.15)',
        }}
      />
      <div
        className="relative h-[100px] w-[100px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, #5B6C8F, #5B6C8F 40%, #3B4E6D 70%, #1E2A4A)',
          boxShadow:
            '0 0 25px rgba(91, 108, 143, 0.35), 0 0 40px rgba(27, 38, 62, 0.35)',
          animation: 'orbPulse 3.2s ease-in-out infinite',
        }}
      >
        <div
          className="absolute inset-1 rounded-full bg-gradient-to-br from-transparent to-white/20"
          style={{
            filter: 'blur(6px)',
          }}
        />
      </div>
      <div
        className="absolute inset-x-10 top-[60%] h-0.5 rounded-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
        style={{
          animation: 'scanLight 2s ease-in-out infinite',
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
      const timer = setTimeout(() => {
        setIsTranslationReady(true);
      }, 100);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [translationLoading]);

  useEffect(() => {
    if (!isFirstLoad) {
      return;
    }

    let isPageReady = false;
    let isMinTimeReached = false;

    const hideLoader = () => {
      if (isPageReady && isMinTimeReached) {
        setIsLoading(false);
        if (typeof window !== 'undefined') {
          window.__gplHasShown = true;
        }
      }
    };

    const timerId = setTimeout(() => {
      isMinTimeReached = true;
      hideLoader();
    }, 2000);

    const maxTimerId = setTimeout(() => {
      console.warn('Loading timeout reached, forcing loader to hide');
      setIsLoading(false);
    }, 10000);

    const checkPageReady = () => {
      if (document.readyState === 'complete') {
        isPageReady = true;
        hideLoader();
      }
    };

    const handleDOMContentLoaded = () => {
      setTimeout(() => {
        isPageReady = true;
        hideLoader();
      }, 100);
    };

    if (document.readyState === 'complete') {
      isPageReady = true;
      hideLoader();
    } else {
      window.addEventListener('load', checkPageReady);
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    }

    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
      if (maxTimerId) {
        clearTimeout(maxTimerId);
      }
      window.removeEventListener('load', checkPageReady);
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
    };
  }, [isFirstLoad]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#030712] via-[#040a18] to-[#0c1628]"
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
        @keyframes ringSpin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes orbPulse {
          0% {
            transform: scale(0.95);
            filter: blur(0px);
          }
          50% {
            transform: scale(1.05);
            filter: blur(2px);
          }
          100% {
            transform: scale(0.95);
            filter: blur(0px);
          }
        }
        @keyframes scanLight {
          0% {
            transform: translateX(-100%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        @keyframes particleFloat {
          0% {
            transform: translateY(0);
            opacity: 0.5;
          }
          50% {
            transform: translateY(-18px);
            opacity: 1;
          }
          100% {
            transform: translateY(0);
            opacity: 0.5;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0">
        {nebulaParticles.map((particle) => (
          <div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              borderRadius: '50%',
              background: particle.color,
              boxShadow: `0 0 ${particle.glow}px ${particle.color}`,
              animation: `particleFloat ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-6 sm:space-y-10">
        <div className="rounded-[32px] border border-[#6A5BFF]/40 bg-gradient-to-br from-[#03050f] via-[#080b1a] to-[#14002f] p-6 shadow-[0_20px_60px_rgba(10,10,30,0.65)] sm:p-10">
          <div className="flex items-center justify-center">
            <NebulaCore />
          </div>
          <div className="mt-6 flex items-center justify-center">
            {isTranslationReady ? (
              <p
                className="inline-block text-base font-semibold uppercase tracking-[0.4em] text-transparent"
                style={{
                  background:
                    'linear-gradient(120deg, #7E92B5, #5E6C8B, #3B4E6D)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  animation: 'orbPulse 3s ease-in-out infinite',
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
