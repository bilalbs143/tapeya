'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import ReferralsTab from '@/dynamic-components/template16/modals/customer-service/ReferralsTab';
import { useTranslations } from '@/hooks/useTranslations';

export default function ReferralsPage() {
  const { t } = useTranslations();
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8 text-white md:px-0">
      <div className="relative flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6">
        <div className="flex min-h-0 flex-1 flex-col space-y-4 rounded-[12px] md:space-y-6">
          {/* Back button for mobile */}
          <div className="mb-4 flex items-center justify-start sm:hidden">
            <button
              onClick={handleClose}
              aria-label={t('back')}
              className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#E8D25E] text-black transition-all duration-300 sm:h-[33px] sm:w-[33px]"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#0B0B0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-[20px] font-semibold text-white sm:text-[26px] md:text-[30px]">
              {t('referrals')}
            </h2>
          </div>

          {/* Scrollable content */}
          <div className="scrollbar-hide min-h-[500px] flex-1 overflow-y-auto rounded-[10px] border border-[#E8D25E4D] p-3 md:p-4 lg:p-6">
            <div className="space-y-4 md:space-y-6">
              <ReferralsTab />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
