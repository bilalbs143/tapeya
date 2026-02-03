'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';

import WithdrawalTab from '../modals/transaction/WithdrawalTab';

export default function WithdrawalPage({ embedded = false }) {
  const { t } = useTranslations();
  const router = useRouter();
  const { user, userLoader } = useSelector((state) => state.auth);

  const handleBack = () => {
    if (embedded) return;
    router.push('/dashboard/home');
  };

  // Get wallet data from user
  const walletInfo = user?.wallet || {};
  const holdingMoney = walletInfo.holding_money || 0;
  const points = walletInfo.points || 0;
  const couponPoints = walletInfo.coupon_points || 0;

  const content = (
    <div className="container mx-auto px-4 py-8 text-white md:px-0">
      <div className="relative flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6">
        <div className="flex min-h-0 flex-1 flex-col space-y-4 rounded-[12px] md:space-y-6">
          {/* Header with Back Button (hidden in embedded mode) */}
          <div className="flex items-center justify-between gap-4">
            {!embedded && (
              <button
                onClick={handleBack}
                aria-label={t('back')}
                className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md px-2 text-white transition-all duration-300 hover:opacity-90 sm:h-[33px] sm:w-auto sm:px-3"
                style={{
                  backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
                }}
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
            )}
            <h2 className="flex-1 text-[20px] font-semibold text-white sm:text-[26px] md:text-[30px]">
              {t('withdrawal')}
            </h2>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column: Existing Content */}
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto rounded-[6px]">
              <div className="space-y-4 md:space-y-6">
                <WithdrawalTab />
              </div>
            </div>

            {/* Right Column: Withdrawal Information Text */}
            <div className="rounded-[10px] bg-transparent p-6">
              <div className="text-sm leading-relaxed md:text-base" style={{ color: '#c8c8c8' }}>
                <h3 className="mb-4 text-lg font-bold text-white md:text-xl">
                  {t('withdrawal_heading') || 'Withdraw'}
                </h3>
                <div className="space-y-4">
                  <p>
                    {t('withdrawal_minimum') || 'Minimum Withdrawal: Rp. 20,000,-'}
                  </p>
                  <p>
                    {t('withdrawal_confirm_once') || 'Please confirm the withdrawal only once, and wait for your application to be processed to be able to make the next withdrawal.'}
                  </p>
                  <p>
                    {t('withdrawal_max_per_market') || 'Maximum withdrawal is 2x per market, only applies if you place a bet on that market.'}
                  </p>
                  <p className="font-bold text-white">
                    {t('withdrawal_account_registered') || 'WE WILL ONLY TRANSFER FUNDS TO YOUR ACCOUNT REGISTERED ON OUR SITE!'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Use global page background only for standalone page, not embedded tab view
  if (embedded) {
    return content;
  }

  return <div className="min-h-screen bg-[#272b30]">{content}</div>;
}
