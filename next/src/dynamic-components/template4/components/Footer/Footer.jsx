'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';

function Footer() {
  const { t } = useTranslations();
  const { footerLogo } = useTemplate();

  return (
    <footer className="relative px-2 pt-10 sm:px-4">
      <div className="container mx-auto">
        {/* New APK Section - 3 Column Layout with Image in Middle */}
        <div className="mb-10">
          <div className="relative grid grid-cols-1 gap-0 border border-[#03c72c4d] bg-transparent p-6 md:grid-cols-3 md:items-center md:gap-6 md:border-none md:bg-black md:p-8 md:!pb-0">
            {/* Background Pattern SVG - Desktop Only */}
            <div className="absolute inset-0 hidden overflow-hidden md:block">
              <svg
                className="absolute top-0 left-0 h-full w-full"
                viewBox="0 0 1860 501"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <mask id="path-1-inside-1_24_1290" fill="white">
                  <path d="M1855 0C1857.76 0 1860 2.23858 1860 5V496C1860 498.761 1857.76 501 1855 501H5C2.23858 501 0 498.761 0 496V5C0 2.23858 2.23858 0 5 0H742C775.137 0 800.963 28.8449 818.855 56.737C840.919 91.135 882.429 114.311 930 114.311C977.571 114.311 1019.08 91.135 1041.15 56.737C1059.04 28.8449 1084.86 0 1118 0H1855Z" />
                </mask>
                <path
                  d="M1855 0C1857.76 0 1860 2.23858 1860 5V496C1860 498.761 1857.76 501 1855 501H5C2.23858 501 0 498.761 0 496V5C0 2.23858 2.23858 0 5 0H742C775.137 0 800.963 28.8449 818.855 56.737C840.919 91.135 882.429 114.311 930 114.311C977.571 114.311 1019.08 91.135 1041.15 56.737C1059.04 28.8449 1084.86 0 1118 0H1855Z"
                  fill="#0A1818"
                />
                <path
                  d="M1041.15 56.737L1040.3 56.1971L1041.15 56.737ZM818.855 56.737L818.013 57.2769L818.855 56.737ZM1855 0V1C1857.21 1 1859 2.79086 1859 5H1860H1861C1861 1.68629 1858.31 -1 1855 -1V0ZM1860 5H1859V496H1860H1861V5H1860ZM1860 496H1859C1859 498.209 1857.21 500 1855 500V501V502C1858.31 502 1861 499.314 1861 496H1860ZM1855 501V500H5V501V502H1855V501ZM5 501V500C2.79086 500 1 498.209 1 496H0H-1C-1 499.314 1.68629 502 5 502V501ZM0 496H1V5H0H-1V496H0ZM0 5H1C1 2.79086 2.79086 1 5 1V0V-1C1.68629 -1 -1 1.68629 -1 5H0ZM5 0V1H742V0V-1H5V0ZM818.855 56.737L818.013 57.2769C840.272 91.9789 882.109 115.311 930 115.311V114.311V113.311C882.748 113.311 841.566 90.2911 819.696 56.1971L818.855 56.737ZM930 114.311V115.311C977.891 115.311 1019.73 91.9789 1041.99 57.2769L1041.15 56.737L1040.3 56.1971C1018.43 90.2911 977.252 113.311 930 113.311V114.311ZM1118 0V1H1855V0V-1H1118V0ZM1041.15 56.737L1041.99 57.2769C1050.91 43.3733 1061.77 29.2831 1074.5 18.6771C1087.22 8.07463 1101.74 1 1118 1V0V-1C1101.12 -1 1086.16 6.3478 1073.22 17.1408C1060.27 27.9303 1049.28 42.2086 1040.3 56.1971L1041.15 56.737ZM742 0V1C758.262 1 772.783 8.07463 785.504 18.6771C798.229 29.2831 809.094 43.3733 818.013 57.2769L818.855 56.737L819.696 56.1971C810.723 42.2085 799.73 27.9303 786.785 17.1408C773.835 6.3478 758.875 -1 742 -1V0Z"
                  fill="#03C72C"
                  fillOpacity="0.3"
                  mask="url(#path-1-inside-1_24_1290)"
                />
              </svg>
            </div>
            {/* Left Column - Text and Button */}
            <div className="relative z-10 flex flex-col md:col-span-1">
              {/* White Text */}
              <h2 className="text-3xl leading-tight font-bold text-white uppercase md:text-[30px] lg:text-[40px]">
                {t('uplift_casino_journey')}
              </h2>

              {/* Subtitle */}
              <p className="mt-4 text-lg text-white">
                {t('download_exclusive_app')}
              </p>

              {/* Download APK Button */}
              <a
                href="https://thestaticfile.com/uploads/user04.apk"
                download="artchip.apk"
                className="filled-hover-effect mt-6 flex w-fit cursor-pointer items-center justify-center gap-3 rounded-[45px] bg-[#55BC55] px-6 pt-4 pb-4 text-base font-bold text-black transition-colors hover:bg-[#4AA44A] active:scale-95"
                data-hover={t('get_app')}
              >
                <span className="inline-flex items-center justify-center">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/android-icon-4.svg"
                    alt="android-icon"
                    width={20}
                    height={20}
                  />
                </span>
                <span>{t('get_app')}</span>
              </a>
            </div>

            {/* Middle Column - Smartphone Mockup Image */}
            <div className="relative z-10 flex justify-center md:col-span-1 md:items-end">
              <div className="relative">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/footer-apk-icon-4.webp"
                  alt="smartphone-mockup"
                  width={220}
                  height={420}
                  className="h-auto w-[240px] object-contain md:w-[240px] lg:w-[550px]"
                />
              </div>
            </div>

            {/* Right Column - Scan Me and QR Code */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 md:col-span-1">
              {/* Mobile QR Code Section */}
              <div className="block md:hidden">
                <div className="flex flex-col items-center gap-4">
                  {/* QR Code with Green Border */}
                  <div
                    className="rounded-lg p-2"
                    style={{
                      border: '2px solid #55BC55',
                      background: 'transparent',
                    }}
                  >
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user04.png"
                      alt="qr-code"
                      width={120}
                      height={120}
                      className="h-auto w-[220px]"
                    />
                  </div>

                  {/* Scan Text */}
                  <p className="text-center text-[22px] font-medium text-white">
                    {t('scan_me_to_download')}
                  </p>
                </div>
              </div>

              {/* Desktop QR Code Section */}
              <div className="hidden md:block">
                <div className="">
                  <div className="flex flex-col items-center rounded-md text-center">
                    <h3 className="mb-4 bg-clip-text text-xl font-bold text-transparent text-white">
                      {t('scan_me_to_download')}
                    </h3>
                    <div className="rounded-[6px] border border-[#5AB25A]">
                      <div className="rounded-[6px] p-6">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user04.png"
                          alt="qr-code"
                          width={150}
                          height={150}
                          className="h-auto w-[200px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods - Two sections with gradient borders */}
        <div className="mb-10 space-y-6">
          {/* PAY WITH CRYPTO Section */}
          <div
            className="rounded-[5px] p-[1px]"
            style={{
              background: 'transparent',
              border: '1px solid #03c72c4d',
            }}
          >
            <div className="flex flex-col gap-6 rounded-[5px] bg-black p-6 md:flex-row md:items-center md:justify-between md:p-6">
              {/* Mobile Layout */}
              <div className="flex flex-col items-center gap-6 md:hidden">
                {/* Title - Center Aligned */}
                <h3 className="text-[30px] font-bold text-white uppercase">
                  {t('pay_with_crypto')}
                </h3>

                {/* Crypto Icons - 4x2 Grid */}
                <div
                  className="grid grid-cols-4 gap-3"
                  style={{ width: '100%', placeItems: 'center' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-[5px] transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                      style={{
                        border: '1px solid #03c72c4d',
                        background: '#0A1818',
                      }}
                    >
                      <Image
                        src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                        alt={`crypto-${n}`}
                        width={28}
                        height={28}
                      />
                    </div>
                  ))}
                </div>

                {/* + 300 More Button - Full Width */}
                <div
                  className="flex w-full items-center justify-center rounded-[5px] px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                  style={{
                    border: '1px solid #03c72c4d',
                    background: '#0A1818',
                  }}
                >
                  {t('plus_300_more')}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex md:w-full md:items-center md:justify-between">
                {/* Left - Title */}
                <div className="flex-shrink-0">
                  <h3 className="text-2xl font-bold text-white uppercase md:text-3xl lg:text-[35px]">
                    {t('pay_with_crypto')}
                  </h3>
                </div>

                {/* Middle - Crypto Icons */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-[5px] transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                      style={{
                        border: '1px solid #03c72c4d',
                        background: '#0A1818',
                      }}
                    >
                      <Image
                        src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                        alt={`crypto-${n}`}
                        width={28}
                        height={28}
                      />
                    </div>
                  ))}
                  <div
                    className="flex h-12 items-center justify-center rounded-[5px] px-4 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55] md:px-5 md:text-base"
                    style={{
                      border: '1px solid #03c72c4d',
                      background: '#0A1818',
                    }}
                  >
                    {t('plus_300_more')}
                  </div>
                </div>

                {/* Right - Timing Info */}
                <div className="flex-shrink-0 text-right text-white">
                  <p className="text-[10px]">{t('deposit_time_one_minute')}</p>
                  <p className="text-[10px]">
                    {t('withdrawal_time_three_minutes')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PAY VIA BANK Section */}
          <div
            className="rounded-[5px] p-[1px]"
            style={{
              background: 'transparent',
              border: '1px solid #03c72c4d',
            }}
          >
            <div className="flex flex-col gap-6 rounded-[5px] bg-black p-6 md:flex-row md:items-center md:justify-between md:p-6">
              {/* Mobile Layout */}
              <div className="flex flex-col items-center gap-6 md:hidden">
                {/* Title - Center Aligned */}
                <h3 className="text-[30px] font-bold text-white uppercase">
                  {t('pay_via_bank')}
                </h3>

                {/* Bank Payment Buttons - 2x2 Grid */}
                <div
                  className="grid grid-cols-2 gap-3"
                  style={{ width: '100%', placeItems: 'center' }}
                >
                  {[
                    {
                      label: t('local_bank'),
                      src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/local-bank.png',
                    },
                    {
                      label: t('wallet_app'),
                      src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/wallet-app.png',
                    },
                    {
                      label: t('e_wallet'),
                      src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/e-wallet.png',
                    },
                    {
                      label: t('utility_card'),
                      src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/u-card.png',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex w-[100%] items-center gap-2 rounded-[5px] px-4 py-2 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                      style={{
                        border: '1px solid #03c72c4d',
                        background: '#0A1818',
                      }}
                    >
                      <Image
                        src={item.src}
                        alt={item.label}
                        width={20}
                        height={20}
                      />
                      <span className="text-sm">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex md:w-full md:items-center md:justify-between">
                {/* Left - Title */}
                <div className="flex-shrink-0">
                  <h3 className="text-2xl font-bold text-white uppercase md:text-3xl lg:text-[35px]">
                    {t('pay_via_bank')}
                  </h3>
                </div>

                {/* Middle - Bank Payment Buttons */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  {[
                    {
                      label: t('local_bank'),
                      src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/local-bank.png',
                    },
                    {
                      label: t('wallet_app'),
                      src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/wallet-app.png',
                    },
                    {
                      label: t('e_wallet'),
                      src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/e-wallet.png',
                    },
                    {
                      label: t('utility_card'),
                      src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/u-card.png',
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-[5px] px-4 py-2 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                      style={{
                        border: '1px solid #03c72c4d',
                        background: '#0A1818',
                      }}
                    >
                      <Image
                        src={item.src}
                        alt={item.label}
                        width={20}
                        height={20}
                      />
                      <span className="text-sm md:text-base">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Right - Timing Info */}
                <div className="flex-shrink-0 text-right text-white">
                  <p className="text-[10px]">{t('instant_deposit')}</p>
                  <p className="text-[10px]">{t('instant_withdrawal')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-10 rounded-[5px] border border-[#03c72c4d] bg-[#0A1818] p-6">
          {/* New Section - Logo, Tagline, and Links */}
          <div className="border-opacity-50 max-w-full pt-8 pb-6">
            {/* Logo and Tagline - Centered on mobile */}
            <div className="mb-8 text-center md:mb-0 md:hidden">
              {/* Logo */}
              <div className="mb-4 flex items-center justify-center">
                <Image
                  src={footerLogo}
                  alt={t('artchip_logo')}
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
                <h3
                  className="mb-4 text-lg font-bold"
                  style={{
                    color: '#55BC55',
                  }}
                >
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Information */}
              <div>
                <h3
                  className="mb-4 text-lg font-bold capitalize"
                  style={{
                    color: '#55BC55',
                  }}
                >
                  {t('information')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* FAQ's */}
              <div>
                <h3
                  className="mb-4 text-lg font-bold"
                  style={{
                    color: '#55BC55',
                  }}
                >
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_banking')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Mobile: Contact Section - Separate Row */}
            <div className="mt-8 md:hidden">
              <h3
                className="mb-4 text-left text-lg font-bold"
                style={{
                  color: '#55BC55',
                }}
              >
                {t('contact')}
              </h3>
              <div className="flex gap-4">
                {/* WhatsApp Button */}
                <a
                  href="#"
                  className="flex flex-1 items-center justify-center gap-2 rounded-[5px] px-3 py-4 text-sm text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                  style={{
                    border: '1px solid #03c72c4d',
                    background: '#0A1818',
                  }}
                >
                  <span>{t('whatsapp')}</span>
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/footer-whatsapp-4.svg"
                    alt="WhatsApp"
                    width={23}
                    height={23}
                  />
                </a>

                {/* Telegram Button */}
                <a
                  href="#"
                  className="flex flex-1 items-center justify-center gap-2 rounded-[5px] px-3 py-4 text-sm text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                  style={{
                    border: '1px solid #03c72c4d',
                    background: '#0A1818',
                  }}
                >
                  <span>{t('telegram')}</span>
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/footer-telegram-4.svg"
                    alt="Telegram"
                    width={23}
                    height={23}
                  />
                </a>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden gap-8 md:grid md:grid-cols-5">
              {/* Left Column - Logo and Tagline */}
              <div className="mb-6 text-left md:col-span-1">
                {/* Logo */}
                <div className="flex items-center justify-start">
                  <Image
                    src={footerLogo}
                    alt={t('artchip_logo')}
                    width={140}
                    height={140}
                  />
                </div>

                {/* Tagline */}
                <p className="mt-6 max-w-xs text-[12px] leading-relaxed text-gray-300">
                  {t('footer_tagline')}
                </p>
              </div>

              {/* Second Column - Quick Links */}
              <div className="md:col-span-1">
                <h3
                  className="mb-4 text-lg font-bold"
                  style={{
                    color: '#55BC55',
                  }}
                >
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Third Column - Information */}
              <div className="md:col-span-1">
                <h3
                  className="mb-4 text-lg font-bold capitalize"
                  style={{
                    color: '#55BC55',
                  }}
                >
                  {t('information')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Fourth Column - FAQ's */}
              <div className="md:col-span-1">
                <h3
                  className="mb-4 text-lg font-bold"
                  style={{
                    color: '#55BC55',
                  }}
                >
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#55BC55]"
                    >
                      {t('faq_banking')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Fifth Column - Contact */}
              <div className="md:col-span-1">
                <h3
                  className="mb-4 text-lg font-bold"
                  style={{
                    color: '#55BC55',
                  }}
                >
                  {t('contact')}
                </h3>
                <div className="space-y-3">
                  {/* WhatsApp Button */}
                  <a
                    href="#"
                    className="flex max-w-[200px] items-center justify-center gap-3 rounded-[5px] px-4 py-3 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                    style={{
                      border: '1px solid #03c72c4d',
                      background: '#0A1818',
                    }}
                  >
                    <span className="font-semibold">{t('whatsapp')}</span>
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/footer-whatsapp-4.svg"
                      alt="WhatsApp"
                      width={20}
                      height={20}
                    />
                  </a>

                  {/* Telegram Button */}
                  <a
                    href="#"
                    className="flex max-w-[200px] items-center justify-center gap-3 rounded-[5px] px-4 py-3 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#55BC55]"
                    style={{
                      border: '1px solid #03c72c4d',
                      background: '#0A1818',
                    }}
                  >
                    <span className="font-semibold">{t('telegram')}</span>
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/footer-telegram-4.svg"
                      alt="Telegram"
                      width={20}
                      height={20}
                    />
                  </a>
                </div>
              </div>
            </div>

            {/* Bottom Section - Descriptive Paragraph */}
            <div className="mt-8 rounded-[5px] border border-[#03c72c4d] bg-[#060D0D]">
              <div className="rounded-[10px] bg-black p-2">
                <p className="mx-auto text-center text-sm leading-relaxed text-white">
                  {t('footer_description')}
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Section - Copyright and Social Icons */}
          <div className="relative mt-8 flex max-w-full flex-col items-center justify-between pt-8 pb-10 md:flex-row md:pb-8">
            {/* Copyright Text */}
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-white">
                © 2025{' '}
                <span style={{ color: 'rgb(85, 188, 85)', fontWeight: 'bold' }}>
                  ArtChip
                </span>
                . All Right Reserved
              </p>
            </div>

            {/* Social Media Icons */}
            <div className="flex items-center space-x-4">
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/discord-4.svg"
                  alt={t('discord')}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/twitter-4.svg"
                  alt={t('twitter')}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/insta-4.svg"
                  alt={t('instagram')}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/youtube-4.svg"
                  alt={t('youtube')}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
