'use client';

import React from 'react';
import { useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { useTranslations } from '@/hooks/useTranslations';

import ExchangeTab from '../modals/transaction/ExchangeTab';

export default function ExchangePage() {
  const { t } = useTranslations();
  const { user, userLoader } = useSelector((state) => state.auth);

  const walletInfo = user?.wallet || {};
  const holdingMoney = walletInfo.holding_money || 0;
  const points = walletInfo.points || 0;
  const couponPoints = walletInfo.coupon_points || 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 text-white">
      <div className="space-y-6">
        {/* Wallet Summary Section */}
        <div className="rounded-[10px] border border-[#FFFFFF66] p-3 md:p-4 lg:p-6">
          <div className="flex flex-col gap-0 md:flex-row md:items-center md:justify-between md:gap-0">
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

        <div className="rounded-[5px] border border-[#00374A] p-3 md:p-4 lg:p-6">
          <ExchangeTab />
        </div>
      </div>
    </div>
  );
}
