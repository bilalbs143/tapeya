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
            <h2 className="text-[16px] tracking-wide uppercase md:text-[30px]">
              <span className="font-bring-race text-white">{t('leader')}</span>{' '}
              <span className="font-bring-race" style={{ color: '#951EDD' }}>
                {t('board')}
              </span>
            </h2>

            {/* Tabs on Right - Using sidebar menu item styling */}
            <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:gap-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`template14-menu-item-angled w-full ${
                    activeTab === tab.id
                      ? 'template14-menu-item-angled-active'
                      : ''
                  }`}
                  style={{ marginBottom: 0 }}
                >
                  <div className="template14-menu-item-angled-inner !px-4 !py-1.5 !text-[10px] sm:!px-10 sm:!py-2 sm:!text-[14px]">
                    <div className="template14-menu-item-content">
                      <span
                        className={`${
                          activeTab === tab.id ? 'text-white' : 'text-[#7D7D7D]'
                        } font-medium transition-colors duration-300`}
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
            style={{ backgroundColor: '#271253', padding: '10px' }}
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
                    backgroundColor: '#271253',
                  }}
                >
                  <tr>
                    <th
                      className="relative px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#544591' }}
                    >
                      <span className="relative z-10">
                        {t('ranks') || 'Ranks'}
                      </span>
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#544591' }}
                    >
                      {t('user') || 'User'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#544591' }}
                    >
                      {t('game') || 'Game'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#544591' }}
                    >
                      {t('provider') || 'Provider'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#544591' }}
                    >
                      {t('bet') || 'Bet'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#544591' }}
                    >
                      {t('multiplier') || 'Multiplier'}
                    </th>
                    <th
                      className="px-3 py-2 text-left text-xs font-medium uppercase sm:px-4 sm:py-3 sm:text-sm"
                      style={{ color: '#544591' }}
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
                          background:
                            'linear-gradient(90deg, #1F2758 0%, #262F6C 23.2%, #30255D 69.47%, #381D51 100%)',
                        }}
                      >
                        <td
                          className="relative px-3 py-2 text-xs text-white sm:px-4 sm:py-3 sm:text-sm"
                          style={{ borderRadius: '5px 0 0 5px' }}
                        >
                          {row.rank === 1 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="127"
                              height="75"
                              viewBox="0 0 127 75"
                              fill="none"
                              className="pointer-events-none absolute bottom-0 left-0 h-full w-auto"
                              style={{ zIndex: 0 }}
                            >
                              <path
                                d="M0 5C0 2.23858 2.23858 0 5 0H123L108 75H5C2.23858 75 0 72.7614 0 70V5Z"
                                fill={`url(#paint0_linear_711_2229_rank1_${index})`}
                              />
                              <path
                                d="M123 0L108 75H112L127 0H123Z"
                                fill="#F9DB36"
                              />
                              <circle
                                cx="63.5"
                                cy="37.5"
                                r="20"
                                fill="#222A61"
                                stroke="#7C30E6"
                                strokeWidth="2"
                              />
                              <text
                                x="63.5"
                                y="37.5"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                                fontSize="16"
                                fontWeight="bold"
                                fontFamily="Arial, sans-serif"
                              >
                                {row.rank}
                              </text>
                              <defs>
                                <linearGradient
                                  id={`paint0_linear_711_2229_rank1_${index}`}
                                  x1="17.0366"
                                  y1="41.5"
                                  x2="117.191"
                                  y2="40.967"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#A96F23" />
                                  <stop offset="1" stopColor="#784431" />
                                </linearGradient>
                              </defs>
                            </svg>
                          ) : row.rank === 2 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="127"
                              height="75"
                              viewBox="0 0 127 75"
                              fill="none"
                              className="pointer-events-none absolute bottom-0 left-0 h-full w-auto"
                              style={{ zIndex: 0 }}
                            >
                              <path
                                d="M0 5C0 2.23858 2.23858 0 5 0H123L108 75H5C2.23858 75 0 72.7614 0 70V5Z"
                                fill={`url(#paint0_linear_711_2230_rank2_${index})`}
                              />
                              <path
                                d="M123 0L108 75H112L127 0H123Z"
                                fill="#61CAF2"
                              />
                              <circle
                                cx="63.5"
                                cy="37.5"
                                r="20"
                                fill="#222A61"
                                stroke="#7C30E6"
                                strokeWidth="2"
                              />
                              <text
                                x="63.5"
                                y="37.5"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                                fontSize="16"
                                fontWeight="bold"
                                fontFamily="Arial, sans-serif"
                              >
                                {row.rank}
                              </text>
                              <defs>
                                <linearGradient
                                  id={`paint0_linear_711_2230_rank2_${index}`}
                                  x1="17.0366"
                                  y1="41.5"
                                  x2="117.191"
                                  y2="40.967"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#2D4DA5" />
                                  <stop offset="1" stopColor="#3A26AE" />
                                </linearGradient>
                              </defs>
                            </svg>
                          ) : row.rank === 3 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="127"
                              height="75"
                              viewBox="0 0 127 75"
                              fill="none"
                              className="pointer-events-none absolute bottom-0 left-0 h-full w-auto"
                              style={{ zIndex: 0 }}
                            >
                              <path
                                d="M0 5C0 2.23858 2.23858 0 5 0H123L108 75H5C2.23858 75 0 72.7614 0 70V5Z"
                                fill={`url(#paint0_linear_711_2231_rank3_${index})`}
                              />
                              <path
                                d="M123 0L108 75H112L127 0H123Z"
                                fill="#F25E4C"
                              />
                              <circle
                                cx="63.5"
                                cy="37.5"
                                r="20"
                                fill="#222A61"
                                stroke="#7C30E6"
                                strokeWidth="2"
                              />
                              <text
                                x="63.5"
                                y="37.5"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                                fontSize="16"
                                fontWeight="bold"
                                fontFamily="Arial, sans-serif"
                              >
                                {row.rank}
                              </text>
                              <defs>
                                <linearGradient
                                  id={`paint0_linear_711_2231_rank3_${index}`}
                                  x1="17.0366"
                                  y1="41.5"
                                  x2="117.191"
                                  y2="40.967"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#934431" />
                                  <stop offset="1" stopColor="#71312B" />
                                </linearGradient>
                              </defs>
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="127"
                              height="75"
                              viewBox="0 0 127 75"
                              fill="none"
                              className="pointer-events-none absolute bottom-0 left-0 h-full w-auto"
                              style={{ zIndex: 0 }}
                            >
                              <path
                                d="M0 5C0 2.23858 2.23858 0 5 0H123L108 75H5C2.23858 75 0 72.7614 0 70V5Z"
                                fill={`url(#paint0_linear_700_1818_row_${index})`}
                              />
                              <path
                                d="M123 0L108 75H112L127 0H123Z"
                                fill="#C04CC2"
                              />
                              <circle
                                cx="63.5"
                                cy="37.5"
                                r="20"
                                fill="#222A61"
                                stroke="#7C30E6"
                                strokeWidth="2"
                              />
                              <text
                                x="63.5"
                                y="37.5"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                                fontSize="16"
                                fontWeight="bold"
                                fontFamily="Arial, sans-serif"
                              >
                                {row.rank}
                              </text>
                              <defs>
                                <linearGradient
                                  id={`paint0_linear_700_1818_row_${index}`}
                                  x1="0"
                                  y1="37.5"
                                  x2="127"
                                  y2="37.5"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#951EDD" />
                                  <stop offset="1" stopColor="#500081" />
                                </linearGradient>
                              </defs>
                            </svg>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-white sm:px-4 sm:py-6 sm:text-sm">
                          <span className="block max-w-full truncate">
                            {row.user}
                          </span>
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
