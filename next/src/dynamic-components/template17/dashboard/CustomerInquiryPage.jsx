'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import InquiryTab from '@/dynamic-components/template17/modals/customer-service/InquiryTab';
import { useTranslations } from '@/hooks/useTranslations';

export default function CustomerInquiryPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const openInquiryId = searchParams?.get('inquiryId');

  const handleBack = () => {
    router.push('/dashboard/home');
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E]">
      <div className="container mx-auto px-4 py-8 text-white md:px-0">
        <div className="relative flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6">
          <div className="flex min-h-0 flex-1 flex-col space-y-4 rounded-[12px] md:space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={handleBack}
                aria-label={t('back')}
                className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#E8D25E] px-2 text-black transition-all duration-300 hover:bg-[#D4C04F] sm:h-[33px] sm:w-auto sm:px-3"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="transition-all duration-300 group-hover:-translate-x-1 sm:h-5 sm:w-5"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="#0B0B0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="hidden text-sm font-semibold sm:inline-block">
                  {t('back')}
                </span>
              </button>
              <h2 className="flex-1 text-[20px] font-semibold text-white sm:text-[26px] md:text-[30px]">
                {t('customer_inquiry')}
              </h2>
            </div>

            {/* Scrollable content */}
            <div className="scrollbar-hide min-h-[500px] flex-1 overflow-y-auto">
              <div className="space-y-4 md:space-y-6">
                <InquiryTab activeTab="inquiry" openInquiryId={openInquiryId} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
