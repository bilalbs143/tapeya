'use client';

import React, { useState } from 'react';

import WithdrawalBankTab from '@/dynamic-components/template2/components/WithdrawalOptions/WithdrawalBankTab';
import WithdrawalCryptoTab from '@/dynamic-components/template2/components/WithdrawalOptions/WithdrawalCryptoTab';
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
        <div className="mb-[10px] rounded-[8px] border border-[#FFFFFF66] bg-black p-3">
          <div className="flex flex-wrap gap-1 md:gap-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 rounded-[10px] border border-[#FFFFFF66] px-3 py-2 text-[12px] font-bold whitespace-nowrap transition-all duration-300 md:border-0 md:px-6 md:py-3 md:text-[14px] lg:px-8 lg:text-[16px] ${
                  activeTab === t.key ? 'bg-[#51A2FF] text-white' : 'text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="rounded-[10px] border border-[#FFFFFF66] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">
            {activeTab === 'bankTransfer' && <WithdrawalBankTab />}
            {activeTab === 'crypto' && <WithdrawalCryptoTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
