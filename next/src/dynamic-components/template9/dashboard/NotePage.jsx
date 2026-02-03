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
          className="template9-filled-button-hover flex items-center justify-center rounded-[4px] bg-[#9D4EDD] px-10 py-3 font-semibold text-white transition-all duration-300 hover:bg-[#9D4EDD]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        {/* Scrollable content */}
        <div className="scrollbar-hide min-h-[500px] overflow-y-auto rounded-[5px] border border-[#DBB42C4D] bg-[#1D0032] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">
            <NoteTab openMessageId={openMessageId} />
          </div>
        </div>
      </div>
    </div>
  );
}
