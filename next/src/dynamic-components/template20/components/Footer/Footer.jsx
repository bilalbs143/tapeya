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
        <div className="max-w-9xl mx-auto w-full lg:max-w-[1812px]">
          <div className="mb-10 w-full overflow-hidden rounded-[10px] border border-[#FFDAB91A] shadow-2xl">
            <div className="relative flex h-auto min-h-[324px] w-full flex-col justify-center  px-6 py-10 md:h-[330px] bg-[url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Payment-Partner-background.png)] md:bg-cover md:bg-center md:bg-no-repeat md:px-16 md:py-0">
              {/* Content Overlay */}
              <div className="relative z-10 w-full max-w-full">
                {/* Title */}
                <h3 className="custom-font mb-8 text-left text-2xl font-bold text-white md:text-[42px] md:font-extrabold">
                  Our payment Methods
                </h3>

                {/* Payment Methods Container - Desktop: Side by Side, Mobile: Stacked */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-12">
                  {/* Via Crypto Section */}
                  <div className="mb-8 md:mb-0 md:flex-1">
                    <p className="mb-4 text-left text-[16px] font-bold text-[#FFDAB9]">
                      PAY VIA CRYPTO
                    </p>
                    <div className="grid grid-cols-5 items-center gap-3 md:flex md:flex-wrap md:gap-8.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <div
                          key={n}
                          className="flex h-12 w-12 items-center justify-center rounded-[4px] shadow-[inset_0_3.205px_17.63px_0_rgba(0,0,0,0.45)] transition-all duration-300 ease-out hover:scale-110 hover:shadow-[inset_0_4px_24px_0_rgba(120,20,20,0.35)]"
                          style={{
                            border: '1px solid #FFDAB94D',
                            background: '#2F0000',
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
                        className="col-span-2 flex h-12 items-center justify-center rounded-[4px] px-6 text-sm font-medium text-white shadow-[inset_0_3.205px_17.63px_0_rgba(0,0,0,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[inset_0_4px_24px_0_rgba(120,20,20,0.35)] md:col-span-1"
                        style={{
                          border: '1px solid #FFDAB94D',
                          background: '#2F0000',
                        }}
                      >
                        + 300 More
                      </button>
                    </div>
                  </div>

                  {/* Vertical Divider - Desktop Only */}
                  <div className="hidden h-auto min-h-[120px] w-[2px] items-center self-stretch bg-[#FFDAB9] md:block" />

                  {/* Via Bank Section */}
                  <div className="md:flex-1">
                    <p className="mb-4 text-left text-[16px] font-bold text-[#FFDAB9]">
                      PAY VIA{' '}
                      <span className="capitalize md:uppercase">Bank</span>
                    </p>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-4 md:flex md:flex-wrap md:gap-7">
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
                          className="flex items-center justify-center gap-4 rounded-[4px] border border-[#FFDAB94D] bg-[#2F0000] px-6 py-2.5 text-white shadow-[inset_0_3.205px_17.63px_0_rgba(0,0,0,0.45)] transition-transform hover:scale-105 hover:shadow-[inset_0_4px_24px_0_rgba(120,20,20,0.35)]"
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
        </div>

        <div className="relative overflow-hidden !bg-[#1A1A1A] py-6 shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)] lg:bg-transparent lg:py-10 lg:shadow-none">
          {/*  MOBILE LAYOUT  */}
          <div className="container mx-auto lg:hidden">
            {/* Logo and Tagline */}
            <div className="mb-8 text-center">
              {/* Logo */}
              <div className="mb-6 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Logo Background Ellipse */}
                  <img
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Ellipse+1.png"
                    alt="Logo Background"
                    className="absolute h-[150%] w-auto max-w-none opacity-80"
                  />
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/logo.png"
                    alt={t('artchip_logo')}
                    width={150}
                    height={150}
                    className="relative z-10 object-contain"
                  />
                </div>
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
            <div className="mx-4 mt-8 rounded-[5px] bg-[#000000] p-6">
              <div className="grid grid-cols-1 gap-8">
                {/* Quick Links */}
                <div>
                  <h3 className="font-cravend mb-4 text-[16px] font-bold text-[#FFDAB9]">
                    {t('quick_links')}
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/about"
                        className="text-[14px] text-[#ffff] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('about_us')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact-us"
                        className="text-[14px] text-[#ffff] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('contact_us')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/disclaimer"
                        className="text-[14px] text-[#ffff] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('disclaimer')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Information */}
                <div>
                  <h3 className="font-cravend mb-4 text-[16px] font-bold text-[#FFDAB9] capitalize">
                    {t('information')}
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/cookie-policy"
                        className="text-[14px] text-[#ffff] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('cookie_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/responsible-gambling"
                        className="text-[14px] text-[#ffff] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('responsible_gambling')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-policy"
                        className="text-[14px] text-[#ffff] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('privacy_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms-of-use"
                        className="text-[14px] text-[#ffff] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('terms_and_conditions')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* FAQ's */}
                <div>
                  <h3 className="font-cravend mb-4 text-[16px] font-bold text-[#FFDAB9]">
                    {t('faqs')}
                  </h3>
                  <ul className="space-y-3">
                    <li>
                      <Link
                        href="/faq?tab=general"
                        className="text-[14px] break-words text-[#ffff] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('faq_general')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=deposit"
                        className="text-[14px] break-words text-[#ffff] transition-colors hover:text-[#FFDAB9]"
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
                        className="text-[14px] break-words text-[#ffff] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('faq_technical')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Get Our App */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#FFDAB9]">
                    Get Our App
                  </h4>
                  <div className="relative flex items-start">
                    {/* Left side: QR Code and Download Button */}
                    <div className="flex flex-col items-center gap-3">
                      {/* QR Code */}
                      <div className="flex h-[100px] w-[100px] items-center justify-center rounded-lg bg-white p-2">
                        <img
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Frame+1707486226.png"
                          alt="QR Code"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      {/* Download Button */}
                      <button className="rounded-full bg-[#FFDAB9] px-6 py-2 text-[13px] font-bold text-black transition-transform hover:scale-105">
                        Download
                      </button>
                    </div>
                    {/* Right side: Character Image */}
                    <div className="relative -mt-10 h-[220px] w-[260px]">
                      <img
                        src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/fotter-mob-18.png"
                        alt="Character"
                        className="absolute right-[-24px] bottom-[-0px] h-[240px] w-auto max-w-none object-contain"
                      />
                    </div>
                  </div>
                </div>


                {/* Mobile Copyright (Simplified) */}
                <div className="-mt-8 w-[100%] border-t border-white/10 pt-6 pb-2">
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
            <div className="flex w-[250px] flex-col items-start justify-between pt-10 pb-8">
              <div>
                <div className="relative flex items-center justify-center">
                  {/* Logo Background Ellipse */}
                  <img
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Ellipse+1.png"
                    alt="Logo Background"
                    className="absolute h-[180%] w-auto max-w-none opacity-80"
                  />
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/logo.png"
                    alt={t('artchip_logo')}
                    width={220}
                    height={90}
                    className="relative z-10 h-[75px] w-auto"
                  />
                </div>
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
            <div className="flex-1 rounded-[10px] border border-[#CBBC9121] bg-[#000000] px-10 py-6 shadow-lg">
              <div className="flex justify-between">
                {/* Quick Links */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#FFDAB9]">
                    {t('quick_links')}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <Link
                        href="/about"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('about_us')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact-us"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('contact_us')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/disclaimer"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('disclaimer')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Informative */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#FFDAB9]">
                    {t('information')}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <Link
                        href="/cookie-policy"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('cookie_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/responsible-gambling"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('responsible_gambling')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/privacy-policy"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('privacy_policy')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/terms-of-use"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('terms_and_conditions')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* FAQs */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#FFDAB9]">
                    {t('faqs')}
                  </h4>
                  <ul className="flex flex-col gap-3">
                    <li>
                      <Link
                        href="/faq?tab=general"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('faq_general')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=deposit"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('faq_deposit_withdrawal')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=gaming"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('faq_gaming')}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/faq?tab=technical"
                        className="text-[14px] text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                      >
                        {t('faq_technical')}
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Get Our App */}
                <div className="flex flex-col gap-5">
                  <h4 className="text-[15px] font-bold text-[#FFDAB9]">
                    Get Our App
                  </h4>
                  <div className="relative flex items-start">
                    {/* Left side: QR Code and Download Button */}
                    <div className="flex flex-col items-center gap-3">
                      {/* QR Code */}
                      <div className="flex h-[100px] w-[100px] items-center justify-center rounded-lg bg-white p-2">
                        <img
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Frame+1707486226.png"
                          alt="QR Code"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      {/* Download Button */}
                      <button className="rounded-full bg-[#FFDAB9] px-6 py-2 text-[13px] font-bold text-black transition-transform hover:scale-105">
                        Download
                      </button>
                    </div>
                    {/* Right side: Character Image */}
                    <div className="relative -mt-10 h-[220px] w-[260px]">
                      <img
                        src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Footer+download+Section+background.png"
                        alt="Character"
                        className="absolute right-[-1px] bottom-[-0px] h-[240px] w-auto max-w-none object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Bar */}
              <div className="flex items-center justify-between border-t border-white/10 pt-6">
                <p className="text-[13px] font-medium text-[#FFFFFF]">
                  © 2025{' '}
                  <span className="font-bold text-[#FFFFFF]">ArtChip</span>.{' '}
                  {t('all_rights_reserved')}
                </p>
                <div className="flex space-x-8">
                  <Link
                    href="/terms-of-use"
                    className="text-[13px] font-medium text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
                  >
                    {t('terms_and_conditions')}
                  </Link>
                  <Link
                    href="/privacy-policy"
                    className="text-[13px] font-medium text-[#FFFFFF] transition-colors hover:text-[#FFDAB9]"
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
