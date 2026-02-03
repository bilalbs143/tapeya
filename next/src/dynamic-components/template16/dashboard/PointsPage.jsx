'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';

import PointsTab from '../modals/transaction/PointsTab';

export default function PointsPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const { user, userLoader } = useSelector((state) => state.auth);

  const handleBack = () => {
    router.push('/transaction');
  };

  // Get wallet data from user
  const walletInfo = user?.wallet || {};
  const holdingMoney = walletInfo.holding_money || 0;
  const points = walletInfo.points || 0;
  const couponPoints = walletInfo.coupon_points || 0;

  return (
    <div className="container mx-auto px-4 py-8 text-white md:px-0">
      <div className="relative flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6">
        <div className="flex min-h-0 flex-1 flex-col space-y-4 rounded-[12px] md:space-y-6">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handleBack}
              aria-label={t('back')}
              className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md bg-[#E8D25E] px-2 text-black transition-all duration-300 hover:bg-[#D4C04F] sm:h-[33px] sm:w-auto sm:px-3"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="transition-all duration-300 group-hover:-translate-x-1 sm:h-5 sm:w-5"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="#0B0B0B"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="hidden text-sm font-semibold sm:inline-block">
                {t('back')}
              </span>
            </button>
            <h2 className="flex-1 text-[20px] font-semibold text-white sm:text-[26px] md:text-[30px]">
              {t('points')}
            </h2>
          </div>

          {/* Scrollable content area */}
          <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
            {/* Inner container with border */}
            <div className="space-y-4 md:space-y-6">
              {/* Wallet Summary Section - Removed */}

              {/* Tab content */}
              <div className="space-y-4 md:space-y-6">
                <PointsTab />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
