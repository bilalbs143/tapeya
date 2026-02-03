'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations.js';

import ReferralsTab from '../modals/customer-service/ReferralsTab';

export default function ReferralsPage() {
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
          className="template9-filled-button-hover flex items-center justify-center rounded-[4px] bg-[#9D4EDD] px-10 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#9D4EDD]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#DBB42C4D] bg-[#1D0032] px-4 py-3 md:px-6 md:py-6">
          <div className="mt-1 mb-4 flex items-center justify-center sm:justify-between">
            <h2 className="font-cravend text-center text-[20px] sm:text-left sm:text-[35px] md:text-[35px]">
              {t('Referral')}
            </h2>
          </div>{' '}
          {/* Scrollable content */}
          <div>
            <div className="space-y-4 md:space-y-6">
              <ReferralsTab />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
