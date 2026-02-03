'use client';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t } = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/koko-home-2-up.webp',
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/koko-home-1.webp',
  ];

  // Get banner texts from translations
  const slideTexts = [
    {
      mainText: [
        t('hero_banner_1_line_1'),
        t('hero_banner_1_line_2'),
        t('hero_banner_1_line_3'),
      ],
      subText: t('hero_banner_1_sub_text'),
    },
    {
      mainText: [
        t('hero_banner_2_line_1'),
        t('hero_banner_2_line_2'),
        t('hero_banner_2_line_3'),
      ],
      subText: t('hero_banner_2_sub_text'),
    },
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 10000); // Change slide every 10 seconds

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative w-full">
      <div className="relative overflow-hidden">
        {/* Fade carousel: stack slides and cross-fade via opacity */}
        <div className="relative">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <Image
                src={slide}
                alt={t('casino_banner_slide', { slide: index + 1 })}
                width={1920}
                height={700}
                className="h-auto max-h-[250px] min-h-[130px] w-full max-w-full object-contain object-center sm:max-h-[100%]"
                priority={index === 0}
                sizes="100vw"
                quality={95}
              />
              {/* Text Overlay for banners */}
              {slideTexts[index] && (
                <div className="absolute inset-0 z-10 flex flex-col items-start justify-center pl-8 sm:pl-16 md:pl-24 lg:pl-32">
                  <div className="max-w-[45%] px-2 text-left sm:max-w-[50%] sm:px-4 md:px-6 lg:px-8">
                    <h1
                      className="mb-2 text-[18px] text-white italic sm:mb-4 sm:text-[40px] md:text-[60px] lg:text-[80px]"
                      style={{
                        textShadow: '2px 10px 6px rgba(255, 159, 0, 0.30)',
                        fontWeight: 'bold',
                        lineHeight: '1.1',
                      }}
                    >
                      {slideTexts[index].mainText.map((line, lineIndex) => (
                        <React.Fragment key={lineIndex}>
                          {line}
                          {lineIndex <
                            slideTexts[index].mainText.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </h1>
                    <p className="text-[8px] font-bold text-white italic sm:text-lg md:text-xl">
                      {slideTexts[index].subText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {/* Ensure container reserves height using the first image's intrinsic size */}
          <div className="invisible">
            <Image
              src={slides[0]}
              alt={t('casino_banner_slide', { slide: 1 })}
              width={1920}
              height={700}
              className="h-auto max-h-[250px] min-h-[130px] w-full max-w-full object-contain object-center sm:max-h-[100%]"
              priority
              sizes="100vw"
              quality={95}
            />
          </div>
        </div>
      </div>

      {/* Dotted Controls */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-3 w-3 cursor-pointer rounded-full border border-white/50 transition-all duration-300 sm:h-5 sm:w-5 sm:border-2 sm:border-white ${
                index === currentSlide
                  ? 'bg-[#FC7E09]/70 sm:scale-110 sm:bg-[#FC7E09]'
                  : 'bg-[#FC7E09]/30 hover:bg-[#FC7E09]/40 sm:bg-[#FC7E09]/50 sm:hover:bg-[#FC7E09]/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HeroSection;
