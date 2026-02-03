'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

// Local banks: 4 rows visible per slide; additional banks on next slide(s)
const LOCAL_BANKS = [
  'BCA',
  'Mandiri',
  'BNI',
  'BRI',
  'CIMB',
  'Danamon',
  'Permata',
  'BJB',
  'PANIN',
  'OCBC',
  'DKI',
  'SUMUT',
  'BSI',
  'NEO',
  'JAGO',
  'SeaBank',
  'DBS',
  'NOBU',
  'Maybank',
  'Mestika',
  'Sinarmas',
];
const BANKS_PER_SLIDE = 16; // 4 rows x 4 columns

import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';
import { openModal } from '@/slices/common/commonSlice';

const BASE_LOGO_URL = 'https://d3emlo5tm9es2f.cloudfront.net/next';

// All providers from categories hover (casino, slots, sports, arcade, table) – same logos, white filter
const FOOTER_PROVIDERS = [
  { key: 'evolution', name: 'Evolution', logo: `${BASE_LOGO_URL}/logos/Evolution-16.png` },
  { key: 'TOMHORN_7Mojos', name: '7 Mojos', logo: `${BASE_LOGO_URL}/logos/7mojos-16.png` },
  { key: 'TOMHORN_AbsoluteLive', name: 'Absolute Live', logo: `${BASE_LOGO_URL}/logos/Absolute-16.png` },
  { key: 'TOMHORN_VIVO', name: 'Vivo', logo: `${BASE_LOGO_URL}/logos/vivo-16.png` },
  { key: 'dream_gaming', name: 'Dream Gaming', logo: `${BASE_LOGO_URL}/logos/Dreamgaming-16.png` },
  { key: 'sa_game', name: 'Sa Game', logo: `${BASE_LOGO_URL}/logos/sagaming-16.png` },
  { key: 'agin', name: 'Agin', logo: `${BASE_LOGO_URL}/logos/AsiaGaming-16.png` },
  { key: 'sexy_ae', name: 'SEXYBCRT', logo: `${BASE_LOGO_URL}/logos/SexyGaming-16.png` },
  { key: 'MICRO_Slot', name: 'Microgaming', logo: `${BASE_LOGO_URL}/logos/microgaming.png` },
  { key: 'booongo', name: 'Booongo', logo: `${BASE_LOGO_URL}/logos/bongo.png` },
  { key: 'PLAYNGO', name: 'Play n Go', logo: `${BASE_LOGO_URL}/logos/playgo-white.png` },
  { key: 'habanero', name: 'Habanero', logo: `${BASE_LOGO_URL}/logos/habanero_white 3.png` },
  { key: 'TOMHORN_SLOT', name: 'Tom Horn Gaming', logo: `${BASE_LOGO_URL}/logos/tomhorn.png` },
  { key: 'cq9', name: 'CQ9', logo: `${BASE_LOGO_URL}/logos/cq9.png` },
  { key: 'PGSoft', name: 'Pocket Soft Gaming', logo: `${BASE_LOGO_URL}/logos/Pocketsoft Games.png` },
  { key: 'redtiger', name: 'Red Tiger', logo: `${BASE_LOGO_URL}/logos/Red Tiger.png` },
  { key: 'netent', name: 'NetEnt', logo: `${BASE_LOGO_URL}/logos/netent.png` },
  { key: 'evoplay', name: 'Evoplay', logo: `${BASE_LOGO_URL}/logos/evoplay.png` },
  { key: 'nlc', name: 'NLC', logo: `${BASE_LOGO_URL}/logos/nlc.png` },
  { key: 'btg', name: 'Big Time Gaming', logo: `${BASE_LOGO_URL}/logos/BTG_Logo.png` },
  { key: 'sports-1', name: 'SBO Sportsbook', logo: `${BASE_LOGO_URL}/logos/SBOBET.png` },
  { key: 'sports-2', name: 'SBO Sportsbook Wap', logo: `${BASE_LOGO_URL}/logos/SBOBET-wap.png` },
  { key: 'sports-3', name: 'Saba Sports', logo: `${BASE_LOGO_URL}/logos/SABA-SPORTS.png` },
  { key: 'sports-4', name: 'AFB Sports', logo: `${BASE_LOGO_URL}/logos/AFB.png` },
  { key: 'sports-5', name: 'BTI Sports', logo: `${BASE_LOGO_URL}/logos/BTI-SPORTS.png` },
  { key: 'sports-6', name: 'Panda Sports', logo: `${BASE_LOGO_URL}/logos/PANDA-SPORTS.png` },
  { key: 'sports-7', name: 'Lucky Sports', logo: `${BASE_LOGO_URL}/logos/lucky-white.png` },
  { key: 'sports-8', name: 'AP Gaming', logo: `${BASE_LOGO_URL}/logos/ap-gaming.png` },
  { key: 'virtual-sports-1', name: 'SBO Virtual Sports', logo: `${BASE_LOGO_URL}/logos/SBOBET-vs.png` },
  { key: 'jdb_arcade', name: 'JDP Gaming', logo: `${BASE_LOGO_URL}/logos/JDP-white.png` },
  { key: 'hacksaw_arcade', name: 'Hacksaw', logo: `${BASE_LOGO_URL}/logos/Hacksaw.png` },
  { key: 'oriental', name: 'Oriental Game', logo: `${BASE_LOGO_URL}/logos/Oriental.png` },
  { key: 'fc_arcade', name: 'FC Arcade', logo: `${BASE_LOGO_URL}/logos/fc arcade-white.png` },
  { key: 'MICRO_Casino_Table', name: 'Microgaming', logo: `${BASE_LOGO_URL}/logos/microgaming.png` },
  { key: 'crypto_poker', name: 'Crypto in poker', logo: `${BASE_LOGO_URL}/logos/crypto-poker-white.png` },
];

function Footer() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state) => state.auth);
  const { isAuth } = auth;
  const [localBankSlide, setLocalBankSlide] = useState(0);
  const localBankSlidesTotal = Math.ceil(LOCAL_BANKS.length / BANKS_PER_SLIDE);

  // Auto-advance Local Bank slider every 4 seconds
  useEffect(() => {
    if (localBankSlidesTotal <= 1) return;
    const interval = setInterval(() => {
      setLocalBankSlide((prev) => (prev + 1) % localBankSlidesTotal);
    }, 4000);
    return () => clearInterval(interval);
  }, [localBankSlidesTotal]);

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
        {/* Telegram Bet Section - hidden */}
        <div className="mb-6 hidden">
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
                  width={48}
                  height={48}
                  className="h-8 w-8 flex-shrink-0 object-contain animate-[telegramFloat_4s_ease-in-out_infinite] md:h-10 md:w-10"
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
                {/* Local Bank Section - 4 rows per slide, smooth auto-slider */}
                <div>
                  <h3 className="mb-4 text-left text-[16px] font-bold text-white">
                    {t('local_bank') && t('local_bank') !== 'local_bank'
                      ? t('local_bank')
                      : 'Local Bank'}
                  </h3>
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-in-out"
                      style={{
                        width: `${localBankSlidesTotal * 100}%`,
                        transform: `translateX(${(-localBankSlide * 100) / localBankSlidesTotal}%)`,
                      }}
                    >
                      {Array.from({ length: localBankSlidesTotal }, (_, slideIndex) => (
                        <div
                          key={slideIndex}
                          className="grid min-w-0 grid-cols-4 content-start gap-x-2 gap-y-4 flex-shrink-0 md:gap-x-3 md:gap-y-4"
                          style={{ width: `${100 / localBankSlidesTotal}%` }}
                        >
                          {LOCAL_BANKS.slice(
                            slideIndex * BANKS_PER_SLIDE,
                            slideIndex * BANKS_PER_SLIDE + BANKS_PER_SLIDE,
                          ).map((bank) => (
                            <button
                              key={bank}
                              className="flex h-[34px] min-w-0 items-center justify-start gap-4 overflow-hidden rounded-[6px] border-2 border-[#6c6c6c] bg-[#363636] pl-3 pr-3 text-[12px] font-bold leading-tight text-left text-white transition-all hover:opacity-80"
                            >
                              <div
                                className="h-[10px] w-[10px] flex-shrink-0 rounded-full"
                                style={{
                                  backgroundColor: '#00ff66',
                                  boxShadow: '0 0 6px rgba(0, 255, 102, 0.85)',
                                }}
                              />
                              <span className="min-w-0 truncate text-left" title={bank}>{bank}</span>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                  {localBankSlidesTotal > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                      {Array.from({ length: localBankSlidesTotal }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Slide ${i + 1}`}
                          onClick={() => setLocalBankSlide(i)}
                          className="h-1 min-w-[20px] rounded-none transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                          style={{
                            backgroundColor: i === localBankSlide ? '#fff' : '#6c6c6c',
                            width: i === localBankSlide ? 24 : 12,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* E Money & Pulsa Section - same properties as Local Bank badges */}
                <div>
                  <h3 className="mb-4 text-left text-[16px] font-bold text-white">
                    {t('e_money_pulsa') && t('e_money_pulsa') !== 'e_money_pulsa'
                      ? t('e_money_pulsa')
                      : 'E Money & Pulsa'}
                  </h3>
                  <div className="grid min-w-0 grid-cols-4 gap-x-2 gap-y-4 md:gap-x-3 md:gap-y-4">
                    {[
                      'Jenius',
                      'DANA',
                      'OVO',
                      'ShopeePay',
                      'GOPAY',
                      'LinkAja',
                      'Sakuku',
                      'AstraPay',
                      'Lain-lain',
                      'Telkomsel',
                      'Axiata',
                    ].map((wallet) => (
                      <button
                        key={wallet}
                        className="flex h-[34px] min-w-0 items-center justify-start gap-4 overflow-hidden rounded-[6px] border-2 border-[#6c6c6c] bg-[#363636] pl-3 pr-3 text-[12px] font-bold leading-tight text-left text-white transition-all hover:opacity-80"
                      >
                        <div
                          className="h-[10px] w-[10px] flex-shrink-0 rounded-full"
                          style={{
                            backgroundColor: '#00ff66',
                            boxShadow: '0 0 6px rgba(0, 255, 102, 0.85)',
                          }}
                        />
                        <span className="min-w-0 truncate text-left" title={wallet}>{wallet}</span>
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

        {/* Footer Navigation Links – full-width border, links in container */}
      </div>
      <div className="w-full border-b-2" style={{ borderColor: '#bdbdbd' }}>
        <div className="container mx-auto">
          <div className="flex items-center justify-center py-2">
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
                    className="px-3 text-[13px] font-normal uppercase leading-normal text-white transition-colors hover:text-[rgb(160,133,64)] md:px-4"
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
        </div>
      </div>
      <div className="px-4 md:px-20">
        {/* Game Providers Section */}
        <div
          className="relative pt-3 pb-6 md:px-6 md:pb-8"
        >
          {/* Logo Container */}
          <div className="mb-8 flex flex-wrap items-center justify-center gap-4 md:mb-10 md:gap-6 lg:gap-8">
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/RTP game.png"
              alt="RTP Game"
              width={120}
              height={60}
              className="h-auto w-auto max-w-[100px] object-contain opacity-90 transition-opacity hover:opacity-100 md:max-w-[120px]"
            />
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Pelayanan.png"
              alt="Pelayanan"
              width={120}
              height={60}
              className="h-auto w-auto max-w-[100px] object-contain opacity-90 transition-opacity hover:opacity-100 md:max-w-[120px]"
            />
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Lisensi.png"
              alt="Lisensi"
              width={120}
              height={60}
              className="h-auto w-auto max-w-[100px] object-contain opacity-90 transition-opacity hover:opacity-100 md:max-w-[120px]"
            />
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/logos/Kerahasiaan.png"
              alt="Kerahasiaan"
              width={120}
              height={60}
              className="h-auto w-auto max-w-[100px] object-contain opacity-90 transition-opacity hover:opacity-100 md:max-w-[120px]"
            />
          </div>

          {/* Provider Logos – same as categories hover, all white */}
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-3 md:gap-x-4 md:gap-y-4 lg:gap-x-6 lg:gap-y-10">
            {FOOTER_PROVIDERS.map((provider) => {
              const invertFilter =
                provider.key !== 'sports-7' && provider.key !== 'PLAYNGO' && provider.key !== 'fc_arcade'
                  ? '[filter:brightness(0)_invert(1)]'
                  : '';
              return (
                <div key={provider.key} className="flex items-center">
                  <Image
                    src={provider.logo}
                    alt={provider.name}
                    width={80}
                    height={32}
                    className={`h-auto max-h-[26px] w-auto max-w-[72px] object-contain opacity-40 transition-opacity hover:opacity-90 md:max-h-[30px] md:max-w-[80px] ${invertFilter}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Section - Copyright and Social Icons */}
        <div
          className="relative flex max-w-full flex-col items-center justify-center pb-4"
        >
          {/* Copyright Text */}
          <div className="text-center">
            <p className="text-sm text-white">
              © {new Date().getFullYear()}{' '}
              <span style={{ color: '#a08540', fontWeight: 'bold' }}>
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
