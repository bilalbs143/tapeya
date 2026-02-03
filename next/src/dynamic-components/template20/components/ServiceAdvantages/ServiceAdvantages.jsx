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
  }, [dispatch]);

  // Format data for each tab
  const getTabData = () => {
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
        profit: deposit.profit ? `${Number(deposit.profit).toFixed(2)} IDR` : (deposit.amount ? `${Number(deposit.amount).toFixed(2)} IDR` : 'N/A'),
        originalData: deposit,
      })) || [];

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
          ? '1000.00 IDR' // Static for demonstration as in image
          : 'N/A',
        multiplier: '1.99', // Placeholder as in design
        profit: '100000 IDR', // Static for demonstration as in image
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

  return (
    <div>
      <section className="relative rounded-[10px] py-10">
        <div className="relative z-10 mx-auto max-w-full px-4 md:px-4">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            {/* Leaderboard - Left Column */}
            <div
              className="flex flex-col rounded-[14px] bg-[#0b0e14] p-6 lg:col-span-8 lg:p-6"
              style={{ border: '1px solid #1a1d23' }}
            >
              {/* Header with Title and Tabs (Desktop Only) */}
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-[32px] font-bold text-white">
                  {t('leaderboard')}
                </h2>

                {/* Desktop Tabs */}
                <div className="hidden lg:flex items-center gap-3">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className="transition-all duration-300"
                      style={{
                        borderRadius: '8px',
                        padding: '10px 28px',
                        background: tab.id === 'highestWithdrawal' ? '#D00000' : '#FDE2C4',
                        border: 'none',
                        opacity: activeTab === tab.id ? 1 : 0.6,
                      }}
                    >
                      <span
                        className="text-[14px] font-[900] tracking-wide whitespace-nowrap uppercase"
                        style={{
                          color: tab.id === 'highestWithdrawal' ? '#FFFFFF' : '#000000',
                        }}
                      >
                        {t(tab.labelKey)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Table Container */}
              <div className="w-full overflow-hidden mb-6">
                <div
                  className="statistics-table-scroll overflow-x-auto overflow-y-auto"
                  style={{
                    maxHeight: '520px',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#FDE2C4 #0b0e14',
                  }}
                >
                  <table className="w-full min-w-[850px] border-collapse">
                    <thead>
                      <tr
                        className="text-left"
                        style={{ borderBottom: '1px solid #FFDAB94D' }}
                      >
                        <th className="px-4 py-4 text-[14px] font-normal text-[#9CA3AF] capitalize">
                          {t('ranks')}
                        </th>
                        <th className="px-4 py-4 pl-16 text-[14px] font-normal text-[#9CA3AF] capitalize">
                          {t('user')}
                        </th>
                        <th className="px-4 py-4 text-[14px] font-normal text-[#9CA3AF] capitalize">
                          {t('game')}
                        </th>
                        <th className="px-4 py-4 text-[14px] font-normal text-[#9CA3AF] capitalize">
                          {t('provider')}
                        </th>
                        <th className="px-4 py-4 text-[14px] font-normal text-[#9CA3AF] capitalize">
                          {t('bet')}
                        </th>
                        <th className="px-4 py-4 text-[14px] font-normal text-[#9CA3AF] capitalize">
                          {t('multiplier')}
                        </th>
                        <th className="px-4 py-4 text-[14px] font-normal text-[#9CA3AF] capitalize">
                          {t('profit')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTabData.loading ? (
                        <tr>
                          <td colSpan={7} className="py-20 text-center">
                            <div className="flex justify-center">
                              <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-[#FFDAB9]" />
                            </div>
                          </td>
                        </tr>
                      ) : currentTabData.data.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-24 text-center text-sm text-[#4b4b4b]"
                          >
                            {t('no_data_found')}
                          </td>
                        </tr>
                      ) : (
                        currentTabData.data.map((row, index) => (
                          <tr
                            key={index}
                            className="border-b border-[#FFDAB94D] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div
                                className="flex h-7 w-7 items-center justify-center rounded-full"
                                style={{
                                  backgroundColor: '#2F0000',
                                  border: '1px solid #FFDAB94D',
                                }}
                              >
                                <span className="text-xs font-bold text-white">
                                  {row.rank}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 overflow-hidden rounded-full border border-[#FFB703] p-[1.5px]">
                                  <img
                                    src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/icon-table-12.png"
                                    alt="User"
                                    className="h-full w-full rounded-full object-cover"
                                  />
                                </div>
                                <span className="max-w-[120px] truncate text-[15px] font-bold text-white">
                                  {row.user}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[15px] font-bold text-white">
                                {row.game}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[15px] font-bold text-white">
                                {row.provider}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[15px] font-bold whitespace-nowrap text-white">
                                {row.bet.split(' IDR')[0]}{' '}
                                <span className="text-[#FFDAB9]">IDR</span>
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[15px] font-bold text-white/90">
                                {row.multiplier}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-[15px] font-bold whitespace-nowrap text-white">
                                {row.profit.split(' IDR')[0]}{' '}
                                <span className="text-[#FFDAB9]">IDR</span>
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>


              {/* Bottom Action Buttons (Mobile Only) */}
              <div className="grid lg:hidden grid-cols-2 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setActiveTab('highestWithdrawal')}
                  className="flex items-center justify-center rounded-[8px] py-2 transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: '#D00000',
                    border: '1px solid #D00000',
                  }}
                >
                  <span className="text-[14px] font-[900] uppercase tracking-wide text-white">
                    {t('highest_withdrawal')}
                  </span>
                </button>
                <button
                  onClick={() => setActiveTab('realTimeDeposit')}
                  className="flex items-center justify-center rounded-[8px] py-2 transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: '#FDE2C4',
                    border: '1px solid #FDE2C4',
                  }}
                >
                  <span className="text-[14px] font-[900] uppercase tracking-wide text-black">
                    {t('real_time_deposit')}
                  </span>
                </button>
              </div>

            </div>

            {/* Promotions Banner - Right Column */}
            <div className="group relative flex h-[400px] flex-col overflow-hidden rounded-[14px] border border-white/5 md:h-[450px] lg:col-span-4 lg:h-[660px]">
              {/* Background with deep red gradient and chips pattern placeholder */}
              <div
                className="absolute inset-0 bg-[#4e0c0c]"
                style={{
                  backgroundImage: 'url(\'https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Promotions.png\'), linear-gradient(180deg, #6A0D0D 0%, #300505 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Overlay Content */}
              <div className="relative z-10 flex h-full flex-col items-center justify-between bg-gradient-to-t from-black/20 to-transparent p-8">
                <div className="flex w-full justify-center py-6" />

                <button className="transform rounded-[10px] bg-[#FDE2C4] px-3 py-4 text-[18px] font-bold text-[#000000] uppercase shadow-lg transition-all hover:bg-white active:scale-95">
                  Sign-up Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
