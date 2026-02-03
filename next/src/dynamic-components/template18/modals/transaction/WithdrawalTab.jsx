'use client';

import React, { useState } from 'react';

import WithdrawalBankTab from '@/dynamic-components/template18/components/WithdrawalOptions/WithdrawalBankTab';
import WithdrawalCryptoTab from '@/dynamic-components/template18/components/WithdrawalOptions/WithdrawalCryptoTab';
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
        <div className="mt-4 mb-[10px] rounded-[5px] border border-[#11234D] p-[2px] md:mt-4">
          <div className="rounded-[5px] bg-transparent p-1">
            <div className="flex flex-wrap gap-1 md:gap-5">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`w-[446px] rounded-[6px] border border-[#11234D] px-3 py-2 text-[12px] font-bold whitespace-nowrap transition-all duration-300 md:border-0 md:px-8 md:py-4 md:text-[14px] ${
                    activeTab === t.key
                      ? 'bg-[#FFB703] text-white'
                      : 'text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="rounded-[5px] border border-[#11234D] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">
            {activeTab === 'bankTransfer' && <WithdrawalBankTab />}
            {activeTab === 'crypto' && <WithdrawalCryptoTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
