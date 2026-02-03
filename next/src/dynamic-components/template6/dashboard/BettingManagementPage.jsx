'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations.js';

import BettingTab from '../modals/customer-service/BettingTab';

export default function BettingManagementPage() {
  const { t } = useTranslations();
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 text-white">
      <div className="mb-3 flex items-center justify-start sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('back')}
          className="flex items-center justify-center rounded-[4px] bg-[#D61324] px-8 py-2 font-extrabold text-white transition-all duration-300 hover:bg-[#D61324]"
        >
          Back
        </button>
      </div>
      <div className="space-y-6">
        {/* Scrollable content */}
        <div className="scrollbar-hide min-h-[500px] overflow-y-auto rounded-[5px] border border-[#FB63214D] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">
            <BettingTab />
          </div>
        </div>
      </div>
    </div>
  );
}
