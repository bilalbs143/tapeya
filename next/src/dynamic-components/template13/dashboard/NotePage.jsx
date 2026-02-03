'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { useTranslations } from '@/hooks/useTranslations.js';

import NoteTab from '../modals/customer-service/NoteTab';

export default function NotePage() {
  const searchParams = useSearchParams();
  const openMessageId = searchParams?.get('messageId');
  const router = useRouter();
  const { t } = useTranslations();

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 text-white">
      <div className="mb-4 flex items-center justify-start sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('back')}
          className="flex items-center justify-center rounded-[4px] bg-[#20C5FE] px-8 py-2 font-extrabold text-white transition-all duration-300 hover:bg-[#1ab0e4]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        {/* Scrollable content */}
        <div className="scrollbar-hide min-h-[500px] overflow-y-auto rounded-[5px] border border-[#00374A] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">
            <NoteTab openMessageId={openMessageId} />
          </div>
        </div>
      </div>
    </div>
  );
}
