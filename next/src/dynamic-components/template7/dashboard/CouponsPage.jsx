'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

import ConvertPointsCouponsTab from '../modals/transaction/ConvertPointsCouponsTab';
import CouponsTab from '../modals/transaction/CouponsTab';
import PointsTab from '../modals/transaction/PointsTab';

export default function CouponsPage() {
  const { t } = useTranslations();
  const router = useRouter();

  const tabs = [
    { key: 'convert', label: t('convert_points_coupons') },
    { key: 'points', label: t('points') },
    { key: 'coupons', label: t('coupons') },
  ];

  const [activeTab, setActiveTab] = useState('convert');
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => {
    router.push('/');
  };

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label;

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 font-[Orbitron] text-white">
      {/* Mobile Back Button */}
      <div className="mb-4 flex items-center justify-center sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('back')}
          className="angled-button angled-button-blue flex h-[35px] w-[120px] w-full items-center justify-center font-extrabold text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
          data-hover={t('back')}
        >
          <div className="angled-button-inner">
            <span className="angled-button-text">{t('back')}</span>
          </div>
        </button>
      </div>

      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#3E1D88] bg-[linear-gradient(90deg,rgba(41,18,135,0.40)_0.48%,rgba(87,61,193,0.40)_49.87%,rgba(41,18,135,0.40)_96.31%)] p-3 md:p-4 lg:p-6">
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <h2 className="font-bring-race w-full text-center text-[25px] text-white md:w-auto md:text-left md:text-[40px]">
              {t('points_and_coupons')}
            </h2>

            {/* Tabs Header */}
            <div className="mt-3 hidden rounded-[6px] p-0 md:mt-0 md:block md:p-[4px]">
              <div className="flex flex-wrap gap-2 md:gap-4">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`group relative inline-flex items-center justify-center border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide uppercase transition-all duration-300 before:absolute before:inset-0 before:-skew-x-[10deg] before:rounded-[3px] before:border before:transition-all before:duration-300 md:px-4 md:py-[8px] md:text-[16px] ${
                      activeTab === tab.key
                        ? 'text-white before:border-[#3E1D88] before:bg-[#3E1D88] before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]'
                        : 'text-[#544591] before:border-[#3E1D88] before:bg-[rgba(51,19,105,0.7)] hover:text-white hover:before:bg-[#331369] hover:before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]'
                    }`}
                  >
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Dropdown Tabs */}
            <div className="mt-3 w-full rounded-[6px] p-[4px] md:hidden">
              {/* Main Button showing current selection */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex w-full items-center justify-between border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-white uppercase transition-all duration-300 before:absolute before:inset-0 before:-skew-x-[10deg] before:rounded-[3px] before:border before:border-[#3E1D88] before:bg-[#3E1D88] before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
              >
                <span className="relative">{activeLabel}</span>

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
                        className="group relative inline-flex items-center justify-center border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-[#544591] uppercase transition-all duration-300 before:absolute before:inset-0 before:-skew-x-[10deg] before:rounded-[3px] before:border before:border-[#3E1D88] before:bg-[rgba(51,19,105,0.7)] before:transition-all before:duration-300 hover:text-white hover:before:bg-[#331369] hover:before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
                      >
                        <span className="relative">{tab.label}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-4">
            <div className="rounded-[5px] border border-[#3E1D88] bg-[#331369] p-3 md:p-4 lg:p-6">
              <div className="space-y-4 md:space-y-6">
                {activeTab === 'convert' && <ConvertPointsCouponsTab />}
                {activeTab === 'points' && <PointsTab />}
                {activeTab === 'coupons' && <CouponsTab />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
