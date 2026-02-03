'use client';

import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

export default function DepositDebitTab() {
  const { t } = useTranslations();

  return (
    <div className="relative overflow-hidden rounded-md bg-transparent p-4 md:p-5">
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
            className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFFB2] focus:border-[rgba(6,214,160,0.6)] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
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
            className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFFB2] focus:border-[rgba(6,214,160,0.6)] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
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
            className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFFB2] focus:border-[rgba(6,214,160,0.6)] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
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
            className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[rgba(6,214,160,0.3)] bg-[#14213D] px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFFB2] focus:border-[rgba(6,214,160,0.6)] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
          />
        </div>
      </div>

      {/* Full-cover blur overlay */}
      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <span className="bg-[#06D6A0] bg-clip-text text-center text-base font-semibold text-transparent sm:text-lg md:text-2xl">
          {t('coming_soon')}
        </span>
      </div>
    </div>
  );
}
