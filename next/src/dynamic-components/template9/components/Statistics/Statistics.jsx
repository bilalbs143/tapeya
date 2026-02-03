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
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .statistics-table-scroll {
            scrollbar-width: thin;
            scrollbar-color: #DBB42C transparent;
          }
          .statistics-table-scroll::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .statistics-table-scroll::-webkit-scrollbar-track {
            background: transparent;
          }
          .statistics-table-scroll::-webkit-scrollbar-thumb {
            border-radius: 5px;
            border: 0.905px solid rgba(219, 180, 44, 0.30);
            background: #12001F;
            box-shadow: 0 3.621px 19.914px 0 rgba(0, 0, 0, 0.45) inset;
          }
          .statistics-table-scroll::-webkit-scrollbar-thumb:hover {
            background: #12001F;
          }
        `,
        }}
      />
      <section className="relative rounded-[10px] py-10">
        <div className="relative z-10 container mx-auto max-w-full md:max-w-full">
          {/* Header with Title and Tabs */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Title on Left */}
            <h2 className="text-[22px] tracking-wide uppercase md:text-[30px]">
              <span className="font-cravend text-white">{t('leader')}</span>{' '}
              <span className="font-cravend text-white">{t('board')}</span>
            </h2>

            {/* Tabs on Right */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="transition-all duration-300"
                  style={{
                    borderRadius: '4px',
                    padding: '8px 40px',
                    ...(activeTab === tab.id
                      ? {
                        background: '#9D4EDD',
                        boxShadow: '0 3.151px 11.029px 0 rgba(0, 0, 0, 0.25)',
                        border: 'none',
                      }
                      : {
                        border: '0.788px solid rgba(219, 180, 44, 0.30)',
                        background: '#12001F',
                        boxShadow:
                            '0 3.151px 17.331px 0 rgba(0, 0, 0, 0.45) inset',
                      }),
                  }}
                >
                  <div>
                    <div>
                      <span
                        className={`${
                          activeTab === tab.id ? 'text-white' : 'text-white'
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
            className="relative h-auto w-full lg:h-[500px]"
            style={{
              borderRadius: '4px',
              border: '0.788px solid rgba(219, 180, 44, 0.30)',
              background: '#1D0032',
              padding: '10px',
            }}
          >
            {/* Girl Image on Right Side */}
            <div className="pointer-events-none absolute top-0 right-0 bottom-0 z-0 hidden w-[30%] max-w-[300px] lg:block">
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/leaderboard-girl-img-9.webp"
                alt="Leaderboard"
                className="h-full w-full object-contain object-right"
              />
            </div>

            {/* Table */}
            <div className="statistics-table-scroll relative z-10 overflow-x-auto overflow-y-auto pr-0 lg:max-h-[480px] lg:pr-[25%]">
              <table
                className="w-full min-w-[700px]"
                style={{ borderCollapse: 'separate', borderSpacing: '0 8px' }}
              >
                <thead
                  style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 20,
                    backgroundColor: '#1D0032',
                  }}
                >
                  <tr>
                    <th
                      className="relative px-3 py-2 text-center text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
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
                          borderRadius: '3px',
                          background:
                            'linear-gradient(90deg, rgba(124, 48, 230, 0.12) 0%, rgba(219, 180, 44, 0.12) 100%)',
                        }}
                      >
                        <td className="px-3 py-2 sm:px-4 sm:py-6">
                          <div
                            className="font-cravend mx-auto flex items-center justify-center border border-[rgba(219,180,44,0.30)] bg-[#12001F] text-xs text-white shadow-[0_3.151px_17.331px_0_rgba(0,0,0,0.45)_inset] sm:text-sm"
                            style={{
                              borderRadius: '50%',
                              borderWidth: '0.788px',
                              width: '40px',
                              height: '40px',
                            }}
                          >
                            {row.rank}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-xs text-white sm:px-4 sm:py-6 sm:text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-6 w-6 flex-shrink-0 items-center justify-center border border-[#DBB42C] bg-[#0A1414]"
                              style={{
                                borderRadius: '24px',
                              }}
                            >
                              <svg
                                width="14"
                                height="14"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                                  fill="#DBB42C"
                                />
                                <path
                                  d="M8 10C3.58172 10 0 12.2386 0 15C0 15.5523 0.447715 16 1 16H15C15.5523 16 16 15.5523 16 15C16 12.2386 12.4183 10 8 10Z"
                                  fill="#DBB42C"
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
                          style={{ borderRadius: '0 3px 3px 0' }}
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
