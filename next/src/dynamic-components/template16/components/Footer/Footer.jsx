'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { useTemplate } from '@/hooks/useTemplate.js';
import { useTranslations } from '@/hooks/useTranslations';

function Footer() {
  const { t } = useTranslations();

  return (
    <footer className="relative bg-[#0C0C0C] px-2 pt-10 sm:px-4">
      <div className="container mx-auto">
        {/* Payment Methods - Two sections with gradient borders */}
        <div className="mb-10 space-y-6">
          {/* PAY WITH CRYPTO Section - Commented Out */}
          {/*
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
          */}
        </div>

        {/* Game Providers Section */}
        <div
          className="relative mb-10 rounded-[10px] border px-4 pt-8 pb-6 md:px-6 md:pt-10 md:pb-8"
          style={{ borderColor: '#463F1C', backgroundColor: '#1a1a1a' }}
        >
          {/* Title Section */}
          <div className="mb-6 text-center">
            <h2 className="mb-3 text-lg font-bold text-white underline decoration-[#E8D25E] underline-offset-4 md:text-2xl lg:text-3xl">
              {t('slot_depo_10k_title') ||
                'Situs Slot Depo 10K Link Slot Via Qris 10 Ribu Super Scatter'}
            </h2>
            <p className="mx-auto max-w-xl text-center text-xs leading-relaxed text-white md:text-sm">
              {t('slot_depo_10k_description') ||
                'MPONUSA188 adalah situs link slot depo 10k via qris super cepat bermain slot minimal deposit 10rb paling gacor melalui link alternatif terpercaya..'}
            </p>
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
        </div>

        {/* Information Section - 2x2 Grid of Banners */}
        <div
          className="relative mb-10 rounded-[10px] border px-4 pt-8 pb-6 md:px-6 md:pt-10 md:pb-8"
          style={{ borderColor: '#463F1C' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-4">
            <h2
              className="text-center text-xl font-bold uppercase md:text-3xl lg:text-3xl"
              style={{
                background: '#E8D25E',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {t('information') || 'Information'}
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Registration Card - Top Left */}
            <Link
              href="/register"
              className="relative overflow-hidden rounded-[10px] border transition-opacity hover:opacity-90"
              style={{
                borderColor: '#463F1C',
              }}
            >
              <div className="relative">
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/register-banner-16.webp"
                  alt="Registration"
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-4 md:p-6">
                  <h3
                    className="mb-2 font-bold md:text-2xl"
                    style={{
                      color: '#E8D25E',
                      fontSize: '16px',
                    }}
                  >
                    {t('registration') || 'Registration'}
                  </h3>
                  <p
                    className="leading-relaxed text-white md:text-sm"
                    style={{ fontSize: '10px' }}
                  >
                    {t('join_crs99_experience') ||
                      'Join MPONUSA188 for a spectacular and exciting gaming experience. Enjoy lots of bonuses on our site.'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Slot Games Card - Top Right */}
            <Link
              href="/slot-providers?q=slots"
              className="relative overflow-hidden rounded-[10px] border transition-opacity hover:opacity-90"
              style={{
                borderColor: '#463F1C',
              }}
            >
              <div className="relative">
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-banner-16.webp"
                  alt="Slot Games"
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-4 md:p-6">
                  <h3
                    className="mb-2 font-bold md:text-2xl"
                    style={{
                      color: '#E8D25E',
                      fontSize: '16px',
                    }}
                  >
                    {t('slot_games') || 'Slot Games'}
                  </h3>
                  <p
                    className="leading-relaxed text-white md:text-sm"
                    style={{ fontSize: '10px' }}
                  >
                    {t('join_crs99_experience') ||
                      'Join MPONUSA188 for a spectacular and exciting gaming experience. Enjoy lots of bonuses on our site.'}
                  </p>
                </div>
              </div>
            </Link>

            {/* Sports Games Card - Bottom Left */}
            <div
              className="relative overflow-hidden rounded-[10px] border"
              style={{
                borderColor: '#463F1C',
              }}
            >
              <div className="relative">
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/sports-banner-16.webp"
                  alt="Sports Games"
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-4 md:p-6">
                  <h3
                    className="mb-2 font-bold md:text-2xl"
                    style={{
                      color: '#E8D25E',
                      fontSize: '16px',
                    }}
                  >
                    {t('sports_games') || 'Sports Games'}
                  </h3>
                  <p
                    className="leading-relaxed text-white md:text-sm"
                    style={{ fontSize: '10px' }}
                  >
                    {t('join_crs99_experience') ||
                      'Join MPONUSA188 for a spectacular and exciting gaming experience. Enjoy lots of bonuses on our site.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Casino Games Card - Bottom Right */}
            <Link
              href="/live-casino?q=live"
              className="relative overflow-hidden rounded-[10px] border transition-opacity hover:opacity-90"
              style={{
                borderColor: '#463F1C',
              }}
            >
              <div className="relative">
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/live-casino-banner-16.webp"
                  alt="Live Casino Games"
                  className="h-auto w-full object-cover"
                />
                <div className="absolute inset-0 flex flex-col justify-center p-4 md:p-6">
                  <h3
                    className="mb-2 font-bold md:text-2xl"
                    style={{
                      color: '#E8D25E',
                      fontSize: '16px',
                    }}
                  >
                    {t('live_casino_games') || 'Live Casino Games'}
                  </h3>
                  <p
                    className="leading-relaxed text-white md:text-sm"
                    style={{ fontSize: '10px' }}
                  >
                    {t('join_crs99_experience') ||
                      'Join MPONUSA188 for a spectacular and exciting gaming experience. Enjoy lots of bonuses on our site.'}
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Bottom Section - Copyright and Social Icons */}
        <div className="relative flex max-w-full flex-col items-center justify-center pt-8 pb-10 md:pb-8">
          {/* Copyright Text */}
          <div className="text-center">
            <p className="text-sm text-white">
              © 2025{' '}
              <span style={{ color: '#E8D25E', fontWeight: 'bold' }}>
                ArtChip
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
