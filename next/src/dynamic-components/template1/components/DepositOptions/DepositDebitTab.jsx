'use client';

import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

export default function DepositDebitTab() {
  const { t } = useTranslations();

  return (
    <div className="relative overflow-hidden rounded-md bg-[#261A66] p-4 md:p-5">
      {/* Form content (blurred by overlay) */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-4">
        <div className="space-y-2">
          <label
            htmlFor="card-number"
            className="block text-[12px] font-bold text-white md:text-[14px]"
          >
            {t('card_number')}
          </label>
          <input
            id="card-number"
            type="text"
            placeholder={t('enter_card_number')}
            className="h-[46px] w-full rounded-md border border-[#5343B1] bg-[#241866] px-3 py-3 text-white placeholder-white/60 outline-none placeholder:text-xs focus:border-[#5343B1] focus:ring-2 focus:ring-[#5343B1] md:placeholder:text-sm"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="cardholder-name"
            className="block text-[12px] font-bold text-white md:text-[14px]"
          >
            {t('cardholder_name')}
          </label>
          <input
            id="cardholder-name"
            type="text"
            placeholder={t('enter_cardholder_name')}
            className="h-[46px] w-full rounded-md border border-[#5343B1] bg-[#241866] px-3 py-3 text-white placeholder-white/60 outline-none placeholder:text-xs focus:border-[#5343B1] focus:ring-2 focus:ring-[#5343B1] md:placeholder:text-sm"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="expiry-date"
            className="block text-[12px] font-bold text-white md:text-[14px]"
          >
            {t('expiry_date')}
          </label>
          <input
            id="expiry-date"
            type="text"
            placeholder={t('mm_yy')}
            className="h-[46px] w-full rounded-md border border-[#5343B1] bg-[#241866] px-3 py-3 text-white placeholder-white/60 outline-none placeholder:text-xs focus:border-[#5343B1] focus:ring-2 focus:ring-[#5343B1] md:placeholder:text-sm"
          />
        </div>
        <div className="space-y-2">
          <label
            htmlFor="cvv"
            className="block text-[12px] font-bold text-white md:text-[14px]"
          >
            {t('cvv')}
          </label>
          <input
            id="cvv"
            type="password"
            placeholder={t('cvv')}
            className="h-[46px] w-full rounded-md border border-[#5343B1] bg-[#241866] px-3 py-3 text-white placeholder-white/60 outline-none placeholder:text-xs focus:border-[#5343B1] focus:ring-2 focus:ring-[#5343B1] md:placeholder:text-sm"
          />
        </div>
      </div>

      {/* Full-cover blur overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#1a1240]/30 backdrop-blur-sm">
        <span className="text-center text-base font-semibold text-white sm:text-lg md:text-2xl">
          {t('coming_soon')}
        </span>
      </div>
    </div>
  );
}
