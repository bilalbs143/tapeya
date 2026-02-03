import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import LazyImage from '@/dynamic-components/template3/components/LazyImage/LazyImage';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';

function Categories() {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  // Jackpot ticker (increments 3 per second)
  const [jackpot, setJackpot] = useState(64702645);

  // Mobile slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

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

  // Mobile slider navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  // Auto-advance slides every 3 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="border-b border-[#FFFFFF66] bg-[#000304]">
      {/* Desktop Categories */}
      <div className="hidden md:block">
        <div className="container mx-auto px-0 py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {/* Slot */}
            <div className="rounded-[10px] border border-[#d3af3736]">
              <Link
                href="/slot-providers"
                className="group flex items-center justify-between rounded-[10px] bg-transparent px-4 py-3 transition-all duration-200 hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
              >
                <div className="h-16 w-16 rounded-[8px] bg-[#E8D25E] p-[1px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]">
                  <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000304]">
                    <LazyImage
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-cat-3.svg"
                      alt={t('slots')}
                      width={32}
                      height={32}
                      className="h-10 w-10"
                    />
                  </div>
                </div>
                <span className="bg-[#E8D25E] bg-clip-text text-[18px] font-bold text-transparent">
                  {t('slots')}
                </span>
              </Link>
            </div>

            {/* Casino */}
            <div className="rounded-[10px] border border-[#d3af3736]">
              <Link
                href="/live-casino"
                className="group flex items-center justify-between rounded-[10px] bg-transparent px-4 py-3 transition-all duration-200 hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
              >
                <div className="h-16 w-16 rounded-[8px] bg-[#E8D25E] p-[1px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]">
                  <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000304]">
                    <LazyImage
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-cat-3.svg"
                      alt={t('casino')}
                      width={32}
                      height={32}
                      className="h-10 w-10"
                    />
                  </div>
                </div>
                <span className="bg-[#E8D25E] bg-clip-text text-[18px] font-bold text-transparent">
                  {t('casino')}
                </span>
              </Link>
            </div>

            {/* Jackpot */}
            <div className="min-w-0 rounded-[10px] border border-[#d3af3736]">
              <div className="flex h-[100%] min-w-0 items-center justify-center gap-1 rounded-[10px] bg-transparent px-3 py-3 text-center">
                <span className="bg-[#E8D25E] bg-clip-text text-[14px] font-extrabold whitespace-nowrap text-transparent uppercase lg:text-[16px]">
                  {t('jackpot') || 'JACKPOT'}
                </span>
                <span className="text-[14px] whitespace-nowrap text-[#D3AF37] lg:text-[16px]">
                  /
                </span>
                <span className="min-w-0 truncate bg-[#E8D25E] bg-clip-text text-[14px] font-extrabold whitespace-nowrap text-transparent lg:text-[16px]">
                  {getCurrency()} {formattedJackpot}
                </span>
              </div>
            </div>

            {/* WhatsApp */}
            <div className="rounded-[10px] border border-[#d3af3736]">
              <a
                href="https://web.whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-[10px] bg-transparent px-4 py-3 text-white transition-all duration-200 hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
              >
                <div className="h-16 w-16 rounded-[8px] bg-[#E8D25E] p-[1px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]">
                  <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000304]">
                    <LazyImage
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/whatsapp-3.svg"
                      alt="WhatsApp"
                      width={32}
                      height={32}
                      className="h-8 w-8"
                    />
                  </div>
                </div>
                <span className="bg-[#E8D25E] bg-clip-text text-[18px] font-semibold text-transparent">
                  WhatsApp
                </span>
              </a>
            </div>

            {/* Telegram */}
            <div className="rounded-[10px] border border-[#d3af3736]">
              <a
                href="https://web.telegram.org"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-[10px] bg-transparent px-4 py-3 text-white transition-all duration-200 hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
              >
                <div className="h-16 w-16 rounded-[8px] bg-[#E8D25E] p-[1px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]">
                  <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000304]">
                    <LazyImage
                      src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/telegram-3.svg"
                      alt="Telegram"
                      width={32}
                      height={32}
                      className="h-8 w-8"
                    />
                  </div>
                </div>
                <span className="bg-[#E8D25E] bg-clip-text text-[18px] font-semibold text-transparent">
                  Telegram
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Categories Slider */}
      <div className="relative block md:hidden">
        <div className="px-4 py-4">
          <div className="overflow-hidden">
            {/* Mobile Slider Container */}
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Slide 1: Slot and Casino */}
              <div className="w-full flex-shrink-0 px-2">
                <div className="flex gap-3">
                  {/* Slot Button */}
                  <div className="flex-1 rounded-[10px] border border-[#d3af3736]">
                    <Link
                      href="/slot-providers"
                      className="group flex items-center justify-between rounded-[10px] bg-transparent px-4 py-3 transition-all duration-200 hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                    >
                      <div className="h-12 w-12 rounded-[8px] bg-[#E8D25E] p-[1px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]">
                        <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000304]">
                          <LazyImage
                            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/slot-cat-3.svg"
                            alt={t('slots')}
                            width={24}
                            height={24}
                            className="h-6 w-6"
                          />
                        </div>
                      </div>
                      <span className="bg-[#E8D25E] bg-clip-text text-[16px] font-bold text-transparent">
                        {t('slots')}
                      </span>
                    </Link>
                  </div>

                  {/* Casino Button */}
                  <div className="flex-1 rounded-[10px] border border-[#d3af3736]">
                    <Link
                      href="/live-casino"
                      className="group flex items-center justify-between rounded-[10px] bg-transparent px-4 py-3 transition-all duration-200 hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                    >
                      <div className="h-12 w-12 rounded-[8px] bg-[#E8D25E] p-[1px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]">
                        <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000304]">
                          <LazyImage
                            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/casino-cat-3.svg"
                            alt={t('casino')}
                            width={24}
                            height={24}
                            className="h-6 w-6"
                          />
                        </div>
                      </div>
                      <span className="bg-[#E8D25E] bg-clip-text text-[16px] font-bold text-transparent">
                        {t('casino')}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Slide 2: Jackpot */}
              <div className="w-full flex-shrink-0 px-2">
                <div className="h-full rounded-[10px] border border-[#d3af3736]">
                  <div className="flex h-full items-center justify-center gap-2 rounded-[10px] bg-transparent px-4 py-3 text-center sm:gap-3">
                    <span className="bg-[#E8D25E] bg-clip-text text-[16px] font-extrabold text-transparent uppercase sm:text-[18px] md:text-[20px]">
                      {t('jackpot') || 'JACKPOT'}
                    </span>
                    <span className="text-[16px] text-[#D3AF37] sm:text-[18px] md:text-[20px]">
                      /
                    </span>
                    <span className="bg-[#E8D25E] bg-clip-text text-[16px] font-extrabold text-transparent sm:text-[18px] md:text-[20px]">
                      {getCurrency()} {formattedJackpot}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slide 3: Telegram and WhatsApp */}
              <div className="w-full flex-shrink-0 px-2">
                <div className="flex gap-3">
                  {/* Telegram */}
                  <div className="flex-1 rounded-[10px] border border-[#d3af3736]">
                    <a
                      href="https://web.telegram.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-[10px] bg-transparent px-4 py-3 text-white transition-all duration-200 hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                    >
                      <div className="h-12 w-12 rounded-[8px] bg-[#E8D25E] p-[1px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]">
                        <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000304]">
                          <LazyImage
                            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/telegram-3.svg"
                            alt="Telegram"
                            width={24}
                            height={24}
                            className="h-6 w-6"
                          />
                        </div>
                      </div>
                      <span className="bg-[#E8D25E] bg-clip-text text-[16px] font-semibold text-transparent">
                        Telegram
                      </span>
                    </a>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex-1 rounded-[10px] border border-[#d3af3736]">
                    <a
                      href="https://web.whatsapp.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between rounded-[10px] bg-transparent px-4 py-3 text-white transition-all duration-200 hover:shadow-[inset_0_0_6px_1px_#D3AF37]"
                    >
                      <div className="h-12 w-12 rounded-[8px] bg-[#E8D25E] p-[1px] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-[5deg]">
                        <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-[#000304]">
                          <LazyImage
                            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/whatsapp-3.svg"
                            alt="WhatsApp"
                            width={24}
                            height={24}
                            className="h-6 w-6"
                          />
                        </div>
                      </div>
                      <span className="bg-[#E8D25E] bg-clip-text text-[16px] font-semibold text-transparent">
                        WhatsApp
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrow */}
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-[0px] flex h-8 w-8 -translate-y-1/2 items-center justify-center transition-opacity hover:opacity-80"
            >
              <LazyImage
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/cat-slide-right-3.svg"
                alt="Next slide"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Categories;
