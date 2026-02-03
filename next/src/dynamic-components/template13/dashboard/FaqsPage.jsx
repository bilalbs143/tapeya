'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations.js';

import FaqTab from '../modals/customer-service/FaqTab';

export default function FaqsPage() {
  const { t } = useTranslations();

  const router = useRouter();
  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 text-white">
      <div className="mb-4 flex items-center justify-start sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('close')}
          className="flex items-center justify-center rounded-[4px] bg-[#20C5FE] px-8 py-2 font-extrabold text-white transition-all duration-300 hover:bg-[#1ab0e4]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#00374A] px-4 py-3 md:px-6 md:py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[20px] font-medium text-[white] sm:text-[30px]">
              {t('Frequently Asked Questions')}
            </h2>
          </div>
          {/* Scrollable content */}
          <div className="scrollbar-hide min-h-[500px] overflow-y-auto rounded-[5px] border border-[#00374A] p-3 md:p-4 lg:p-6">
            <div className="space-y-4 md:space-y-6">
              <FaqTab />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
