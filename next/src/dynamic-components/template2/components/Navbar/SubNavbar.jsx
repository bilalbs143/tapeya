'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

import { LanguageSwitcher } from '@/dynamic-components/template2/components/LanguageSwitcher/LanguageSwitcher';
import WalletDropdown from '@/dynamic-components/template2/components/WalletDropdown/WalletDropdown';
import { formatDateTimeWithSeconds } from '@/helpers/dateTime';
import { useMarquee } from '@/hooks/useMarquee';
import { useTranslations } from '@/hooks/useTranslations';
// import { fetchImportantAnnouncements } from '@/website/websiteAction';

function SubNavbar() {
  const { t, currentLocale } = useTranslations();
  // const dispatch = useDispatch();
  const isAuth = useSelector((state) => state.auth.isAuth);
  // const { importantAnnouncementsData } = useSelector((state) => state.website);
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

  return (
    <nav className="relative z-[1] border-b border-[#FFFFFF66] bg-[#000304]">
      <div className="container mx-auto px-4 py-2">
        {/* Desktop Layout */}
        <div className="hidden items-center md:grid md:[grid-template-columns:1fr_650px_1fr]">
          {/* Left spacer to allow true centering */}
          <div />

          {/* Center: Announcement pill */}
          <div className="flex justify-center">
            <div className="flex w-full items-center gap-3 overflow-hidden rounded-full px-4 py-2 text-white/90 transition-colors hover:text-white">
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/announce-icon-2.svg"
                alt={t('announcement')}
                width={16}
                height={16}
              />
              <span className="h-4 w-px flex-shrink-0 bg-[#FF0037]" />
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
              <span className="h-4 w-px flex-shrink-0 bg-[#FF0037]" />
            </div>
          </div>

          {/* Right: Time and Language pill */}
          <div className="flex items-center justify-end gap-2">
            <div className="flex h-[35px] items-center rounded-[6px] border border-[#FFFFFF66] bg-[#000304] px-3 md:h-[30px]">
              {(() => {
                const dateTime = formatDateTimeWithSeconds(now);
                const parts = dateTime.split(' ');
                const datePart = parts[0] || '';
                const timePart = parts[1] || '';
                return (
                  <span className="text-[12px] font-medium whitespace-nowrap text-white sm:text-[13px] md:text-[14px]">
                    {datePart} {timePart}
                  </span>
                );
              })()}
            </div>
            <div className="flex h-[30px] items-center rounded-[6px] px-2">
              <LanguageSwitcher variant="dropdown" />
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex items-center justify-between md:hidden">
          {/* Mobile: Announcement pill */}
          <Link
            href="#"
            className={`relative z-10 inline-flex items-center gap-2 overflow-hidden py-2 text-[12px] text-white/90 transition-colors hover:text-white ${
              isAuth ? 'w-[170px]' : 'w-full'
            }`}
          >
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/announce-icon-2.svg"
              alt={t('announcement')}
              width={14}
              height={14}
            />
            <span className="h-3 w-px flex-shrink-0 bg-[#F25307]/60" />
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
            <span className="h-3 w-px flex-shrink-0 bg-[#F25307]/60" />
          </Link>

          {/* Mobile: Wallet Dropdown - Only show when user is authenticated */}
          {isAuth && <WalletDropdown variant="mobile" />}
        </div>
      </div>
    </nav>
  );
}

export default SubNavbar;
