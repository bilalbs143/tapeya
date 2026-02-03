'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

// Custom hook for jackpot counter
const useJackpotCounter = () => {
  const [amount, setAmount] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('template16_jackpot');
      if (stored) {
        const { value, timestamp } = JSON.parse(stored);
        const now = Date.now();
        const elapsed = now - timestamp;
        // Increment by 1 every 100ms (10 per second)
        const increment = Math.floor(elapsed / 100);
        return value + increment;
      }
    }
    return 1000000000; // Starting amount: 1,000,000,000
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setAmount((prevAmount) => {
        const newAmount = prevAmount + 1;
        // Save to localStorage with timestamp
        if (typeof window !== 'undefined') {
          localStorage.setItem(
            'template16_jackpot',
            JSON.stringify({
              value: newAmount,
              timestamp: Date.now(),
            }),
          );
        }
        return newAmount;
      });
    }, 100); // Increment every 100ms

    return () => clearInterval(interval);
  }, []);

  // Format the number with commas
  const formatAmount = (num) => {
    return num.toLocaleString('en-US');
  };

  return formatAmount(amount);
};

function Jackpot() {
  const { t } = useTranslations();
  const jackpotAmount = useJackpotCounter();

  const backgroundUrlDesktop =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/jackpot-desktop-16.webp';
  const backgroundUrlMobile =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/jackpot-mobile-16.webp';

  return (
    <section
      className="w-full px-4 pt-6 md:px-0 md:pt-10"
      aria-label={t('jackpot') || 'Jackpot'}
    >
      <div className="container mx-auto">
        <div className="relative w-full overflow-hidden">
          {/* Desktop Image */}
          <Image
            src={backgroundUrlDesktop}
            alt={t('jackpot') || 'Jackpot'}
            width={1920}
            height={200}
            className="hidden h-auto w-full object-cover md:block"
            priority
          />
          {/* Mobile Image */}
          <Image
            src={backgroundUrlMobile}
            alt={t('jackpot') || 'Jackpot'}
            width={768}
            height={200}
            className="block h-auto w-full object-cover md:hidden"
            priority
          />

          {/* Jackpot Number Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex items-center gap-6 text-center md:gap-8 lg:gap-[150px]">
              <span
                className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl"
                style={{
                  WebkitTextStroke: '2px black',
                  textStroke: '2px black',
                  fontWeight: 900,
                }}
              >
                {t('jackpot') || 'JACKPOT'}
              </span>
              <span
                className="text-2xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl"
                style={{
                  WebkitTextStroke: '2px black',
                  textStroke: '2px black',
                  fontWeight: 900,
                }}
              >
                {jackpotAmount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Jackpot;
