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
          className="flex items-center justify-center rounded-[4px] bg-[#2DFA1A] px-8 py-2 font-semibold text-black transition-all duration-300 hover:bg-[#2DFA1A]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#2DFA1A4D] bg-[#0A1414] px-4 py-3 md:px-6 md:py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bring-race text-[25px] text-[white] sm:text-[30px] md:text-[40px]">
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
