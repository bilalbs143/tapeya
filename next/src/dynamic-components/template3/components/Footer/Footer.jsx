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
    <footer className="relative bg-[#0C0C0C] px-2 pt-10 sm:px-4">
      <div className="container mx-auto">
        {/* New APK Section - 3 Column Layout with Image in Middle */}
        <div className="mb-10 rounded-[10px] bg-[#E8D25E] p-[2px]">
          <div className="grid grid-cols-1 gap-6 rounded-[10px] bg-black p-6 md:grid-cols-3 md:items-center md:p-8">
            {/* Left Column - Text and Button */}
            <div className="flex flex-col items-center md:col-span-1">
              {/* Gradient Text */}
              <h2 className="bg-[#E8D25E] bg-clip-text text-center text-3xl leading-tight font-bold text-transparent uppercase md:text-[30px] lg:text-[40px]">
                {t('now_you_can_play_on_mobile')}
              </h2>

              {/* Download APK Button */}
              <a
                href="https://thestaticfile.com/uploads/user03.apk"
                download="artchip.apk"
                className="mt-6 flex w-fit cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-4 pt-3 pb-4 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-colors hover:bg-[#D3AF37] active:scale-95"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0B0B0B]">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/android-icon-3.svg"
                    alt="android-icon"
                    width={20}
                    height={20}
                  />
                </span>
                <span>{t('download_apk')}</span>
              </a>
            </div>

            {/* Middle Column - Smartphone Mockup Image */}
            <div className="flex justify-center md:col-span-1">
              <div className="relative">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/footer-apk-icon-3.webp"
                  alt="smartphone-mockup"
                  width={220}
                  height={420}
                  className="h-auto w-[240px] object-contain md:w-[240px] lg:w-[350px]"
                />
              </div>
            </div>

            {/* Right Column - Scan Me and QR Code */}
            <div className="flex flex-col items-center justify-center gap-4 md:col-span-1">
              {/* Mobile QR Code Section */}
              <div className="block md:hidden">
                <div className="rounded-lg bg-[#E8D25E] p-[2px]">
                  <div className="flex items-center gap-4 rounded-md bg-black p-4">
                    {/* Left Text Section */}
                    <div className="flex flex-col">
                      <h3 className="bg-[#E8D25E] bg-clip-text text-lg font-bold text-transparent uppercase">
                        {t('scan_me')}
                      </h3>
                      <p className="text-xs text-white">{t('to_download')}</p>
                    </div>

                    {/* Right QR Code Section */}
                    <div className="rounded-lg bg-[#E8D25E] p-[1px]">
                      <div className="rounded-lg bg-black p-2">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user03.png"
                          alt="qr-code"
                          width={80}
                          height={80}
                          className="h-auto w-[140px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop QR Code Section */}
              <div className="hidden md:block">
                <div className="rounded-lg bg-[#E8D25E] p-[2px]">
                  <div className="flex flex-col items-center rounded-md bg-black px-20 py-6 text-center">
                    <h3 className="mb-4 bg-[#E8D25E] bg-clip-text text-2xl font-bold text-transparent uppercase md:text-3xl">
                      {t('scan_qr')}
                    </h3>
                    <div className="rounded-[6px] bg-[#E8D25E] p-[1px]">
                      <div className="rounded-[6px] bg-black p-2">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user03.png"
                          alt="qr-code"
                          width={150}
                          height={150}
                          className="h-auto w-[180px]"
                        />
                      </div>
                    </div>
                    <p className="mt-2 bg-[#E8D25E] bg-clip-text text-xs font-semibold text-[#E8D25E]">
                      {t('for_download_apk')}
                    </p>
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
            className="rounded-[10px] p-[2px]"
            style={{
              background: '#E8D25E',
            }}
          >
            <div className="flex flex-col gap-6 rounded-[10px] bg-black p-6 md:flex-row md:items-center md:justify-between md:p-8">
              {/* Mobile Layout */}
              <div className="flex flex-col items-center gap-6 md:hidden">
                {/* Title - Center Aligned */}
                <h3
                  className="text-[30px] font-bold uppercase"
                  style={{
                    background: '#E8D25E',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
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
                      className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                      style={{
                        border: '1.01px solid #FFF788',
                        background: 'rgba(211, 175, 55, 0.20)',
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
                  className="flex w-full items-center justify-center rounded-[50px] px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                  style={{
                    border: '1.01px solid #FFF788',
                    background: 'rgba(211, 175, 55, 0.20)',
                  }}
                >
                  {t('plus_300_more')}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex md:w-full md:items-center md:justify-between">
                {/* Left - Title */}
                <div className="flex-shrink-0">
                  <h3
                    className="text-2xl font-bold uppercase md:text-3xl lg:text-[35px]"
                    style={{
                      background: '#E8D25E',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {t('pay_with_crypto')}
                  </h3>
                </div>

                {/* Middle - Crypto Icons */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                      style={{
                        border: '1.01px solid #FFF788',
                        background: 'rgba(211, 175, 55, 0.20)',
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
                    className="flex h-12 items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37] md:px-5 md:text-base"
                    style={{
                      border: '1.01px solid #FFF788',
                      background: 'rgba(211, 175, 55, 0.20)',
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
            className="rounded-[10px] p-[2px]"
            style={{
              background: 'linear-gradient(135deg, #D3AF37, #FFF788, #D3AF37)',
            }}
          >
            <div className="flex flex-col gap-6 rounded-[10px] bg-black p-6 md:flex-row md:items-center md:justify-between md:p-8">
              {/* Mobile Layout */}
              <div className="flex flex-col items-center gap-6 md:hidden">
                {/* Title - Center Aligned */}
                <h3
                  className="text-[30px] font-bold uppercase"
                  style={{
                    background: '#E8D25E',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
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
                      className="flex w-[100%] items-center gap-2 rounded-full px-4 py-2 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                      style={{
                        border: '1.01px solid #FFF788',
                        background: 'rgba(211, 175, 55, 0.20)',
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
                  <h3
                    className="text-2xl font-bold uppercase md:text-3xl lg:text-[35px]"
                    style={{
                      background: '#E8D25E',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
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
                      className="flex items-center gap-2 rounded-full px-4 py-2 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                      style={{
                        border: '1.01px solid #FFF788',
                        background: 'rgba(211, 175, 55, 0.20)',
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
                  background: '#E8D25E',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('quick_links')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('about_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('contact_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
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
                  background: '#E8D25E',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('information')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/cookie-policy"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('cookie_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/responsible-gambling"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('responsible_gambling')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('privacy_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-use"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
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
                  background: '#E8D25E',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('faqs')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/faq?tab=general"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('faq_general')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=deposit"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('faq_deposit_withdrawal')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=gaming"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('faq_gaming')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=technical"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('faq_technical')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=banking"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
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
                  alt={t('artchip_logo')}
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
              <h3
                className="mb-4 text-lg font-bold"
                style={{
                  background: '#E8D25E',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('quick_links')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('about_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('contact_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
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
                  background: '#E8D25E',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('information')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/cookie-policy"
                    className="text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('cookie_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/responsible-gambling"
                    className="text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('responsible_gambling')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('privacy_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-use"
                    className="text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
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
                  background: '#E8D25E',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {t('faqs')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/faq?tab=general"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('faq_general')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=deposit"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('faq_deposit_withdrawal')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=gaming"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('faq_gaming')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=technical"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('faq_technical')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=banking"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#E8D25E]"
                  >
                    {t('faq_banking')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section - Descriptive Paragraph */}
          <div
            className="mt-8 rounded-[10px] p-[2px]"
            style={{
              background: '#E8D25E',
            }}
          >
            <div className="rounded-[10px] bg-black p-2">
              <p className="mx-auto text-center text-sm leading-relaxed text-white">
                {t('footer_description')}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright and Social Icons */}
        <div className="relative flex max-w-full flex-col items-center justify-center pt-8 pb-10 md:pb-8">
          {/* Copyright Text */}
          <div className="text-center">
            <p className="text-sm text-white">
              © 2025{' '}
              <span style={{ color: '#E8D25E', fontWeight: 'bold' }}>
                ArtChip
              </span>
              . All Right Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
