'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

import ProfileTab from '../modals/customer-service/ProfileTab';

export default function ProfilePage() {
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
          className="flex items-center justify-center rounded-[4px] bg-[#D61324] px-6 py-1 font-extrabold text-white transition-all duration-300 hover:bg-[#D61324]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#FB63214D] px-4 py-3 md:px-6 md:py-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[white] sm:text-[30px]">
              {t('Personal Details')}
            </h2>
          </div>
          {/* Scrollable content */}
          <div className="scrollbar-hide min-h-[500px] overflow-y-auto rounded-[5px] border border-[#FB63214D] p-3 md:p-4 lg:p-6">
            <div className="space-y-4 md:space-y-6">
              <ProfileTab />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
