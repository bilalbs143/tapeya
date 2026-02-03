'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import DepositBankTab from '@/dynamic-components/template8/components/DepositOptions/DepositBankTab';
import DepositCryptoTab from '@/dynamic-components/template8/components/DepositOptions/DepositCryptoTab';
import DepositDebitTab from '@/dynamic-components/template8/components/DepositOptions/DepositDebitTab';
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
            className="flex items-center justify-center rounded-[4px] bg-[#2DFA1A] px-8 py-2 font-semibold text-black transition-all duration-300 hover:bg-[#2DFA1A]"
          >
            {t('back')}
          </button>
        </div>

        {/* Deposit  */}
        <div className="rounded-[5px] border border-[#2DFA1A4D] bg-[#0A1414] p-3 md:p-4 lg:p-6">
          <div className="mb-2 flex flex-col items-center md:flex-row md:justify-between">
            <h2 className="font-bring-race w-full text-center text-[25px] text-white md:w-auto md:text-left md:text-[36px]">
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
                    className={`group relative inline-flex items-center justify-center border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[3px] before:border before:transition-all before:duration-300 md:px-10 md:py-[6px] md:text-[16px] ${
                      activeTab === tab.key
                        ? 'text-black before:border-[#2DFA1A4D] before:bg-[#2DFA1A] before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]'
                        : 'text-[white] before:border-[#2DFA1A4D] before:bg-[#060D0D] hover:text-white hover:before:bg-[#2DFA1A] hover:before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]'
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
                className="relative flex w-full items-center justify-between border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-[#2DFA1A] uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[3px] before:border before:border-[#2DFA1A4D] before:bg-[#060D0D] before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
              >
                <span className="relative z-10">{activeLabel}</span>

                {/* Arrow Icon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="11"
                  height="7"
                  viewBox="0 0 11 7"
                  fill="none"
                  className={`relative z-10 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                >
                  <path
                    d="M4.37883 5.79289L0.293044 1.70711C-0.336921 1.07714 0.109246 0 1.00015 0H9.17172C10.0626 0 10.5088 1.07714 9.87883 1.70711L5.79304 5.79289C5.40252 6.18342 4.76935 6.18342 4.37883 5.79289Z"
                    fill="white"
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
                        className="group relative inline-flex items-center justify-center border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-[white] uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[3px] before:border before:border-[#2DFA1A4D] before:bg-[#060D0D] before:transition-all before:duration-300 hover:text-[#2DFA1A] hover:before:bg-[#2DFA1A] hover:before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
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
