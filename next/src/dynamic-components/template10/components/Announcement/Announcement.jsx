'use client';
import React from 'react';

import { useMarquee } from '@/hooks/useMarquee';
import { useTranslations } from '@/hooks/useTranslations';

function Announcement() {
  const { t, currentLocale } = useTranslations();

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

  return (
    <section className="pt-6 md:pt-10">
      <div
        className="z-[1] flex items-center rounded-[5px] border px-3 md:px-6"
        style={{
          border: '1px solid #E33A24',
          background:
            'linear-gradient(0deg, rgba(23, 47, 49, 0.80) 0%, rgba(23, 47, 49, 0.80) 100%)',
        }}
      >
        {/* Title */}
        <div className="flex items-center pr-3 md:pr-6">
          <h3
            className="font-bring-race py-3 text-[10px] tracking-wide uppercase md:py-4 md:text-[16px]"
            style={{
              color: '#FFFFFF',
            }}
          >
            <span className="font-spy-agency">{t('announcement')}</span>
          </h3>
        </div>

        {/* Separator */}
        <div
          className="w-px self-stretch"
          style={{
            backgroundColor: '#E33A24',
          }}
        />

        {/* Announcement Text */}
        <div className="flex flex-1 items-center gap-2 pl-3 md:pl-4">
          {/* Desktop Marquee */}
          <div
            className="relative hidden flex-1 overflow-hidden text-sm text-white transition-colors md:block"
            ref={desktopMarquee.containerRef}
            onMouseEnter={desktopMarquee.handleMouseEnter}
            onMouseLeave={desktopMarquee.handleMouseLeave}
          >
            <div style={marqueeContainerStyle}>
              <div
                ref={desktopMarquee.contentRef}
                style={{
                  ...marqueeContentStyle,
                  color: '#FFFFFF',
                }}
              >
                {announcementText}
              </div>
              {desktopMarquee.needsDuplication && (
                <div
                  style={{
                    ...marqueeContentStyle,
                    color: '#FFFFFF',
                  }}
                  aria-hidden="true"
                >
                  {announcementText}
                </div>
              )}
            </div>
          </div>
          {/* Mobile Marquee */}
          <div
            className="relative flex flex-1 overflow-hidden text-xs text-white transition-colors md:hidden"
            ref={mobileMarquee.containerRef}
            onMouseEnter={mobileMarquee.handleMouseEnter}
            onMouseLeave={mobileMarquee.handleMouseLeave}
          >
            <div style={marqueeContainerStyle}>
              <div
                ref={mobileMarquee.contentRef}
                style={{
                  ...marqueeContentMobileStyle,
                  color: '#FFFFFF',
                }}
              >
                {announcementText}
              </div>
              {mobileMarquee.needsDuplication && (
                <div
                  style={{
                    ...marqueeContentMobileStyle,
                    color: '#FFFFFF',
                  }}
                  aria-hidden="true"
                >
                  {announcementText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Announcement;
