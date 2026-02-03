'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';

import DepositTab from '../modals/transaction/DepositTab';

export default function DepositPage({ embedded = false }) {
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
              {t('deposit')}
            </h2>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column: Existing Content */}
            <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto rounded-[6px]">
              <div className="space-y-4 md:space-y-6">
                <DepositTab />
              </div>
            </div>

            {/* Right Column: Deposit Information Text */}
            <div className="rounded-[10px] bg-transparent p-6">
              <div className="text-sm leading-relaxed md:text-base" style={{ color: '#c8c8c8' }}>
                <h3 className="mb-4 text-lg font-bold text-white md:text-xl">
                  {t('deposits') || 'Deposits'}
                </h3>
                <div className="space-y-4">
                  <p className="font-bold text-white">
                    {t('deposit_attention_notice') || 'PAY ATTENTION TO THE DESTINATION ACCOUNT NUMBER THAT WE PROVIDE!!'}
                  </p>
                  <p>
                    {t('deposit_error_tolerance_notice') || 'We do not tolerate errors in sending money (deposits) to accounts that are not the accounts we provide.'}
                  </p>
                  <p>
                    {t('deposit_minimum_bank') || 'Minimum deposit: Rp. 10,000,-'}
                  </p>
                  <p>
                    {t('deposit_minimum_credit') || 'Minimum credit deposit: Rp. 20,000,-'}
                  </p>
                  <p className="font-bold text-white">
                    {t('deposit_pulsa_code_notice') || 'DEPOSIT VIA PULSA, MUST INCLUDE THE CODE "SN" IN THE REFERENCE COLUMN.'}
                  </p>
                  <div className="mt-6">
                    <p className="mb-2 font-bold text-white">
                      {t('deposit_bonus_terms_title') || 'Terms & Conditions Daily 5% deposit bonus!!'}
                    </p>
                    <p className="mb-2 font-semibold text-white">
                      {t('deposit_bonus_terms_subtitle') || 'Terms and Conditions :'}
                    </p>
                    <ul className="ml-5 list-disc space-y-2">
                      <li>
                        {t('deposit_bonus_term_1') || 'Mandatory deposit via bank to get 5% of the total deposit'}
                      </li>
                      <li>
                        {t('deposit_bonus_term_2') || '1 day you can only claim once (first deposit)'}
                      </li>
                      <li>
                        {t('deposit_bonus_term_3') || 'Maximum Daily Bonus per day is IDR 5,000,000'}
                      </li>
                    </ul>
                    <p className="mt-4">
                      {t('deposit_bonus_example') || 'Example Deposit Rp. 200,000 x 5% = Rp. 10,000 (Bonus received)'}
                    </p>
                    <p className="mt-2 font-semibold text-white">
                      {t('deposit_bonus_credit_note') || 'Note: Depositing via credit will not get a deposit bonus.'}
                    </p>
                  </div>
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
