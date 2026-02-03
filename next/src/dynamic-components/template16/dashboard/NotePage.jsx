'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import NoteTab from '@/dynamic-components/template16/modals/customer-service/NoteTab';
import { useTranslations } from '@/hooks/useTranslations.js';

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
          className="flex cursor-pointer items-center justify-center rounded-[10px] bg-[#E8D25E] px-8 pt-3 pb-4 text-[14px] font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800] active:scale-95"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        {/* Scrollable content */}
        <div className="scrollbar-hide min-h-[500px] overflow-y-auto rounded-[10px] border border-[#E8D25E]/30 bg-[#111111] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">
            <NoteTab openMessageId={openMessageId} />
          </div>
        </div>
      </div>
    </div>
  );
}

