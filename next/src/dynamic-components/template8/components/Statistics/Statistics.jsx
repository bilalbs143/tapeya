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
  const [activeTab, setActiveTab] = useState('realTimeDeposit');

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
        bet: deposit.amount ? `${deposit.amount} IDR` : 'N/A',
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
        bet: withdrawal.amount ? `${withdrawal.amount} IDR` : 'N/A',
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
        <div className="relative z-10 container mx-auto max-w-full md:max-w-full">
          {/* Header with Title and Tabs */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title on Left */}
            <h2 className="text-[22px] tracking-wide uppercase md:text-[30px]">
              <span className="font-bring-race text-white">{t('leader')}</span>{' '}
              <span className="font-bring-race text-[#2DFA1A]">
                {t('board')}
              </span>
            </h2>

            {/* Tabs on Right - Using sidebar menu item styling */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="rounded-[5px] transition-all duration-300"
                  style={{
                    marginBottom: 0,
                    border:
                      activeTab === tab.id
                        ? 'none'
                        : '1px solid rgba(45, 250, 26, 0.30)',
                    backgroundColor:
                      activeTab === tab.id ? '#2DFA1A' : '#0A1414',
                    padding: '8px 40px',
                  }}
                >
                  <div>
                    <div>
                      <span
                        className={`${
                          activeTab === tab.id ? 'text-black' : 'text-white'
                        } text-[14px] font-bold transition-colors duration-300`}
                      >
                        {t(tab.labelKey)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div
            className="w-full rounded-[5px]"
            style={{
              backgroundColor: '#0A1414',
              border: '1px solid rgba(45, 250, 26, 0.30)',
              padding: '10px',
            }}
          >
            {/* Table */}
            <div
              className="statistics-table-scroll overflow-x-auto overflow-y-auto"
              style={{ maxHeight: '450px' }}
            >
              <table
                className="w-full min-w-[700px]"
                style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}
              >
                <thead
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    backgroundColor: '#0A1414',
                  }}
                >
                  <tr>
                    <th
                      className="relative px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#636363' }}
                    >
                      <span className="relative z-10">
                        {t('ranks') || 'Ranks'}
                      </span>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#636363' }}
                    >
                      {t('user') || 'User'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#636363' }}
                    >
                      {t('game') || 'Game'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#636363' }}
                    >
                      {t('provider') || 'Provider'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#636363' }}
                    >
                      {t('bet') || 'Bet'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#636363' }}
                    >
                      {t('multiplier') || 'Multiplier'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#636363' }}
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
                        style={{
                          border: '1px solid #3E1D88',
                          background: '#0F1B1B',
                        }}
                      >
                        <td
                          className="px-3 py-2 text-xs text-white sm:px-4 sm:py-3 sm:text-sm"
                          style={{ borderRadius: '5px 0 0 5px' }}
                        >
                          {row.rank}
                        </td>
                        <td className="px-3 py-2 text-xs text-white sm:px-4 sm:py-6 sm:text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-full bg-[#0A1414]"
                              style={{
                                border: '1px solid #2DFA1A',
                              }}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                                  fill="#2DFA1A"
                                />
                                <path
                                  d="M8 10C3.58172 10 0 12.2386 0 15C0 15.5523 0.447715 16 1 16H15C15.5523 16 16 15.5523 16 15C16 12.2386 12.4183 10 8 10Z"
                                  fill="#2DFA1A"
                                />
                              </svg>
                            </div>
                            <span className="block max-w-full truncate">
                              {row.user}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-white sm:px-4 sm:py-6 sm:text-sm">
                          <span className="block max-w-full truncate">
                            {row.game}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-white sm:px-4 sm:py-6 sm:text-sm">
                          <span className="block max-w-full truncate">
                            {row.provider}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-white sm:px-4 sm:py-6 sm:text-sm">
                          {row.bet}
                        </td>
                        <td className="px-3 py-2 text-xs text-white sm:px-4 sm:py-6 sm:text-sm">
                          {row.multiplier}
                        </td>
                        <td
                          className="px-3 py-2 text-xs text-white sm:px-4 sm:py-6 sm:text-sm"
                          style={{ borderRadius: '0 5px 5px 0' }}
                        >
                          {row.profit}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
