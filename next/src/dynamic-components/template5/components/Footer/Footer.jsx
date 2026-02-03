'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';

function Footer() {
  const { t } = useTranslations();
  const { footerLogo } = useTemplate();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <footer className="relative bg-black px-2 pt-10 sm:px-4">
      <div className="max-w-9xl mx-auto w-full lg:max-w-[calc(100%-512px)]">
        {/* New Payment Cards - Two in a row, equal width (Copied from Template2) */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2">
          {/* Crypto Currency Card */}
          <motion.div
            className="relative overflow-hidden rounded-[5px] border border-[#00374A] bg-[#000000] p-5 md:p-7"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            style={{ willChange: 'opacity, transform' }}
            layout
          >
            {/* Right-side Gradient Overlay on the SECTION */}
            <div
              className="pointer-events-none absolute top-0 right-0 bottom-0"
              style={{
                width: '30%',
                background:
                  'linear-gradient(to left, rgba(32, 197, 254, 0.50) 0%, transparent 100%)',
              }}
            />
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0">
                <h3 className="relative z-10 text-2xl font-extrabold text-white md:text-2xl">
                  {t('crypto_currency_title')}
                </h3>
                <div className="relative z-10 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[#D9D9D9]">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <p className="text-xs">{t('deposit_time_one_minute')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <p className="text-xs">
                      {t('withdrawal_time_three_minutes')}
                    </p>
                  </div>
                </div>

                {/* Crypto Icons Grid */}
                <div className="relative z-10 mt-5 grid grid-cols-4 gap-3 md:gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <motion.div
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-[#20C5FE] bg-black hover:border-[#51A2FF] hover:shadow-[inset_0_0_14px_2px_#20C5FE]"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{
                        duration: 0.3,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: 0.1 + (n - 1) * 0.05,
                      }}
                      style={{ willChange: 'opacity, transform' }}
                    >
                      <Image
                        src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                        alt={`crypto-${n}`}
                        width={28}
                        height={28}
                      />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Illustration Placeholder */}
              <div className="absolute right-0 bottom-0">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/crypto-currencies-5.webp"
                  alt="crypto-illustration"
                  width={300}
                  height={220}
                  className="h-auto w-[130px] object-contain md:w-[240px]"
                />
              </div>
            </div>
          </motion.div>

          {/* Bank Transfer Card */}
          <motion.div
            className="relative overflow-hidden rounded-[5px] border border-[#00374A] bg-[#000000] p-5 md:p-7"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.1,
            }}
            style={{ willChange: 'opacity, transform' }}
            layout
          >
            {/* Right-side Gradient Overlay on the SECTION */}
            <div
              className="pointer-events-none absolute top-0 right-0 bottom-0"
              style={{
                width: '30%',
                background:
                  'linear-gradient(to left, rgba(32, 197, 254, 0.50) 0%, transparent 100%)',
              }}
            />
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0">
                <h3 className="relative z-10 text-2xl font-extrabold text-white md:text-2xl">
                  {t('bank_transfer_title')}
                </h3>
                <div className="relative z-10 mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[#D9D9D9]">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <p className="text-xs">{t('instant_deposit')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <p className="text-xs">{t('instant_withdrawal')}</p>
                  </div>
                </div>

                {/* Methods Pills */}
                <div className="relative z-10 mt-5 grid grid-cols-2 gap-3 md:gap-4">
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
                  ].map((item, index) => (
                    <motion.div
                      key={item.label}
                      className="flex items-center gap-2 rounded-full border border-[#20C5FE] bg-black px-4 py-2 text-white hover:border-[#51A2FF] hover:shadow-[inset_0_0_14px_2px_#20C5FE]"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-100px' }}
                      transition={{
                        duration: 0.4,
                        ease: [0.25, 0.1, 0.25, 1],
                        delay: 0.1 + index * 0.08,
                      }}
                      style={{ willChange: 'opacity, transform' }}
                    >
                      <Image
                        src={item.src}
                        alt={item.label}
                        width={20}
                        height={20}
                      />
                      <span className="text-sm md:text-base">{item.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Illustration Placeholder */}
              <div className="absolute right-0 bottom-0">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/b-transfer-5.webp"
                  alt="bank-illustration"
                  width={300}
                  height={220}
                  className="h-auto w-[130px] rounded-md object-contain md:w-[230px]"
                />
              </div>
            </div>
          </motion.div>
        </div>
        <motion.div
          className="mb-10 overflow-hidden rounded-[5px] border border-[#00374A] bg-black p-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.2,
          }}
          style={{ willChange: 'opacity, transform' }}
          layout
        >
          {/* New Section - Logo, Tagline, and Links */}
          <div className="border-opacity-50 max-w-full border-b-2 border-dashed border-[#00374A] pt-0 pb-6 md:pt-8">
            {/* Logo and Tagline - Centered on mobile */}
            <motion.div
              className="mb-8 text-center md:mb-0 md:hidden"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
                delay: 0.3,
              }}
              style={{ willChange: 'opacity, transform' }}
            >
              {/* Logo */}
              <div className="mb-4 flex items-center justify-start md:justify-center">
                <Image
                  src={footerLogo}
                  alt={t('artchip_logo')}
                  width={190}
                  height={190}
                />
              </div>
            </motion.div>

            {/* Mobile: Three columns for Quick Links, Information, and FAQ's */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.3,
                }}
                style={{ willChange: 'opacity, transform' }}
              >
                <h3 className="mb-4 text-lg font-bold text-white">
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </motion.div>

              {/* Information */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.4,
                }}
                style={{ willChange: 'opacity, transform' }}
              >
                <h3 className="mb-4 text-lg font-bold text-white capitalize">
                  {t('information')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </motion.div>

              {/* FAQ's */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.5,
                }}
                style={{ willChange: 'opacity, transform' }}
              >
                <h3 className="mb-4 text-lg font-bold text-white">
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_banking')}
                    </Link>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden gap-8 md:grid md:grid-cols-4">
              {/* Left Column - Logo and Tagline */}
              <motion.div
                className="mb-6 text-left md:col-span-1"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.3,
                }}
                style={{ willChange: 'opacity, transform' }}
              >
                {/* Logo */}
                <div className="flex items-center justify-start">
                  <Image
                    src={footerLogo}
                    alt={t('artchip_logo')}
                    width={140}
                    height={140}
                  />
                </div>
              </motion.div>

              {/* Second Column - Quick Links */}
              <motion.div
                className="md:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.35,
                }}
                style={{ willChange: 'opacity, transform' }}
              >
                <h3 className="mb-4 text-lg font-bold text-white">
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </motion.div>

              {/* Third Column - Information */}
              <motion.div
                className="md:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.4,
                }}
                style={{ willChange: 'opacity, transform' }}
              >
                <h3 className="mb-4 text-lg font-bold text-white capitalize">
                  {t('information')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </motion.div>

              {/* Fourth Column - FAQ's */}
              <motion.div
                className="md:col-span-1"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  duration: 0.5,
                  ease: [0.25, 0.1, 0.25, 1],
                  delay: 0.45,
                }}
                style={{ willChange: 'opacity, transform' }}
              >
                <h3 className="mb-4 text-lg font-bold text-white">
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#20C5FE]"
                    >
                      {t('faq_banking')}
                    </Link>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>

          {/* Bottom Section - Copyright */}
          <motion.div
            className="relative flex max-w-full flex-col items-center justify-between overflow-hidden pt-8 pb-2 md:flex-row md:pb-2"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
              delay: 0.6,
            }}
            style={{ willChange: 'opacity, transform' }}
            layout
          >
            {/* Copyright Text */}
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-white">
                © 2025 <span style={{ fontWeight: 'bold' }}>ArtChip</span>. All
                Right Reserved
              </p>
            </div>

            {/* Privacy Policy and Terms Links */}
            <div className="flex items-center gap-4">
              <Link
                href="/privacy-policy"
                className="text-sm font-medium text-white uppercase transition-colors hover:text-[#20C5FE]"
              >
                {t('privacy_policy')}
              </Link>
              <Link
                href="/terms-of-use"
                className="text-sm font-medium text-white uppercase transition-colors hover:text-[#20C5FE]"
              >
                {t('terms_and_conditions')}
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}

export default Footer;
