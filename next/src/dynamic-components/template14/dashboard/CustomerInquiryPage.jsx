'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations.js';

import InquiryTab from '../modals/customer-service/InquiryTab';

export default function CustomerInquiryPage() {
  const searchParams = useSearchParams();
  const openInquiryId = searchParams?.get('inquiryId');
  const { t } = useTranslations();
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 text-white">
      <div className="mb-4 flex items-center justify-center sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('back')}
          className="angled-button angled-button-blue flex h-[35px] w-[120px] w-full items-center justify-center font-extrabold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
          data-hover={t('back')}
        >
          <div className="angled-button-inner">
            <span className="angled-button-text">{t('back')}</span>
          </div>
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#3E1D88] bg-[linear-gradient(90deg,rgba(41,18,135,0.40)_0.48%,rgba(87,61,193,0.40)_49.87%,rgba(41,18,135,0.40)_96.31%)] px-4 py-3 md:px-6 md:py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bring-race text-[25px] text-white sm:text-[35px] md:text-[40px]">
              {t('customer_inquiry')}
            </h2>
          </div>
          <div>
            <div className="space-y-4 md:space-y-6">
              <InquiryTab activeTab="inquiry" openInquiryId={openInquiryId} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
