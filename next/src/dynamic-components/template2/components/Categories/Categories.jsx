import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import LazyImage from '@/dynamic-components/template2/components/LazyImage/LazyImage';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';

function Categories() {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  // Jackpot ticker (increments 3 per second)
  const [jackpot, setJackpot] = useState(64702645);

  useEffect(() => {
    const incrementEveryMs = 1000 / 3; // ~3 increments per second
    let animationFrameId;
    let lastTs =
      typeof performance !== 'undefined' ? performance.now() : Date.now();
    let accumulator = 0;

    const tick = (ts) => {
      const nowTs =
        ts ||
        (typeof performance !== 'undefined' ? performance.now() : Date.now());
      const delta = nowTs - lastTs;
      lastTs = nowTs;
      accumulator += delta;

      while (accumulator >= incrementEveryMs) {
        setJackpot((prev) => prev + 1);
        accumulator -= incrementEveryMs;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const formattedJackpot = new Intl.NumberFormat('en-US').format(jackpot);

  return (
    <section className="hidden border-b border-[#FFFFFF66] bg-[#000304] md:block">
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {/* Slot */}
          <Link
            href="/slot-providers"
            className="group flex items-center justify-between rounded-[12px] border border-[#FFFFFF66] bg-[#0A0D10]/80 px-4 py-3 transition-all duration-200 hover:border-[#51A2FF] hover:bg-white/5 hover:shadow-[inset_0_0_6px_1px_#51A2FF]"
          >
            <span className="text-base font-semibold text-white">
              {t('slots').toUpperCase()}
            </span>
            <LazyImage
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-cat.webp"
              alt={t('slots')}
              width={44}
              height={44}
              className="h-11 w-11 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]"
            />
          </Link>

          {/* Casino */}
          <Link
            href="/live-casino"
            className="group flex items-center justify-between rounded-[12px] border border-[#FFFFFF66] bg-[#0A0D10]/80 px-4 py-3 transition-all duration-200 hover:border-[#51A2FF] hover:bg-white/5 hover:shadow-[inset_0_0_6px_1px_#51A2FF]"
          >
            <span className="text-base font-semibold text-white">
              {t('casino').toUpperCase()}
            </span>
            <LazyImage
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-cat.webp"
              alt={t('casino')}
              width={44}
              height={44}
              className="h-11 w-11 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]"
            />
          </Link>

          {/* Jackpot - center wide card */}
          <div className="flex items-center justify-center rounded-[12px] border border-[#FFFFFF66] bg-[#0A0D10]/80 px-4 py-3 sm:col-span-2 lg:col-span-2">
            <div className="w-full rounded-[10px] bg-gradient-to-b from-[#0E0F12] to-[#0A0D10] px-6">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[18px] font-extrabold tracking-wide text-[#D3B95F] uppercase sm:text-[22px]">
                  {t('jackpot') || 'Jackpot'}:
                </span>
                <span className="text-[18px] font-extrabold tracking-wide text-[#E5D27A] sm:text-[22px]">
                  {formattedJackpot}
                </span>
                <span className="text-[18px] font-extrabold tracking-wide text-[#D3B95F] sm:text-[22px]">
                  {getCurrency()}
                </span>
              </div>
            </div>
          </div>

          {/* WhatsApp */}
          <a
            href="https://web.whatsapp.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-[12px] bg-[#21C942] px-4 py-3 text-white transition-transform hover:scale-[1.01]"
          >
            <div className="flex flex-col">
              <span className="text-base font-semibold">WhatsApp</span>
              <span className="text-[10px] opacity-80">@user123</span>
            </div>
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/logos_whatsapp-icon.png"
              alt="WhatsApp"
              className="h-10 w-10"
            />
          </a>

          {/* Telegram */}
          <a
            href="https://web.telegram.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-[12px] bg-[#2F80ED] px-4 py-3 text-white transition-transform hover:scale-[1.01]"
          >
            <div className="flex flex-col">
              <span className="text-base font-semibold">Telegram</span>
              <span className="text-[10px] opacity-80">@user123</span>
            </div>
            <img
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/Telegram (1).png"
              alt="Telegram"
              className="h-10 w-10"
            />
          </a>
        </div>
      </div>
    </section>
  );
}

export default Categories;
