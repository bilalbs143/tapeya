'use client';

import { useRouter } from 'next/navigation.js';
import React from 'react';
import { useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';

import WithdrawalTab from '../modals/transaction/WithdrawalTab';

export default function WithdrawalPage() {
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
          aria-label={t('back')}
          className="flex items-center justify-center rounded-[4px] bg-[#D61324] px-8 py-2 font-extrabold text-white transition-all duration-300 hover:bg-[#D61324]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#FB63214D] px-4 py-3 md:px-6 md:py-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[white] sm:text-[30px]">
              {t('withdrawal')}
            </h2>
          </div>
          {/* Withdrawal Section */}
          <WithdrawalTab />
        </div>
      </div>
    </div>
  );
}
