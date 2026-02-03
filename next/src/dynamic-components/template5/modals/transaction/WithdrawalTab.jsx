'use client';

import React, { useState } from 'react';

import WithdrawalBankTab from '@/dynamic-components/template5/components/WithdrawalOptions/WithdrawalBankTab';
import WithdrawalCryptoTab from '@/dynamic-components/template5/components/WithdrawalOptions/WithdrawalCryptoTab';
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
        <div className="mt-4 mb-[10px] rounded-[5px] border border-[#00374A] p-[1px] md:mt-2">
          <div className="rounded-[5px] bg-transparent p-3">
            <div className="flex flex-wrap gap-1 md:gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 rounded-[4px] border border-[#00374A] px-3 py-2 text-[12px] font-bold whitespace-nowrap transition-all duration-300 hover:bg-[#20C5FE] md:flex-none md:border-0 md:px-6 md:py-3 md:text-[14px] ${
                    activeTab === t.key
                      ? 'bg-[#20C5FE] text-white'
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
        <div className="rounded-[5px] border border-[#00374A] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">
            {activeTab === 'bankTransfer' && <WithdrawalBankTab />}
            {activeTab === 'crypto' && <WithdrawalCryptoTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
