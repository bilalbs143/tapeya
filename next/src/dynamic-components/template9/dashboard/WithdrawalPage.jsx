'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import WithdrawalBankTab from '@/dynamic-components/template9/components/WithdrawalOptions/WithdrawalBankTab.jsx';
import WithdrawalCryptoTab from '@/dynamic-components/template9/components/WithdrawalOptions/WithdrawalCryptoTab.jsx';
import { useTranslations } from '@/hooks/useTranslations';

import WithdrawalTab from '../modals/transaction/WithdrawalTab';

export default function WithdrawalPage() {
  const { t } = useTranslations();
  const router = useRouter();

  const handleClose = () => {
    router.push('/');
  };

  const tabs = [
    { key: 'bankTransfer', label: t('withdrawal_via_bank_transfer') },
    { key: 'crypto', label: t('withdrawal_via_crypto_currencies') },
  ];

  const [activeTab, setActiveTab] = useState('bankTransfer');
  const [isOpen, setIsOpen] = useState(false);

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label || '';

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 text-white">
      {/* Mobile Back Button */}
      <div className="mb-4 flex items-center justify-start sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('back')}
          className="flex items-center justify-center rounded-[4px] bg-[#9D4EDD] px-8 py-2.5 font-normal text-white transition-all duration-300 hover:bg-[#2DFA1A]"
        >
          {t('back')}
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#DBB42C4D] bg-[#1D0032] px-4 py-3 md:px-6 md:py-6">
          {/* Header */}
          <div>
            <div className="rounded-[5px] bg-transparent" />
            <div className="mb-2 flex flex-col items-center md:flex-row md:justify-between">
              <h2 className="font-cravend w-full text-center text-[25px] text-white md:w-auto md:text-left md:text-[35px]">
                {t('withdrawal')}
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
                          ? 'text-white before:border-[#DBB42C4D] before:bg-[#9D4EDD] before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]'
                          : 'text-[white] before:border-[#DBB42C4D] before:bg-[#060D0D] hover:text-white hover:before:bg-[#9D4EDD] hover:before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]'
                      }`}
                    >
                      <span className="relative">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Dropdown Tabs */}
              <div className="mt-3 w-full rounded-[6px] p-[4px] md:hidden">
                {/* Main Button showing current selection */}
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="relative flex w-full items-center justify-between border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-[#DBB42C] uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[3px] before:border before:border-[#DBB42C4D] before:bg-transparent before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
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
                      stroke="#DBB42C"
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
                          className="group relative inline-flex items-center justify-center border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-[white] uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[3px] before:border before:border-[#DBB42C4D] before:bg-transparent before:transition-all before:duration-300 hover:text-[#2DFA1A] hover:before:bg-[#2DFA1A] hover:before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
                        >
                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Withdrawal Section */}
          {activeTab === 'bankTransfer' ? (
            <WithdrawalBankTab />
          ) : (
            <WithdrawalCryptoTab />
          )}
        </div>
      </div>
    </div>
  );
}
