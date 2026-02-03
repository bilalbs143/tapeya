'use client';

import React, { useState } from 'react';

import DepositBankTab from '@/dynamic-components/template19/components/DepositOptions/DepositBankTab';
import DepositCryptoTab from '@/dynamic-components/template19/components/DepositOptions/DepositCryptoTab';
import DepositDebitTab from '@/dynamic-components/template19/components/DepositOptions/DepositDebitTab';
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
        <div className="mt-4 mb-[12px] rounded-[5px] border border-[rgba(6,214,160,0.3)] p-[2px] md:mt-4">
          <div className="rounded-[5px] bg-transparent p-1">
            <div className="flex flex-wrap gap-1 md:gap-7">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`w-[446px] rounded-[5px] border border-[rgba(6,214,160,0.3)] px-3 py-2 text-[12px] font-semibold whitespace-nowrap transition-all duration-200 md:border md:px-8 md:py-3.5 md:text-[14px] ${
                    activeTab === t.key
                      ? 'border-[#06D6A0] bg-[#14213D] text-white'
                      : 'text-[#CCCCCC] hover:border-[#06D6A0]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab content */}
        <div className="rounded-[7px] border border-[rgba(6,214,160,0.3)] bg-[#14213D]/80 p-3 md:p-4 lg:p-6">
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
