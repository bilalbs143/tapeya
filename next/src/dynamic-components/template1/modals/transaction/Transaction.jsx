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

// Tabs handle their own data fetching; no fetches here
import CouponsTab from './CouponsTab';
import DepositTab from './DepositTab';
import ExchangeTab from './ExchangeTab';
import PointsTab from './PointsTab';
import WithdrawalTab from './WithdrawalTab';

export default function Transaction({ defaultTab }) {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const { user, userLoader } = useSelector((state) => state.auth);
  const previouslySelectedTab = useSelector(
    (state) => state.common.previouslySelectedTab,
  );
  const {
    transactionRequestLoader,
    requestInfoLoader,
    requestInfoData,
    transactionHistoryLoader,
    transactionHistoryData,
  } = useSelector((state) => state.website);

  const validTabs = ['deposit', 'withdrawal', 'exchange', 'points', 'coupons'];
  const initialTab = validTabs.includes(defaultTab) ? defaultTab : 'deposit';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Handle defaultTab prop changes
  useEffect(() => {
    if (defaultTab && validTabs.includes(defaultTab)) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

  // All data fetching is handled inside each tab component

  // If user clicked convert from Points/Coupons tabs, switch to exchange
  useEffect(() => {
    if (
      previouslySelectedTab === 'Points' ||
      previouslySelectedTab === 'Coupons'
    ) {
      setActiveTab('exchange');
    }
  }, [previouslySelectedTab, dispatch]);

  // Get wallet data from user
  const walletInfo = user?.wallet || {};
  const holdingMoney = walletInfo.holding_money || 0;
  const points = walletInfo.points || 0;
  const couponPoints = walletInfo.coupon_points || 0;

  // No pagination managed here; tabs own their own pagination state

  return (
    <div className="transaction-modal relative mx-auto flex h-[80vh] w-full flex-col overflow-hidden rounded-[16px] bg-[#312577] p-4 text-white shadow-xl md:rounded-[24px] md:p-6 lg:p-8">
      <div className="flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCloseModal}
            aria-label="Close"
            className="btn-hover-outline group flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border border-[#FC7E09] bg-transparent leading-none font-bold text-[2xl] text-white sm:h-7 sm:w-7"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs header - At the top of the border */}
        <div className="mt-10 mb-[10px] flex flex-wrap gap-1 md:mt-6 md:gap-2">
          {[
            { key: 'deposit', label: t('deposit') },
            { key: 'withdrawal', label: t('withdrawal') },
            { key: 'exchange', label: t('convert_to_game_wallet') },
            { key: 'points', label: t('points') },
            { key: 'coupons', label: t('coupons') },
          ].map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 cursor-pointer rounded-[4px] border border-[#5343B1] px-3 py-2 text-[12px] font-bold whitespace-nowrap transition-all duration-300 md:px-6 md:text-[14px] lg:px-8 lg:text-[16px] ${
                activeTab === t.key
                  ? 'bg-[#FC7E09] text-white'
                  : 'bg-[#241866] text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Wrapper: allow scroll for Deposit/Withdrawal; others manage their own scroll */}
        <div
          className={`scrollbar-hide min-h-0 flex-1 rounded-[3px] border-2 border-[#452FCD] ${
            activeTab === 'deposit' || activeTab === 'withdrawal'
              ? 'overflow-y-auto'
              : 'overflow-hidden'
          }`}
        >
          <div className="flex h-full min-h-0 flex-col space-y-4 p-3 md:space-y-6 md:p-4 lg:p-6">
            {/* Wallet Summary Section - Always visible */}
            <div className="rounded-[6px] border-2 border-[#452FCD] p-2 md:p-3">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {/* Game Wallet */}
                <div className="rounded-[12px] border border-[#5343B1] bg-[#241866]/90 p-2 shadow-[0_0_0_1px_rgba(83,67,177,0.35)_inset]">
                  <div className="flex items-center justify-center gap-3 rounded-[8px] bg-[#241866] px-3 py-2 md:px-4 md:py-3">
                    <span className="text-[12px] font-semibold text-white md:text-[15px]">
                      {t('game_wallet')}
                    </span>
                    <span className="mx-3 inline-block h-3 w-px bg-[#5343B1] md:h-4" />
                    <span className="text-center text-[16px] leading-none font-semibold text-[#FC7E09] md:text-[18px]">
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-[#FC7E09]" />
                      ) : (
                        formatCurrency(holdingMoney)
                      )}
                    </span>
                  </div>
                </div>

                {/* Points */}
                <div className="rounded-[12px] border border-[#5343B1] bg-[#241866]/90 p-2 shadow-[0_0_0_1px_rgba(83,67,177,0.35)_inset]">
                  <div className="flex items-center justify-center gap-3 rounded-[8px] bg-[#241866] px-3 py-2 md:px-4 md:py-3">
                    <span className="text-[12px] font-semibold text-white md:text-[15px]">
                      {t('points')}
                    </span>
                    <span className="mx-3 inline-block h-3 w-px bg-[#5343B1] md:h-4" />
                    <span className="text-center text-[16px] leading-none font-semibold text-[#FC7E09] md:text-[18px]">
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-[#FC7E09]" />
                      ) : (
                        formatPoints(points)
                      )}
                    </span>
                  </div>
                </div>

                {/* Coupon Points */}
                <div className="rounded-[12px] border border-[#5343B1] bg-[#241866]/90 p-2 shadow-[0_0_0_1px_rgba(83,67,177,0.35)_inset]">
                  <div className="flex items-center justify-center gap-3 rounded-[8px] bg-[#241866] px-3 py-2 md:px-4 md:py-3">
                    <span className="text-[12px] font-semibold text-white md:text-[15px]">
                      {t('coupon_points')}
                    </span>
                    <span className="mx-3 inline-block h-3 w-px bg-[#5343B1] md:h-4" />
                    <span className="text-center text-[16px] leading-none font-semibold text-[#FC7E09] md:text-[18px]">
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-[#FC7E09]" />
                      ) : (
                        formatPoints(couponPoints)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab content */}
            <div className="flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6">
              {(() => {
                switch (activeTab) {
                  case 'deposit':
                    return <DepositTab />;
                  case 'withdrawal':
                    return <WithdrawalTab />;
                  case 'exchange':
                    return <ExchangeTab />;
                  case 'points':
                    return <PointsTab />;
                  case 'coupons':
                    return <CouponsTab />;
                  default:
                    return <DepositTab />;
                }
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
