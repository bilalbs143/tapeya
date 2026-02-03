'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import SlotCategories from '@/dynamic-components/template5/components/SlotCategories/SlotCategories';
import { getProviderNameById } from '@/helpers/stringUtils';
import { useTranslations } from '@/hooks/useTranslations';

export default function SlotsPage() {
  const { t } = useTranslations();
  const { selectedProviderId, allProvidersData } = useSelector(
    (state) => state.website,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="relative w-full overflow-x-hidden">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/lines-pattern.svg"
            alt="Lines Pattern"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Slot Detail Hero Banner - Same structure as Slot Providers */}
        <motion.section
          className="relative mx-auto w-full overflow-hidden"
          aria-label="Live Casino Banner"
          initial={{ opacity: 0 }}
          animate={isMounted ? { opacity: 1 } : { opacity: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.1,
          }}
          style={{ willChange: 'opacity' }}
          layout
        >
          <div
            className="relative w-full rounded-[5px]"
            style={{ border: '1px solid #00374A' }}
          >
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-banner-5-up.webp"
              alt="Live Casino Background"
              width={1920}
              height={600}
              className="hidden w-full rounded-[5px] md:block"
              style={{ height: 'auto' }}
              priority
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-banner-mob-5-up.webp"
              alt="Live Casino Background Mobile"
              width={1920}
              height={600}
              className="block w-full rounded-[5px] md:hidden"
              style={{ height: 'auto' }}
              priority
            />

            {/* Gradient Overlay */}
            <div
              className="absolute inset-0 rounded-[3px]"
              style={{
                background:
                  'linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 80%, rgba(0, 0, 0, 1) 100%)',
              }}
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-start px-4 md:px-6">
              <div className="w-full max-w-2xl text-left">
                <h1
                  className="text-[20px] leading-tight font-bold tracking-wide text-white uppercase md:text-[35px]"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {t('slot_games')}
                </h1>
                <p
                  className="mt-2 text-[12px] text-white/70 md:text-[16px]"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {t('jackpot_dreams_start_here')}
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="overflow-hidden pt-6">
          {/* Header */}
          <motion.div
            className="mb-6 w-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={isMounted ? { opacity: 1 } : { opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.2,
            }}
            style={{ willChange: 'opacity' }}
            layout
          >
            <div
              className="flex items-center justify-between gap-3 px-3 py-3 md:px-6 md:py-3"
              style={{
                border: '1px solid #00374A',
                borderRadius: '5px',
                background: 'transparent',
              }}
            >
              <div className="flex items-center gap-3">
                <h3
                  className="text-[14px] font-semibold tracking-wide text-white uppercase md:text-[22px]"
                  style={{ fontFamily: 'var(--font-alatsi)' }}
                >
                  {selectedProviderId
                    ? getProviderNameById(
                      selectedProviderId,
                      allProvidersData,
                    ) || t('slot_games')
                    : t('slot_games')}
                </h3>
              </div>
              {/* Search */}
              <div className="flex items-center gap-2">
                <div
                  className="flex items-center gap-2 px-3 py-2"
                  style={{
                    border: '1px solid #00374A',
                    borderRadius: '5px',
                    background: 'transparent',
                  }}
                >
                  <input
                    type="text"
                    placeholder={t('search_games')}
                    className="max-w-[110px] bg-transparent text-sm text-white outline-none placeholder:text-[#9CA3AF] md:max-w-[220px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="23"
                    height="23"
                    viewBox="0 0 23 23"
                    fill="none"
                  >
                    <path
                      d="M17.4035 17.4383L21.3818 21.4167M20.125 10.4375C20.125 13.0068 19.1044 15.4708 17.2876 17.2876C15.4708 19.1044 13.0068 20.125 10.4375 20.125C7.86821 20.125 5.40416 19.1044 3.5874 17.2876C1.77064 15.4708 0.75 13.0068 0.75 10.4375C0.75 7.86821 1.77064 5.40416 3.5874 3.5874C5.40416 1.77064 7.86821 0.75 10.4375 0.75C13.0068 0.75 15.4708 1.77064 17.2876 3.5874C19.1044 5.40416 20.125 7.86821 20.125 10.4375Z"
                      stroke="#20C5FE"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <SlotCategories searchQuery={searchQuery} />
        {/* Bottom Curved Pattern above footer (positioned, no layout shift) */}
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-0 -z-10 h-[420px]"
          aria-hidden
        >
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/curved-pattern.svg"
            alt="Curved Pattern"
            className="h-full w-full object-cover opacity-30"
          />
        </div>
      </div>

      {/* Slot Bottom Banner (copied from Slot Providers) */}
      <motion.div
        className="mt-0 overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        style={{ willChange: 'opacity' }}
        layout
      >
        <div className="px-0 pt-8 sm:px-0">
          <div className="relative overflow-hidden">
            {/* Desktop Banner - Hidden on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-5-up-2.webp"
              alt={t('home_page_banner')}
              className="hidden h-auto w-full object-cover md:block"
            />

            {/* Mobile Banner - Only visible on mobile (<=768px) */}
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-bottom-banner-mob-5-up-2.webp"
              alt={t('home_page_banner')}
              className="block h-auto w-full object-cover md:hidden"
            />

            {/* Text Overlay - Center aligned on mobile, left and center aligned on desktop */}
            <div className="absolute inset-0 flex items-start justify-center px-4 pt-8 md:items-center md:justify-start md:pt-0 md:pl-12">
              <div className="text-center md:text-left">
                <h2 className="mb-2 text-[24px] leading-tight font-bold text-white uppercase md:mb-4 md:text-[32px] lg:text-[40px]">
                  {(() => {
                    const text = t(
                      'ready_to_take_slot_experience_to_next_level',
                    );
                    const lines = text.split('\n');
                    return lines.map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx < lines.length - 1 && <br />}
                      </React.Fragment>
                    ));
                  })()}
                </h2>
                <button className="text-base font-semibold text-white underline md:text-lg">
                  {t('spin_now')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
