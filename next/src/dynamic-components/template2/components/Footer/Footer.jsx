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
    <footer className="container mx-auto rounded-[10px] border border-[#FFFFFF66] bg-[#000304] p-6 md:p-10">
      <div className="container mx-auto">
        {/* New APK Banner - Matches provided design */}
        <div className="mb-10 rounded-[26px] border border-[#FFFFFF66] bg-[#000304]">
          <div className="relative flex flex-col items-center justify-between gap-6 p-6 !pb-0 md:flex-row md:p-10">
            {/* Left Girl Illustration - visible on mobile, behind mockup */}
            <div className="block w-[220px] lg:w-[140px]">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-slide-girl.webp"
                alt="apk-left-girl"
                width={280}
                height={420}
                className="absolute top-[29%] left-[8%] z-1 h-auto w-[100px] object-contain md:top-[-28px] md:left-[-20px] md:w-[254px]"
                priority
              />
            </div>

            {/* Middle: Headline and CTA */}
            <div className="order-1 max-w-xl text-center text-white md:order-2">
              <h3 className="text-2xl leading-tight font-extrabold md:text-4xl">
                {t('footer_mobile_title_line1')}
                <br />
                {t('footer_mobile_title_line2')}
              </h3>
              <div className="mt-6 inline-flex">
                <a
                  href="https://thestaticfile.com/uploads/user02.apk"
                  download
                  className="btn-hover-border inline-flex items-center gap-3 rounded-[60px] bg-[#51A2FF] px-5 py-3 font-semibold text-white transition-opacity hover:opacity-90 md:px-6 md:py-4"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/android.png"
                    alt="android"
                    width={24}
                    height={24}
                  />
                  <span>{t('download_apk')}</span>
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/download.png"
                    alt="download"
                    width={20}
                    height={20}
                  />
                </a>
              </div>
            </div>

            {/* Right Phones */}
            <div className="order-3 flex items-end gap-6 md:gap-10">
              <div className="relative z-10">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-mockup-1.webp"
                  alt="apk-mockup-1"
                  width={220}
                  height={420}
                  className="h-auto w-[140px] object-contain md:w-[180px] lg:w-[220px]"
                />
                {/* Centered QR Code Overlay */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className="text-[10px] tracking-wide text-white uppercase md:text-xs"
                      style={{ fontFamily: 'var(--font-airstrike)' }}
                    >
                      {t('scan_me')}
                    </span>
                    <div className="rounded-md border border-[#51A2FF] p-2 md:p-3">
                      <Image
                        src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user02.png"
                        alt="apk-qr"
                        width={130}
                        height={130}
                        className="h-auto w-[70px] md:w-[90px] lg:w-[130px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/apk-mockup-2.webp"
                alt="apk-mockup-2"
                width={220}
                height={420}
                className="h-auto w-[140px] object-contain md:w-[180px] lg:w-[220px]"
              />
            </div>
          </div>
        </div>

        {/* New Payment Cards - Two in a row, equal width */}
        <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Crypto Currency Card */}
          <div className="relative overflow-hidden rounded-[26px] border border-[#FFFFFF66] bg-[#000304] p-5 md:p-7 md:pr-[220px]">
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0">
                <h3 className="text-2xl font-extrabold text-white md:text-3xl">
                  {t('crypto_currency_title')}
                </h3>
                <div className="mt-4 space-y-2 text-[#D9D9D9]">
                  <div className="flex items-start gap-2">
                    <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <p className="text-sm md:text-base">
                      {t('deposit_time_one_minute')}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <p className="text-sm md:text-base">
                      {t('withdrawal_time_three_minutes')}
                    </p>
                  </div>
                </div>

                {/* Crypto Icons Row */}
                <div className="relative z-10 mt-5 flex flex-wrap items-center gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] hover:border-[#51A2FF] hover:shadow-[inset_0_0_14px_2px_#51A2FF]"
                    >
                      <Image
                        src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                        alt={`crypto-${n}`}
                        width={28}
                        height={28}
                      />
                    </div>
                  ))}
                  <div className="flex h-12 items-center justify-center rounded-full border border-[#2C2F63] bg-[#2C2F63] px-4 text-sm hover:border-[#51A2FF] hover:shadow-[inset_0_0_14px_2px_#51A2FF] md:px-5 md:text-base">
                    {t('plus_300_more')}
                  </div>
                </div>
              </div>

              {/* Right Illustration Placeholder */}
              <div className="absolute right-0 bottom-0">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/crypto-currencies.webp"
                  alt="crypto-illustration"
                  width={300}
                  height={220}
                  className="h-auto w-[130px] object-contain md:w-[240px]"
                />
              </div>
            </div>
          </div>

          {/* Bank Transfer Card */}
          <div className="relative overflow-hidden rounded-[26px] border border-[#FFFFFF66] bg-[#000304] p-5 md:p-7 md:pr-[220px]">
            <div className="flex items-center justify-between gap-6">
              <div className="min-w-0">
                <h3 className="text-2xl font-extrabold text-white md:text-3xl">
                  {t('bank_transfer_title')}
                </h3>
                <div className="mt-4 space-y-2 text-[#D9D9D9]">
                  <div className="flex items-start gap-2">
                    <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <p className="text-sm md:text-base">
                      {t('instant_deposit')}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="mt-[6px] inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
                    <p className="text-sm md:text-base">
                      {t('instant_withdrawal')}
                    </p>
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
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-full border border-[#2C2F63] bg-[#2C2F63] px-4 py-2 text-white hover:border-[#51A2FF] hover:shadow-[inset_0_0_14px_2px_#51A2FF]"
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
              </div>

              {/* Right Illustration Placeholder */}
              <div className="absolute right-0 bottom-0">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/b-transfer.webp"
                  alt="bank-illustration"
                  width={300}
                  height={220}
                  className="h-auto w-[130px] rounded-md object-contain md:w-[240px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Separator between payment cards and links */}
        <div className="my-8 h-px w-full bg-[#333]" />

        {/* New Section - Logo, Tagline, and Links */}
        <div className="border-opacity-50 pt-8 pb-6">
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
              <h3 className="mb-4 text-lg font-bold text-white">
                {t('quick_links')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('about_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('contact_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('disclaimer')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Information */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-white capitalize">
                {t('information')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/cookie-policy"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('cookie_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/responsible-gambling"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('responsible_gambling')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('privacy_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-use"
                    className="text-sm text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
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
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('faq_general')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=deposit"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('faq_deposit_withdrawal')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=gaming"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('faq_gaming')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=technical"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('faq_technical')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=banking"
                    className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
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
              <h3 className="mb-4 text-lg font-bold text-white">
                {t('quick_links')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('about_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact-us"
                    className="text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('contact_us')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/disclaimer"
                    className="text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('disclaimer')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Third Column - Information */}
            <div className="md:col-span-1">
              <h3 className="mb-4 text-lg font-bold text-white capitalize">
                {t('information')}
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/cookie-policy"
                    className="text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('cookie_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/responsible-gambling"
                    className="text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('responsible_gambling')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('privacy_policy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-use"
                    className="text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
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
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('faq_general')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=deposit"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('faq_deposit_withdrawal')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=gaming"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('faq_gaming')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=technical"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('faq_technical')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq?tab=banking"
                    className="break-words text-[#B4BBC5] transition-colors hover:text-[#51A2FF]"
                  >
                    {t('faq_banking')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section - Descriptive Paragraph */}
          <div className="mt-8 rounded-[10px] border border-[#FFFFFF66] p-2">
            <p className="mx-auto text-center text-sm leading-relaxed text-white">
              {t('footer_description')}
            </p>
          </div>
        </div>

        {/* Bottom Section - Copyright and Social Icons */}
        <div className="mt-8 flex flex-col items-center justify-between pt-8 pb-32 md:flex-row md:pb-8">
          {/* Copyright Text */}
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-white">
              © 2025 ArtChip. All Right Reserved
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
