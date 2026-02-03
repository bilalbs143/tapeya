'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { LanguageSwitcher } from '@/dynamic-components/template17/components/LanguageSwitcher/LanguageSwitcher';
import { formatDateTimeWithSeconds } from '@/helpers/dateTime';
import { useMarquee } from '@/hooks/useMarquee';
import { useTranslations } from '@/hooks/useTranslations';

function SubNavbar({ variant = 'default' }) {
  const { t, currentLocale } = useTranslations();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // useEffect(() => {
  //   dispatch(fetchImportantAnnouncements());
  // }, [dispatch]);

  // Static announcements based on language
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

  const announcementText =
    staticAnnouncements[currentLocale] || staticAnnouncements.en;
  // const announcementText =
  //   importantAnnouncementsData?.content || t('welcome_to_artchip');

  // Use custom marquee hook for desktop
  const desktopMarquee = useMarquee({
    speed: 25, // pixels per second
    pauseOnHover: true,
    direction: 'left',
  });

  // Use custom marquee hook for mobile
  const mobileMarquee = useMarquee({
    speed: 20, // slightly slower for mobile
    pauseOnHover: true,
    direction: 'left',
  });

  // Inline styles for the marquee container
  const marqueeContainerStyle = {
    display: 'flex',
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  };

  const marqueeContentStyle = {
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    wordBreak: 'keep-all',
    overflowWrap: 'normal',
    paddingRight: '50px',
    flexShrink: 0,
    minWidth: 'max-content',
    transform: `translateX(${desktopMarquee.position}px)`,
    transition: desktopMarquee.isPaused ? 'none' : 'none', // No transition for smooth animation
  };

  const marqueeContentMobileStyle = {
    whiteSpace: 'nowrap',
    wordWrap: 'normal',
    wordBreak: 'keep-all',
    overflowWrap: 'normal',
    paddingRight: '50px',
    flexShrink: 0,
    minWidth: 'max-content',
    transform: `translateX(${mobileMarquee.position}px)`,
    transition: mobileMarquee.isPaused ? 'none' : 'none', // No transition for smooth animation
  };

  const isDashboardVariant = variant === 'dashboard';
  const timeContainerClasses = `flex h-[35px] items-center px-3 md:h-[30px]${
    isDashboardVariant ? '' : ' bg-[#000304]'
  }`;

  return (
    <nav
      className={`relative z-[1] ${
        isDashboardVariant ? 'border border-[#2A2A2A] bg-[#161616]' : 'bg-[#000304]'
      }`}
      style={isDashboardVariant ? { borderRadius: 0 } : undefined}
    >
      {!isDashboardVariant && (
        <>
          {/* 1px gradient top border */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#E8D25E]" />
          {/* 1px gradient bottom border */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#E8D25E]" />
        </>
      )}
      <div className="container mx-auto px-4 py-2">
        {/* Desktop Layout */}
        <div className="hidden items-center md:grid md:grid-cols-[1fr_auto] md:gap-4">
          {/* Left: Announcement pill (full width) */}
          <div className="flex justify-start min-w-0">
            <div className="flex w-full items-center gap-3 overflow-hidden rounded-full py-2 pr-4 text-[#E8D25E] transition-colors">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/announce-icon-3.svg"
                alt={t('announcement')}
                width={16}
                height={16}
              />
              <span className="h-4 w-px flex-shrink-0 bg-[#E8D25E]" />
              <div
                className="relative flex-1 overflow-hidden"
                ref={desktopMarquee.containerRef}
                onMouseEnter={desktopMarquee.handleMouseEnter}
                onMouseLeave={desktopMarquee.handleMouseLeave}
              >
                <div style={marqueeContainerStyle}>
                  <div
                    ref={desktopMarquee.contentRef}
                    style={marqueeContentStyle}
                  >
                    {announcementText}
                  </div>
                  {desktopMarquee.needsDuplication && (
                    <div style={marqueeContentStyle} aria-hidden="true">
                      {announcementText}
                    </div>
                  )}
                </div>
              </div>
              <span className="h-4 w-px flex-shrink-0 bg-[#E8D25E]" />
            </div>
          </div>

          {/* Right: Time and Language pill */}
          <div className="flex items-center justify-end gap-2">
            <div className={timeContainerClasses}>
              {(() => {
                const dateTime = formatDateTimeWithSeconds(now);
                const parts = dateTime.split(' ');
                const datePart = parts[0] || '';
                const timePart = parts[1] || '';
                return (
                  <span className="bg-[#E8D25E] bg-clip-text text-[12px] font-medium whitespace-nowrap text-transparent sm:text-[13px] md:text-[14px]">
                    {datePart} {timePart}
                  </span>
                );
              })()}
            </div>
            {/* Language switcher with transparent bg and solid #D3AF37 border */}
            {/* <div className="flex h-[40px] items-center rounded-[10px] border border-[#E8D25E] bg-transparent px-1 text-white hover:shadow-[inset_0_0_6px_1px_#D3AF37]">
              <LanguageSwitcher variant="dropdown" appearance="outline" />
            </div> */}
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex items-center justify-between md:hidden">
          {/* Mobile: Announcement pill (match desktop UI) */}
          <Link
            href="#"
            className="relative z-10 inline-flex flex-1 items-center gap-3 overflow-hidden rounded-full py-2 pr-2 text-[12px] text-[#E8D25E] transition-colors hover:text-white"
          >
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/announce-icon-3.svg"
              alt={t('announcement')}
              width={16}
              height={16}
            />
            <span className="h-4 w-px flex-shrink-0 bg-[#E8D25E]" />
            <div
              className="relative flex-1 overflow-hidden"
              ref={mobileMarquee.containerRef}
              onMouseEnter={mobileMarquee.handleMouseEnter}
              onMouseLeave={mobileMarquee.handleMouseLeave}
            >
              <div style={marqueeContainerStyle}>
                <div
                  ref={mobileMarquee.contentRef}
                  style={marqueeContentMobileStyle}
                >
                  {announcementText}
                </div>
                {mobileMarquee.needsDuplication && (
                  <div style={marqueeContentMobileStyle} aria-hidden="true">
                    {announcementText}
                  </div>
                )}
              </div>
            </div>
            <span className="h-4 w-px flex-shrink-0 bg-[#E8D25E]" />
          </Link>

          {/* Mobile: Time display (same as desktop) */}
          <div className="flex items-center justify-end gap-2">
            <div className={timeContainerClasses}>
              {(() => {
                const dateTime = formatDateTimeWithSeconds(now);
                const parts = dateTime.split(' ');
                const datePart = parts[0] || '';
                const timePart = parts[1] || '';
                return (
                  <span className="bg-[#E8D25E] bg-clip-text text-[12px] font-medium whitespace-nowrap text-transparent sm:text-[13px] md:text-[14px]">
                    {datePart} {timePart}
                  </span>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default SubNavbar;
