'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import DepositHistory from '@/dynamic-components/template16/components/DepositOptions/DepositHistory';
import WithdrawalHistory from '@/dynamic-components/template16/components/WithdrawalOptions/WithdrawalHistory';
import CouponsTab from '@/dynamic-components/template16/modals/transaction/CouponsTab';
import PointsTab from '@/dynamic-components/template16/modals/transaction/PointsTab';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';

export default function TransactionPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const { user, userLoader } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('deposit');

  // Get wallet data from user
  const walletInfo = user?.wallet || {};
  const holdingMoney = walletInfo.holding_money || 0;
  const points = walletInfo.points || 0;
  const couponPoints = walletInfo.coupon_points || 0;

  const handleWithdraw = () => {
    router.push('/dashboard/withdrawal');
  };

  const handleDeposit = () => {
    router.push('/dashboard/deposit');
  };

  const handleInquiry = () => {
    router.push('/dashboard/customer-inquiry');
  };

  const handleCoupons = () => {
    router.push('/dashboard/coupons');
  };

  const handlePoints = () => {
    router.push('/dashboard/points');
  };

  const handleExchange = () => {
    router.push('/dashboard/exchange');
  };

  return (
    <div className="w-full py-6 text-white md:py-12">
      {/* Transaction Section - Full Width */}
      <div className="w-full border-t border-b border-[rgba(232,210,94,0.30)] bg-[#e8d25e4a] px-3 pt-6 pb-6 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
          {/* Left Side - Title and Statistics */}
          <div className="flex flex-col gap-2 md:gap-3">
            <h1 className="text-xl font-bold text-white uppercase sm:text-2xl md:text-3xl lg:text-4xl">
              {t('balance') || 'BALANCE'}
            </h1>
            {/* Statistics - Compact Flex Layout */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              {/* Deposit Game */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold text-white sm:text-sm md:text-base">
                  {t('game_wallet') || 'Deposit Game'} :
                </span>
                <span className="text-sm font-semibold text-[#E8D25E] sm:text-base md:text-lg">
                  {userLoader ? (
                    <CommonLoader size="sm" border="border-[#E8D25E]" />
                  ) : (
                    formatCurrency(holdingMoney)
                  )}
                </span>
              </div>

              {/* Points */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold text-white sm:text-sm md:text-base">
                  {t('points') || 'Points'} :
                </span>
                <span className="text-sm font-semibold text-[#E8D25E] sm:text-base md:text-lg">
                  {userLoader ? (
                    <CommonLoader size="sm" border="border-[#E8D25E]" />
                  ) : (
                    formatPoints(points)
                  )}
                </span>
              </div>

              {/* Coupon Points */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-xs font-semibold text-white sm:text-sm md:text-base">
                  {t('coupon_points') || 'Coupon Points'} :
                </span>
                <span className="text-sm font-semibold text-[#E8D25E] sm:text-base md:text-lg">
                  {userLoader ? (
                    <CommonLoader size="sm" border="border-[#E8D25E]" />
                  ) : (
                    formatPoints(couponPoints)
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Right Side - Transaction Text and Buttons */}
          <div className="flex flex-col items-start gap-3 sm:items-end sm:gap-4">
            {/* Transaction Text */}
            <span className="text-sm font-semibold text-[#E8D25E] sm:text-base md:text-lg lg:text-xl">
              {t('transaction') || 'TRANSACTION'}
            </span>

            {/* Action Buttons */}
            <div className="grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto sm:grid-cols-none sm:flex-row sm:gap-4 md:gap-6">
              {/* Withdraw Button */}
              <button
                type="button"
                onClick={handleWithdraw}
                className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800] active:scale-95 sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="19"
                  viewBox="0 0 18 19"
                  fill="none"
                  className="sm:h-5 sm:w-5"
                >
                  <path
                    d="M0.542969 10.751C0.542969 7.57793 0.542969 5.991 1.52912 5.00569C2.51528 4.02037 4.10137 4.01953 7.2744 4.01953H10.6401C13.8131 4.01953 15.4001 4.01953 16.3854 5.00569C17.3707 5.99184 17.3715 7.57793 17.3715 10.751C17.3715 13.924 17.3715 15.5109 16.3854 16.4962C15.3992 17.4815 13.8131 17.4824 10.6401 17.4824H7.2744C4.10137 17.4824 2.51444 17.4824 1.52912 16.4962C0.54381 15.5101 0.542969 13.924 0.542969 10.751Z"
                    stroke="#090A0B"
                    strokeWidth="1.08571"
                  />
                  <circle
                    cx="9.22873"
                    cy="4.88571"
                    r="4.61429"
                    fill="black"
                    stroke="#090A0B"
                    strokeWidth="0.542857"
                  />
                  <path
                    d="M8.82162 7.32861C8.82162 7.55347 9.0039 7.73576 9.22876 7.73576C9.45362 7.73576 9.6359 7.55347 9.6359 7.32861H9.22876H8.82162ZM9.51665 2.15501C9.35765 1.99601 9.09987 1.99601 8.94087 2.15501L6.34982 4.74605C6.19083 4.90505 6.19083 5.16283 6.34982 5.32183C6.50882 5.48083 6.76661 5.48083 6.92561 5.32183L9.22876 3.01869L11.5319 5.32183C11.6909 5.48083 11.9487 5.48083 12.1077 5.32183C12.2667 5.16283 12.2667 4.90505 12.1077 4.74605L9.51665 2.15501ZM9.22876 7.32861H9.6359V2.4429H9.22876H8.82162V7.32861H9.22876Z"
                    fill="#E8D25E"
                  />
                </svg>
                <span>{t('withdraw') || 'Withdraw'}</span>
              </button>

              {/* Deposit Button */}
              <button
                type="button"
                onClick={handleDeposit}
                className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800] active:scale-95 sm:w-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="19"
                  viewBox="0 0 18 19"
                  fill="none"
                  className="sm:h-5 sm:w-5"
                >
                  <path
                    d="M0.542969 10.751C0.542969 7.57793 0.542969 5.991 1.52912 5.00569C2.51528 4.02037 4.10137 4.01953 7.2744 4.01953H10.6401C13.8131 4.01953 15.4001 4.01953 16.3854 5.00569C17.3707 5.99184 17.3715 7.57793 17.3715 10.751C17.3715 13.924 17.3715 15.5109 16.3854 16.4962C15.3992 17.4815 13.8131 17.4824 10.6401 17.4824H7.2744C4.10137 17.4824 2.51444 17.4824 1.52912 16.4962C0.54381 15.5101 0.542969 13.924 0.542969 10.751Z"
                    stroke="#090A0B"
                    strokeWidth="1.08571"
                  />
                  <circle
                    cx="9.22873"
                    cy="4.88571"
                    r="4.61429"
                    fill="black"
                    stroke="#090A0B"
                    strokeWidth="0.542857"
                  />
                  <path
                    d="M9.6359 2.44287C9.6359 2.21801 9.45362 2.03573 9.22876 2.03573C9.0039 2.03573 8.82162 2.21801 8.82162 2.44287H9.22876H9.6359ZM8.94087 7.61648C9.09987 7.77548 9.35765 7.77548 9.51665 7.61648L12.1077 5.02544C12.2667 4.86644 12.2667 4.60865 12.1077 4.44965C11.9487 4.29065 11.6909 4.29065 11.5319 4.44965L9.22876 6.7528L6.92561 4.44965C6.76661 4.29065 6.50882 4.29065 6.34982 4.44965C6.19083 4.60865 6.19083 4.86644 6.34982 5.02544L8.94087 7.61648ZM9.22876 2.44287H8.82162V7.32859H9.22876H9.6359V2.44287H9.22876Z"
                    fill="#E8D25E"
                  />
                </svg>
                <span>{t('deposit') || 'Deposit'}</span>
              </button>

              {/* Inquiry Button */}
              <button
                type="button"
                onClick={handleInquiry}
                className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800] active:scale-95 sm:w-auto"
              >
                <span>{t('inquiry') || 'Inquiry'}</span>
              </button>

              {/* Coupons Button */}
              <button
                type="button"
                onClick={handleCoupons}
                className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800] active:scale-95 sm:w-auto"
              >
                <span>{t('coupons') || 'Coupons'}</span>
              </button>

              {/* Points Button */}
              <button
                type="button"
                onClick={handlePoints}
                className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800] active:scale-95 sm:w-auto"
              >
                <span>{t('points') || 'Points'}</span>
              </button>

              {/* Convert Button */}
              <button
                type="button"
                onClick={handleExchange}
                className="group flex w-full cursor-pointer items-center justify-center gap-3 rounded-[10px] bg-[#E8D25E] px-3 pt-2 pb-3 text-base font-semibold text-black [box-shadow:inset_0_-6px_0_#876800] transition-all duration-200 hover:pb-2 hover:[box-shadow:0_0_10px_0_#876800_inset,0_0_20px_2px_#876800] hover:outline hover:outline-2 hover:outline-[#876800] active:scale-95 sm:w-auto"
              >
                <span>{t('convert_points_coupons') || 'Convert'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="w-full border-t border-[rgba(232,210,94,0.30)] bg-[#111] px-3 pt-6 pb-6 md:px-6">
        {/* Top Bar: Heading and Tabs */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Left Side - Heading */}
          <h2 className="text-xl font-bold text-white uppercase sm:text-2xl md:text-3xl">
            {t('transaction_history') || 'TRANSACTION HISTORY'}
          </h2>

          {/* Right Side - Tab Links */}
          <div className="flex flex-wrap items-center gap-6 md:gap-10">
            {[
              { key: 'deposit', label: t('deposit') || 'Deposit' },
              { key: 'withdrawal', label: t('withdrawal') || 'Withdrawal' },
              { key: 'points', label: t('points') || 'Points' },
              { key: 'coupons', label: t('coupons') || 'Coupons' },
            ].map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative pb-1 text-lg font-extrabold transition-colors duration-200 md:text-xl ${
                    isActive
                      ? 'text-[#E8D25E]'
                      : 'text-[#6A6A6A] hover:text-[#E8D25E]'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-[#E8D25E]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full">
          {activeTab === 'deposit' && <DepositHistory />}
          {activeTab === 'withdrawal' && <WithdrawalHistory />}
          {activeTab === 'points' && <PointsTab />}
          {activeTab === 'coupons' && <CouponsTab />}
        </div>
      </div>
    </div>
  );
}
