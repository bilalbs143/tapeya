'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);

  const desktopSlides = [
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-17-1-up.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-17-2-up.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-17-3-up.webp',
  ];

  const mobileSlides = [
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-17-1-up.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-17-2-up.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-17-3-up.webp',
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
    <section
      className="relative w-full overflow-hidden"
      aria-label={t('hero_section')}
    >
      {/* Desktop Slider */}
      <div className="relative hidden h-[380px] min-h-[380px] md:block">
        {desktopSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide}
              alt={`${t('hero_section')} ${index + 1}`}
              width={1920}
              height={380}
              className="h-full w-full object-cover object-center"
              priority={index === 0}
            />
          </div>
        ))}
        {/* Ensure container reserves height using the first image's intrinsic size */}
        <div className="invisible">
          <Image
            src={desktopSlides[0]}
            alt={t('hero_section')}
            width={1920}
            height={380}
            className="h-[380px] w-full object-cover object-center"
            priority
          />
        </div>
      </div>

      {/* Mobile Slider */}
      <div className="relative block h-[550px] md:hidden">
        {mobileSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide}
              alt={`${t('hero_section')} ${index + 1}`}
              width={768}
              height={550}
              className="h-full w-full object-cover object-center"
              priority={index === 0}
            />
          </div>
        ))}
        {/* Ensure container reserves height using the first image's intrinsic size */}
        <div className="invisible">
          <Image
            src={mobileSlides[0]}
            alt={t('hero_section')}
            width={768}
            height={550}
            className="h-[550px] w-full object-cover object-center"
            priority
          />
        </div>
      </div>

      {/* Horizontal bar controls (white theme) */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
        <div className="flex items-center gap-2">
          {desktopSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-1.5 w-8 cursor-pointer rounded-sm transition-all duration-300 sm:h-2 sm:w-10 ${
                index === currentSlide
                  ? 'bg-white'
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
