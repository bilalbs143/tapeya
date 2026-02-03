'use client';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function SubNavbar({ variant = 'default' }) {
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

  const isDashboardVariant = variant === 'dashboard';

  return (
    <nav
      className={`relative z-[1] min-h-[20px] bg-[#1c1e22] border border-[#0c0d0e] ${
        isDashboardVariant ? '' : ''
      }`}
      style={{ boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.05)' }}
    >
      {!isDashboardVariant && (
        <>
          {/* 1px gradient top border */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#ec4d49] md:hidden" />
          <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-px bg-[#E8D25E] md:block" />
          {/* 1px gradient bottom border */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#ec4d49] md:hidden" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-px bg-[#E8D25E] md:block" />
        </>
      )}
      <div className="container mx-auto px-4 py-2">
        {/* Desktop Layout */}
        <div className="hidden items-center md:flex">
          <div className="relative w-full overflow-hidden text-[12px] text-[#c8c8c8]">
            <div className="flex animate-[marquee_25s_linear_infinite] hover:[animation-play-state:paused]">
              <span className="whitespace-nowrap pr-[50px]">{announcementText}</span>
              <span className="whitespace-nowrap pr-[50px]">{announcementText}</span>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="flex items-center justify-between md:hidden">
          {/* Mobile: Announcement */}
          <div className="relative z-10 inline-flex flex-1 overflow-hidden py-2 pr-2 text-[12px] text-[#c8c8c8]">
            <div className="flex animate-[marquee_30s_linear_infinite] hover:[animation-play-state:paused]">
              <span className="whitespace-nowrap pr-[50px]">{announcementText}</span>
              <span className="whitespace-nowrap pr-[50px]">{announcementText}</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default SubNavbar;
