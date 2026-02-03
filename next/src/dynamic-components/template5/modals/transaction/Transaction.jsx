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
    <div className="transaction-modal relative mx-auto flex h-[80vh] w-full flex-col overflow-hidden rounded-[5px] border-2 border-[#03C72C4D] bg-[#060D0D] text-white shadow-xl">
      <div className="flex min-h-0 flex-1 flex-col space-y-4 p-4 md:space-y-6 md:p-6 lg:p-8">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCloseModal}
            aria-label={t('close')}
            className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md bg-[#55BC55] text-black transition-all duration-300 sm:h-[33px] sm:w-[33px]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="#0B0B0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs header */}
        <div className="relative mt-10 mb-[10px] overflow-visible rounded-[10px] bg-[#55BC55] p-[1px] md:mt-10">
          {/* Left Icon */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
            alt=""
            className="absolute -top-2 left-[-25px] h-[55px] w-[40px] sm:-top-3 sm:h-[70px] sm:w-[50px] md:-top-4 md:h-[83px] md:w-[59px]"
          />

          {/* Right Icon */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
            alt=""
            className="absolute top-auto right-[-25px] -bottom-3 h-[55px] w-[40px] sm:-top-3 sm:h-[70px] sm:w-[50px] md:top-[-16px] md:h-[83px] md:w-[59px]"
          />
          <div className="rounded-[10px] bg-[#060D0D] p-3 px-[25px] md:bg-[#0A1818] md:p-0 md:px-[66px]">
            <div className="flex flex-wrap justify-center gap-2 py-2 md:gap-2 md:py-0">
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
                  className={`flex-1 rounded-[2px] border border-[#03c72c4d] px-3 py-2 text-[12px] font-bold whitespace-nowrap transition-all duration-300 md:rounded-[0] md:border-0 md:px-6 md:py-4 md:text-[16px] lg:px-8 lg:text-[16px] ${activeTab === t.key ? 'bg-[#55BC55] text-white' : 'text-white'}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content area to keep modal height consistent */}
        <div className="scrollbar-hide mt-3 min-h-0 flex-1 overflow-y-auto rounded-[10px] border border-[#00374A] p-3 md:p-4 lg:p-6">
          {/* Inner container with border */}
          <div className="space-y-4 md:space-y-6">
            {/* Wallet Summary Section - Always visible */}
            <div className="rounded-[10px] border border-[#FFFFFF66] p-2 md:p-3">
              <div className="flex flex-col gap-0 md:flex-row md:items-center md:justify-between md:gap-0">
                {/* Game Wallet */}
                <div className="p-1">
                  <div className="flex items-center justify-center gap-2 px-2 py-1 md:gap-3 md:px-4 md:py-3">
                    <span className="text-[12px] font-semibold text-white md:text-[15px]">
                      {t('game_wallet')} :
                    </span>
                    <span className="text-center text-[16px] leading-none font-semibold text-white md:text-[18px]">
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-white" />
                      ) : (
                        formatCurrency(holdingMoney)
                      )}
                    </span>
                  </div>
                </div>
                <span className="my-1 block h-px w-full bg-[#FFFFFF66] md:hidden" />
                <span className="mx-3 hidden h-3 w-px bg-[#FFFFFF66] md:inline-block md:h-4" />

                {/* Points */}
                <div className="p-1">
                  <div className="flex items-center justify-center gap-2 px-2 py-1 md:gap-3 md:px-4 md:py-3">
                    <span className="text-[12px] font-semibold text-white md:text-[15px]">
                      {t('points')} :
                    </span>
                    <span className="text-center text-[16px] leading-none font-semibold text-white md:text-[18px]">
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-white" />
                      ) : (
                        formatPoints(points)
                      )}
                    </span>
                  </div>
                </div>
                <span className="my-1 block h-px w-full bg-[#FFFFFF66] md:hidden" />
                <span className="mx-3 hidden h-3 w-px bg-[#FFFFFF66] md:inline-block md:h-4" />

                {/* Coupon Points */}
                <div className="p-1">
                  <div className="flex items-center justify-center gap-2 px-2 py-1 md:gap-3 md:px-4 md:py-3">
                    <span className="text-[12px] font-semibold text-white md:text-[15px]">
                      {t('coupon_points')} :
                    </span>

                    <span className="text-center text-[16px] leading-none font-semibold text-white md:text-[18px]">
                      {userLoader ? (
                        <CommonLoader size="sm" border="border-white" />
                      ) : (
                        formatPoints(couponPoints)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab content */}
            <div className="space-y-4 md:space-y-6">
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
