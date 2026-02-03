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
          <div className="rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] p-[1px]">
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
                      className="flex h-12 w-12 items-center justify-center rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] transition-all hover:shadow-[inset_0_0_6px_1px_#2DFA1A]"
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
                <div className="flex w-full items-center justify-center rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#2DFA1A]">
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
                      className="flex h-12 w-12 items-center justify-center rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] transition-all hover:shadow-[inset_0_0_6px_1px_#2DFA1A]"
                    >
                      <Image
                        src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                        alt={`crypto-${n}`}
                        width={28}
                        height={28}
                      />
                    </div>
                  ))}
                  <div className="flex h-12 items-center justify-center rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] px-4 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#2DFA1A] md:px-5 md:text-base">
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
          <div className="rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] p-[1px]">
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
                      className="flex w-[100%] items-center gap-2 rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] px-4 py-2 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#2DFA1A]"
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
                      className="flex items-center gap-2 rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] px-4 py-2 text-white transition-all hover:shadow-[inset_0_0_6px_1px_#2DFA1A]"
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

        {/* ARTCHIP Text SVG - Outside Section, Attached to Top */}
        <div className="flex w-full items-center justify-center px-2 sm:px-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1457"
            height="103"
            viewBox="0 0 1457 103"
            fill="none"
            className="h-auto w-full max-w-[100%]"
          >
            <path
              d="M63.7371 0H72.3511C79.9431 0 84.3231 2.19 89.1411 11.096L137.467 98.842C138.489 100.886 138.051 102.2 135.715 102.2H117.173C115.275 102.2 114.399 101.762 113.815 100.448L104.179 82.636H34.2451L24.7551 100.448C24.0251 101.762 23.2951 102.2 21.3971 102.2H2.27111C-0.064889 102.2 -0.502889 100.886 0.519111 98.842L48.4071 11.096C53.0791 2.19 57.6051 0 63.7371 0ZM44.4651 63.656H93.8131L71.1831 21.754C70.7451 21.024 70.1611 20.732 69.4311 20.732H68.5551C67.8251 20.732 67.3871 21.024 66.9491 21.754L44.4651 63.656Z"
              fill="url(#paint0_linear_39_415)"
            />
            <path
              d="M260.926 0H339.182C360.936 0 370.572 9.78201 370.572 29.93V38.398C370.572 55.334 363.856 65.262 349.402 68.182L373.784 98.404C374.952 99.864 374.222 102.2 371.886 102.2H352.322C349.986 102.2 349.256 101.616 348.234 100.302L325.02 70.664H278.738V98.988C278.738 101.178 277.716 102.2 275.526 102.2H259.758C257.568 102.2 256.546 101.178 256.546 98.988V4.38C256.546 1.46 258.006 0 260.926 0ZM278.738 51.392H334.656C344.584 51.392 348.234 47.888 348.234 39.128V32.996C348.234 24.09 344.438 20.44 334.656 20.44H280.636C279.322 20.44 278.738 20.878 278.738 22.046V51.392Z"
              fill="url(#paint1_linear_39_415)"
            />
            <path
              d="M490.373 0H604.545C606.735 0 607.903 1.022 607.903 3.212V17.52C607.903 19.71 606.735 20.732 604.545 20.732H558.555V98.988C558.555 101.178 557.679 102.2 555.489 102.2H539.575C537.531 102.2 536.363 101.178 536.363 98.988V20.732H490.373C488.329 20.732 487.161 19.71 487.161 17.52V3.212C487.161 1.022 488.329 0 490.373 0Z"
              fill="url(#paint2_linear_39_415)"
            />
            <path
              d="M764.49 0H830.19C832.38 0 833.402 1.022 833.402 3.212V17.52C833.402 19.71 832.38 20.732 830.19 20.732H765.22C750.182 20.732 745.802 25.258 745.802 40.734V61.466C745.802 76.942 750.182 81.468 765.22 81.468H830.19C832.38 81.468 833.402 82.49 833.402 84.68V98.988C833.402 101.178 832.38 102.2 830.19 102.2H764.49C734.852 102.2 723.61 91.688 723.61 63.656V38.544C723.61 10.512 734.852 0 764.49 0Z"
              fill="url(#paint3_linear_39_415)"
            />
            <path
              d="M1049.42 0H1065.19C1067.38 0 1068.54 1.022 1068.54 3.212V98.988C1068.54 101.178 1067.38 102.2 1065.19 102.2H1049.42C1047.37 102.2 1046.21 101.178 1046.21 98.988V60.59H977.878V98.988C977.878 101.178 976.857 102.2 974.667 102.2H958.898C956.708 102.2 955.686 101.178 955.686 98.988V3.212C955.686 1.022 956.708 0 958.898 0H974.667C976.857 0 977.878 1.022 977.878 3.212V40.734H1046.21V3.212C1046.21 1.022 1047.37 0 1049.42 0Z"
              fill="url(#paint4_linear_39_415)"
            />
            <path
              d="M1197.79 0H1213.56C1215.75 0 1216.77 1.022 1216.77 3.212V98.988C1216.77 101.178 1215.75 102.2 1213.56 102.2H1197.79C1195.6 102.2 1194.58 101.178 1194.58 98.988V3.212C1194.58 1.022 1195.6 0 1197.79 0Z"
              fill="url(#paint5_linear_39_415)"
            />
            <path
              d="M1347.31 0H1425.57C1447.91 0 1456.96 10.366 1456.96 29.93V40.88C1456.96 60.59 1447.91 71.394 1425.57 71.394H1365.13V98.988C1365.13 101.178 1364.1 102.2 1361.91 102.2H1346.15C1343.96 102.2 1342.93 101.178 1342.93 98.988V4.38C1342.93 1.46 1344.39 0 1347.31 0ZM1365.13 51.246H1421.04C1430.97 51.246 1434.62 47.304 1434.62 38.69V33.142C1434.62 24.382 1430.97 20.44 1421.04 20.44H1367.02C1365.71 20.44 1365.13 21.024 1365.13 22.192V51.246Z"
              fill="url(#paint6_linear_39_415)"
            />
            <defs>
              <linearGradient
                id="paint0_linear_39_415"
                x1="774.891"
                y1="-23.2998"
                x2="774.891"
                y2="102.2"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2DFA1A" stopOpacity="0" />
                <stop offset="0.7" stopColor="#0A1414" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_39_415"
                x1="774.891"
                y1="-23.2998"
                x2="774.891"
                y2="102.2"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2DFA1A" stopOpacity="0" />
                <stop offset="0.7" stopColor="#0A1414" />
              </linearGradient>
              <linearGradient
                id="paint2_linear_39_415"
                x1="774.891"
                y1="-23.2998"
                x2="774.891"
                y2="102.2"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2DFA1A" stopOpacity="0" />
                <stop offset="0.7" stopColor="#0A1414" />
              </linearGradient>
              <linearGradient
                id="paint3_linear_39_415"
                x1="774.891"
                y1="-23.2998"
                x2="774.891"
                y2="102.2"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2DFA1A" stopOpacity="0" />
                <stop offset="0.7" stopColor="#0A1414" />
              </linearGradient>
              <linearGradient
                id="paint4_linear_39_415"
                x1="774.891"
                y1="-23.2998"
                x2="774.891"
                y2="102.2"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2DFA1A" stopOpacity="0" />
                <stop offset="0.7" stopColor="#0A1414" />
              </linearGradient>
              <linearGradient
                id="paint5_linear_39_415"
                x1="774.891"
                y1="-23.2998"
                x2="774.891"
                y2="102.2"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2DFA1A" stopOpacity="0" />
                <stop offset="0.7" stopColor="#0A1414" />
              </linearGradient>
              <linearGradient
                id="paint6_linear_39_415"
                x1="774.891"
                y1="-23.2998"
                x2="774.891"
                y2="102.2"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2DFA1A" stopOpacity="0" />
                <stop offset="0.7" stopColor="#0A1414" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative overflow-hidden rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] p-6">
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
                <h3 className="mb-4 text-lg font-bold text-white">
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
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
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-sm text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* FAQ's */}
              <div>
                <h3 className="mb-4 text-lg font-bold text-white">
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="text-sm break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_banking')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* GET THE APP - Mobile */}
              <div className="md:hidden">
                <div className="flex justify-center">
                  <div className="flex h-[150px] w-full flex-row items-center justify-between border border-[rgb(45,250,26)]/30 bg-[#060D0D]">
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
                      <div className="rounded-[5px] border border-[rgb(45,250,26)]/30 p-1.5">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user08.png"
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
                <div className="h-full min-h-[200px] w-px bg-[rgb(45,250,26)]/30" />
              </div>

              {/* Second Column - Quick Links */}
              <div className="flex-1">
                <h3 className="mb-4 text-lg font-bold text-white">
                  {t('quick_links')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/about"
                      className="text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('about_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact-us"
                      className="text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('contact_us')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/disclaimer"
                      className="text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('disclaimer')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Vertical Separator */}
              <div className="flex justify-center px-4">
                <div className="h-full min-h-[200px] w-px bg-[rgb(45,250,26)]/30" />
              </div>

              {/* Third Column - Information */}
              <div className="flex-1">
                <h3 className="mb-4 text-lg font-bold text-white capitalize">
                  {t('information')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/cookie-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('cookie_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/responsible-gambling"
                      className="text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('responsible_gambling')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy-policy"
                      className="text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('privacy_policy')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/terms-of-use"
                      className="text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('terms_and_conditions')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Vertical Separator */}
              <div className="flex justify-center px-4">
                <div className="h-full min-h-[200px] w-px bg-[rgb(45,250,26)]/30" />
              </div>

              {/* Fourth Column - FAQ's */}
              <div className="flex-1">
                <h3 className="mb-4 text-lg font-bold text-white">
                  {t('faqs')}
                </h3>
                <ul className="space-y-2">
                  <li>
                    <Link
                      href="/faq?tab=general"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_general')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=deposit"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_deposit_withdrawal')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=gaming"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_gaming')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=technical"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_technical')}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/faq?tab=banking"
                      className="break-words text-[#B4BBC5] transition-colors hover:text-[#2DFA1A]"
                    >
                      {t('faq_banking')}
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Vertical Separator */}
              <div className="flex justify-center px-4">
                <div className="h-full min-h-[200px] w-px bg-[rgb(45,250,26)]/30" />
              </div>

              {/* Fifth Column - GET THE APP */}
              <div className="flex-1">
                <div className="flex justify-center">
                  <div className="flex h-[230px] flex-1 flex-col items-center justify-center border border-[rgb(45,250,26)]/30 bg-[#060D0D]">
                    <div className="flex h-full w-full flex-col items-center justify-center p-3">
                      {/* GET THE APP Text */}
                      <div className="mb-3 text-center">
                        <div className="font-bring-race text-sm leading-tight tracking-[0.05em] text-white uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] md:text-base">
                          {t('get')}
                        </div>
                        <div className="font-bring-race text-sm leading-tight tracking-[0.05em] text-white uppercase [text-shadow:0_2px_4px_rgba(0,0,0,0.5)] md:text-base">
                          {t('the_app')}
                        </div>
                      </div>
                      {/* QR Code */}
                      <div className="rounded-[5px] border border-[rgb(45,250,26)]/30 p-1.5">
                        <Image
                          src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/user08.png"
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
          <div className="relative flex max-w-full flex-col items-center justify-between rounded-[5px] border border-[rgb(45,250,26)]/30 bg-[#0A1414] px-6 py-4 md:flex-row">
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
                className="text-sm text-white uppercase transition-colors hover:text-[#2DFA1A]"
              >
                {t('privacy_policy')}
              </Link>
              <Link
                href="/terms-of-use"
                className="text-sm text-white uppercase transition-colors hover:text-[#2DFA1A]"
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
