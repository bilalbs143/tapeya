'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import LazyImage from '@/dynamic-components/template5/components/LazyImage/LazyImage';
import { useTranslations } from '@/hooks/useTranslations';

function Categories() {
  const { t } = useTranslations();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Reset and trigger animation on mount and route change
    setIsMounted(false);
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  const categories = [
    {
      id: 'casino',
      nameKey: 'casino',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-cat-5.webp',
      href: '/live-casino',
      buttonTextKey: 'play_now',
    },
    {
      id: 'slot',
      nameKey: 'slots',
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-cat-5.webp',
      href: '/slot-providers',
      buttonTextKey: 'play_now',
    },
    {
      id: 'live',
      nameKey: 'live_casino',
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/live-cat-5.webp',
      href: '/live-casino',
      buttonTextKey: 'play_now',
    },
    {
      id: 'sport',
      nameKey: 'sport',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/sport-cat-5.webp',
      href: '#',
      buttonTextKey: 'play_now',
    },
  ];

  return (
    <motion.section
      className="overflow-hidden pt-6 md:pt-10"
      initial={{ opacity: 0, y: 50 }}
      animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.7,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.2,
      }}
      style={{ willChange: 'opacity, transform' }}
      layout
    >
      <motion.div
        className="mb-3"
        initial={{ opacity: 0, y: -30 }}
        animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
        transition={{
          duration: 0.6,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.4,
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        <h2 className="text-[22px] font-semibold text-white md:text-[30px]">
          {t('game_categories')}
        </h2>
      </motion.div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-3">
        {categories.map((category, index) => {
          const isDisabled = index >= 2; // First 2 categories (casino, slot) are enabled, rest are disabled

          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={
                isMounted
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 40, scale: 0.9 }
              }
              whileHover={
                !isDisabled
                  ? {
                    y: -8,
                    transition: {
                      duration: 0.25,
                      ease: [0.25, 0.1, 0.25, 1],
                    },
                  }
                  : {}
              }
              transition={{
                y: {
                  duration: 0.25,
                  ease: [0.25, 0.1, 0.25, 1],
                },
                opacity: {
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.5 + index * 0.1,
                },
                scale: {
                  duration: 0.6,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.5 + index * 0.1,
                },
              }}
              style={{ willChange: 'opacity, transform' }}
              className={`overflow-hidden rounded-lg ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              {isDisabled ? (
                <div className="group pointer-events-none relative block h-full w-full overflow-hidden rounded-lg">
                  <LazyImage
                    src={category.image}
                    alt={t(category.nameKey)}
                    width={600}
                    height={400}
                    className="h-auto w-full object-cover grayscale"
                  />
                  {/* Overlay Content */}
                  <div className="absolute inset-0 flex flex-col justify-between overflow-hidden p-4">
                    <div className="text-left">
                      <h3 className="mb-2 text-[14px] leading-tight font-bold text-white drop-shadow-lg md:text-xl">
                        {t(category.nameKey)}
                      </h3>
                    </div>
                    <div className="mt-auto">
                      <span className="text-[12px] font-semibold text-white drop-shadow-lg">
                        Segera Hadir
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={category.href}
                  className="group relative block h-full w-full overflow-hidden rounded-lg"
                >
                  <LazyImage
                    src={category.image}
                    alt={t(category.nameKey)}
                    width={600}
                    height={400}
                    className="h-auto w-full object-cover"
                  />
                  {/* Overlay Content */}
                  <div className="absolute inset-0 flex flex-col justify-between overflow-hidden p-4">
                    <div className="text-left">
                      <h3 className="mb-2 text-[14px] leading-tight font-bold text-white drop-shadow-lg md:text-xl">
                        {t(category.nameKey)}
                      </h3>
                    </div>
                    <div className="mt-auto">
                      <button className="hero-button-hover-effect-5 w-fit rounded-[22px] bg-[#20C5FE] px-4 py-1 text-[12px] font-semibold whitespace-nowrap text-white transition-colors duration-200">
                        <span>{t(category.buttonTextKey)}</span>
                      </button>
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
}

export default Categories;
