'use client';

import React, { useState } from 'react';

import DepositBankTab from '@/dynamic-components/template3/components/DepositOptions/DepositBankTab';
import DepositCryptoTab from '@/dynamic-components/template3/components/DepositOptions/DepositCryptoTab';
import DepositDebitTab from '@/dynamic-components/template3/components/DepositOptions/DepositDebitTab';
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
        <div className="mt-10 mb-[10px] rounded-[10px] bg-[#E8D25E] p-[1px] md:mt-10">
          <div className="rounded-[10px] bg-[#0A1818] p-3">
            <div className="flex flex-wrap gap-1 md:gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 rounded-[5px] border border-[#FFFFFF66] px-3 py-2 text-[12px] font-bold whitespace-nowrap transition-all duration-300 md:flex-none md:border-0 md:px-6 md:py-3 md:text-[14px] ${
                    activeTab === t.key
                      ? 'bg-[#E8D25E] text-black'
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
        <div className="rounded-[10px] border border-[#FFFFFF66] p-3 md:p-4 lg:p-6">
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
