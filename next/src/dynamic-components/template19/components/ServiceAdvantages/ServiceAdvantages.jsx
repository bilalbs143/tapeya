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
        provider: deposit.game?.provider?.name || 'Pragmatic Play',
        bet: deposit.amount
          ? `${Number(deposit.amount).toFixed(2)} IDR`
          : '1000.00 IDR',
        multiplier: '1.99',
        profit: deposit.amount
          ? `${Number(deposit.amount * 10).toFixed(0)} IDR`
          : '100000 IDR',
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
        provider: withdrawal.game?.provider?.name || 'Pragmatic Play',
        bet: withdrawal.amount
          ? `${Number(withdrawal.amount).toFixed(2)} IDR`
          : '1000.00 IDR',
        multiplier: '1.99',
        profit: withdrawal.amount
          ? `${Number(withdrawal.amount).toFixed(0)} IDR`
          : '100000 IDR',
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
    <div className="w-full">
      <section
        className="relative bg-cover bg-center bg-no-repeat pt-16 pb-4 border-y border-[#06D6A04D]"
        style={{
          backgroundImage:
            "url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/leaderboard-bg.png')",
        }}
      >
        <div className="relative z-10 container mx-auto max-w-full px-4 md:max-w-[1500px] md:px-0">
          {/* Header & Tabs */}
          <div className="relative z-40 mb-6 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <h2
              className="w-full text-center text-[40px] font-black tracking-wide text-white uppercase md:w-auto md:text-left"
              style={{ fontFamily: 'var(--font-inter)' }}
            >
              LEADERBOARD
            </h2>

            {/* Tabs (Hidden on mobile, shown on desktop) */}
            <div className="hidden gap-2 md:flex relative z-20">
              <button
                onClick={() => setActiveTab('highestWithdrawal')}
                className={`rounded px-4 py-2.5 text-sm font-bold uppercase transition-all duration-300 md:px-12 ${activeTab === 'highestWithdrawal'
                  ? 'bg-[#06D6A0] text-black shadow-[0_0_10px_rgba(0,210,170,0.4)]'
                  : 'border border-[#06D6A04D] bg-[#14213D85] text-white hover:text-black'
                }`}
              >
                {t('highest_withdrawal')}
              </button>
              <button
                onClick={() => setActiveTab('realTimeDeposit')}
                className={`rounded px-6 py-2.5 text-sm font-bold uppercase transition-all duration-300 md:px-12 ${activeTab === 'realTimeDeposit'
                  ? 'bg-[#06D6A0] text-black shadow-[0_0_10px_rgba(0,210,170,0.4)]'
                  : 'border border-[#06D6A04D] bg-[#14213D85] text-white hover:text-black'
                }`}
              >
                {t('real_time_deposit')}
              </button>
            </div>
          </div>

          <div className="flex flex-col items-start gap-0 lg:flex-row">
            {/* LEFT: TABLE */}
            <div className="relative z-20 w-full lg:w-[75%] lg:pr-10">
              <div
                className="statistics-table-scroll overflow-x-auto"
                style={{
                  minHeight: '400px',
                  scrollbarWidth: 'none' /* Firefox */,
                  msOverflowStyle: 'none' /* IE 10+ */,
                }}
              >

                <table className="w-full min-w-[800px] border-separate border-spacing-y-3">
                  <thead>
                    <tr>
                      {[
                        'ranks',
                        'user',
                        'game',
                        'provider',
                        'bet',
                        'multiplier',
                        'profit',
                      ].map((header, i) => (
                        <th
                          key={header}
                          className={`pb-2 text-xs font-semibold tracking-wider text-gray-500 uppercase ${i === 0 ? 'pl-6 text-left' : 'px-4 text-left'}`}
                        >
                          {header === 'ranks' ? 'Ranks' : t(header) || header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTabData.loading ? (
                      <tr>
                        <td colSpan={7} className="py-20 text-center">
                          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#00D2AA] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                        </td>
                      </tr>
                    ) : currentTabData.data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="py-20 text-center text-gray-500"
                        >
                          {t('no_data_found')}
                        </td>
                      </tr>
                    ) : (
                      currentTabData.data.map((row, index) => (
                        <tr
                          key={index}
                          className="group relative mb-2 transition-transform duration-300 hover:scale-[1.01]"
                        >
                          {/* Rank */}
                          <td className="relative rounded-l-lg border-y border-[#06D6A04D] bg-[#14213D99] py-4 pl-6 transition-colors">
                            <div className="flex items-center">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#00D2AA] text-xs font-bold text-white">
                                {row.rank}
                              </div>
                            </div>
                          </td>

                          {/* User */}
                          <td className="border-y border-[#06D6A04D] bg-[#14213D99] px-4 py-4 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border-2 border-[#FFD700] bg-[#3d424a]">
                                <img
                                  src={
                                    row.originalData?.user?.profile_image ||
                                    'https://d3emlo5tm9es2f.cloudfront.net/next/icons/icon-table-12.png'
                                  }
                                  alt="U"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="max-w-[120px] truncate text-sm font-bold text-white">
                                {row.user}
                              </span>
                            </div>
                          </td>

                          {/* Game */}
                          <td className="border-y border-[#06D6A04D] bg-[#14213D99] px-4 py-4 text-sm font-medium whitespace-nowrap text-white transition-colors">
                            {row.game}
                          </td>

                          {/* Provider */}
                          <td className="border-y border-[#06D6A04D] bg-[#14213D99] px-4 py-4 text-sm font-medium whitespace-nowrap text-white transition-colors">
                            {row.provider}
                          </td>

                          {/* Bet */}
                          <td className="border-y border-[#06D6A04D] bg-[#14213D99] px-4 py-4 text-sm font-bold whitespace-nowrap text-white transition-colors">
                            {row.bet && row.bet.includes('IDR') ? (
                              <>
                                {row.bet.split(' IDR')[0]}{' '}
                                <span className="text-[10px] text-[#00D2AA]">
                                  IDR
                                </span>
                              </>
                            ) : (
                              row.bet
                            )}
                          </td>

                          {/* Multiplier */}
                          <td className="border-y border-[#06D6A04D] bg-[#14213D99] px-4 py-4 text-sm font-bold whitespace-nowrap text-white transition-colors">
                            {row.multiplier}
                          </td>

                          {/* Profit */}
                          <td className="rounded-r-lg border-y border-[#06D6A04D] bg-[#14213D99] px-4 py-4 pr-6 text-right text-sm font-bold whitespace-nowrap text-white transition-colors">
                            {row.profit &&
                              typeof row.profit === 'string' &&
                              row.profit.includes('IDR') ? (
                              <>
                                {row.profit.split(' IDR')[0]}{' '}
                                <span className="text-[10px] text-[#00D2AA]">
                                  IDR
                                </span>
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

            {/* RIGHT: CHARACTER */}
            <div className="relative hidden h-[500px] w-[25%] lg:block">
              {/* Character Image */}
              <div className="pointer-events-none absolute bottom-0 right-[-50px] z-10 h-[540px] w-[570px]">
                <img
                  src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Leaderboard+Img.png"
                  alt="Leaderboard Character"
                  className="h-full w-full object-contain object-bottom"
                />
                {/* Floating Elements (Money) - Optional decoration matching design */}
                <div className="absolute top-[200px] left-[50px] animate-bounce duration-[3000ms]">
                  {/* Placeholder for floating money if needed, or just part of image */}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs (Shown only on mobile at the bottom) */}
          <div className="mt-8 flex justify-center gap-2 px-4 md:hidden">
            <button
              onClick={() => setActiveTab('highestWithdrawal')}
              className={`flex-1 rounded py-3 text-sm font-bold uppercase transition-all duration-300 ${activeTab === 'highestWithdrawal'
                ? 'bg-[#00D2AA] text-black shadow-[0_0_10px_rgba(0,210,170,0.4)]'
                : 'border border-[#00D2AA] bg-[#14213D99] text-gray-400'
              }`}
            >
              {t('highest_withdrawal')}
            </button>
            <button
              onClick={() => setActiveTab('realTimeDeposit')}
              className={`flex-1 rounded py-3 text-sm font-bold uppercase transition-all duration-300 ${activeTab === 'realTimeDeposit'
                ? 'bg-[#00D2AA] text-black shadow-[0_0_10px_rgba(0,210,170,0.4)]'
                : 'border border-[#00D2AA] bg-[#14213D99] text-gray-400'
              }`}
            >
              {t('real_time_deposit')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
