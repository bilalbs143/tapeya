'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';

function Footer() {
  const { t } = useTranslations();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sliderRef = useRef(null);
  const { footerLogo } = useTemplate();

  // Sample game providers data - you can replace with your actual data
  const gameProviders = [
    {
      name: 'WM',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-1.svg',
    },
    {
      name: 'AE Sexy',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-2.svg',
    },
    {
      name: 'BG Gaming',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-3.svg',
    },
    {
      name: 'Pragmatic Play',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-4.svg',
    },
    {
      name: 'NetEnt',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-5.svg',
    },
    {
      name: 'Microgaming',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-6.svg',
    },
    {
      name: 'Evolution Gaming',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-7.svg',
    },
    {
      name: "Play'n GO",
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-8.svg',
    },
    {
      name: 'Yggdrasil',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-9.svg',
    },
    {
      name: 'Quickspin',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-10.svg',
    },
    {
      name: 'Red Tiger',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-11.svg',
    },
    {
      name: 'Playtech',
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-12.svg',
    },
    {
      name: t('game_provider_13'),
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-13.svg',
    },
    {
      name: t('game_provider_14'),
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-14.svg',
    },
    {
      name: t('game_provider_15'),
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-15.svg',
    },
    {
      name: t('game_provider_16'),
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-16.svg',
    },
    {
      name: t('game_provider_17'),
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-17.svg',
    },
    {
      name: t('game_provider_18'),
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-18.svg',
    },
    {
      name: t('game_provider_19'),
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-19.svg',
    },
    {
      name: t('game_provider_20'),
      logo: 'https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-20.svg',
    },
    // Add more as needed - you can expand this to include all 59 game providers
  ];

  // Calculate total slides needed (showing 3 at a time)
  const totalSlides = Math.max(0, gameProviders.length - 2);

  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev >= totalSlides ? 0 : prev + 1));
  }, [totalSlides]);

  const handlePrevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev <= 0 ? totalSlides : prev - 1));
  }, [totalSlides]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      handleNextSlide();
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, handleNextSlide]);

  // Pause autoplay on hover
  const handleSliderHover = () => {
    setIsAutoPlaying(false);
  };

  const handleSliderLeave = () => {
    setIsAutoPlaying(true);
  };

  // Calculate transform value for smooth sliding
  const getTransformValue = () => {
    if (totalSlides === 0) return 0;
    // Each slide moves by the width of 1 logo + gap (80px + 10px = 90px)
    return currentSlide * 90;
  };

  return (
    <footer className="mt-auto bg-[#1C1D40]">
      <div className="container mx-auto px-4 py-8">
        {/* APK Promo - Top section inside footer */}
        <div className="mb-6 overflow-hidden rounded-[26px] border-4 border-[#6456BD]">
          <div className="flex flex-col items-center justify-between gap-6 p-6 md:p-10 lg:flex-row">
            {/* Left: Illustration image */}
            <div className="order-3 flex-shrink-0 lg:order-1">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-footer-bg.png"
                alt={t('apk_promo')}
                width={480}
                height={270}
                className="h-auto w-[300px] object-contain xl:h-auto xl:w-[480px]"
                priority
              />
            </div>

            {/* Middle: Texts and CTA */}
            <div className="order-2 max-w-xl text-center text-white lg:order-2">
              <h3 className="text-lg leading-snug font-semibold text-[#D9D9D9] md:text-2xl">
                {t('download_our_apk_best')}
              </h3>
              <h3 className="text-lg leading-snug font-semibold text-[#D9D9D9] md:text-2xl">
                {t('online_gaming_experience')}
              </h3>
              <p className="mt-5 inline-block rounded-[24px] bg-[#6456BD] px-[24px] py-[10px] text-[18px] font-semibold text-white">
                {t('secure_anytime_anywhere')}
              </p>
              <div className="mt-4">
                <a
                  href="https://thestaticfile.com/uploads/kokobet777.apk"
                  download
                  className="btn-hover-border mt-4 inline-flex items-center gap-3 rounded-[60px] bg-[#179A00] px-[24px] py-[18px] font-semibold text-white transition-opacity hover:opacity-90 md:gap-4"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/android-icon.svg"
                    alt={t('android')}
                    width={28}
                    height={28}
                  />
                  <span>{t('download_apk')}</span>
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/apk-download.svg"
                    alt={t('download')}
                    width={24}
                    height={24}
                  />
                </a>
              </div>
            </div>

            {/* Right: QR Code */}
            <div className="order-1 mb-0 flex-shrink-0 lg:order-3 lg:mb-[5px]">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/apk-barcode.png"
                alt={t('apk_qr_code')}
                width={160}
                height={160}
                className="h-[220px] w-[220px] rounded-[12px] border-2 border-white p-2 xl:h-[250px] xl:w-[250px]"
              />
            </div>
          </div>
        </div>

        {/* Play Now with Crypto - Payment Icons Bar */}
        <div className="rounded-xl border border-[#353875]/40 p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-center md:gap-5">
            <div className="font-semibold text-[#D9D9D9]">
              <h4 className="pb-2 text-[18px] font-bold md:text-[24px]">
                {t('play_now_with_crypto')}
              </h4>
            </div>
            <div className="grid w-full grid-cols-3 place-items-center gap-[12px] sm:grid-cols-4 md:flex md:w-auto md:flex-wrap md:items-center md:justify-center md:gap-[30px]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-12 md:w-12">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-1.svg"
                  alt={t('payment_icon_1')}
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-12 md:w-12">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-2.svg"
                  alt={t('payment_icon_2')}
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-12 md:w-12">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-3.svg"
                  alt={t('payment_icon_3')}
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-12 md:w-12">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-4.svg"
                  alt={t('payment_icon_4')}
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-12 md:w-12">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-5.svg"
                  alt={t('payment_icon_5')}
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-12 md:w-12">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-6.svg"
                  alt={t('payment_icon_6')}
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-12 md:w-12">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-7.svg"
                  alt={t('payment_icon_7')}
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-12 md:w-12">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-8.svg"
                  alt={t('payment_icon_8')}
                  width={28}
                  height={28}
                />
              </div>
              <div className="flex h-12 w-[88px] shrink-0 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] text-[14px] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-12 md:w-[120px] md:text-[16px]">
                + 100 {t('more')}
              </div>
            </div>
          </div>
        </div>

        {/* Play Now with Crypto - Payment Icons Bar (Duplicate) */}
        <div className="mt-4 rounded-xl border border-[#353875]/40 p-3 md:p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-center md:gap-5">
            <div className="font-semibold text-[#D9D9D9]">
              <h4 className="pb-2 text-[18px] font-bold md:text-[24px]">
                {t('payment_methods')}
              </h4>
            </div>
            <div className="grid w-full grid-cols-2 place-items-center gap-[12px] sm:grid-cols-3 md:flex md:w-auto md:flex-wrap md:items-center md:justify-center md:gap-[30px] lg:grid-cols-4">
              <div className="flex h-12 w-22 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-15 md:w-30">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/pm-1.png"
                  alt={t('payment_method_1')}
                  width={120}
                  height={120}
                />
              </div>
              <div className="flex h-12 w-22 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-15 md:w-30">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/pm-2.png"
                  alt={t('payment_method_2')}
                  width={120}
                  height={120}
                />
              </div>
              <div className="flex h-12 w-22 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-15 md:w-30">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/pm-3.png"
                  alt={t('payment_method_3')}
                  width={120}
                  height={120}
                />
              </div>
              <div className="flex h-12 w-22 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] md:h-15 md:w-30">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/pm-4.png"
                  alt={t('payment_method_4')}
                  width={120}
                  height={120}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Game Provider Section */}
        <div className="pt-8 pb-0 md:pb-12">
          {/* Section Header */}
          <div className="mb-0 flex items-center md:mb-6">
            <div className="flex items-center gap-3">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/footer-gp-heading.svg"
                alt={t('game_provider_icon')}
                width={24}
                height={24}
                className="h-6 w-6"
              />
              <h2 className="bg-gradient-to-r from-cyan-300 via-blue-100 via-purple-200 to-purple-700 bg-clip-text text-lg leading-tight font-extrabold text-transparent md:text-3xl">
                {t('game_provider')}
              </h2>
            </div>
          </div>

          {/* Game Provider Logos Grid */}
          <div className="relative">
            {/* Mobile: New slider with exactly 3 logos visible */}
            <div className="block overflow-hidden md:hidden">
              <div
                className="game-provider-slider"
                onMouseEnter={handleSliderHover}
                onMouseLeave={handleSliderLeave}
                ref={sliderRef}
              >
                {/* Left Arrow */}
                <button
                  className="slider-arrow slider-arrow--prev cursor-pointer"
                  onClick={handlePrevSlide}
                  aria-label={t('previous_slide')}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Slider Container - Shows exactly 3 logos */}
                <div className="slider-container">
                  <div
                    className="slider-track"
                    style={{
                      transform: `translateX(-${getTransformValue()}px)`,
                      transition:
                        'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    }}
                  >
                    {gameProviders.map((provider, index) => (
                      <div key={index} className="slider-item">
                        <Image
                          src={provider.logo}
                          alt={`${t('game_provider')} ${index + 1}`}
                          width={80}
                          height={80}
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Arrow */}
                <button
                  className="slider-arrow slider-arrow--next cursor-pointer"
                  onClick={handleNextSlide}
                  aria-label={t('next_slide')}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop: Full grid layout */}
            <div className="hidden flex-wrap justify-start gap-4 md:flex md:gap-6">
              {Array.from({ length: 59 }, (_, index) => (
                <div key={index} className="flex items-center justify-center">
                  <Image
                    src={`https://d3emlo5tm9es2f.cloudfront.net/next/logos/gp-footer-${index + 1}.svg`}
                    alt={`${t('game_provider')} ${index + 1}`}
                    width={100}
                    height={100}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Separator under Game Provider Section */}
        <div className="my-8 h-px w-full bg-[#4B51A3]" />

        {/* New Section - Logo, Tagline, and Links */}
        <div className="border-opacity-50 border-b border-[#4B51A3] pt-8 pb-12">
          {/* Logo and Tagline - Centered on mobile */}
          <div className="mb-8 text-center md:mb-0 md:hidden">
            {/* Logo */}
            <div className="mb-4 flex items-center justify-center">
              <Image
                src={footerLogo}
                alt={t('kokobet777_logo')}
                width={190}
                height={190}
              />
            </div>

            {/* Tagline */}
            <p className="mx-auto max-w-xs text-sm leading-relaxed text-gray-300">
              {t('footer_tagline')}
            </p>
          </div>

          {/* Mobile: Three columns for Quick Links, Information, and FAQ's */}
          <div className="grid grid-cols-3 gap-4 md:hidden">
            {/* Quick Links */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">
                {t('quick_links')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('about_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('contact_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('disclaimer')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">
                {t('information')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/cookie-policy"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('cookie_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/responsible-gambling"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('responsible_gambling')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('privacy_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-use"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('terms_and_conditions')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* FAQ's */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">{t('faqs')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/faq?tab=general"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_general')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=deposit"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_deposit_withdrawal')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=gaming"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_gaming')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=technical"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_technical')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=banking"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_banking')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden gap-8 md:grid md:grid-cols-4">
            {/* Left Column - Logo and Tagline */}
            <div className="mb-6 text-left md:col-span-1">
              {/* Logo */}
              <div className="flex items-center justify-start">
                <Image
                  src={footerLogo}
                  alt={t('kokobet777_logo')}
                  width={190}
                  height={190}
                />
              </div>

              {/* Tagline */}
              <p className="max-w-xs text-sm leading-relaxed text-gray-300">
                {t('footer_tagline')}
              </p>
            </div>

            {/* Second Column - Quick Links */}
            <div className="md:col-span-1">
              <h3 className="mb-4 text-lg font-bold text-white">
                {t('quick_links')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('about_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('contact_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('disclaimer')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Third Column - Information */}
            <div className="md:col-span-1">
              <h3 className="mb-4 text-lg font-bold text-white">
                {t('information')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/cookie-policy"
                    className="text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('cookie_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/responsible-gambling"
                    className="text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('responsible_gambling')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('privacy_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-use"
                    className="text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('terms_and_conditions')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Fourth Column - FAQ's */}
            <div className="md:col-span-1">
              <h3 className="mb-4 text-lg font-bold text-white">{t('faqs')}</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/faq?tab=general"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_general')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=deposit"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_deposit_withdrawal')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=gaming"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_gaming')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=technical"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_technical')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=banking"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#FC7E09]"
                  >
                    {t('faq_banking')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section - Descriptive Paragraph */}
          <div className="mt-8 pt-8">
            <p className="mx-auto text-center text-sm leading-relaxed text-[#8183CC]">
              {t('footer_description')}
            </p>
          </div>
        </div>

        {/* Bottom Section - Copyright and Social Icons */}
        <div className="mt-8 flex flex-col items-center justify-between pt-8 pb-32 md:flex-row md:pb-8">
          {/* Copyright Text */}
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-white">
              © 2025 KOKOBET777. {t('all_rights_reserved')}
            </p>
          </div>

          {/* Social Media Icons */}
          <div className="flex items-center space-x-4">
            <a href="#" className="transition-opacity hover:opacity-80">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/dicord.svg"
                alt={t('discord')}
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </a>
            <a href="#" className="transition-opacity hover:opacity-80">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/twitter.svg"
                alt={t('twitter')}
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </a>
            <a href="#" className="transition-opacity hover:opacity-80">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/insta.svg"
                alt={t('instagram')}
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </a>
            <a href="#" className="transition-opacity hover:opacity-80">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/youtube.svg"
                alt={t('youtube')}
                width={24}
                height={24}
                className="h-6 w-6"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
