'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import LazyImage from '@/dynamic-components/template13/components/LazyImage/LazyImage';
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
      href: '/live-casino?q=live',
      buttonTextKey: 'play_now',
      disabled: false,
    },
    {
      id: 'slot',
      nameKey: 'slots',
      image: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-cat-5.webp',
      href: '/slot-providers?q=slots',
      buttonTextKey: 'play_now',
      disabled: false,
    },
    {
      id: 'arcade',
      nameKey: 'arcade',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/arcade-cat-5.webp',
      href: '/slot-providers?q=arcade',
      buttonTextKey: 'play_now',
      disabled: false,
    },
    {
      id: 'table_games',
      nameKey: 'table_games',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hybrid-cat-5.webp',
      href: '/live-casino?q=table',
      buttonTextKey: 'play_now',
      disabled: false,
    },
    {
      id: 'hybrid_games',
      nameKey: 'hybrid_games',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/table-cat-5.webp',
      href: '/slot-providers?q=hybrid',
      buttonTextKey: 'play_now',
      disabled: false,
    },
    // Sports and Virtual Sports – enabled; Mini Games, Lottery, Fishing – disabled
    {
      id: 'sports',
      nameKey: 'sports',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/sports-cat-5.png',
      href: '/sports?q=sports',
      buttonTextKey: 'play_now',
      disabled: false,
    },
    {
      id: 'virtual_sports',
      nameKey: 'virtual_sports',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/vsports-cat-5.png',
      href: '/sports?q=virtual',
      buttonTextKey: 'play_now',
      disabled: false,
    },
    {
      id: 'mini_games',
      nameKey: 'mini_games',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/mini-games-cat-5.png',
      href: '/slot-providers?q=mini-games',
      buttonTextKey: 'play_now',
      disabled: true,
    },
    {
      id: 'lottery',
      nameKey: 'lottery',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/lottery-cat-5.png',
      href: '/slot-providers?q=lottery',
      buttonTextKey: 'play_now',
      disabled: true,
    },
    {
      id: 'fishing',
      nameKey: 'fish_hunting',
      image:
        'https://d3emlo5tm9es2f.cloudfront.net/next/icons/fishing-cat-5.png',
      href: '/slot-providers?q=fishing',
      buttonTextKey: 'play_now',
      disabled: true,
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
        <h2 className="text-[16px] font-semibold text-white md:text-[30px]">
          {t('game_categories')}
        </h2>
      </motion.div>
      <div className="grid grid-cols-2 gap-3 gap-y-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5">
        {categories.map((category, index) => {
          const isDisabled = category.disabled ?? false;

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
                      <h3 className="mb-2 text-[14px] leading-tight font-bold break-words text-white drop-shadow-lg lg:text-[16px] xl:text-[16px] 2xl:text-[18px]">
                        {t(category.nameKey)}
                      </h3>
                    </div>
                    {/* <div className="mt-auto">
                      <span className="text-[12px] font-semibold text-white drop-shadow-lg">
                        Segera Hadir
                      </span>
                    </div> */}
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
                      <h3 className="mb-2 text-[14px] leading-tight font-bold break-words text-white drop-shadow-lg lg:text-[17px] xl:text-[17px] 2xl:text-[20px]">
                        {t(category.nameKey)}
                      </h3>
                    </div>
                    {/* <div className="mt-auto">
                      <button className="hero-button-hover-effect-5 w-fit rounded-[22px] bg-[#20C5FE] px-4 py-1 text-[12px] font-semibold whitespace-nowrap text-white transition-colors duration-200">
                        <span>{t(category.buttonTextKey)}</span>
                      </button>
                    </div> */}
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
