'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import DepositBankTab from '@/dynamic-components/template10/components/DepositOptions/DepositBankTab';
import DepositCryptoTab from '@/dynamic-components/template10/components/DepositOptions/DepositCryptoTab';
import DepositDebitTab from '@/dynamic-components/template10/components/DepositOptions/DepositDebitTab';
import { useTranslations } from '@/hooks/useTranslations';

export default function DepositPage() {
  const { t } = useTranslations();
  const router = useRouter();

  const tabs = [
    { key: 'depositBank', label: t('deposit_bank') },
    { key: 'depositCrypto', label: t('deposit_crypto') },
    { key: 'depositDebit', label: t('deposit_debit_credit_card') },
  ];

  const [activeTab, setActiveTab] = useState('depositBank');
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    router.push('/');
  };

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label || '';

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 text-white">
      <div className="space-y-6">
        {/* Back button (mobile only) */}
        <div className="mb-4 flex items-center justify-start sm:hidden">
          <button
            onClick={handleClose}
            aria-label={t('back')}
            className="flex items-center justify-center rounded-[4px] bg-[#E33A24] px-8 py-2.5 font-normal text-white transition-all duration-300 hover:bg-[#E33A24]"
          >
            {t('back')}
          </button>
        </div>

        {/* Deposit  */}
        <div className="rounded-[5px] bg-[#246A734D] p-3 md:ml-3 md:p-4 lg:p-6">
          <div className="mb-2 flex flex-col items-center md:flex-row md:justify-between">
            <h2 className="font-spy-agency w-full text-center text-[20px] text-white md:w-auto md:text-left md:text-[35px]">
              {t('deposit')}
            </h2>

            {/* Desktop Tabs */}
            <div className="mt-3 hidden rounded-[6px] p-0 md:mt-0 md:block md:p-[4px]">
              <div className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto text-left md:gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`group relative inline-flex items-center justify-center border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[5px] before:border before:transition-all before:duration-300 md:px-10 md:py-[6px] md:text-[16px] ${
                      activeTab === tab.key
                        ? 'text-white before:border-[#E33A2480] before:bg-[#E33A24] before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]'
                        : 'text-[white] before:border-[#E33A2480] before:bg-[#131515] hover:text-white hover:before:bg-[#E33A24] hover:before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]'
                    }`}
                  >
                    <span className="relative">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="mt-3 w-full rounded-[6px] p-[4px] md:hidden">
              {/* Main Button showing current selection */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex w-full items-center justify-between border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-[white] uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[3px] before:border before:border-[#E33A2480] before:bg-transparent"
              >
                <span className="relative z-10">{activeLabel}</span>

                {/* Arrow Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="9"
                  viewBox="0 0 16 9"
                  fill="none"
                  className={`relative z-10 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                  <path
                    d="M0.355469 0.353516L7.85547 7.85352L15.3555 0.353516"
                    stroke="#E33A24"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {/* Dropdown showing only other options */}
              {isOpen && (
                <div className="mt-2 flex flex-col gap-2">
                  {tabs
                    .filter((tab) => tab.key !== activeTab)
                    .map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.key);
                          setIsOpen(false);
                        }}
                        className="group relative inline-flex items-center justify-center border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-[white] uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[3px] before:border before:border-[#E33A2480] before:bg-transparent before:transition-all before:duration-300 hover:before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
                      >
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'depositBank' && <DepositBankTab />}
          {activeTab === 'depositCrypto' && <DepositCryptoTab />}
          {activeTab === 'depositDebit' && <DepositDebitTab />}
        </div>
      </div>
    </div>
  );
}
