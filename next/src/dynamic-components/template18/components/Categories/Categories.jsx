'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { useSelector } from 'react-redux';

import { useMarquee } from '@/hooks/useMarquee';
import { useTranslations } from '@/hooks/useTranslations';

function Announcement() {
  const { t, currentLocale } = useTranslations();
  const isAuth = useSelector((state) => state.auth.isAuth);

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

  const desktopMarquee = useMarquee({
    speed: 25,
    pauseOnHover: true,
    direction: 'left',
  });

  const mobileMarquee = useMarquee({
    speed: 20,
    pauseOnHover: true,
    direction: 'left',
  });

  return (
    <section className="pt-4 md:pt-5">
      {/*  DESKTOP  */}
      <div className="hidden justify-center md:flex">
        <div className="grid h-[60px] w-full max-w-[1530px] gap-6 md:grid-cols-12 md:px-0">
          {/* Announcement Bar (9 Cols) */}
          <div className="flex h-full items-center overflow-hidden rounded-[10px] border border-[#FFB7034D] bg-[#14213D] md:col-span-9">
            {/* Left Label */}
            <div className="flex h-full items-center border-r border-[#FFB7034D] px-8">
              <span className="text-[15px] font-extrabold tracking-wider text-white uppercase">
                {t('announcement') || 'ANNOUNCEMENTS'}
              </span>
            </div>

            {/* Marquee Content */}
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
                    color: '#B0B0B0', // Light grey text
                    fontSize: '14px',
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
                      color: '#B0B0B0',
                      fontSize: '14px',
                    }}
                  >
                    {announcementText}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Get Our App Button (3 Cols) */}
          <Link
            href="/download-app"
            className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#FFB800] text-[16px] font-bold text-white uppercase transition-opacity hover:opacity-90 md:col-span-3"
          >
            GET OUR APP
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Announcement;
