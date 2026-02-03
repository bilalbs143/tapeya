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
        {/* PAY WITH CRYPTO and PAY VIA BANK Sections from Template4 */}
        <div className="mb-10 space-y-6">
          {/* PAY WITH CRYPTO Section */}
          <div className="rounded-[5px] border-[0.905px] border-[rgba(219,180,44,0.30)] bg-[#12001F] p-[1px] shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-6 rounded-[5px] p-6 md:flex-row md:items-center md:justify-between md:p-6">
              {/* Mobile Layout */}
              <div className="flex flex-col items-center gap-6 md:hidden">
                {/* Title - Center Aligned */}
                <h3 className="text-[30px] font-bold text-white uppercase">
                  {t('pay_with_crypto')}
                </h3>

                {/* Crypto Icons - 4x2 Grid */}
                <div className="grid w-full grid-cols-4 place-items-center gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-[2.363px] border-[1px] border-[rgba(219,180,44,0.30)] bg-gradient-to-r from-[rgba(124,48,230,0.12)] to-[rgba(219,180,44,0.12)] transition-all hover:shadow-[inset_0_0_6px_1px_#DBB42C4D]"
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
                <div className="flex w-full items-center justify-center rounded-[2.363px] border-[1px] border-[rgba(219,180,44,0.30)] bg-gradient-to-r from-[rgba(124,48,230,0.12)] to-[rgba(219,180,44,0.12)] px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#DBB42C4D]">
                  {t('plus_300_more')}
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex md:w-full md:items-center md:justify-between">
                {/* Left - Title */}
                <div className="flex-shrink-0">
                  <h3 className="text-2xl font-bold text-white uppercase md:text-3xl lg:text-[26px]">
                    {t('pay_with_crypto')}
                  </h3>
                </div>

                {/* Middle - Crypto Icons */}
                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-[2.363px] border-[1px] border-[rgba(219,180,44,0.30)] bg-gradient-to-r from-[rgba(124,48,230,0.12)] to-[rgba(219,180,44,0.12)] transition-all hover:shadow-[inset_0_0_6px_1px_#DBB42C4D]"
                    >
                      <Image
                        src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                        alt={`crypto-${n}`}
                        width={28}
                        height={28}
                      />
                    </div>
                  ))}
                  <div className="flex h-12 items-center justify-center rounded-[2.363px] border-[1px] border-[rgba(219,180,44,0.30)] bg-gradient-to-r from-[rgba(124,48,230,0.12)] to-[rgba(219,180,44,0.12)] px-4 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#DBB42C4D] md:px-5 md:text-base">
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
          <div className="rounded-[5px] border-[0.905px] border-[rgba(219,180,44,0.30)] bg-[#12001F] p-[1px] shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)]">
            <div className="flex flex-col gap-6 rounded-[5px] p-6 md:flex-row md:items-center md:justify-between md:p-6">
              {/* Mobile Layout */}
              <div className="flex flex-col items-center gap-6 md:hidden">
                {/* Title - Center Aligned */}
                <h3 className="text-[30px] font-bold text-white uppercase">
                  {t('pay_via_bank')}
                </h3>

                {/* Bank Payment Buttons - 2x2 Grid */}
                <div className="grid w-full grid-cols-2 place-items-center gap-3">
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
                      className="flex w-[100%] items-center gap-2 rounded-[2.363px] border-[1px] border-[rgba(219,180,44,0.30)] bg-gradient-to-r from-[rgba(124,48,230,0.12)] to-[rgba(219,180,44,0.12)] px-4 py-2 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#DBB42C4D]"
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
                  <h3 className="text-2xl font-bold text-white uppercase md:text-3xl lg:text-[26px]">
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
                      className="flex items-center gap-2 rounded-[2.363px] border-[1px] border-[rgba(219,180,44,0.30)] bg-gradient-to-r from-[rgba(124,48,230,0.12)] to-[rgba(219,180,44,0.12)] px-4 py-2 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#DBB42C4D]"
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

        <div className="relative overflow-hidden rounded-[5px] border-[0.905px] border-[rgba(219,180,44,0.30)] bg-[#12001F] p-6 shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)]">
          {/* New Section - Logo, Tagline, and Links */}
          <div className="border-opacity-50 max-w-full pt-0 pb-6 md:pt-8">
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
              {/* Social Icons */}
              <div className="mt-6 flex items-center justify-center space-x-4">
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

            {/* Mobile: Three columns for Quick Links, Information, and FAQ's */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {/* Quick Links */}
              <div>
                <h3 className="font-cravend mb-4 text-[15px] text-[#DBB42C]">
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
                <h3 className="font-cravend mb-4 text-[15px] text-[#DBB42C] capitalize">
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
                <h3 className="font-cravend mb-4 text-[15px] text-[#DBB42C]">
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
                  <div className="flex h-[150px] w-full flex-row items-center justify-between rounded-[4.526px] border-[0.905px] border-[rgba(219,180,44,0.30)] bg-[#12001F] shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)]">
                    <div className="flex h-full w-full flex-row items-center justify-between px-10 py-3">
                      {/* GET THE APP Text */}
                      <div>
                        <div className="font-bring-race text-sm leading-tight tracking-[0.05em] text-white uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                          {t('get')}
                        </div>
                        <div className="font-bring-race text-sm leading-tight tracking-[0.05em] text-white uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                          {t('the_app')}
                        </div>
                      </div>
                      {/* QR Code */}
                      <div className="rounded-[4.526px] border-[1px] border-[#DBB42C] p-1.5">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user07.png"
                          alt="QR Code"
                          width={100}
                          height={100}
                          className="relative z-10 h-[110px] w-[110px] object-contain"
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
                {/* Social Icons */}
                <div className="mt-4 flex items-center space-x-4 md:mt-20">
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

              {/* Vertical Separator */}
              <div className="flex justify-center px-4">
                <div className="h-full min-h-[200px] w-px bg-[#00374A]" />
              </div>

              {/* Second Column - Quick Links */}
              <div className="flex-1">
                <h3 className="font-cravend mb-4 text-[15px] text-[#DBB42C]">
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
                <h3 className="font-cravend mb-4 text-[15px] text-[#DBB42C] capitalize">
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
                <h3 className="font-cravend mb-4 text-[15px] text-[#DBB42C]">
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
                  <div className="flex h-[230px] flex-1 flex-col items-center justify-center rounded-[4.526px] border-[0.905px] border-[rgba(219,180,44,0.30)] bg-[#12001F] shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)]">
                    <div className="flex h-full w-full flex-col items-center justify-center p-3">
                      {/* GET THE APP Text */}
                      <div className="mb-3 text-center">
                        <div className="text-sm leading-tight font-bold tracking-[0.05em] text-white uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] md:text-base">
                          {t('get')}
                        </div>
                        <div className="text-sm leading-tight font-bold tracking-[0.05em] text-white uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] md:text-base">
                          {t('the_app')}
                        </div>
                      </div>
                      {/* QR Code */}
                      <div className="rounded-[4.526px] border-[1px] border-[#DBB42C] p-1.5">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user09.png"
                          alt="QR Code"
                          width={100}
                          height={100}
                          className="relative z-10 h-[80px] w-[80px] object-contain md:h-[130px] md:w-[130px]"
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
          <div className="relative flex max-w-full flex-col items-center justify-between rounded-[5px] bg-[#1D0032] px-6 py-4 md:flex-row">
            {/* Copyright Text */}
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-white">
                © 2025 <span className="font-bold">ArtChip</span>.{' '}
                {t('all_rights_reserved')}
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
