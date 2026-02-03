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
    <footer className="relative bg-black px-2 pt-10 sm:px-4">
      <div className="max-w-9xl mx-auto w-full lg:max-w-[calc(100%-512px)]">
        {/* New Two-Column Section */}
        <div
          className="mb-10 grid grid-cols-1 md:grid-cols-12"
          style={{ border: '1px solid #A93832' }}
        >
          {/* Left Column - 8 columns */}
          <div
            className="relative col-span-12 h-[440px] overflow-hidden md:col-span-8 md:h-[500px]"
            style={{
              backgroundImage:
                'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/footer-new-pattern-6.webp)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="w-full max-w-2xl">
                {/* Title */}
                <h3 className="mb-6 text-left text-2xl font-extrabold text-white md:text-[40px]">
                  {t('save_secure_payments')}
                </h3>

                {/* Via Crypto Section */}
                <div className="mb-6">
                  <p className="mb-3 text-left text-sm font-medium text-white">
                    {t('via_crypto')}
                  </p>
                  <div className="flex flex-wrap justify-between gap-2 md:justify-start">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <div
                        key={n}
                        className="flex h-12 w-12 items-center justify-center rounded-full hover:border-[#51A2FF] hover:shadow-[inset_0_0_14px_2px_#E70011]"
                        style={{
                          border: '1px solid #E70011',
                          background: '#40060B',
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
                    <button
                      className="flex h-12 flex-1 items-center justify-center rounded-full px-6 text-sm text-white hover:border-[#51A2FF] hover:shadow-[inset_0_0_14px_2px_#E70011] md:flex-initial"
                      style={{
                        border: '1px solid #E70011',
                        background: '#40060B',
                      }}
                    >
                      {t('three_hundred_more')}
                    </button>
                  </div>
                </div>

                {/* Via Bank Section */}
                <div>
                  <p className="mb-3 text-left text-sm font-medium text-white">
                    {t('via_bank')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
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
                        label: t('e_wallet_label'),
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/e-wallet.png',
                      },
                      {
                        label: t('utility_card'),
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/u-card.png',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-center gap-2 rounded-full px-4 py-2 text-white hover:border-[#51A2FF] hover:shadow-[inset_0_0_14px_2px_#E70011]"
                        style={{
                          border: '1px solid #E70011',
                          background: '#40060B',
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
              </div>
            </div>
          </div>

          {/* Right Column - 4 columns */}
          <div className="relative col-span-12 h-[415px] overflow-hidden rounded-lg md:col-span-4 md:h-[500px]">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/footer-girl-6.webp"
              alt="footer-girl"
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="mb-10 bg-black p-6">
          {/* New Section - Logo, Tagline, and Links */}
          <div
            className="border-opacity-50 max-w-full border-b pt-0 pb-6 md:pt-8"
            style={{ borderColor: 'rgba(251, 99, 33, 0.30)' }}
          >
            {/* Logo and Tagline - Centered on mobile */}
            <div className="mb-8 text-center md:mb-0 md:hidden">
              {/* Logo */}
              <div className="mb-4 flex items-center justify-start md:justify-center">
                <Image
                  src={footerLogo}
                  alt={t('artchip_logo')}
                  width={190}
                  height={190}
                />
              </div>
            </div>

            {/* Mobile: Three columns for Quick Links, Information, and FAQ's */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {/* Quick Links */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-[#D61324]">
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Information */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-[#D61324] capitalize">
                  {t('information')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* FAQ's */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-[#D61324]">
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
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
                <div className="mb-4 flex items-center justify-start">
                  <Image
                    src={footerLogo}
                    alt={t('artchip_logo')}
                    width={140}
                    height={140}
                  />
                </div>
                {/* Lorem Ipsum Text */}
                <p className="text-sm leading-relaxed text-[#B4BBC5]">
                  {t('footer_description')}
                </p>
              </div>

              {/* Second Column - Quick Links */}
              <div className="md:col-span-1">
                <h3 className="mb-4 text-lg font-bold text-[#D61324]">
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Third Column - Information */}
              <div className="md:col-span-1">
                <h3 className="mb-4 text-lg font-bold text-[#D61324] capitalize">
                  {t('information')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Fourth Column - FAQ's */}
              <div className="md:col-span-1">
                <h3 className="mb-4 text-lg font-bold text-[#D61324]">
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#D61324]"
                    >
                      {t('faq_banking')}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Section - Copyright */}
          <div className="relative flex max-w-full flex-col items-center justify-between pt-8 pb-2 md:flex-row md:pb-2">
            {/* Copyright Text */}
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-white">
                © 2025 <span style={{ fontWeight: 'bold' }}>ArtChip</span>.{' '}
                {t('all_rights_reserved')}
              </p>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-4">
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/discord-5.svg"
                  alt={t('discord')}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/twitter-5.svg"
                  alt={t('twitter')}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/insta-5.svg"
                  alt={t('instagram')}
                  width={24}
                  height={24}
                  className="h-6 w-6"
                />
              </a>
              <a href="#" className="transition-opacity hover:opacity-80">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/youtube-5.svg"
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
