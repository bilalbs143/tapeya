'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';

function HeroSection() {
  const { t } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Reset and trigger animation on mount and route change
    setIsMounted(false);
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleClaimNowClick = useCallback(() => {
    if (!isAuth) {
      dispatch(openModal('login'));
      return;
    }
    router.push('/dashboard/coupons');
  }, [isAuth, dispatch, router]);

  const leftBannerUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-left-banner-5.webp';
  const leftBannerMobileUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-left-banner-mob-5.webp';
  const rightBannerTopUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-right-banner-5-1.webp';
  const rightBannerBottomUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-right-banner-5-2.webp';

  return (
    <motion.section
      className="relative mx-auto w-full overflow-hidden"
      aria-label={t('hero_section')}
      initial={{ opacity: 0, y: 50 }}
      animate={isMounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.1,
      }}
      style={{ willChange: 'opacity, transform' }}
      layout
    >
      <div>
        {/* Banner Grid - Desktop */}
        <div className="hidden gap-4 md:flex">
          {/* Left Banner - Takes more space */}
          <motion.div
            className="group relative h-full flex-[2] cursor-pointer overflow-hidden rounded-lg"
            initial={{ opacity: 0, x: -60, scale: 0.95 }}
            animate={
              isMounted
                ? { opacity: 1, x: 0, scale: 1 }
                : { opacity: 0, x: -60, scale: 0.95 }
            }
            transition={{
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.3,
            }}
          >
            <Image
              src={leftBannerUrl}
              alt="Left Banner"
              width={1200}
              height={800}
              className="h-full w-full rounded-lg object-contain"
              priority
            />

            {/* Overlay Content */}
            <div className="absolute inset-0 flex items-center justify-start px-6 py-6">
              <div className="flex flex-col gap-4">
                {/* Main Text */}
                <h2 className="text-[28px] leading-tight font-bold text-white">
                  {(() => {
                    const text = t('a_single_spin_can_change_your_life');
                    const lines = text.split('\n');
                    return lines.map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx < lines.length - 1 && <br />}
                      </React.Fragment>
                    ));
                  })()}
                </h2>

                {/* CTA removed per request */}
              </div>
            </div>
          </motion.div>

          {/* Right Banners - 2 stacked, Takes less space */}
          <motion.div
            className="flex flex-[1] flex-col gap-0"
            initial={{ opacity: 0, x: 60 }}
            animate={isMounted ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }}
            transition={{
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.4,
            }}
          >
            {/* Top Right Banner */}
            <motion.div
              className="group relative flex-1 cursor-pointer overflow-hidden rounded-lg"
              initial={{ opacity: 0, y: -30, scale: 0.95 }}
              animate={
                isMounted
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: -30, scale: 0.95 }
              }
              transition={{
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.5,
              }}
            >
              <Image
                src={rightBannerTopUrl}
                alt="Right Banner Top"
                width={600}
                height={300}
                className="h-[100%] w-full flex-1 rounded-lg"
                priority
              />
              {/* Overlay Content */}
              <div className="absolute inset-0 flex items-center justify-end px-6">
                <div className="mt-0 flex flex-col gap-2 md:mt-4">
                  <h2 className="text-[20px] leading-tight font-bold text-white">
                    {t('daily_rewards')}
                  </h2>
                  {/* CTA removed per request */}
                </div>
              </div>
            </motion.div>

            {/* Bottom Right Banner */}
            <motion.div
              className="group relative flex-1 cursor-pointer overflow-hidden rounded-lg"
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={
                isMounted
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 0, y: 30, scale: 0.95 }
              }
              transition={{
                duration: 0.6,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.6,
              }}
            >
              <Image
                src={rightBannerBottomUrl}
                alt="Right Banner Bottom"
                width={600}
                height={300}
                className="h-[100%] w-full flex-1 rounded-lg"
                priority
              />
              {/* Overlay Content */}
              <div className="absolute inset-0 flex items-center justify-end px-6">
                <div className="mt-0 flex flex-col gap-2 md:mt-4">
                  <h2 className="text-[20px] leading-tight font-bold text-white">
                    {(() => {
                      const text = t('stand_out_alone_in_casino');
                      const lines = text.split('\n');
                      return lines.map((line, idx) => (
                        <React.Fragment key={idx}>
                          {line}
                          {idx < lines.length - 1 && <br />}
                        </React.Fragment>
                      ));
                    })()}
                  </h2>
                  {/* CTA removed per request */}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Banner Grid - Mobile */}
        <div className="grid grid-cols-1 gap-0 md:hidden md:gap-4">
          <motion.div
            className="group relative cursor-pointer overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={
              isMounted
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 40, scale: 0.95 }
            }
            transition={{
              duration: 0.7,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.3,
            }}
          >
            <Image
              src={leftBannerMobileUrl}
              alt="Left Banner"
              width={600}
              height={400}
              className="h-auto w-full rounded-lg"
              priority
            />

            {/* Overlay Content for Mobile */}
            <div className="absolute inset-0 flex items-start justify-start px-4 pt-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-[25px] leading-tight font-bold text-white md:text-[20px]">
                  {(() => {
                    const text = t('a_single_spin_can_change_your_life');
                    const lines = text.split('\n');
                    return lines.map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx < lines.length - 1 && <br />}
                      </React.Fragment>
                    ));
                  })()}
                </h2>

                {/* CTA removed per request */}
              </div>
            </div>
          </motion.div>
          {/* Top Right Banner */}
          <motion.div
            className="group relative cursor-pointer overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={
              isMounted
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 40, scale: 0.95 }
            }
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.5,
            }}
          >
            <Image
              src={rightBannerTopUrl}
              alt="Right Banner Top"
              width={600}
              height={300}
              className="h-auto w-full rounded-lg"
              priority
            />
            {/* Overlay Content */}
            <div className="absolute inset-0 flex items-center justify-end px-3 py-3">
              <div className="flex flex-col gap-1.5">
                <h2 className="text-[18px] leading-tight font-bold text-white">
                  {t('daily_rewards')}
                </h2>
                {/* CTA removed per request */}
              </div>
            </div>
          </motion.div>

          {/* Bottom Right Banner */}
          <motion.div
            className="group relative cursor-pointer overflow-hidden rounded-lg"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={
              isMounted
                ? { opacity: 1, y: 0, scale: 1 }
                : { opacity: 0, y: 40, scale: 0.95 }
            }
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.7,
            }}
          >
            <Image
              src={rightBannerBottomUrl}
              alt="Right Banner Bottom"
              width={600}
              height={300}
              className="h-auto w-full rounded-lg"
              priority
            />
            {/* Overlay Content */}
            <div className="absolute inset-0 flex items-center justify-end px-3 py-3">
              <div className="mt-4 flex flex-col gap-1.5 md:mt-0">
                <h2 className="text-[18px] leading-tight font-bold text-white">
                  {(() => {
                    const text = t('stand_out_alone_in_casino');
                    const lines = text.split('\n');
                    return lines.map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        {idx < lines.length - 1 && <br />}
                      </React.Fragment>
                    ));
                  })()}
                </h2>
                {/* CTA removed per request */}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
