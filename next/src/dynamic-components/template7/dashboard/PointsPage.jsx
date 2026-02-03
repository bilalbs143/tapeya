'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

import ConvertPointsCouponsTab from '../modals/transaction/ConvertPointsCouponsTab';
import CouponsTab from '../modals/transaction/CouponsTab';
import PointsTab from '../modals/transaction/PointsTab';

export default function PointsPage() {
  const { t } = useTranslations();
  const router = useRouter();

  // Example tabs — you can rename/translate as needed
  const tabs = [
    { key: 'convert', label: t('convert_points_coupons') },
    { key: 'points', label: t('points') },
    { key: 'coupons', label: t('coupons') },
  ];

  const [activeTab, setActiveTab] = useState('points');

  const handleClose = () => {
    router.push('/');
  };

  return (
    <div className="max-w-9xl mx-auto w-full px-4 py-8 text-white">
      <div className="mb-4 flex items-center justify-start sm:hidden">
        <button
          onClick={handleClose}
          aria-label={t('back')}
          className="flex items-center justify-center rounded-[4px] bg-[#D61324] px-8 py-2 font-extrabold text-white transition-all duration-300 hover:bg-[#D61324]"
        >
          {t('back')}
        </button>
      </div>
      <div className="space-y-6">
        <div className="rounded-[5px] border border-[#FB63214D] px-4 py-3 md:px-6 md:py-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[white] sm:text-[30px]">
              {t('Points & Coupons')}
            </h2>
          </div>
          {/*  Tabs Header Section */}
          <div className="space-y-4">
            {/* Tabs header */}
            <div className="mt-4 mb-[10px] rounded-[5px] border border-[#FB63214D] p-[1px] md:mt-4">
              <div className="rounded-[5px] bg-transparent p-3">
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 rounded-[4px] border border-[#FB63214D] px-3 py-2 text-[12px] font-bold whitespace-nowrap text-white transition-all duration-300 md:flex-none md:border-0 md:px-6 md:py-3 md:text-[14px] ${
                        activeTab === tab.key
                          ? 'bg-[#D61324] text-white'
                          : 'text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab content */}
            <div className="rounded-[5px] border border-[#FB63214D] p-3 md:p-4 lg:p-6">
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
