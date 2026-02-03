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
        {/* ================= PAY SECTIONS ================= */}
        <div className="container mx-auto mb-10 space-y-6">
          {/* ================= PAY WITH CRYPTO ================= */}
          <div className="relative rounded-[5px] border-[0.905px] border-[#FEA8034D] p-[1px]">
            <div className={`overflow-hidden rounded-[4px] ${footerBg}`}>
              <div className="flex flex-col gap-6 rounded-[4px] px-6 py-6 lg:flex-row lg:items-center">
                {/* MOBILE */}
                <div className="flex flex-col items-center gap-6 lg:hidden">
                  <h3 className="text-[30px] font-bold text-white uppercase">
                    {t('pay_with_crypto')}
                  </h3>
                  <div className="grid w-full grid-cols-4 place-items-center gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <div
                        key={n}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#593F0E] bg-[#0E0E0E]"
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
                  <div className="w-full rounded-full border border-[#593F0E] bg-[#0E0E0E] py-3 text-center text-sm font-semibold text-white">
                    {t('plus_300_more')}
                  </div>
                </div>

                {/* DESKTOP */}
                <div className="hidden w-full items-center justify-between lg:flex">
                  <h3 className="text-[26px] font-bold text-white uppercase">
                    {t('pay_with_crypto')}
                  </h3>
                  <div className="flex flex-1 flex-wrap items-center justify-center gap-4 md:gap-10 lg:gap-13">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <div
                        key={n}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-[#593F0E] bg-[#0E0E0E] hover:bg-[#593F0E]"
                      >
                        <Image
                          src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                          alt={`crypto-${n}`}
                          width={28}
                          height={28}
                        />
                      </div>
                    ))}
                    <div className="flex h-12 items-center rounded-full border border-[#593F0E] bg-[#0E0E0E] px-5 text-white hover:bg-[#593F0E]">
                      {t('plus_300_more')}
                    </div>
                  </div>
                  {/* 3D Coin Image - Attached to Border */}
                  <div className="absolute right-0 bottom-0 h-full w-[120px]">
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/coin-footer-11.png"
                      alt="crypto-coin"
                      fill
                      className="object-contain object-right"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================= PAY VIA BANK ================= */}
          <div className="relative rounded-[5px] border-[0.905px] border-[#FEA8034D] p-[1px] shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)]">
            <div className={`overflow-hidden rounded-[4px] ${footerBg}`}>
              <div className="flex flex-col gap-6 rounded-[4px] px-6 py-6 lg:flex-row lg:items-center lg:pr-[130px]">
                {/* MOBILE */}
                <div className="flex flex-col items-center gap-6 lg:hidden">
                  <h3 className="text-[30px] font-bold text-white uppercase">
                    {t('pay_via_bank')}
                  </h3>
                  <div className="grid w-full grid-cols-2 gap-3">
                    {[
                      { label: t('local_bank'), src: 'local-bank.png' },
                      { label: t('wallet_app'), src: 'wallet-app.png' },
                      { label: t('e_wallet'), src: 'e-wallet.png' },
                      { label: t('utility_card'), src: 'u-card.png' },
                    ].map((i) => (
                      <div
                        key={i.label}
                        className="flex items-center gap-2 rounded-full border border-[#593F0E] bg-[#0E0E0E] px-4 py-2 text-white hover:bg-[#593F0E]"
                      >
                        <Image
                          src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/${i.src}`}
                          alt={i.label}
                          width={20}
                          height={20}
                        />
                        <span className="text-sm">{i.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* DESKTOP */}
                <div className="hidden w-full items-center lg:flex">
                  <h3 className="text-[26px] font-bold text-white uppercase">
                    {t('pay_via_bank')}
                  </h3>
                  <div className="flex flex-1 items-center justify-center gap-14">
                    {[
                      { label: t('local_bank'), src: 'local-bank.png' },
                      { label: t('wallet_app'), src: 'wallet-app.png' },
                      { label: t('e_wallet'), src: 'e-wallet.png' },
                      { label: t('utility_card'), src: 'u-card.png' },
                    ].map((i) => (
                      <div
                        key={i.label}
                        className="flex items-center gap-2 rounded-full border border-[#593F0E] bg-[#0E0E0E] px-4 py-2 text-white hover:bg-[#593F0E]"
                      >
                        <Image
                          src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/${i.src}`}
                          alt={i.label}
                          width={20}
                          height={20}
                        />
                        <span>{i.label}</span>
                      </div>
                    ))}
                  </div>
                  {/* 3D Card Image - Attached to Border */}
                  <div className="absolute right-0 bottom-0 h-full w-[120px]">
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/card-footer-11.png"
                      alt="bank-card"
                      fill
                      className="object-contain object-right"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[5px] bg-[#000000] py-6 shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)]">
          {/* New Section - Logo, Tagline, and Links */}
          <div className="border-opacity-50 container mx-auto pt-0 pb-6 lg:pt-8">
            {/* Logo and Tagline - Centered on mobile */}
            <div className="mb-8 text-center lg:mb-0 lg:hidden">
              {/* Logo */}
              <div className="mb-4 flex items-center justify-center">
                <Image
                  src={headerLogo}
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

            {/* Mobile: Three columns for Quick Links, Information, and FAQs */}
            <div className="grid grid-cols-1 gap-4 lg:hidden">
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

              <div className="lg:hidden">
                <div className="flex justify-center">
                  <div
                    className="relative flex h-[200px] w-full flex-row overflow-hidden rounded-[4px] border-[1px] border-[#664B14] bg-cover bg-center bg-no-repeat text-left shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)]"
                    style={{
                      backgroundImage:
                        'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Footer-apk.11.png)',
                    }}
                  >
                    <div className="relative z-10 flex h-full flex-col justify-between p-7 pl-6">
                      {/* Text */}
                      <div className="mb-3 pl-3 text-left">
                        <div className="text-[17px] leading-tight font-bold text-white">
                          Scan to
                        </div>
                        <div className="text-[17px] leading-tight font-bold text-white">
                          Download APK
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden gap-8 lg:flex lg:items-start">
              {/* Left Column - Logo and Tagline */}
              <div className="mb-6 flex flex-1 flex-col text-left">
                {/* Logo */}
                <div className="mb-4 flex items-start justify-start">
                  <Image
                    src={headerLogo}
                    alt={t('artchip_logo')}
                    width={140}
                    height={140}
                  />
                </div>
                {/* Social Icons */}
                <div className="mt-4 flex items-center space-x-4 lg:mt-20">
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
                <div className="h-full min-h-[200px] w-px bg-[#664B14]" />
              </div>

              {/* Second Column - Quick Links */}
              <div className="flex-1">
                <h3 className="font-cravend mb-4 text-[17px] font-bold text-[#FFFFFF]">
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
                <div className="h-full min-h-[200px] w-px bg-[#664B14]" />
              </div>

              {/* Third Column - Information */}
              <div className="flex-1">
                <h3 className="font-cravend mb-4 text-[17px] font-bold text-[#FFFFFF] capitalize">
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
                <div className="h-full min-h-[200px] w-px bg-[#664B14]" />
              </div>

              {/* Fourth Column - FAQ's */}
              <div className="flex-1">
                <h3 className="font-cravend mb-4 text-[17px] font-bold text-[#FFFFFF]">
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

              {/* Fifth Column - GET THE APP */}
              <div className="flex-1">
                <div className="flex justify-center">
                  <div
                    className={`relative flex h-[230px] w-[280px] flex-1 flex-col overflow-hidden rounded-[4px] border-[1px] border-[#664B14] bg-cover bg-center bg-no-repeat text-left shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)] ${footerBg}`}
                    style={{
                      backgroundImage:
                        'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Desktop-footer-apk-11.png)',
                    }}
                  >
                    <div className="relative z-10 flex h-full flex-col justify-start p-7 pl-6">
                      {/* Text */}
                      <div className="mr-2 mb-3 text-left">
                        <div className="text-[17px] leading-tight font-bold text-white">
                          Scan to
                        </div>
                        <div className="text-[17px] leading-tight font-bold text-white">
                          Download APK
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section - Copyright */}
          <div className="relative container mx-auto flex flex-col items-center justify-between rounded-[5px] border border-[#FEA8034D] bg-[#121212] px-6 py-4 lg:flex-row">
            {/* Copyright Text */}
            <div className="mb-4 lg:mb-0">
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
