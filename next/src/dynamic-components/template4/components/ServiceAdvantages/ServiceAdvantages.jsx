'use client';
import React, { useEffect, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

// Custom hook for jackpot counter
const useJackpotCounter = () => {
  const [amount, setAmount] = useState(64702645); // Starting amount: 64,702,645

  useEffect(() => {
    // Load saved amount from localStorage on mount
    const savedAmount = localStorage.getItem('jackpot_counter_amount');
    if (savedAmount) {
      setAmount(parseInt(savedAmount, 10));
    }

    // Set up interval to increment counter every 500ms (1 number per 500ms = 2 numbers per second)
    const interval = setInterval(() => {
      setAmount((prevAmount) => {
        const newAmount = prevAmount + 1;
        // Save to localStorage
        localStorage.setItem('jackpot_counter_amount', newAmount.toString());
        return newAmount;
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Format the number with commas
  const formatAmount = (num) => {
    return num.toLocaleString('en-US');
  };

  return formatAmount(amount);
};

function ServiceAdvantages() {
  const { t } = useTranslations();
  const jackpotAmount = useJackpotCounter();

  return (
    <section className="relative mt-8 mb-0 px-2 sm:px-4">
      <div className="container mx-auto">
        <div className="relative overflow-hidden">
          {/* Desktop Banner - Hidden on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-4.webp"
            alt={t('home_page_banner')}
            className="hidden h-auto w-full object-cover md:block"
          />

          {/* Mobile Banner - Only visible on mobile (<=768px) */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-bottom-banner-mob-4.webp"
            alt={t('home_page_banner')}
            className="block h-auto w-full object-cover md:hidden"
          />

          {/* Text Overlay - Top center on mobile, right side on desktop */}
          <div className="absolute inset-0 flex items-start justify-center pt-4 pr-0 md:items-center md:justify-end md:pt-0 md:pr-16">
            <div className="text-center font-['Montserrat']">
              {/* LUCKY JACKPOT */}
              <div className="mb-2 text-[22px] font-black text-white uppercase drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] md:text-[30px] lg:text-[50px]">
                {t('lucky_jackpot')}
              </div>

              {/* IDR Amount with SVG wrapper */}
              <div className="relative mb-2">
                <div className="relative">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1033"
                    height="151"
                    viewBox="0 0 1033 151"
                    fill="none"
                    className="h-12 w-full md:h-16 lg:h-20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M76.5 0H998.5L957 151H34.5L76.5 0Z"
                      fill="url(#paint0_linear_388_512)"
                      fillOpacity="0.7"
                    />
                    <path d="M44 0H69.5L27.2614 151H0L44 0Z" fill="#5AB25A" />
                    <path
                      d="M1007.5 0H1033L990.761 151H963.5L1007.5 0Z"
                      fill="#5AB25A"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_388_512"
                        x1="-35.6091"
                        y1="-6.86363"
                        x2="13.8558"
                        y2="326.752"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#5AB25A" />
                        <stop offset="0.433806" stopColor="#55BC55" />
                        <stop offset="0.898108" stopColor="#139113" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Coin treasure image - positioned on left */}
                  <div className="absolute top-1/2 right-[-20px] hidden -translate-y-1/2 transform md:block">
                    <img
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/coin-tresure-4.png"
                      alt="Coin Treasure"
                      className="h-8 w-auto md:h-20 lg:h-27"
                    />
                  </div>

                  {/* Price text - centered */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-[25px] font-black text-white uppercase drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] md:text-[35px] lg:text-[50px]">
                      KRW {jackpotAmount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Be A Part Now */}
              <div className="text-center text-[14px] font-normal tracking-[8px] text-white md:text-[16px] lg:text-[18px]">
                {t('be_a_part_now')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServiceAdvantages;
