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
    <div className="max-w-8xl mx-auto w-full px-4 py-8 text-white">
      <div className="mb-4 flex items-center justify-start sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('back')}
          className="template10-filled-button-hover flex items-center justify-center rounded-[4px] bg-[#E33A24] px-10 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#E33A24]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        <div className="rounded-[5px] bg-[#246A734D] px-4 py-3 md:ml-3 md:px-6 md:py-6">
          <div className="mt-1 mb-4 flex items-center justify-center sm:justify-between">
            <h2 className="font-spy-agency text-center text-[20px] sm:text-left sm:text-[35px] md:text-[35px]">
              {t('faqs')}
            </h2>
          </div>
          {/* Scrollable content */}
          <div>
            <div className="space-y-4 md:space-y-6">
              <FaqTab />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
