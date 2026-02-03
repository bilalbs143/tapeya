'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';

function Footer() {
  const { t } = useTranslations();
  const { headerLogo } = useTemplate();

  const footerBg =
    "bg-[linear-gradient(0deg,rgba(18,18,18,0.92),rgba(18,18,18,0.92)),url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/footer-frame-11.png')] bg-cover bg-center bg-no-repeat";

  return (
    <footer className="relative w-full p-[0.7rem] pt-10 pb-0 pl-[0.7rem] lg:pt-[1rem] lg:pr-0 lg:pb-0 lg:pl-0">
      <div className="w-full">
        <div className="max-w-9xl mx-auto w-full lg:max-w-[1530px]">
          <div className="mb-10 w-full overflow-hidden rounded-[15px] border border-[#FFB7034D] shadow-2xl">
            <div className="relative flex h-auto min-h-[440px] w-full flex-col justify-center bg-[linear-gradient(0deg,rgba(255,183,3,0.20)_-131.53%,#080E1B_62.54%)] px-6 py-10 md:h-[400px] md:bg-[url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sd.png)] md:bg-cover md:bg-center md:bg-no-repeat md:px-16 md:py-0">
              {/* Content Overlay */}
              <div className="relative z-10 w-full max-w-4xl">
                {/* Title */}
                <h3 className="custom-font mb-8 text-left text-2xl font-bold text-white md:text-[42px] md:font-extrabold md:uppercase">
                  Our payment Methods
                </h3>

                {/* Via Crypto Section */}
                <div className="mb-8">
                  <p className="mb-4 text-left text-[16px] font-bold text-[#FFB703]">
                    PAY VIA CRYPTO
                  </p>
                  <div className="grid grid-cols-5 items-center gap-3 md:flex md:flex-wrap md:gap-7">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <div
                        key={n}
                        className="flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-110 hover:shadow-[inset_0_4px_24px_0_rgba(255,183,3,0.30)]"
                        style={{
                          border: '1px solid #DBB42C4D',
                          background: '#14213D',
                        }}
                      >
                        <Image
                          src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                          alt={`crypto-${n}`}
                          width={24}
                          height={24}
                        />
                      </div>
                    ))}
                    <button
                      className="col-span-2 flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium text-white transition-transform hover:scale-105 hover:shadow-[inset_0_4px_24px_0_rgba(255,183,3,0.30)] md:col-span-1"
                      style={{
                        border: '1px solid #DBB42C4D',
                        background: '#14213D',
                      }}
                    >
                      + 300 More
                    </button>
                  </div>
                </div>

                {/* Via Bank Section */}
                <div>
                  <p className="mb-4 text-left text-[16px] font-bold text-[#FFB703]">
                    PAY VIA{' '}
                    <span className="capitalize md:uppercase">Bank</span>
                  </p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:flex md:flex-wrap md:gap-7">
                    {[
                      {
                        label: t('e_wallet_label') || 'E-Wallet',
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/e-wallet.png',
                      },
                      {
                        label: t('utility_card') || 'Utility Card',
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/u-card.png',
                      },
                      {
                        label: t('local_bank') || 'Local Bank',
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/local-bank.png',
                      },
                      {
                        label: t('wallet_app') || 'Wallet App',
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/wallet-app.png',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-center gap-4 rounded-full border border-[#DBB42C4D] bg-[#14213D] px-6 py-3 text-white transition-transform hover:scale-105 hover:shadow-[inset_0_4px_24px_0_rgba(255,183,3,0.30)]"
                      >
                        <Image
                          src={item.src}
                          alt={item.label}
                          width={24}
                          height={24}
                          className="h-6 w-6 object-contain"
                        />
                        <span className="text-[14px] font-medium whitespace-nowrap">
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden border-t border-[#FFB703] !bg-[#000000] py-6 shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)] lg:bg-transparent lg:py-10 lg:shadow-none">
          {/*  MOBILE LAYOUT  */}
          <div className="container mx-auto lg:hidden">
            {/* Logo and Tagline */}
            <div className="mb-8 text-center">
              {/* Logo */}
              <div className="mb-6 flex items-center justify-center">
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Artchip-18.png"
                  alt={t('artchip_logo')}
                  width={150}
                  height={150}
                  className="object-contain"
                />
              </div>
              {/* Social Icons */}
              <div className="flex items-center justify-center space-x-10">
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

            {/* Links and APK - Wrapped in Container */}
            <div className="mx-4 mt-8 rounded-[12px] border border-[#FFB7034D] bg-[linear-gradient(90deg,#14213D_47.22%,#080E1B_104.19%)] p-6">
              <div className="grid grid-cols-1 gap-8">
                {/* Quick Links */}
                <div>
                  <h3 className="font-cravend mb-4 text-[16px] font-bold text-[#FFB703]">
                    {t('quick_links')}
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/about"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('about_us')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact-us"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('contact_us')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/disclaimer"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('disclaimer')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Information */}
                <div>
                  <h3 className="font-cravend mb-4 text-[16px] font-bold text-[#FFB703] capitalize">
                    {t('information')}
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/cookie-policy"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('cookie_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/responsible-gambling"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('responsible_gambling')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-policy"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('privacy_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms-of-use"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('terms_and_conditions')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* FAQ's */}
                <div>
                  <h3 className="font-cravend mb-4 text-[16px] font-bold text-[#FFB703]">
                    {t('faqs')}
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/faq?tab=general"
                        className="text-[14px] break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('faq_general')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=deposit"
                        className="text-[14px] break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('faq_deposit_withdrawal')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=gaming"
                        className="text-[14px] break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('faq_gaming')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=technical"
                        className="text-[14px] break-words text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('faq_technical')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* APK Box */}
                <div>
                  <div
                    className="relative flex h-[210px] w-full flex-row rounded-[8px] bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Mob+Footer.png)',
                    }}
                  >
                    <div className="absolute top-10 left-5 z-20 text-left">
                      <div className="text-[18px] leading-tight font-bold text-[#FFB703]">
                        Scan to
                      </div>
                      <div className="text-[18px] leading-tight font-bold text-[#FFB703]">
                        Download APK
                      </div>
                    </div>
                    <img
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Frame+1707486226.png"
                      alt="QR"
                      className="absolute bottom-6 left-5 z-20 h-[90px] w-[85px]"
                    />
                  </div>
                </div>

                {/* Mobile Copyright (Simplified) */}
                <div className="mt-4 w-[100%] border-t border-white/10 pt-6 pb-2">
                  <p className="text-center text-[14px] text-[#B4BBC5]">
                    © 2025{' '}
                    <span className="font-bold text-[#FFB703]">ArtChip</span>.{' '}
                    {t('all_rights_reserved')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ================= DESKTOP LAYOUT (NEW) ================= */}
          <div className="container mx-auto hidden items-stretch justify-between gap-10 lg:flex">
            {/* Left Column: Logo & Socials */}
            <div className="flex w-[250px] flex-col items-center justify-between pt-10 pb-8">
              <div>
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Artchip-18.png"
                  alt={t('artchip_logo')}
                  width={220}
                  height={90}
                  className="h-auto w-auto"
                />
              </div>
              <div className="flex space-x-6">
                <a
                  href="#"
                  className="opacity-100 transition-opacity hover:opacity-80"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/discord-5.svg"
                    alt={t('discord')}
                    width={28}
                    height={28}
                  />
                </a>
                <a
                  href="#"
                  className="opacity-100 transition-opacity hover:opacity-80"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/twitter-5.svg"
                    alt={t('twitter')}
                    width={28}
                    height={28}
                  />
                </a>
                <a
                  href="#"
                  className="opacity-100 transition-opacity hover:opacity-80"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/insta-5.svg"
                    alt={t('instagram')}
                    width={28}
                    height={28}
                  />
                </a>
                <a
                  href="#"
                  className="opacity-100 transition-opacity hover:opacity-80"
                >
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/youtube-5.svg"
                    alt={t('youtube')}
                    width={28}
                    height={28}
                  />
                </a>
              </div>
            </div>

            {/* Right Column: Content Card */}
            <div className="flex-1 rounded-[10px] border border-[#FFB7034D] bg-[linear-gradient(90deg,#14213D_47.22%,#080E1B_104.19%)] px-10 py-8 shadow-lg">
              <div className="flex justify-between pb-8">
                {/* Quick Links */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#FFB703]">
                    {t('quick_links')}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <Link
                        href="/about"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('about_us')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact-us"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('contact_us')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/disclaimer"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('disclaimer')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Informative */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#FFB703]">
                    {t('information')}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <Link
                        href="/cookie-policy"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#FFB703]"
                      >
                        {t('cookie_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/responsible-gambling"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#FFB703]"
                      >
                        {t('responsible_gambling')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-policy"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#FFB703]"
                      >
                        {t('privacy_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms-of-use"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#FFB703]"
                      >
                        {t('terms_and_conditions')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* FAQs */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#FFB703]">
                    {t('faqs')}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <Link
                        href="/faq?tab=general"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#FFB703]"
                      >
                        {t('faq_general')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=deposit"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#FFB703]"
                      >
                        {t('faq_deposit_withdrawal')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=gaming"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#FFB703]"
                      >
                        {t('faq_gaming')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=technical"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#FFB703]"
                      >
                        {t('faq_technical')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* APK Box */}
                <div className="w-[280px]">
                  <div
                    className="relative z-10 flex h-[180px] h-full w-full flex-col justify-center overflow-hidden bg-contain bg-center bg-no-repeat p-6"
                    style={{
                      backgroundImage:
                        'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Download-Section+18.png)',
                    }}
                  >
                    <div className="absolute top-7 left-6 z-20 text-left">
                      <div className="text-[15px] leading-tight font-bold text-[#E6D39A]">
                        Scan to
                      </div>
                      <div className="text-[15px] leading-tight font-bold text-[#E6D39A]">
                        Download APK
                      </div>
                    </div>
                    {/* QR CODE  */}
                    <img
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Frame+1707486226.png"
                      alt="QR"
                      className="absolute bottom-3 left-6 z-20 h-[85px] w-[82px]"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <p className="text-[13px] font-medium text-[#B4BBC5]">
                  © 2025{' '}
                  <span className="font-bold text-[#FFB703]">ArtChip</span>.{' '}
                  {t('all_rights_reserved')}
                </p>
                <div className="flex space-x-8">
                  <Link
                    href="/terms-of-use"
                    className="text-[13px] font-medium text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                  >
                    {t('terms_and_conditions')}
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="text-[13px] font-medium text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                  >
                    {t('privacy_policy')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
