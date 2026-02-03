'use client';

import React, { useState } from 'react';

import DepositBankTab from '@/dynamic-components/template6/components/DepositOptions/DepositBankTab';
import DepositCryptoTab from '@/dynamic-components/template6/components/DepositOptions/DepositCryptoTab';
import DepositDebitTab from '@/dynamic-components/template6/components/DepositOptions/DepositDebitTab';
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
        <div className="mt-4 mb-[10px] rounded-[5px] border border-[#FB63214D] p-[1px] md:mt-4">
          <div className="rounded-[5px] bg-transparent p-3">
            {/* Tabs container */}
            <div className="flex flex-wrap gap-1 md:gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 rounded-[4px] border border-[#FB63214D] px-3 py-2 text-[12px] font-bold whitespace-nowrap text-white transition-all duration-300 md:flex-none md:border-0 md:px-6 md:py-3 md:text-[14px] ${
                    activeTab === t.key
                      ? 'bg-[#D61324] text-white'
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
        <div className="rounded-[5px] border border-[#FB63214D] p-3 md:p-4 lg:p-6">
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
