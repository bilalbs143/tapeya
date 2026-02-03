'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import {
  fetchRealtimeDeposits,
  fetchRealtimeWithdrawals,
} from '@/website/websiteAction';

// Custom date formatter for "DD MMMM, YYYY" format
const formatDateCustom = (dateString, t) => {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  const months = [
    t('january'),
    t('february'),
    t('march'),
    t('april'),
    t('may'),
    t('june'),
    t('july'),
    t('august'),
    t('september'),
    t('october'),
    t('november'),
    t('december'),
  ];

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};

function Statistics() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('highestWithdrawal');

  // Redux selectors
  const {
    realtimeDepositsData,
    realtimeDepositsLoader,
    realtimeWithdrawalsData,
    realtimeWithdrawalsLoader,
  } = useSelector((state) => state.website);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchRealtimeDeposits());
    dispatch(fetchRealtimeWithdrawals());
    // dispatch(fetchRealtimeWinners()); // If you want to fetch it here as well
  }, [dispatch]);

  // Format data for each tab
  const getTabData = () => {
    // Format deposits data
    const depositsData =
      realtimeDepositsData?.map((deposit, index) => ({
        rank: index + 1,
        user: deposit.user?.username || deposit.user?.name || t('unknown_user'),
        game: deposit.game?.name || t('deposit'),
        provider: deposit.game?.provider?.name || 'N/A',
        bet: deposit.amount
          ? `${Number(deposit.amount).toFixed(2)} IDR`
          : 'N/A',
        multiplier: 'N/A',
        profit: formatDateCustom(deposit.created_at, t),
        originalData: deposit,
      })) || [];

    // Format withdrawals data
    const withdrawalsData =
      realtimeWithdrawalsData?.map((withdrawal, index) => ({
        rank: index + 1,
        user:
          withdrawal.user?.username ||
          withdrawal.user?.name ||
          t('unknown_user'),
        game: withdrawal.game?.name || t('withdrawal'),
        provider: withdrawal.game?.provider?.name || 'N/A',
        bet: withdrawal.amount
          ? `${Number(withdrawal.amount).toFixed(2)} IDR`
          : 'N/A',
        multiplier: 'N/A',
        profit: formatDateCustom(withdrawal.created_at, t),
        originalData: withdrawal,
      })) || [];

    switch (activeTab) {
      case 'realTimeDeposit':
        return {
          title: t('real_time_deposit'),
          data: depositsData,
          loading: realtimeDepositsLoader,
        };

      case 'highestWithdrawal':
        return {
          title: t('highest_withdrawal_week'),
          data: withdrawalsData,
          loading: realtimeWithdrawalsLoader,
        };

      default:
        return {
          title: t('highest_withdrawal_week'),
          data: withdrawalsData,
          loading: realtimeWithdrawalsLoader,
        };
    }
  };

  const currentTabData = getTabData();

  const tabs = [
    { id: 'highestWithdrawal', labelKey: 'highest_withdrawal' },
    { id: 'realTimeDeposit', labelKey: 'real_time_deposit' },
  ];

  const handleViewDetail = (data) => {
    // This function will be implemented to show a detail modal or navigate to a detail page
    // For now, it will just log the data
    console.log('Viewing detail for:', data);
    // Example: if it's an announcement, navigate to its detail page
    if (data.category === 'Announcement') {
      // window.location.href = `/announcements/${data.id}`; // Assuming you have an announcements detail page
    }
    // if it's a deposit/withdrawal, you might want to show a modal or navigate to a specific detail page
  };

  return (
    <div>
      <section className="relative rounded-[10px] py-10">
        <div className="relative z-10 container mx-auto max-w-full px-4 md:max-w-[1530px] md:px-0">
          {/* Header with Title and Tabs (Tabs HIDDEN on mobile) */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title on Left */}
            <h2
              className="text-[30px] tracking-wide uppercase"
              style={{
                fontFamily: 'var(--font-king-town)',
                color: '#ffffff',
              }}
            >
              {t('leaderboard')}
            </h2>

            {/* Tabs on Right - HIDDEN on mobile, visible on sm and up */}
            <div className="hidden items-center gap-4 sm:ml-auto sm:flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="transition-all duration-300"
                  style={{
                    borderRadius: '4px',
                    padding: '6px 45px',
                    background: activeTab === tab.id ? '#FFB703' : '#080E1B',
                    border: '1px solid #12203A ',
                    boxShadow:
                      activeTab === tab.id
                        ? '0 3.151px 11.029px 0 rgba(0, 0, 0, 0.25)'
                        : 'none',
                  }}
                >
                  <span
                    className="text-[15px] font-bold uppercase"
                    style={{
                      color: activeTab === tab.id ? '#000000' : '#FFFFFF',
                    }}
                  >
                    {t(tab.labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div
            className="w-full rounded-[8px]"
            style={{
              border: 'none',
              padding: '0',
            }}
          >
            {/* Table */}
            <div
              className="statistics-table-scroll overflow-x-auto overflow-y-auto"
              style={{
                maxHeight: '450px',
                scrollbarWidth: 'auto',
                scrollbarColor: '#FFB703 #212024',
              }}
            >
              {/* eslint-disable-next-line react/no-unknown-property */}
              <style jsx>{`
                .statistics-table-scroll {
                  padding-bottom: 20px;
                }
                .statistics-table-scroll::-webkit-scrollbar {
                  height: 12px;
                }
                .statistics-table-scroll::-webkit-scrollbar-track {
                  background: #212024;
                  border-radius: 100px;
                  /* Centering a 150px scrollbar track on mobile */
                  margin: 0 calc((100% - 150px) / 2);
                }
                @media (max-width: 375px) {
                  .statistics-table-scroll::-webkit-scrollbar-track {
                    margin: 0 10px; /* Fallback for very small screens */
                  }
                }
                .statistics-table-scroll::-webkit-scrollbar-thumb {
                  background: #FFB703;
                  border-radius: 100px;
                  border: 3px solid #212024;
                }
                @media (min-width: 768px) {
                  .statistics-table-scroll::-webkit-scrollbar {
                    width: 0 !important;
                    height: 0 !important;
                    display: none !important;
                  }
                  .statistics-table-scroll {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                    overflow: -moz-scrollbars-none;
                  }
                }
              `}</style>
              <table
                className="w-full min-w-[700px]"
                style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}
              >
                <thead>
                  <tr>
                    <th
                      className="relative px-6 py-3 pl-10 text-left text-[13px] font-medium uppercase sm:px-12 sm:py-4 sm:pl-16 sm:text-[14px]"
                      style={{ color: '#8B8B8B' }}
                    >
                      <span className="relative z-10">
                        {t('ranks') || 'Ranks'}
                      </span>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-[13px] font-medium uppercase sm:px-12 sm:py-4 sm:text-[14px]"
                      style={{ color: '#8B8B8B' }}
                    >
                      {t('user') || 'User'}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-[13px] font-medium uppercase sm:px-12 sm:py-4 sm:text-[14px]"
                      style={{ color: '#8B8B8B' }}
                    >
                      {t('game') || 'Game'}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-[13px] font-medium uppercase sm:px-12 sm:py-4 sm:text-[14px]"
                      style={{ color: '#8B8B8B' }}
                    >
                      {t('provider') || 'Provider'}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-[13px] font-medium uppercase sm:px-12 sm:py-4 sm:text-[14px]"
                      style={{ color: '#8B8B8B' }}
                    >
                      {t('bet') || 'Bet'}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-[13px] font-medium uppercase sm:px-12 sm:py-4 sm:text-[14px]"
                      style={{ color: '#8B8B8B' }}
                    >
                      {t('multiplier') || 'Multiplier'}
                    </th>
                    <th
                      className="px-6 py-3 text-left text-[13px] font-medium uppercase sm:px-12 sm:py-4 sm:text-[14px]"
                      style={{ color: '#8B8B8B' }}
                    >
                      {t('profit') || 'Profit'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentTabData.loading ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center">
                        <div className="flex justify-center">
                          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                        </div>
                      </td>
                    </tr>
                  ) : currentTabData.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-8 text-center text-sm text-white"
                      >
                        {t('no_data_found')}
                      </td>
                    </tr>
                  ) : (
                    currentTabData.data.map((row, index) => (
                      <tr
                        key={index}
                        className="border-none"
                        style={{
                          background:
                            'linear-gradient(90deg, #14213D 0%, #13203A 100%)',
                        }}
                      >
                        <td className="border-y border-l border-[#FFB7034D] px-6 py-3 pl-10 text-xs text-white first:rounded-l-[3px] sm:px-12 sm:py-4 sm:pl-16 sm:text-sm">
                          <div className="flex items-center">
                            {/* Unified Rank Badge */}
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-full border"
                              style={{
                                backgroundColor: '#080E1B',
                                borderColor: '#12203A',
                              }}
                            >
                              <span className="font-bold">{row.rank}</span>
                            </div>
                          </div>
                        </td>
                        <td className="border-y border-[#FFB7034D] px-6 py-3 text-xs text-white sm:px-12 sm:py-4 sm:text-sm">
                          <div className="flex items-center gap-4">
                            {/* Unified Avatar image for both mobile and desktop */}
                            <img
                              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/icon-table-12.png"
                              alt="User"
                              className="h-8 w-8 rounded-full border border-gray-600"
                            />

                            <span className="block max-w-full truncate text-white md:text-[#dfdfdf]">
                              {row.user}
                            </span>
                          </div>
                        </td>
                        <td className="border-y border-[#FFB7034D] px-6 py-3 text-xs text-white sm:px-12 sm:py-4 sm:text-sm">
                          <span className="block max-w-full truncate">
                            {row.game}
                          </span>
                        </td>
                        <td className="border-y border-[#FFB7034D] px-6 py-3 text-xs text-white sm:px-12 sm:py-4 sm:text-sm">
                          <span className="block max-w-full truncate">
                            {row.provider}
                          </span>
                        </td>
                        <td className="border-y border-[#FFB7034D] px-6 py-3 text-xs font-bold text-white sm:px-12 sm:py-4 sm:text-sm">
                          {row.bet && row.bet.includes('IDR') ? (
                            <>
                              {row.bet.split(' IDR')[0]}{' '}
                              <span style={{ color: '#FFB703' }}>IDR</span>
                            </>
                          ) : (
                            row.bet
                          )}
                        </td>
                        <td className="border-y border-[#FFB7034D] px-6 py-3 text-xs text-white sm:px-12 sm:py-4 sm:text-sm">
                          {row.multiplier}
                        </td>
                        <td className="border-y border-r border-[#FFB7034D] px-6 py-3 text-xs font-bold text-white last:rounded-r-[3px] sm:px-12 sm:py-4 sm:text-sm">
                          {row.profit &&
                            typeof row.profit === 'string' &&
                            row.profit.includes('IDR') ? (
                            <>
                              {row.profit.split(' IDR')[0]}{' '}
                              <span style={{ color: '#FFB703' }}>IDR</span>
                            </>
                          ) : (
                            row.profit
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Tabs - Visible ONLY on mobile, pushed to bottom */}
          <div className="mt-8 flex flex-row items-center justify-between gap-4 px-2 sm:hidden">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 transition-all duration-300"
                style={{
                  borderRadius: '4px',
                  padding: '12px 20px', // Slightly larger padding for mobile touch
                  background: activeTab === tab.id ? '#FFB703' : '#080E1B',
                  border: '1px solid #12203A ',
                  boxShadow:
                    activeTab === tab.id
                      ? '0 3.151px 11.029px 0 rgba(0, 0, 0, 0.25)'
                      : 'none',
                }}
              >
                <span
                  className="block w-full text-center text-[12px] font-bold uppercase"
                  style={{
                    color: activeTab === tab.id ? '#000000' : '#FFFFFF',
                  }}
                >
                  {t(tab.labelKey)}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
