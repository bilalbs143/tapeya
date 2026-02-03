'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import StatusPill from '@/components/StatusPill/StatusPill';
import { formatDateTimeISO } from '@/helpers/dateTime';
import { formatCurrency, formatPoints } from '@/helpers/formatting';
import { getStatusText, getStatusVariant } from '@/helpers/statusUtils';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchRequestInfo } from '@/website/websiteAction';

function UserHomeData() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const { getCurrency } = useTemplate();
  const { user, userLoader } = useSelector((state) => state.auth);
  const { requestInfoLoader } = useSelector((state) => state.website);

  // Helper function to capitalize text (title case)
  const capitalizeLabel = (key, fallback) => {
    const translated = t(key);
    const text = translated === key ? fallback : translated;
    if (!text) return '';
    // Convert to title case (capitalize first letter of each word)
    return text
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get wallet data from user
  const walletInfo = user?.wallet || {};
  const holdingMoney = walletInfo.holding_money || 0;
  const points = walletInfo.points || 0;
  const couponPoints = walletInfo.coupon_points || 0;

  // State for latest records
  const [latestDeposit, setLatestDeposit] = useState(null);
  const [latestWithdrawal, setLatestWithdrawal] = useState(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);

  // Fetch latest deposit record
  useEffect(() => {
    const fetchDeposit = async () => {
      setDepositLoading(true);
      try {
        const result = await dispatch(
          fetchRequestInfo({
            type: 'deposit',
            perPage: 1,
            page: 1,
          }),
        ).unwrap();
        if (result?.data && result.data.length > 0) {
          setLatestDeposit(result.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch deposit:', error);
      } finally {
        setDepositLoading(false);
      }
    };
    fetchDeposit();
  }, [dispatch]);

  // Fetch latest withdrawal record
  useEffect(() => {
    const fetchWithdrawal = async () => {
      setWithdrawalLoading(true);
      try {
        const result = await dispatch(
          fetchRequestInfo({
            type: 'withdraw',
            perPage: 1,
            page: 1,
          }),
        ).unwrap();
        if (result?.data && result.data.length > 0) {
          setLatestWithdrawal(result.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch withdrawal:', error);
      } finally {
        setWithdrawalLoading(false);
      }
    };
    fetchWithdrawal();
  }, [dispatch]);

  return (
    <section className="mt-6 w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* User Data */}
        <div
          className="flex flex-col overflow-hidden rounded-[5px] border border-[#2A2A2A] bg-[#161616]"
          style={{ boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.35)' }}
        >
          <div className="bg-[#E8D25E] px-4 py-2">
            <h3 className="text-sm font-bold text-black md:text-base">
              {t('user_data') !== 'user_data' ? t('user_data') : 'User Data'}
            </h3>
          </div>
          <div className="px-4 py-3 text-[12px] leading-relaxed text-[#E0E0E0] md:text-sm">
            <p className="flex justify-between gap-2">
              <span>{t('game_wallet') || 'Game Wallet'} :</span>
              <span className="font-semibold text-[#FFD700]">
                {userLoader ? (
                    <CommonLoader size="sm" border="border-[#FFD700]" />
                  ) : (
                    formatCurrency(holdingMoney)
                  )}
              </span>
            </p>
            <p className="mt-2 flex justify-between gap-2">
              <span>{t('points') || 'Points'} :</span>
              <span className="font-semibold text-[#FFD700]">
                {userLoader ? (
                    <CommonLoader size="sm" border="border-[#FFD700]" />
                  ) : (
                    formatPoints(points)
                  )}
              </span>
            </p>
            <p className="mt-2 flex justify-between gap-2">
              <span>{t('coupon_points') || 'Coupon Points'} :</span>
              <span className="font-semibold text-[#FFD700]">
                {userLoader ? (
                    <CommonLoader size="sm" border="border-[#FFD700]" />
                  ) : (
                    formatPoints(couponPoints)
                  )}
              </span>
            </p>
          </div>
        </div>

        {/* Deposit Status */}
        <div
          className="flex flex-col overflow-hidden rounded-[5px] border border-[#2A2A2A] bg-[#161616]"
          style={{ boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.35)' }}
        >
          <div className="bg-[#E8D25E] px-4 py-2">
            <h3 className="text-sm font-bold text-black md:text-base">
              {`${t('deposit') || 'Deposit'} ${t('status') || 'Status'}`}
            </h3>
          </div>
          <div className="px-4 py-3 text-[12px] leading-relaxed text-[#E0E0E0] md:text-sm space-y-1.5">
            {depositLoading ? (
                <div className="flex items-center justify-center py-4">
                  <CommonLoader size="sm" border="border-[#E8D25E]" />
                </div>
              ) : latestDeposit ? (
                <>
                  <p className="flex justify-between gap-2">
                    <span>{capitalizeLabel('amount', 'Amount')} :</span>
                    <span className="font-semibold text-[#FFD700]">
                      {formatCurrency(latestDeposit.requested_money)}
                    </span>
                  </p>
                  <p className="flex justify-between gap-2">
                    <span>{capitalizeLabel('paid_amount', 'Paid Amount')} :</span>
                    <span className="font-semibold text-[#FFD700]">
                      {formatCurrency(latestDeposit.approved_money) || '---'}
                    </span>
                  </p>
                  <p className="flex justify-between gap-2">
                    <span>{capitalizeLabel('status', 'Status')} :</span>
                    <StatusPill
                      value={
                        getStatusText(
                          latestDeposit.status_enum?.toLowerCase(),
                          t,
                        ) || latestDeposit.status_enum
                      }
                      variant={getStatusVariant(
                        latestDeposit.status_enum?.toLowerCase(),
                      )}
                      size="xs"
                    />
                  </p>
                  <p className="flex justify-between gap-2">
                    <span>{capitalizeLabel('date', 'Date')} :</span>
                    <span className="opacity-80">
                      {latestDeposit.created_at
                        ? formatDateTimeISO(latestDeposit.created_at)
                        : 'N/A'}
                    </span>
                  </p>
                </>
              ) : (
                <p className="opacity-70">{t('no_data') || 'No Data'}</p>
              )}
          </div>
        </div>

        {/* Withdrawal Status */}
        <div
          className="flex flex-col overflow-hidden rounded-[5px] border border-[#2A2A2A] bg-[#161616]"
          style={{ boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.35)' }}
        >
          <div className="bg-[#E8D25E] px-4 py-2">
            <h3 className="text-sm font-bold text-black md:text-base">
              {`${t('withdrawal') || 'Withdrawal'} ${t('status') || 'Status'}`}
            </h3>
          </div>
          <div className="px-4 py-3 text-[12px] leading-relaxed text-[#E0E0E0] md:text-sm space-y-1.5">
            {withdrawalLoading ? (
                <div className="flex items-center justify-center py-4">
                  <CommonLoader size="sm" border="border-[#E8D25E]" />
                </div>
              ) : latestWithdrawal ? (
                <>
                  <p className="flex justify-between gap-2">
                    <span>{capitalizeLabel('amount', 'Amount')} :</span>
                    <span className="font-semibold text-[#FFD700]">
                      {formatCurrency(latestWithdrawal.requested_money)}
                    </span>
                  </p>
                  <p className="flex justify-between gap-2">
                    <span>{capitalizeLabel('paid_amount', 'Paid Amount')} :</span>
                    <span className="font-semibold text-[#FFD700]">
                      {formatCurrency(latestWithdrawal.approved_money) || '---'}
                    </span>
                  </p>
                  <p className="flex justify-between gap-2">
                    <span>{capitalizeLabel('status', 'Status')} :</span>
                    <StatusPill
                      value={
                        getStatusText(
                          latestWithdrawal.status_enum?.toLowerCase(),
                          t,
                        ) || latestWithdrawal.status_enum
                      }
                      variant={getStatusVariant(
                        latestWithdrawal.status_enum?.toLowerCase(),
                      )}
                      size="xs"
                    />
                  </p>
                  <p className="flex justify-between gap-2">
                    <span>{capitalizeLabel('date', 'Date')} :</span>
                    <span className="opacity-80">
                      {latestWithdrawal.created_at
                        ? formatDateTimeISO(latestWithdrawal.created_at)
                        : 'N/A'}
                    </span>
                  </p>
                </>
              ) : (
                <p className="opacity-70">{t('no_data') || 'No Data'}</p>
              )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default UserHomeData;

