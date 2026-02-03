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
            className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] autofill:bg-[#03071E] autofill:shadow-[inset_0_0_0px_1000px_#03071E] autofill:[-webkit-text-fill-color:white] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:px-4 md:text-[14px] md:placeholder:text-sm"
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
            className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] autofill:bg-[#03071E] autofill:shadow-[inset_0_0_0px_1000px_#03071E] autofill:[-webkit-text-fill-color:white] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:px-4 md:text-[14px] md:placeholder:text-sm"
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
            className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] autofill:bg-[#03071E] autofill:shadow-[inset_0_0_0px_1000px_#03071E] autofill:[-webkit-text-fill-color:white] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:px-4 md:text-[14px] md:placeholder:text-sm"
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
            className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] autofill:bg-[#03071E] autofill:shadow-[inset_0_0_0px_1000px_#03071E] autofill:[-webkit-text-fill-color:white] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:px-4 md:text-[14px] md:placeholder:text-sm"
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
