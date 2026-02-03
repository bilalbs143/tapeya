'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';

function Footer() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state) => state.auth);
  const { isAuth } = auth;

  // Footer links: section key and translation key for label
  const footerLinks = [
    { sectionKey: 'about', labelKey: 'footer_link_about_us' },
    { sectionKey: 'help', labelKey: 'footer_link_help' },
    { sectionKey: 'rules', labelKey: 'footer_link_terms' },
    { sectionKey: 'bank', labelKey: 'footer_link_bank_info' },
    { sectionKey: 'contact', labelKey: 'footer_link_contact_us' },
    { sectionKey: 'privacy', labelKey: 'footer_link_privacy_policy' },
    { sectionKey: 'cookies', labelKey: 'footer_link_cookie_consent' },
  ];

  const handleLinkClick = (e, sectionKey) => {
    e.preventDefault();
    dispatch(
      openModal({
        modal: 'footerInfo',
        props: { defaultSection: sectionKey },
      }),
    );
  };

  return (
    <footer className="relative bg-[#0C0C0C] px-2 pt-6 sm:px-4 pb-0">
      <div className="container mx-auto">
        {/* Telegram Bet Section */}
        <div className="mb-6">
          <div
            className="relative flex flex-col items-center overflow-hidden rounded-[10px] md:flex-row md:items-center"
            style={{
              backgroundColor: '#111111',
              border: '1px solid #E8D25E4D',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Yellow Accent Block - Hidden on mobile, visible on desktop */}
            <div
              className="hidden md:absolute md:left-0 md:top-0 md:block md:h-full md:rounded-l-[10px] md:px-4 md:py-4 lg:px-6 lg:py-5"
              style={{ backgroundColor: '#E8D25E', width: '5%' }}
            />

            {/* Telegram Icon - Positioned over the edge of yellow box */}
            <div>
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/telegram-icon-17.png"
                alt="Telegram"
                width={40}
                height={40}
                className="absolute left-[27%] top-[20%] md:left-[3%] md:top-1/2 z-20 w-7 h-7 md:h-12 md:w-12 -translate-y-1/2 transform object-contain"
                priority
              />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex w-full flex-col items-center justify-between gap-4 px-4 py-4 md:ml-[5%] md:flex-row md:gap-6 md:px-6 md:py-5">
              {/* Mobile: Stack vertically, Desktop: Horizontal */}
              <div className="flex w-full flex-col items-center gap-4 md:flex-row md:flex-1 md:justify-center md:gap-4 lg:gap-6">
                {/* Telegram Bet Text */}
                <h3 className="whitespace-nowrap text-base font-bold text-white md:text-lg lg:text-xl">
                  {t('telegram_bet') || 'Telegram Bet'}
                </h3>

                {/* Feature List */}
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 lg:gap-8">
                  {['List', 'Login', 'Deposit', 'Withdraw', 'Bet'].map(
                    (item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 md:gap-2"
                      >
                        {/* Checkmark Icon */}
                        <div
                          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full md:h-6 md:w-6"
                          style={{ backgroundColor: '#E8D25E' }}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 12 12"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="md:w-3 md:h-3"
                          >
                            <path
                              d="M10 3L4.5 8.5L2 6"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                        <span className="whitespace-nowrap text-xs font-medium text-white md:text-sm lg:text-base">
                          {t(`telegram_bet_${item.toLowerCase()}`) || item}
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Right Section: Play Now Button */}
              <button
                className="group flex w-full flex-shrink-0 cursor-pointer items-center justify-center gap-3 whitespace-nowrap rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-xs font-semibold text-black transition-all duration-200 hover:pb-2 md:w-auto md:px-4 md:text-sm lg:px-6 lg:text-base [box-shadow:inset_0_-6px_0_#876800] hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800]"
                onClick={() => {
                  if (isAuth) {
                    // If authenticated, navigate to dashboard home
                    router.push('/dashboard/home');
                  } else {
                    // If not authenticated, open login modal with redirect to dashboard home
                    dispatch(openModal({ modal: 'login', props: { redirectUrl: '/dashboard/home' } }));
                  }
                }}
              >
                <span>{t('play_now') || 'Play Now'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile App Section with Payment Methods */}
        <div className="mb-6">
          <div
            className="relative overflow-hidden rounded-[10px] px-4 py-6 md:px-0 md:py-8"
          >
            <div className="flex flex-col gap-6 lg:flex-row items-center lg:gap-8">
              {/* Left Side - Mobile Mockup (Clickable to Download APK) */}
              <a
                href="https://thestaticfile.com/uploads/user14.apk"
                download
                className="flex-shrink-0 lg:w-1/2 cursor-pointer transition-opacity hover:opacity-90"
              >
                {/* Desktop Image */}
                <div className="hidden md:block">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-section-img-17-up-3.png"
                    alt="Mobile App Preview"
                    width={600}
                    height={800}
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
                {/* Mobile Image (same as desktop) */}
                <div className="block md:hidden">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-section-img-17-up-3.png"
                    alt="Mobile App Preview"
                    width={400}
                    height={600}
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
              </a>

              {/* Right Side - Payment Methods */}
              <div className="flex-1 space-y-6">
                {/* Local Bank Section */}
                <div>
                  <h3 className="mb-4 text-left text-lg font-bold text-white md:text-xl">
                    {t('local_bank') && t('local_bank') !== 'local_bank'
                      ? t('local_bank')
                      : 'Local Bank'}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {[
                      'BNI',
                      'BRI',
                      'Mandiri',
                      'BCA',
                      'CIMB Niaga',
                      'Danamon',
                      'Permata',
                    ].map((bank) => (
                      <button
                        key={bank}
                        className="flex items-center gap-2 rounded-[8px] border px-3 py-2 transition-all hover:opacity-80 md:px-3 md:py-2"
                        style={{
                          backgroundColor: '#1a1a1a',
                          borderColor: '#E8D25E4D',
                        }}
                      >
                        <div
                          className="flex h-2 w-2 flex-shrink-0 items-center justify-center rounded-full md:h-3 md:w-3"
                          style={{ backgroundColor: '#E8D25E' }}
                        />
                        <span className="min-w-0 text-[12px] font-medium text-white truncate">
                          {bank}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* E-Money & Credit Section */}
                <div>
                  <h3 className="mb-4 text-left text-lg font-bold text-white md:text-xl">
                    {t('e_money_credit') && t('e_money_credit') !== 'e_money_credit'
                      ? t('e_money_credit')
                      : 'E-Money & Credit'}
                  </h3>
                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    {[
                      'GoPay',
                      'OVO',
                      'DANA',
                      'ShopeePay',
                      'LinkAja',
                      'DOKU',
                      'i.Saku',
                      'Telkomsel',
                      'Indosat Ooredoo (IM3/Tri)',
                      'XL Axiata',
                      'Axis',
                      'Smartfren',
                      'by.U',
                    ].map((wallet) => (
                      <button
                        key={wallet}
                        className="flex items-center gap-2 rounded-[8px] border px-3 py-2 transition-all hover:opacity-80 md:px-3 md:py-2"
                        style={{
                          backgroundColor: '#1a1a1a',
                          borderColor: '#E8D25E4D',
                        }}
                      >
                        <div
                          className="flex h-2 w-2 flex-shrink-0 items-center justify-center rounded-full md:h-3 md:w-3"
                          style={{ backgroundColor: '#E8D25E' }}
                        />
                        <span className="min-w-0 text-[12px] font-medium text-white truncate">
                          {wallet}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods - Two sections with gradient borders */}
        {/* PAY WITH CRYPTO Section - Commented Out */}
        {/*
        <div className="mb-10 space-y-6">
          <div
            className="rounded-[10px] p-[2px]"
            style={{
              background: '#E8D25E',
            }}
          >
            <div className="flex flex-col gap-6 rounded-[10px] bg-black p-6 md:flex-row md:items-center md:justify-between md:p-8">
              <div className="flex flex-col items-center gap-6 md:hidden">
                <h3
                  className="text-[30px] font-bold uppercase"
                  style={{
                    background: '#E8D25E',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {t('pay_with_crypto')}
                </h3>

                <div
                  className="grid grid-cols-4 gap-3"
                  style={{ width: '100%', placeItems: 'center' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                      style={{
                        border: '1.01px solid #FFF788',
                        background: 'rgba(211, 175, 55, 0.20)',
                      }}
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

                <div
                  className="flex w-full items-center justify-center rounded-[50px] px-4 py-3 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                  style={{
                    border: '1.01px solid #FFF788',
                    background: 'rgba(211, 175, 55, 0.20)',
                  }}
                >
                  {t('plus_300_more')}
                </div>
              </div>

              <div className="hidden md:flex md:w-full md:items-center md:justify-between">
                <div className="flex-shrink-0">
                  <h3
                    className="text-2xl font-bold uppercase md:text-3xl lg:text-[35px]"
                    style={{
                      background: '#E8D25E',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {t('pay_with_crypto')}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                    <div
                      key={n}
                      className="flex h-12 w-12 items-center justify-center rounded-full transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                      style={{
                        border: '1.01px solid #FFF788',
                        background: 'rgba(211, 175, 55, 0.20)',
                      }}
                    >
                      <Image
                        src={`https://d3emlo5tm9es2f.cloudfront.net/next/icons/pc-${n}.svg`}
                        alt={`crypto-${n}`}
                        width={28}
                        height={28}
                      />
                    </div>
                  ))}
                  <div
                    className="flex h-12 items-center justify-center rounded-full px-4 text-sm font-semibold text-white transition-all hover:shadow-[inset_0_0_6px_1px_#D3AF37] md:px-5 md:text-base"
                    style={{
                      border: '1.01px solid #FFF788',
                      background: 'rgba(211, 175, 55, 0.20)',
                    }}
                  >
                    {t('plus_300_more')}
                  </div>
                </div>

                <div className="flex-shrink-0 text-right text-white">
                  <p className="text-[10px]">{t('deposit_time_one_minute')}</p>
                  <p className="text-[10px]">
                    {t('withdrawal_time_three_minutes')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        */}

        {/* Footer Navigation Links */}
        <div className="flex items-center justify-center py-4">
          <div className="flex flex-wrap items-center justify-center">
            {footerLinks.map((link, index, array) => (
              <React.Fragment key={link.sectionKey}>
                <button
                  onClick={(e) => handleLinkClick(e, link.sectionKey)}
                  className="px-3 text-sm font-normal uppercase leading-normal text-[#7B7B7B] transition-colors hover:text-white md:px-4 md:text-base"
                >
                  {t(link.labelKey)}
                </button>
                {index < array.length - 1 && (
                  <div
                    className="h-3 w-px md:h-5"
                    style={{ 
                      backgroundColor: '#E8D25E4D',
                    }}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Game Providers Section */}
        <div
          className="relative border-t px-4 pt-8 pb-6 md:px-6 md:pt-10 md:pb-8"
          style={{ borderColor: '#463F1C', backgroundColor: '#111111' }}
        >
          {/* Logo Container */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4 md:mb-10 md:gap-6 lg:gap-8">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/RTP game.png"
              alt="RTP Game"
              width={180}
              height={90}
              className="h-auto w-auto max-w-[150px] object-contain opacity-90 transition-opacity hover:opacity-100 md:max-w-[180px]"
            />
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Pelayanan.png"
              alt="Pelayanan"
              width={180}
              height={90}
              className="h-auto w-auto max-w-[150px] object-contain opacity-90 transition-opacity hover:opacity-100 md:max-w-[180px]"
            />
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Lisensi.png"
              alt="Lisensi"
              width={180}
              height={90}
              className="h-auto w-auto max-w-[150px] object-contain opacity-90 transition-opacity hover:opacity-100 md:max-w-[180px]"
            />
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Kerahasiaan.png"
              alt="Kerahasiaan"
              width={180}
              height={90}
              className="h-auto w-auto max-w-[150px] object-contain opacity-90 transition-opacity hover:opacity-100 md:max-w-[180px]"
            />
          </div>

          {/* Provider Logos Rows */}
          {(() => {
            // All providers from slot-providers page (slot + arcade)
            const allProviders = [
              { logo: 'pragmatic-play.png', name: 'Pragmatic Play' },
              { logo: 'microgaming.png', name: 'Microgaming' },
              { logo: 'bongo.png', name: 'Booongo' },
              { logo: 'Play n Go.png', name: 'Play n Go' },
              { logo: 'habanero_white 3.png', name: 'Habanero' },
              { logo: 'tomhorn.png', name: 'Tom Horn Gaming' },
              { logo: 'cq9.png', name: 'CQ9' },
              { logo: 'Pocketsoft Games.png', name: 'Pocket Soft Gaming' },
              { logo: 'Red Tiger.png', name: 'Red Tiger' },
              { logo: 'netent.png', name: 'NetEnt' },
              { logo: 'evoplay.png', name: 'Evoplay' },
              { logo: 'nlc.png', name: 'NLC' },
              { logo: 'BTG_Logo.png', name: 'Big Time Gaming' },
              { logo: 'JDPGaming.png', name: 'JDP Gaming' },
              { logo: 'Hacksaw.png', name: 'Hacksaw' },
              { logo: 'Oriental.png', name: 'Oriental Game' },
              { logo: 'fc_arcade.png', name: 'FC Arcade' },
            ];

            return (
              <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 md:gap-x-4 md:gap-y-4 lg:gap-x-6 lg:gap-y-6">
                {allProviders.map((provider, index) => (
                  <div key={`provider-${index}`} className="flex items-center">
                    <Image
                      src={`https://d3emlo5tm9es2f.cloudfront.net/next/logos/${provider.logo}`}
                      alt={provider.name}
                      width={120}
                      height={40}
                      className="h-auto max-h-[35px] w-auto object-contain opacity-90 transition-opacity hover:opacity-100 md:max-h-[40px]"
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Title Section */}
          <div className="mt-6 text-center">
            <h2 className="mb-3 text-lg font-bold text-white underline decoration-white underline-offset-4 md:text-2xl lg:text-3xl">
              {t('official_game_info_center_title') ||
                'Official Online Game Information Center, Easy to Win Today'}
            </h2>
            <p className="mx-auto max-w-xl text-center text-xs leading-relaxed text-white md:text-sm">
              {(() => {
                const description =
                  t('official_game_info_center_description') ||
                  'ONECA188 is an official online gaming information center, consistently providing the latest updates on today\'s easiest-to-win slot sites. Only on this site can you easily find the latest leaks about the viral online slot game sites, proven to deliver fantastic jackpot wins!';
                const parts = description.split('ONECA188');
                if (parts.length === 2) {
                  return (
                    <>
                      {parts[0]}
                      <span className="underline">ONECA188</span>
                      {parts[1]}
                    </>
                  );
                }
                return description;
              })()}
            </p>
          </div>
        </div>

        {/* Bottom Section - Copyright and Social Icons */}
        <div
          className="relative flex max-w-full flex-col items-center justify-center pt-8 pb-4 mt-8"
          style={{ borderTop: '1px solid rgba(232, 210, 94, 0.30)' }}
        >
          {/* Copyright Text */}
          <div className="text-center">
            <p className="text-sm text-white">
              © {new Date().getFullYear()}{' '}
              <span style={{ color: '#E8D25E', fontWeight: 'bold' }}>
                ONECA188
              </span>
              . All Right Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
