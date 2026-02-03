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
        <div className="max-w-9xl mx-auto w-full  lg:max-w-[1520px]">
          <div className="mb-10 w-full overflow-hidden rounded-[18px] shadow-2xl">
            <div
              className="relative flex h-[440px] w-full flex-col justify-center px-6 md:h-[400px] md:px-16"
              style={{
                backgroundImage:
                  'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Footer-Image-12.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            >
              {/* Content Overlay */}
              <div className="relative z-10 w-full max-w-4xl">
                {/* Title */}
                <h3 className="custom-font mb-8 text-left text-3xl font-extrabold text-white uppercase md:text-[42px]">
                  OUR PAYMENT METHODS
                </h3>

                {/* Via Crypto Section */}
                <div className="mb-8">
                  <p className="mb-4 text-left text-[16px] font-bold text-[#CBBC91]">
                    PAY VIA CRYPTO
                  </p>
                  <div className="flex flex-wrap items-center gap-3 md:gap-7">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <div
                        key={n}
                        className="flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-110"
                        style={{
                          border: '1px solid #57948B',
                          background: '#04221E',
                          boxShadow: '0px 0px 10px rgba(87, 148, 139, 0.3)',
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
                      className="flex h-12 items-center justify-center rounded-full px-6 text-sm font-medium text-white transition-transform hover:scale-105"
                      style={{
                        border: '1px solid #57948B',
                        background: '#04221E',
                        boxShadow: '0px 0px 10px rgba(87, 148, 139, 0.3)',
                      }}
                    >
                      + 300 More
                    </button>
                  </div>
                </div>

                {/* Via Bank Section */}
                <div>
                  <p className="mb-4 text-left text-[16px] font-bold text-[#CBBC91]">
                    PAY VIA BANK
                  </p>
                  <div className="flex flex-wrap gap-3 md:gap-7">
                    {[
                      {
                        label: t('local_bank') || 'Local Bank',
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/local-bank.png',
                      },
                      {
                        label: t('wallet_app') || 'Wallet App',
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/wallet-app.png',
                      },
                      {
                        label: t('e_wallet_label') || 'E-Wallet',
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/e-wallet.png',
                      },
                      {
                        label: t('utility_card') || 'Utility Card',
                        src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/u-card.png',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-center gap-3 rounded-full px-6 py-3 text-white transition-transform hover:scale-105"
                        style={{
                          border: '1px solid #57948B',
                          background: '#04221E',
                          boxShadow: '0px 0px 10px rgba(87, 148, 139, 0.3)',
                        }}
                      >
                        <Image
                          src={item.src}
                          alt={item.label}
                          width={20}
                          height={20}
                        />
                        <span className="text-sm font-medium">
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

        <div className="relative overflow-hidden border-t border-[#CBBC91] !bg-[#000000] py-6 shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)] lg:bg-transparent lg:py-10 lg:shadow-none">
          {/* ================= MOBILE LAYOUT ================= */}
          <div className="container mx-auto lg:hidden">
            {/* Logo and Tagline */}
            <div className="mb-8 text-center">
              {/* Logo */}
              <div className="mb-6 flex items-center justify-center">
                <Image
                  src={headerLogo}
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
            <div className="mx-4 mt-8 rounded-[12px] border border-[#CBBC9121] bg-[#18181A] p-6">
              <div className="grid grid-cols-1 gap-8">
                {/* Quick Links */}
                <div>
                  <h3 className="font-cravend mb-4 text-[16px] font-bold text-[#CBBC91]">
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
                  <h3 className="font-cravend mb-4 text-[16px] font-bold text-[#CBBC91] capitalize">
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
                  <h3 className="font-cravend mb-4 text-[16px] font-bold text-[#CBBC91]">
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
                    className="relative flex h-[210px] w-full flex-row rounded-[8px]  bg-cover bg-center bg-no-repeat"
                    style={{
                      backgroundImage:
                        'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Download-Mob-15.png)',
                    }}
                  >
                    <div className="absolute top-3 left-4 z-20 text-left">
                      <div className="text-[18px] leading-tight font-bold text-[#CBBC91]">
                        Scan to Download
                      </div>
                      <div className="text-[18px] leading-tight font-bold text-[#CBBC91]">
                        APK
                      </div>
                    </div>

                    {/* QR CODE */}
                    <img
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user13.png"
                      alt="Download APK QR"
                      className="absolute bottom-4 left-4 z-20 h-[96px] w-[96px]"
                    />
                  </div>
                </div>


                {/* Mobile Copyright (Simplified) */}
                <div className="mt-4 w-[100%] border-t border-white/10 pt-6 pb-2">
                  <p className="text-center text-[14px] text-[#B4BBC5]">
                    © 2025 <span className="font-bold text-white">ArtChip</span>
                    . {t('all_rights_reserved')}
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
                  src={headerLogo}
                  alt={t('artchip_logo')}
                  width={200}
                  height={60}
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
            <div className="flex-1 rounded-[10px] border border-[#CBBC9121] bg-[#18181A] px-10 py-8 shadow-lg">
              <div className="flex justify-between pb-8">
                {/* Quick Links */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#CBBC91]">
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
                  <h4 className="text-[15px] font-bold text-[#CBBC91]">
                    {t('information')}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <Link
                        href="/cookie-policy"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#CBBC91]"
                      >
                        {t('cookie_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/responsible-gambling"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#CBBC91]"
                      >
                        {t('responsible_gambling')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-policy"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#CBBC91]"
                      >
                        {t('privacy_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms-of-use"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#CBBC91]"
                      >
                        {t('terms_and_conditions')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* FAQs */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#CBBC91]">
                    {t('faqs')}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <Link
                        href="/faq?tab=general"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#CBBC91]"
                      >
                        {t('faq_general')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=deposit"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#CBBC91]"
                      >
                        {t('faq_deposit_withdrawal')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=gaming"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#CBBC91]"
                      >
                        {t('faq_gaming')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=technical"
                        className="text-[14px] text-[#B4BBC5] transition-colors hover:text-[#DBB42C]"
                      >
                        {t('faq_technical')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* APK Box */}
                <div className="w-[280px]">
                  <div
                    className="relative z-10 flex h-[170px] w-full flex-col justify-center overflow-hidden rounded-[6px] border border-[#CBBC91]  bg-cover bg-center bg-no-repeat p-6"
                    style={{
                      backgroundImage:
                        'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Footer-Bottom-15.png)',
                    }}
                  >
                    <div className="absolute top-3 left-4 z-20 text-left">
                      <div className="text-[18px] leading-tight font-bold text-[#E6D39A]">
                        Scan to Download
                      </div>
                      <div className="text-[18px] leading-tight font-bold text-[#E6D39A]">
                        APK
                      </div>
                    </div>

                    {/* QR CODE */}
                    <img
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user13.png"
                      alt="Download APK QR"
                      className="absolute bottom-[10px] left-[10px] z-20 h-[100px] w-[100px]"
                    />
                  </div>
                </div>

              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <p className="text-[13px] font-medium text-[#B4BBC5]">
                  © 2025 <span className="font-bold text-white">ArtChip</span>.{' '}
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
