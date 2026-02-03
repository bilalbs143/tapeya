'use client';

import React, { useState } from 'react';

import DepositBankTab from '@/dynamic-components/template1/components/DepositOptions/DepositBankTab';
import DepositCryptoTab from '@/dynamic-components/template1/components/DepositOptions/DepositCryptoTab';
import DepositDebitTab from '@/dynamic-components/template1/components/DepositOptions/DepositDebitTab';
import { useTranslations } from '@/hooks/useTranslations';

export default function DepositTab() {
  const { t } = useTranslations();
  const tabs = [
    { key: 'depositBank', label: t('deposit_bank') },
    { key: 'depositCrypto', label: t('deposit_crypto') },
    { key: 'depositDebit', label: t('deposit_debit_credit_card') },
  ];

  const [activeTab, setActiveTab] = useState('depositBank');

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
              className={`flex-1 basis-1/3 cursor-pointer rounded-[4px] border border-[#5343B1] px-2 py-2 text-center text-[12px] font-bold whitespace-nowrap transition-all duration-300 sm:px-3 sm:text-[11px] md:flex-none md:basis-auto md:px-6 md:text-[14px] lg:px-8 lg:text-[16px] ${
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
            {activeTab === 'depositBank' && <DepositBankTab />}
            {activeTab === 'depositCrypto' && (
              <DepositCryptoTab isActive={true} />
            )}
            {activeTab === 'depositDebit' && <DepositDebitTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
