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
    <footer className="relative w-full p-[0.7rem] pt-10 pl-[0.7rem] md:p-[1rem] md:pl-0">
      <div className="w-full">
        {/* Daily Rewards and Payment Methods Section */}
        <div className="mb-10 grid grid-cols-1 items-stretch gap-4 md:grid-cols-2">
          {/* Left Column - Daily Rewards */}
          <div className="relative h-full overflow-hidden rounded-lg">
            {/* Background Image */}
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/daily-reward-10.webp"
              alt="Daily Rewards Background"
              width={600}
              height={400}
              className="h-full w-full object-cover"
              unoptimized
            />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col justify-center p-4 md:p-8">
              <div className="relative z-10">
                <h2 className="font-bring-race mb-4 text-xl text-white uppercase md:mb-6 md:text-3xl">
                  DAILY <br /> PRIZES
                </h2>
                <button className="rounded-[5px] bg-[#246A73] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 md:px-8 md:py-3 md:text-base">
                  Take a Part
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Payment Methods (2 rows) */}
          <div className="flex h-full flex-col gap-4">
            {/* Top Row - Pay via Crypto */}
            <div className="flex flex-1 flex-wrap items-center justify-between gap-2 rounded-[5px] bg-[rgba(36,106,115,0.30)] p-4 md:gap-3 md:p-6">
              <h3 className="font-bring-race text-base text-white uppercase md:text-xl">
                {t('pay_via')} <br /> {t('crypto')}
              </h3>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                {/* Crypto Icons - Using icons from bottom section */}
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E33A24] bg-[#131515] md:h-12 md:w-12"
                  >
                    <Image
                      src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                      alt={`crypto-${n}`}
                      width={28}
                      height={28}
                      className="h-5 w-5 md:h-7 md:w-7"
                    />
                  </div>
                ))}

                {/* 300 More Chip */}
                <div className="flex h-10 min-w-[60px] items-center justify-center rounded-[64px] border border-[#E33A24] bg-[#131515] px-3 md:h-12 md:min-w-[80px] md:px-4">
                  <div className="flex flex-row items-center gap-1">
                    <span className="text-xs leading-tight font-bold text-white md:text-sm">
                      300
                    </span>
                    <span className="text-[10px] leading-tight text-white md:text-xs">
                      {t('more')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row - Pay via Bank */}
            <div className="flex flex-1 flex-wrap items-center justify-between gap-2 rounded-[5px] bg-[rgba(36,106,115,0.30)] p-4 md:gap-3 md:p-6">
              <h3 className="font-bring-race text-base text-white uppercase md:text-xl">
                {t('pay_via')} <br /> {t('bank')}
              </h3>
              <div className="grid grid-cols-2 gap-2 md:gap-4">
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
                    className="flex items-center justify-center rounded-[64px] border border-[#E33A24] bg-[#131515] px-2 py-2 md:px-4 md:py-2"
                  >
                    <div className="flex h-full w-full items-center justify-center gap-1 md:gap-2">
                      <Image
                        src={item.src}
                        alt={item.label}
                        width={20}
                        height={20}
                        className="h-4 w-4 md:h-5 md:w-5"
                      />
                      <span className="text-[10px] text-white md:text-sm">
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-[rgba(36,106,115,0.30)] p-6">
          {/* New Section - Logo, Tagline, and Links */}
          <div className="border-opacity-50 max-w-full px-0 pt-0 pb-6 md:px-6 md:pt-8">
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
            </div>

            {/* Mobile: Three columns for Quick Links, Information, and FAQ's */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {/* Quick Links */}
              <div>
                <h3 className="font-spy-agency mb-4 text-[15px] text-white">
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Information */}
              <div>
                <h3 className="font-spy-agency mb-4 text-[15px] text-white capitalize">
                  {t('information')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* FAQ's */}
              <div>
                <h3 className="font-spy-agency mb-4 text-[15px] text-white">
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_banking')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* GET THE APP - Mobile */}
              <div className="md:hidden">
                <div className="flex justify-center">
                  <div className="relative flex w-full items-center justify-between gap-2 rounded-[5px] border border-[#E33A24] bg-[#131515] p-4">
                    {/* Scan to Download Text - Top Left */}
                    <div className="mb-4 text-left">
                      <p className="text-sm font-normal text-white">
                        {t('scan_to_download')}
                      </p>
                    </div>
                    {/* QR Code - Centered */}
                    <div className="flex items-center justify-center">
                      <div className="rounded-[5px] border border-[#E33A24] p-2">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user10.png"
                          alt="QR Code"
                          width={120}
                          height={120}
                          className="h-[120px] w-[120px] object-contain"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden gap-8 md:flex md:items-start">
              {/* Left Column - Logo and Tagline */}
              <div className="mb-6 flex flex-1 flex-col text-left">
                {/* Logo */}
                <div className="mb-4 flex items-start justify-start">
                  <Image
                    src={footerLogo}
                    alt={t('artchip_logo')}
                    width={140}
                    height={140}
                  />
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="flex justify-center px-4">
                <div className="h-full min-h-[200px] w-px bg-[#00374A]" />
              </div>

              {/* Second Column - Quick Links */}
              <div className="flex-1">
                <h3 className="font-spy-agency mb-4 text-[15px] text-white">
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Vertical Separator */}
              <div className="flex justify-center px-4">
                <div className="h-full min-h-[200px] w-px bg-[#00374A]" />
              </div>

              {/* Third Column - Information */}
              <div className="flex-1">
                <h3 className="font-spy-agency mb-4 text-[15px] text-white capitalize">
                  {t('information')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Vertical Separator */}
              <div className="flex justify-center px-4">
                <div className="h-full min-h-[200px] w-px bg-[#00374A]" />
              </div>

              {/* Fourth Column - FAQ's */}
              <div className="flex-1">
                <h3 className="font-spy-agency mb-4 text-[15px] text-white">
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                    >
                      {t('faq_banking')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Vertical Separator */}
              <div className="flex justify-center px-4">
                <div className="h-full min-h-[200px] w-px bg-[#00374A]" />
              </div>

              {/* Fifth Column - GET THE APP */}
              <div className="flex-1">
                <div className="flex justify-center">
                  <div className="relative flex w-full flex-col rounded-[5px] border border-[#E33A24] bg-[#131515] p-4">
                    {/* Scan to Download Text - Top Left */}
                    <div className="mb-4 text-left">
                      <p className="text-sm font-normal text-white md:text-base">
                        {t('scan_to_download')}
                      </p>
                    </div>
                    {/* QR Code - Centered */}
                    <div className="flex items-center justify-center">
                      <div className="rounded-[5px] border border-[#E33A24] p-2">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user10.png"
                          alt="QR Code"
                          width={150}
                          height={150}
                          className="h-[120px] w-[120px] object-contain md:h-[150px] md:w-[150px]"
                          unoptimized
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Copyright */}
          <div
            className="relative flex max-w-full flex-col items-center justify-between rounded-[5px] px-6 py-4 md:flex-row"
            style={{
              background:
                'linear-gradient(90deg, #131515 0%, rgba(36, 106, 115, 0.30) 100%)',
            }}
          >
            {/* Copyright Text */}
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-white">
                © 2025 <span className="font-bold text-[#E33A24]">ArtChip</span>
                . {t('all_rights_reserved')}
              </p>
            </div>

            {/* Policy Links */}
            <div className="flex items-center space-x-4">
              <Link
                href="/privacy-policy"
                className="text-sm text-white uppercase transition-colors hover:text-[#DBB42C]"
              >
                {t('privacy_policy')}
              </Link>
              <Link
                href="/terms-of-use"
                className="text-sm text-white uppercase transition-colors hover:text-[#DBB42C]"
              >
                {t('terms_and_conditions')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
