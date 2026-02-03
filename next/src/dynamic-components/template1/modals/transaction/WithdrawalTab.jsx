'use client';

import React, { useState } from 'react';

import WithdrawalBankTab from '@/dynamic-components/template1/components/WithdrawalOptions/WithdrawalBankTab';
import WithdrawalCryptoTab from '@/dynamic-components/template1/components/WithdrawalOptions/WithdrawalCryptoTab';
import { useTranslations } from '@/hooks/useTranslations';

export default function WithdrawalTab() {
  const { t } = useTranslations();
  const tabs = [
    { key: 'bankTransfer', label: t('withdrawal_via_bank_transfer') },
    { key: 'crypto', label: t('withdrawal_via_crypto_currencies') },
  ];

  const [activeTab, setActiveTab] = useState('bankTransfer');

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {/* Tabs header */}
        <div className="mb-[10px] flex w-full flex-wrap gap-1 md:mx-auto md:w-auto md:flex-nowrap md:gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 basis-1/2 cursor-pointer rounded-[4px] border border-[#5343B1] px-2 py-2 text-center text-[12px] font-bold whitespace-nowrap transition-all duration-300 sm:px-3 sm:text-[11px] md:flex-none md:basis-auto md:px-6 md:text-[14px] lg:px-8 lg:text-[16px] ${
                activeTab === t.key
                  ? 'bg-[#FC7E09] text-white'
                  : 'bg-[#241866] text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="rounded-[3px] border-2 border-[#452FCD] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">
            {activeTab === 'bankTransfer' && <WithdrawalBankTab />}
            {activeTab === 'crypto' && <WithdrawalCryptoTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
