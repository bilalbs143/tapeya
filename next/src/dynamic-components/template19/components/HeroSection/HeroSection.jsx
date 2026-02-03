'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useMarquee } from '@/hooks/useMarquee';
import { useTranslations } from '@/hooks/useTranslations';

function HeroSection() {
  const { t, currentLocale } = useTranslations();
  const router = useRouter();

  const backgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Hero+Banner.png';
  const mobileBackgroundUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Hero+Banner+mob.png';
  const girlUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hero-girl-banner-4.webp';
  const casinoGameUrl =
    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/hero-casino-game-3.webp';

  const staticAnnouncements = {
    en: 'Welcome to casino and slot gaming – Enjoy smooth gameplay, instant crypto deposits and withdrawals, and 24/7 support for an unmatched online casino experience.',
    id: 'Selamat datang di kasino dan permainan slot – Nikmati permainan yang lancar, deposit dan penarikan kripto instan, serta dukungan 24/7 untuk pengalaman kasino online yang tak tertandingi.',
    ko: '카지노와 슬롯 게임에 오신 것을 환영합니다 – 부드러운 게임 플레이, 즉시 암호화폐 입출금, 그리고 24시간 연중무휴 지원으로 비교할 수 없는 온라인 카지노 경험을 즐기세요.',
    jp: 'カジノとスロットゲームへようこそ – スムーズなゲームプレイ、即時の暗号通貨の入出金、24時間年中無休のサポートで、比類のないオンラインカジノ体験をお楽しみください。',
    my: 'Selamat datang ke permainan kasino dan slot – Nikmati permainan lancar, deposit dan pengeluaran kripto segera, serta sokongan 24/7 untuk pengalaman kasino dalam talian yang tiada tandingan.',
    th: 'ยินดีต้อนรับสู่คาสิโนและเกมสล็อต – เพลิดเพลินกับการเล่นเกมที่ลื่นไหล ฝากและถอนคริปโตแบบทันที และการสนับสนุนตลอด 24/7 เพื่อประสบการณ์คาสิโนออนไลน์ที่ไม่มีใครเทียบได้',
    tw: '歡迎來到賭場和老虎機遊戲 – 享受流暢的遊戲玩法、即時加密貨幣存款和提款，以及 24/7 全天候支援，獲得無與倫比的線上賭場體驗。',
    vn: 'Chào mừng đến với casino và trò chơi slot – Tận hưởng lối chơi mượt mà, gửi và rút tiền crypto tức thì, cùng hỗ trợ 24/7 cho trải nghiệm casino trực tuyến vô song.',
  };

  const announcementText = staticAnnouncements[currentLocale] || staticAnnouncements.en;

  const desktopMarquee = useMarquee({
    speed: 25,
    pauseOnHover: true,
    direction: 'left',
  });

  const mobileMarquee = useMarquee({
    speed: 25,
    pauseOnHover: true,
    direction: 'left',
  });

  return (
    <section className="relative mx-auto w-full" aria-label={t('hero_section')}>
      {/* Desktop Layout - Hidden on mobile */}
      <div className="relative hidden h-[885px] w-full overflow-hidden bg-[#0d1b1b] md:block">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={backgroundUrl}
            alt="Hero Background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Action Buttons Container - Positioned to match design intent (floating on banner) */}
        <div className="pointer-events-none absolute inset-0 mx-auto w-full max-w-[1530px] px-4 md:px-0">
          <div className="pointer-events-auto absolute bottom-[180px] left-[53px] z-20">
            <div className="flex gap-5">
              {/* Casino Button */}
              <div
                onClick={() => router.push('/live-casino')}
                className="group relative flex h-[123px] w-[270px] cursor-pointer overflow-hidden rounded-[10px] border border-[#06D6A04D] bg-[#14213D80] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.02] hover:border-[#00E5CC]"
              >
                {/* Left Content */}
                <div className="z-10 flex flex-1 flex-col justify-center pb-2 pl-6">
                  <span className="text-[24px] leading-none font-bold tracking-wide text-white">
                    Casino
                  </span>
                  <span className="mt-2 text-[13px] font-medium tracking-wide text-[#06D6A0]">
                    Play Now
                  </span>
                </div>

                {/* Right Background Shape */}
                <div className="absolute top-0 right-[-12px] bottom-0 z-0 w-[95px] origin-bottom-right skew-x-[-18deg] transform bg-[#06D6A0]" />

                {/* Icon */}
                <div className="absolute top-0 right-0 bottom-0 z-10 flex w-[100px] items-center justify-center pr-2">
                  <div className="relative h-[100px] w-[100px] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Casino-14.png"
                      alt="Casino"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Slots Button */}
              <div
                onClick={() => router.push('/slot-providers')}
                className="group relative flex h-[123px] w-[270px] cursor-pointer overflow-hidden rounded-[10px] border border-[#06D6A04D] bg-[#14213D80] shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.02] hover:border-[#00E5CC]"
              >
                {/* Left Content */}
                <div className="z-10 flex flex-1 flex-col justify-center pb-2 pl-6">
                  <span className="text-[24px] leading-none font-bold tracking-wide text-white">
                    Slots
                  </span>
                  <span className="mt-2 text-[13px] font-medium tracking-wide text-[#06D6A0]">
                    Play Now
                  </span>
                </div>

                {/* Right Background Shape */}
                <div className="absolute top-0 right-[-12px] bottom-0 z-0 w-[95px] origin-bottom-right skew-x-[-18deg] transform bg-[#06D6A0]" />

                {/* Icon */}
                <div className="absolute top-0 right-0 bottom-0 z-10 flex w-[100px] items-center justify-center pr-2">
                  <div className="relative h-[100px] w-[130px] drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)]">
                    <Image
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-14.png"
                      alt="Slots"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Announcement Bar */}
        <div className="absolute right-0 bottom-0 left-0 z-20 h-[80px] border-t border-b border-[#06D6A04D] bg-[#020b10]">
          <div className="mx-auto flex h-full w-full max-w-[1530px] items-center pl-[50px]">
            <div className="relative z-30 flex h-full items-center pr-6">
              {/* Teal Vertical Line Separator */}
              <div className="absolute top-1/2 right-0 h-[24px] w-[1px] -translate-y-1/2 bg-[#00E5CC]"></div>

              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/annoucment.png"
                alt="Announcement"
                width={24}
                height={24}
                className="mr-3 object-contain"
              />

              <span className="ml-1 text-[13px] font-bold tracking-[0.2em] text-white uppercase">
                Announcements
              </span>
            </div>

            <div
              className="relative flex h-full flex-1 items-center overflow-hidden px-4"
              ref={desktopMarquee.containerRef}
              onMouseEnter={desktopMarquee.handleMouseEnter}
              onMouseLeave={desktopMarquee.handleMouseLeave}
            >
              <div className="flex overflow-hidden">
                <div
                  ref={desktopMarquee.contentRef}
                  style={{
                    whiteSpace: 'nowrap',
                    paddingRight: '50px',
                    minWidth: 'max-content',
                    transform: `translateX(${desktopMarquee.position}px)`,
                    color: '#9ca3af',
                    fontSize: '13px',
                    fontWeight: 500,
                    letterSpacing: '0.025em',
                  }}
                >
                  {announcementText}
                </div>

                {desktopMarquee.needsDuplication && (
                  <div
                    aria-hidden
                    style={{
                      whiteSpace: 'nowrap',
                      paddingRight: '50px',
                      minWidth: 'max-content',
                      transform: `translateX(${desktopMarquee.position}px)`,
                      color: '#9ca3af',
                      fontSize: '13px',
                      fontWeight: 500,
                      letterSpacing: '0.025em',
                    }}
                  >
                    {announcementText}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="relative block h-auto w-full overflow-hidden bg-[#0d1b1b] md:hidden">
        <img
          src={mobileBackgroundUrl}
          alt="Hero Background Mobile"
          className="block h-auto w-full object-contain"
        // priority not needed for img tag
        />

        {/* Mobile Buttons */}
        <div className="absolute bottom-[46px] left-0 right-0 z-10 px-4 pb-4">
          <div className="flex gap-3">
            {/* Casino Button Mobile */}
            <div onClick={() => router.push('/live-casino')} className="group relative h-[65px] w-1/2 cursor-pointer overflow-hidden rounded-[8px] bg-[#14213D] border border-[#00E5CC]/50">
              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-center pl-4">
                <span className="text-[18px] font-bold text-white leading-none">Casino</span>
                <span className="text-[10px] text-[#00E5CC] mt-1">Play Now</span>
              </div>
              {/* Shape */}
              <div className="absolute top-0 right-[-8px] bottom-0 w-[40px] bg-[#00E5CC] skew-x-[-18deg]" />
              {/* Icon */}
              <div className="absolute right-2 top-0 bottom-0 w-[45px] flex items-center justify-center z-20">
                <div className="relative w-[55px] h-[55px] pr-2">
                  <Image src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Casino-14.png" alt="Casino" fill className="object-contain" />
                </div>
              </div>
            </div>

            {/* Slots Button Mobile */}
            <div onClick={() => router.push('/slot-providers')} className="group relative h-[65px] w-1/2 cursor-pointer overflow-hidden rounded-[8px] bg-[#14213D] border border-[#00E5CC]/50">
              {/* Content */}
              <div className="relative z-10 flex h-full flex-col justify-center pl-4">
                <span className="text-[18px] font-bold text-white leading-none">Slots</span>
                <span className="text-[10px] text-[#00E5CC] mt-1">Play Now</span>
              </div>
              {/* Shape */}
              <div className="absolute top-0 right-[-8px] bottom-0 w-[40px] bg-[#00E5CC] skew-x-[-18deg]" />
              {/* Icon */}
              <div className="absolute right-2 top-0 bottom-0 w-[45px] flex items-center justify-center z-20">
                <div className="relative w-[55px] h-[45px] pr-2">
                  <Image src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/slot-14.png" alt="Slots" fill className="object-contain" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Announcement Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-[46px] bg-[#020b10] border-t border-b border-[#06D6A04D] z-20 flex items-center">
          <div className="relative flex items-center pl-4 h-full z-30 bg-[#020b10]">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[20px] w-[1px] bg-[#00E5CC]"></div>
            <Image src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/annoucment.png" alt="Icon" width={18} height={18} className="mr-2 object-contain" />
            <span className="text-[11px] font-bold tracking-widest text-white uppercase pr-4">Announcements</span>
          </div>

          <div
            className="relative flex h-full flex-1 items-center overflow-hidden px-2"
            ref={mobileMarquee.containerRef}
          >
            <div className="flex overflow-hidden">
              <div
                ref={mobileMarquee.contentRef}
                style={{ whiteSpace: 'nowrap', paddingRight: '30px', minWidth: 'max-content', transform: `translateX(${mobileMarquee.position}px)`, color: '#9ca3af', fontSize: '11px', fontWeight: 500 }}
              >
                {announcementText}
              </div>
              {mobileMarquee.needsDuplication && (
                <div style={{ whiteSpace: 'nowrap', paddingRight: '30px', minWidth: 'max-content', transform: `translateX(${mobileMarquee.position}px)`, color: '#9ca3af', fontSize: '11px', fontWeight: 500 }}>{announcementText}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
