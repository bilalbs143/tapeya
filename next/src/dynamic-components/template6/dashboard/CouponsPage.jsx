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
        <div className="rounded-[5px] border border-[#FB63214D] p-3 md:p-4 lg:p-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-[20px] font-bold text-[white] sm:text-[30px]">
              {t('points_and_coupons')}
            </h2>
          </div>
          <div className="space-y-4">
            {/* Tabs header */}
            <div className="rounded-[5px] border border-[#FB63214D] p-[1px]">
              <div className="rounded-[5px] bg-transparent p-3">
                <div className="flex flex-wrap gap-1 md:gap-10">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex-1 rounded-[4px] border border-[#FB63214D] px-4 py-2 text-[13px] font-bold whitespace-nowrap transition-all duration-300 md:flex-none md:border-0 md:px-8 md:py-3 md:text-[16px] ${
                        activeTab === tab.key
                          ? 'bg-[#D61324] text-white shadow-[inset_0_4.402px_26.412px_0_#E70011]'
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
