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
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const desktopSlides = [
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-left-banner-5-up.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-5-2.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-5-3.webp',
  ];

  const mobileSlides = [
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-left-banner-mob-5-up.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-5-3.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-5-2.webp',
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % desktopSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [desktopSlides.length]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

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
        {/* Desktop Slider */}
        <motion.div
          className="relative hidden w-full md:block"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isMounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{
            duration: 0.7,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.3,
          }}
        >
          {desktopSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide}
                alt={`Hero Banner ${index + 1}`}
                width={1920}
                height={800}
                className="h-auto w-full"
                priority={index === 0}
              />
            </div>
          ))}
          {/* Ensure container reserves height using the first image's intrinsic size */}
          <div className="invisible">
            <Image
              src={desktopSlides[0]}
              alt="Hero Banner"
              width={1920}
              height={800}
              className="h-auto w-full"
              priority
            />
          </div>
        </motion.div>

        {/* Mobile Slider */}
        <motion.div
          className="relative block w-full md:hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isMounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }
          }
          transition={{
            duration: 0.7,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.3,
          }}
        >
          {mobileSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide}
                alt={`Hero Banner ${index + 1}`}
                width={768}
                height={400}
                className="h-auto w-full"
                priority={index === 0}
              />
            </div>
          ))}
          {/* Ensure container reserves height using the first image's intrinsic size */}
          <div className="invisible">
            <Image
              src={mobileSlides[0]}
              alt="Hero Banner"
              width={768}
              height={400}
              className="h-auto w-full"
              priority
            />
          </div>
        </motion.div>
      </div>

      {/* Dotted Controls */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
        <div className="flex space-x-3">
          {desktopSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-3 w-3 cursor-pointer rounded-full border-2 border-[#20C5FE]/50 transition-all duration-300 sm:h-4 sm:w-4 ${
                index === currentSlide
                  ? 'bg-[#20C5FE] scale-110 border-[#20C5FE]'
                  : 'bg-[#20C5FE]/30 hover:bg-[#20C5FE]/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}

export default HeroSection;
