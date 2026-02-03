'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);

  const desktopSlides = [
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-7-up.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-7-2.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-7-3.webp',
  ];

  const mobileSlides = [
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-7-up.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-7-2.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-top-banner-mob-7-3.webp',
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
    <section className="relative mx-auto w-full" aria-label={t('hero_section')}>
      <div className="">
        <div className="relative w-full">
          {/* Desktop Slider */}
          <div className="relative hidden md:block">
            {desktopSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={slide}
                  alt={`${t('hero_banner_alt')} ${index + 1}`}
                  width={1920}
                  height={1080}
                  className="h-auto w-full"
                  priority={index === 0}
                />
              </div>
            ))}
            {/* Ensure container reserves height using the first image's intrinsic size */}
            <div className="invisible">
              <Image
                src={desktopSlides[0]}
                alt={t('hero_banner_alt')}
                width={1920}
                height={1080}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>

          {/* Mobile Slider */}
          <div className="relative block md:hidden">
            {mobileSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={slide}
                  alt={`${t('hero_banner_alt')} ${index + 1}`}
                  width={600}
                  height={1200}
                  className="h-auto w-full"
                  priority={index === 0}
                />
              </div>
            ))}
            {/* Ensure container reserves height using the first image's intrinsic size */}
            <div className="invisible">
              <Image
                src={mobileSlides[0]}
                alt={t('hero_banner_alt')}
                width={600}
                height={1200}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dotted Controls */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
        <div className="flex space-x-3">
          {desktopSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-3 w-3 cursor-pointer rounded-full border-2 border-[#7351FF]/50 transition-all duration-300 sm:h-4 sm:w-4 ${
                index === currentSlide
                  ? 'bg-[#7351FF] scale-110 border-[#7351FF]'
                  : 'bg-[#7351FF]/30 hover:bg-[#7351FF]/50'
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
