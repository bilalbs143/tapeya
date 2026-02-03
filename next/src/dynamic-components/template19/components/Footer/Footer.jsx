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
    <footer className="relative w-full p-[0.7rem] pt-0 pb-0 pl-[0.7rem] lg:pt-0 lg:pr-0 lg:pb-0 lg:pl-0">
      <div className="w-full">
        <div className="relative overflow-hidden !border-t border-[#06D6A04D] !bg-[#000000] py-6 shadow-[inset_0_3.621px_19.914px_0_rgba(0,0,0,0.45)] lg:border-none lg:bg-transparent lg:py-0 lg:shadow-none">
          {/* Center Background Image */}
          <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
            <div className="relative h-full w-full">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Ellipse-2.png"
                alt="Background Ellipse"
                fill
                className="object-cover opacity-30"
                priority
              />
            </div>
          </div>
          {/* ================= MOBILE LAYOUT (NEW STRUCTURE) ================= */}
          <div className="container relative z-10 mx-auto px-4 lg:hidden">
            {/* 1. Header: Logo & Socials */}
            <div className="flex items-center justify-between py-6">
              {/* Logo */}
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/artchip-main-19.svg"
                alt={t('artchip_logo')}
                width={120}
                height={40}
                className="h-auto w-[120px]"
              />
              {/* Social Icons */}
              <div className="flex space-x-4">
                {[
                  {
                    src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/discord-5.svg',
                    alt: 'discord',
                  },
                  {
                    src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/twitter-5.svg',
                    alt: 'twitter',
                  },
                  {
                    src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/insta-5.svg',
                    alt: 'instagram',
                  },
                  {
                    src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/youtube-5.svg',
                    alt: 'youtube',
                  },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="transition-opacity hover:opacity-80"
                  >
                    <Image
                      src={social.src}
                      alt={social.alt}
                      width={20}
                      height={20}
                      className="h-5 w-5"
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* 2. Links Grid (3 Columns) */}
            <div className="mt-4 grid grid-cols-3 gap-2">
              {/* Quick Links */}
              <div>
                <h3 className="mb-3 text-[12px] font-extrabold text-white uppercase">
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Informative */}
              <div>
                <h3 className="mb-3 text-[12px] font-extrabold text-white uppercase">
                  INFORMATIVE
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      Resp. Gambling
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      Terms & Cond.
                    </Link>
                  </li>
                </ul>
              </div>

              {/* FAQs */}
              <div>
                <h3 className="mb-3 text-[12px] font-extrabold text-white uppercase">
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      General Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      Deposit/Withdrawal
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      Gaming
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="text-[11px] text-[#B4BBC5] transition-colors hover:text-[#00ffcc]"
                    >
                      Technical
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* 3. App Banner */}
            <div className="mt-8 mb-8">
              <div className="relative h-[230px] w-full overflow-hidden rounded-xl border border-[#0f3f36] bg-[#0c2420]">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/download-Footer-section-14.png')",
                  }}
                >
                  <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/80 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-20 flex h-full w-[65%] flex-col justify-center px-6">
                  <h2 className="mb-1 text-2xl leading-none font-extrabold text-white uppercase">
                    GET OUR <br /> APP
                  </h2>
                  {/* QR Code */}
                  <div className="flex h-[80px] w-[80px] items-center justify-center rounded-lg bg-white p-2">
                    <img
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Frame+1707486226.png"
                      alt="QR Code"
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <button className="w-fit rounded-full mt-1  bg-[#00d2aa] px-6 py-2 text-xs font-bold text-black hover:bg-[#00bda0]">
                    Download APK
                  </button>
                </div>

                {/* Character */}
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/components/Slots-Image-1.png"
                  alt="App Character"
                  className="absolute right-[-10px] bottom-0 z-10 h-[115%] w-[60%] object-contain object-bottom"
                />
              </div>
            </div>

            {/* 4. Payment Methods */}
            <div className="mb-8">
              {/* Pay Via Crypto */}
              <h3 className="mb-4 text-[14px] font-extrabold text-white uppercase">
                PAY VIA CRYPTO
              </h3>
              <div className="mb-6 grid grid-cols-5 gap-3">
                {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((n, i) => (
                  <div
                    key={i}
                    className="flex aspect-square items-center justify-center rounded-lg border border-[#06D6A04D] bg-[#0a1f1b]"
                  >
                    <Image
                      src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                      width={20}
                      height={20}
                      alt={`crypto-${n}`}
                    />
                  </div>
                ))}
              </div>

              {/* Pay Via Bank */}
              <h3 className="mb-4 text-[14px] font-extrabold text-white uppercase">
                PAY VIA BANK
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    label: t('local_bank') || 'Local Bank',
                    icon: 'local-bank.png',
                  },
                  {
                    label: t('wallet_app') || 'Wallet App',
                    icon: 'wallet-app.png',
                  },
                  {
                    label: t('e_wallet_label') || 'E-Wallet',
                    icon: 'e-wallet.png',
                  },
                  {
                    label: t('utility_card') || 'Utility Card',
                    icon: 'u-card.png',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg border border-[#1a4a42] bg-[#0a1f1b] px-4 py-3"
                  >
                    <Image
                      src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/${item.icon}`}
                      width={20}
                      height={20}
                      alt={item.label}
                    />
                    <span className="text-[13px] font-medium text-gray-300">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Footer Bottom */}
            <div className="flex items-center justify-between border-t border-[#ffffff10] pt-6 pb-6">
              <p className="text-[10px] text-[#B4BBC5]">
                © 2025{' '}
                <span className="font-bold text-[#00d2aa] hover:text-[#00ffcc]">
                  ArtChip
                </span>
                . All Right Reserved
              </p>
              <div className="flex gap-4">
                <Link
                  href="/terms-of-use"
                  className="text-[10px] font-bold text-white underline decoration-1 underline-offset-2"
                >
                  Terms & Conditions
                </Link>
                <Link
                  href="/privacy-policy"
                  className="text-[10px] font-bold text-white underline decoration-1 underline-offset-2"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>

          {/* ================= DESKTOP LAYOUT (NEW STRUCTURE) ================= */}
          <div className="relative z-10 mx-auto hidden w-full max-w-[1520px] pt-10 pb-5 lg:block">
            {/* 1. TOP HEADER: Logo & Socials */}
            <div className="mb-10 flex items-center justify-between px-4">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/artchip-main-19.svg"
                alt={t('artchip_logo')}
                width={180}
                height={50}
                className="h-auto w-auto"
              />
              <div className="flex gap-6">
                {[
                  {
                    src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/discord-5.svg',
                    alt: 'discord',
                  },
                  {
                    src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/twitter-5.svg',
                    alt: 'twitter',
                  },
                  {
                    src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/insta-5.svg',
                    alt: 'instagram',
                  },
                  {
                    src: 'https://d3emlo5tm9es2f.cloudfront.net/next/icons/youtube-5.svg',
                    alt: 'youtube',
                  },
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="transition-opacity hover:opacity-80"
                  >
                    <Image
                      src={social.src}
                      alt={social.alt}
                      width={24}
                      height={24}
                    />
                  </a>
                ))}
              </div>
            </div>

            {/* 2. MIDDLE CONTENT: Links & App Card */}
            {/* 2. MIDDLE CONTENT: Links & App Card */}
            <div className="mb-0 flex items-start justify-between border-t border-[#0f3f36] px-4 pb-0">
              {/* QUICK LINKS */}
              <div className="flex flex-col gap-6 pt-10 pb-12">
                <h3 className="text-[15px] font-extrabold tracking-wider text-white uppercase">
                  QUICK LINKS
                </h3>
                <ul className="flex flex-col gap-4">
                  {[
                    { label: t('about_us'), href: '/about' },
                    { label: t('contact_us'), href: '/contact-us' },
                    { label: 'Disclaimer', href: '/disclaimer' },
                  ].map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-[#a1a1aa] transition-colors hover:text-[#00ffcc]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* INFORMATIVE */}
              <div className="flex flex-col gap-6 pt-10 pb-12">
                <h3 className="text-[15px] font-extrabold tracking-wider text-white uppercase">
                  INFORMATIVE
                </h3>
                <ul className="flex flex-col gap-4">
                  {[
                    { label: t('cookie_policy'), href: '/cookie-policy' },
                    {
                      label: 'Responsible Gambling',
                      href: '/responsible-gambling',
                    },
                    { label: 'Privacy Policy', href: '/privacy-policy' },
                    { label: 'Terms and Conditions', href: '/terms-of-use' },
                  ].map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-[#a1a1aa] transition-colors hover:text-[#00ffcc]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* FAQS */}
              <div className="flex flex-col gap-6 pt-10 pb-12">
                <h3 className="text-[15px] font-extrabold tracking-wider text-white uppercase">
                  FAQS
                </h3>
                <ul className="flex flex-col gap-4">
                  {[
                    { label: 'General', href: '/faq?tab=general' },
                    { label: 'Deposit/Withdrawal', href: '/faq?tab=deposit' },
                    { label: 'Gaming', href: '/faq?tab=gaming' },
                    { label: 'Technical', href: '/faq?tab=technical' },
                  ].map((link, idx) => (
                    <li key={idx}>
                      <Link
                        href={link.href}
                        className="text-[14px] text-[#a1a1aa] transition-colors hover:text-[#00ffcc]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* APP CARD */}
              <div className="relative h-[325px] w-[465px] self-end overflow-hidden border-x border-[#0f3f36] bg-[#0c2420]">
                {/* Background & Content */}
                <div
                  className="absolute inset-0 z-0 bg-cover bg-center"
                  style={{
                    backgroundImage:
                      "url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Download-Footer-section-14.png')",
                  }}
                >
                  <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 to-transparent" />

                  {/* Content Positioned */}
                  <div className="relative z-20 flex h-full w-[60%] flex-col justify-center px-8">
                    <h2 className="mb-2 text-3xl leading-none font-extrabold text-white uppercase">
                      GET OUR <br /> APP
                    </h2>
                    {/* QR Code */}
                    <div className="flex h-[100px] w-[100px] items-center justify-center rounded-lg bg-white p-2">
                      <img
                        src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Frame+1707486226.png"
                        alt="QR Code"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <button className="mt-2 w-fit rounded-full bg-[#00d2aa] px-8 py-3 text-sm font-bold text-black transition-colors hover:bg-[#00bda0]">
                      Download APK
                    </button>
                  </div>

                  {/* Character Image */}
                  <img
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/components/Slots-Image-1.png"
                    className="absolute right-0 bottom-0 z-10 h-[110%] w-[55%] object-contain object-bottom"
                    alt="App Character"
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </div>
              </div>
            </div>

            {/* 3. PAYMENTS SECTION */}
            <div className="mb-10 flex flex-col gap-6 border-t border-[#0f3f36] pt-10">
              {/* Row 1: Crypto Icons */}
              <div className="flex items-center justify-between px-4">
                <h3 className="w-[200px] text-[15px] font-extrabold text-white uppercase">
                  PAY VIA CRYPTO
                </h3>
                <div className="flex gap-3 md:gap-10">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-[#06D6A04D] bg-[#0a1f1b] transition-all hover:border-[#00ffcc] hover:shadow-[0_0_10px_rgba(0,255,204,0.3)]"
                    >
                      <Image
                        src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                        width={20}
                        height={20}
                        alt={`crypto-${n}`}
                      />
                    </div>
                  ))}
                  {/* Extra circle for 'more' if needed, image showed 8 icons */}
                </div>
              </div>

              {/* Separator line */}
              <div className="w-full border-t border-[#0f3f36]" />

              {/* Row 2: Bank/Other Methods */}
              <div className="flex items-center justify-between px-4">
                {/* Image text says PAY VIA CRYPTO again. I will use "PAY VIA CRYPTO" to be exact. */}
                <h3 className="w-[200px] text-[15px] font-extrabold text-white uppercase">
                  PAY VIA CRYPTO
                </h3>
                <div className="flex gap-4">
                  {[
                    {
                      label: t('local_bank') || 'Local Bank',
                      icon: 'local-bank.png',
                    },
                    {
                      label: t('wallet_app') || 'Wallet App',
                      icon: 'wallet-app.png',
                    },
                    {
                      label: t('e_wallet_label') || 'E-Wallet',
                      icon: 'e-wallet.png',
                    },
                    {
                      label: t('utility_card') || 'Utility Card',
                      icon: 'u-card.png',
                    },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex min-w-[140px] cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#1a4a42] bg-[#0a1f1b] px-5 py-2.5 transition-all hover:border-[#00ffcc] hover:shadow-[0_0_10px_rgba(0,255,204,0.3)]"
                    >
                      <Image
                        src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/${item.icon}`}
                        width={18}
                        height={18}
                        alt={item.label}
                      />
                      <span className="text-[13px] font-medium text-gray-300">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 4. FOOTER BOTTOM */}
            <div className="flex items-center justify-between border-t border-[#0f3f36] px-4 pt-6 text-[13px] font-medium text-gray-500">
              <p>
                © 2025 <span className="font-bold text-[#00d2aa]">ArtChip</span>
                . All Right Reserved
              </p>
              <div className="flex gap-8">
                <Link
                  href="/terms-of-use"
                  className="transition-colors hover:text-white"
                >
                  Terms & Conditions
                </Link>
                <Link
                  href="/privacy-policy"
                  className="transition-colors hover:text-white"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
