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

  // Map footer link labels to modal section keys
  const linkToSectionMap = {
    'ABOUT US': 'about',
    'HELP': 'help',
    'REGULATION': 'rules',
    'BANK INFORMATION': 'bank',
    'CONTACT US': 'contact',
    'PRIVACY POLICY': 'privacy',
    'COOKIES CONSENT': 'cookies',
  };

  const handleLinkClick = (e, linkLabel) => {
    e.preventDefault();
    const section = linkToSectionMap[linkLabel];
    if (section) {
      dispatch(
        openModal({
          modal: 'footerInfo',
          props: { defaultSection: section },
        }),
      );
    }
  };

  return (
    <footer className="relative bg-[#0C0C0C] px-2 pt-6 sm:px-4 pb-0">
      <div className="container mx-auto">
        {/* Telegram Bet Section */}
        <div className="mb-6">
          <div
            className="relative overflow-hidden rounded-[10px]"
            style={{
              backgroundImage:
                'url(https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/banner-telegram.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Black overlay on top of bg image */}
            <div className="pointer-events-none absolute inset-0 bg-black/60" />

            {/* Content */}
            <div className="relative z-10 flex w-full flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between md:gap-6 md:px-10 md:py-6">
              <div className="flex min-w-0 items-start gap-4 md:items-center">
                {/* Telegram Icon */}
                <Image
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/banner-telegram-icon.png"
                  alt="Telegram"
                  width={64}
                  height={64}
                  className="h-10 w-10 flex-shrink-0 object-contain animate-[telegramFloat_4s_ease-in-out_infinite] md:h-14 md:w-14"
                  priority
                />

                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold uppercase tracking-wide text-white md:text-2xl">
                    {t('telegram_bet') || 'Telegram Bet'}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                    {['List', 'Login', 'Deposit', 'Withdraw', 'Bet'].map(
                      (item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center rounded-full border border-[#00ff66] [box-shadow:0_0_6px_rgba(0,255,102,0.85)]">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              aria-hidden="true"
                            >
                              <path
                                d="M10 3L4.5 8.5L2 6"
                                stroke="#00ff66"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                          <span className="whitespace-nowrap text-sm italic text-white">
                            {t(`telegram_bet_${item.toLowerCase()}`) || item}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>

              {/* Telegram Button */}
              <button
                className="group flex w-full flex-shrink-0 cursor-pointer items-center justify-center whitespace-nowrap rounded-full bg-[#0088cc] px-4 py-[10px] text-xs font-semibold text-white transition-all duration-200 md:w-auto md:text-sm lg:text-base"
                style={{
                  boxShadow:
                    '0 2px 6px rgba(0, 136, 204, 0.35), 0 0 10px rgba(0, 136, 204, 0.25)',
                }}
                onClick={() => {
                  if (isAuth) {
                    router.push('/dashboard/home');
                  } else {
                    dispatch(
                      openModal({
                        modal: 'login',
                        props: { redirectUrl: '/dashboard/home' },
                      }),
                    );
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
                href="https://thestaticfile.com/uploads/user17.apk"
                download
                className="flex-shrink-0 lg:w-1/2 cursor-pointer transition-opacity hover:opacity-90"
              >
                {/* Desktop Image */}
                <div className="hidden md:block">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-section-img-21.png"
                    alt="Mobile App Preview"
                    width={600}
                    height={800}
                    className="h-auto w-full object-contain"
                    priority
                  />
                </div>
                {/* Mobile Image */}
                <div className="block md:hidden">
                  <Image
                    src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/home-section-img-21.png"
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
                  <div className="grid grid-cols-3 gap-x-3 gap-y-4 md:grid-cols-4 md:gap-4">
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
                        className="flex h-[34px] min-w-[110px] items-center gap-2 overflow-hidden rounded-[6px] border-2 border-[#6c6c6c] bg-[#363636] pl-7 pr-4 text-[14px] font-bold text-white transition-all hover:opacity-80 md:text-base"
                      >
                        <div
                          className="h-[10px] w-[10px] flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor: '#00ff66',
                            boxShadow: '0 0 6px rgba(0, 255, 102, 0.85)',
                          }}
                        />
                        <span className="truncate">{bank}</span>
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
                  <div className="grid grid-cols-3 gap-x-3 gap-y-4 md:grid-cols-4 md:gap-4">
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
                        className="flex h-[34px] min-w-[110px] items-center gap-2 overflow-hidden rounded-[6px] border-2 border-[#6c6c6c] bg-[#363636] pl-7 pr-4 text-[14px] font-bold text-white transition-all hover:opacity-80 md:text-base"
                      >
                        <div
                          className="h-[10px] w-[10px] flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor: '#00ff66',
                            boxShadow: '0 0 6px rgba(0, 255, 102, 0.85)',
                          }}
                        />
                        <span className="truncate">{wallet}</span>
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
            {[
              'ABOUT US',
              'HELP',
              'REGULATION',
              'BANK INFORMATION',
              'CONTACT US',
              'PRIVACY POLICY',
              'COOKIES CONSENT',
            ].map((item, index, array) => (
              <React.Fragment key={item}>
                <button
                  onClick={(e) => handleLinkClick(e, item)}
                  className="px-3 text-sm font-normal uppercase leading-normal text-white transition-colors hover:text-white md:px-4 md:text-base"
                >
                  {item}
                </button>
                {index < array.length - 1 && (
                  <div
                    className="h-3 w-px bg-white md:h-5"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Game Providers Section */}
        <div
          className="relative border-t-2 px-4 pt-8 pb-6 md:px-6 md:pt-10 md:pb-8"
          style={{ borderColor: '#bdbdbd' }}
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
                const description = t('official_game_info_center_description') ||
                  'MPONUSA188 is an official online gaming information center, consistently providing the latest updates on today\'s easiest-to-win slot sites. Only on this site can you easily find the latest leaks about the viral online slot game sites, proven to deliver fantastic jackpot wins!';
                const parts = description.split('MPONUSA188');
                if (parts.length === 2) {
                  return (
                    <>
                      {parts[0]}
                      <span className="underline">MPONUSA188</span>
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
        >
          {/* Copyright Text */}
          <div className="text-center">
            <p className="text-sm text-white">
              © {new Date().getFullYear()}{' '}
              <span style={{ color: '#ec4d49', fontWeight: 'bold' }}>
                MPONUSA188
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
