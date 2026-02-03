'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';
import {
  clearPreviouslySelectedTab,
  closeModal,
} from '@/slices/common/commonSlice';

import CouponsTab from './CouponsTab';
import DepositTab from './DepositTab';
import ExchangeTab from './ExchangeTab';
import PointsTab from './PointsTab';
import WithdrawalTab from './WithdrawalTab';

export default function Transaction({ defaultTab }) {
  const { t } = useTranslations();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const previouslySelectedTab = useSelector(
    (state) => state.common.previouslySelectedTab,
  );

  const validTabs = ['deposit', 'withdrawal', 'exchange', 'points', 'coupons'];
  const initialTab = validTabs.includes(defaultTab) ? defaultTab : 'deposit';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [isOpen, setIsOpen] = useState(false);

  const tabs = [
    { key: 'deposit', label: t('deposit') },
    { key: 'withdrawal', label: t('withdrawal') },
    { key: 'exchange', label: t('convert_to_game_wallet') },
    { key: 'points', label: t('points') },
    { key: 'coupons', label: t('coupons') },
  ];

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label || '';

  useEffect(() => {
    if (defaultTab && validTabs.includes(defaultTab)) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    if (
      previouslySelectedTab === 'Points' ||
      previouslySelectedTab === 'Coupons'
    ) {
      setActiveTab('exchange');
    }
  }, [previouslySelectedTab]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  return (
    <div
      className="relative mx-auto max-h-[90vh] w-full max-w-[1479px] transform overflow-y-auto rounded-[7px] border border-[rgba(6,214,160,0.3)] text-white shadow-xl transition-all duration-300 ease-out"
      style={{
        backgroundImage:
          "url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/login-bg-19.webp')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="transaction-modal relative mx-auto flex h-[80vh] w-full flex-col overflow-hidden rounded-[7px] bg-transparent">
        <div className="flex min-h-0 flex-1 flex-col space-y-4 bg-transparent p-4 md:space-y-6 md:p-6 lg:p-8">
          <div className="relative mt-2 mb-[10px] overflow-visible">
            <div className="p-[1px]">
              <div className="relative flex items-center justify-end px-3 py-2 md:justify-between">
                {/* LEFT TABS */}
                <div className="hidden flex-wrap items-center gap-3 md:flex md:gap-5">
                  {tabs.map((tab) => {
                    const isConvert = tab.key === 'exchange';

                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`${isConvert ? 'min-w-[454px]' : 'min-w-[200px]'} rounded-[5px] px-6 py-3.5 text-[14px] font-semibold transition-all duration-200 ${
                        activeTab === tab.key
                          ? 'border border-[#06D6A0] bg-[#14213D] text-white'
                          : 'border border-[rgba(6,214,160,0.3)] text-[#CCCCCC] hover:border-[#06D6A0]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* CLOSE BUTTON */}
                <button
                  onClick={handleCloseModal}
                  aria-label={t('close')}
                  className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-transparent transition-all hover:scale-110"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 43 43"
                    fill="none"
                    className="stroke-[rgba(6,214,160,0.3)]"
                  >
                    <path
                      d="M1.41406 32.2714L12.8426 20.8428L2.55692 10.5571L11.6998 1.41422L21.9855 11.6999L32.2712 1.41422L41.4141 10.5571L31.1283 20.8428L41.4141 31.1285L32.2712 40.2714L21.9855 29.9856L10.5569 41.4142L1.41406 32.2714Z"
                      strokeWidth="2"
                    />
                  </svg>
                </button>
              </div>
              {/* MOBILE DROPDOWN */}
              <div className="mt-3 w-full rounded-[6px] p-[4px] md:hidden">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="relative flex w-full items-center justify-between border-0 px-6 py-2 text-[13px] font-normal tracking-wide text-white/70 uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[5px] before:border before:border-[#06D6A0] before:bg-[#14213D]"
                >
                  <span className="relative z-10">{activeLabel}</span>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="9"
                    viewBox="0 0 16 9"
                    fill="none"
                    className={`relative z-10 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'
                    }`}
                  >
                    <path
                      d="M3.87883 5.29289L0.293044 1.70711C-0.336921 1.07714 0.109246 0 1.00015 0H8.17172C9.06263 0 9.50879 1.07714 8.87883 1.70711L5.29304 5.29289C4.90252 5.68342 4.26935 5.68342 3.87883 5.29289Z"
                      fill="#06D6A0"
                    />
                  </svg>
                </button>

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
                          className="group relative inline-flex items-center justify-center border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-white uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[5px] before:border before:border-[rgba(6,214,160,0.3)] before:bg-[#14213D] before:transition-all before:duration-300 hover:before:border-[#06D6A0]"
                        >
                          <span className="relative z-10">{tab.label}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Box */}
          <div className="scrollbar-hide mt-3 min-h-0 flex-1 overflow-y-auto rounded-[7px] border border-[rgba(6,214,160,0.3)] bg-transparent p-3 md:p-4 lg:p-4">
            <div className="space-y-4 md:space-y-6">
              {activeTab === 'deposit' && <DepositTab />}
              {activeTab === 'withdrawal' && <WithdrawalTab />}
              {activeTab === 'exchange' && <ExchangeTab />}
              {activeTab === 'points' && <PointsTab />}
              {activeTab === 'coupons' && <CouponsTab />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
