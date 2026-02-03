'use client';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import {
  fetchRealtimeDeposits,
  fetchRealtimeWithdrawals,
} from '@/website/websiteAction';

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

  return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
};

function Statistics() {
  const { t } = useTranslations();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('realTimeDeposit');

  const {
    realtimeDepositsData,
    realtimeDepositsLoader,
    realtimeWithdrawalsData,
    realtimeWithdrawalsLoader,
  } = useSelector((state) => state.website);

  useEffect(() => {
    dispatch(fetchRealtimeDeposits());
    dispatch(fetchRealtimeWithdrawals());
  }, [dispatch]);

  const getTabData = () => {
    const depositsData =
      realtimeDepositsData?.map((deposit, index) => ({
        rank: index + 1,
        user: deposit.user?.username || deposit.user?.name || t('unknown_user'),
        game: deposit.game?.name || t('deposit'),
        provider: deposit.game?.provider?.name || 'N/A',
        bet: deposit.amount ? `${deposit.amount} IDR` : 'N/A',
        multiplier: 'N/A',
        profit: formatDateCustom(deposit.created_at, t),
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
        bet: withdrawal.amount ? `${withdrawal.amount} IDR` : 'N/A',
        multiplier: 'N/A',
        profit: formatDateCustom(withdrawal.created_at, t),
      })) || [];

    return activeTab !== 'realTimeDeposit'
      ? { data: withdrawalsData, loading: realtimeWithdrawalsLoader }
      : { data: depositsData, loading: realtimeDepositsLoader };
  };

  const currentTabData = getTabData();

  const tabs = [
    { id: 'highestWithdrawal', labelKey: 'highest_withdrawal' },
    { id: 'realTimeDeposit', labelKey: 'real_time_deposit' },
  ];

  return (
    <div className="overflow-x-hidden">
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
          .statistics-table-scroll::-webkit-scrollbar-thumb {
            border-radius: 5px;
            border: 0.905px solid rgba(219, 180, 44, 0.30);
            background: #0E0E0E80;
            box-shadow: inset 0 3.621px 19.914px rgba(0,0,0,0.45);
          }
        `,
        }}
      />

      {/*  MOBILE ONLY SIDE PADDING */}
      <section className="relative rounded-[10px] px-3 py-10 md:px-0">
        <div className="relative z-10 mx-auto w-full max-w-[1530px] rounded-[4px] border border-[#FEA8034D] bg-[#121212] px-4 py-6 md:px-8 md:py-7">
          {/* ================= DESKTOP HEADER ================= */}
          <div className="mb-10 hidden items-center justify-between md:flex">
            <h2
              className="text-[30px] tracking-wide text-white uppercase"
              style={{ fontFamily: 'var(--font-king-town)' }}
            >
              {t('leaderboard')}
            </h2>

            <div className="flex items-center gap-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="transition-all duration-300"
                  style={{
                    borderRadius: '4px',
                    padding: '10px 45px',
                    background:
                      activeTab === tab.id ? '#DFA336' : 'transparent',
                    border:
                      activeTab === tab.id
                        ? '1px solid #DFA336'
                        : '1px solid #DFA3364D',
                    boxShadow:
                      activeTab === tab.id
                        ? '0 0 15px rgba(223, 163, 54, 0.2)'
                        : 'none',
                  }}
                >
                  <span className="text-[15px] font-bold text-white uppercase">
                    {t(tab.labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ================= DESKTOP WATERMARK ================= */}
          <div className="pointer-events-none absolute right-0 -bottom-3 left-0 z-0 hidden w-full overflow-hidden rounded-[4px] opacity-100 md:block">
            <div className="flex w-full items-center justify-center pb-0 pl-4">
              <span
                className="font-cravend text-[60px] leading-none whitespace-nowrap uppercase lg:text-[160px]"
                style={{
                  letterSpacing: '0.25em',
                  background:
                    'linear-gradient(180deg, rgba(223, 163, 54, 0.15) 0%, rgba(223, 163, 54, 0) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                LEADERBOARD
              </span>
            </div>
          </div>

          {/* ================= MOBILE HEADER ================= */}
          <div className="mb-6 block text-center md:hidden">
            <h2 className="font-cravend text-[32px] tracking-[4px] text-white uppercase">
              {t('leader')}
              {t('board')}
            </h2>
          </div>

          <div
            className="relative w-full lg:h-[512px]"
            style={{
              borderRadius: '4px',
              background: '#0E0E0E80',
              padding: '10px',
            }}
          >
            {/* Desktop Image */}
            <div className="pointer-events-none absolute inset-y-0 right-[120px] z-20 hidden w-[35%] max-w-[400px] origin-center scale-110 lg:block">
              <img
                src="https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/Leaderboard-Girl-Image-11.png"
                alt="Leaderboard"
                className="h-full w-full object-contain object-right"
              />
            </div>

            {/* 🔧 MOBILE TABLE SIDE PADDING ONLY */}
            <div className="statistics-table-scroll relative z-10 max-h-[400px] overflow-x-auto overflow-y-auto px-2 md:px-0 lg:max-h-[480px] lg:pr-[25%]">
              <table
                className="w-full min-w-[850px] md:min-w-[700px]"
                style={{ borderCollapse: 'separate', borderSpacing: '0 10px' }}
              >
                <thead className="sticky top-0 z-20 bg-[#0E0E0E80]">
                  <tr className="text-xs text-[#636363] uppercase">
                    <th className="px-2 py-3 text-center md:px-4">
                      {t('ranks')}
                    </th>
                    <th className="px-2 py-3 md:px-4 md:text-left">
                      {t('user')}
                    </th>
                    <th className="px-2 py-3 md:px-4 md:text-left">
                      {t('game')}
                    </th>
                    <th className="px-2 py-3 md:px-4 md:text-left">
                      {t('provider')}
                    </th>
                    <th className="px-2 py-3 text-center md:px-4">
                      {t('bet')}
                    </th>
                    <th className="px-2 py-3 text-center md:px-4">
                      {t('multiplier')}
                    </th>
                    <th className="px-2 py-3 text-center md:px-4">
                      {t('profit')}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentTabData.loading ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-white">
                        Loading...
                      </td>
                    </tr>
                  ) : (
                    currentTabData.data.map((row, i) => (
                      <tr
                        key={i}
                        className="text-sm text-white"
                        style={{
                          background:
                            'linear-gradient(90deg, rgba(18, 18, 18, 0.14) 0%, rgba(223, 163, 54, 0.14) 100%)',
                        }}
                      >
                        <td className="px-2 py-4 text-center font-bold md:px-4">
                          {row.rank}
                        </td>
                        <td className="px-2 py-4 md:px-4">{row.user}</td>
                        <td className="px-2 py-4 md:px-4">{row.game}</td>
                        <td className="px-2 py-4 md:px-4">{row.provider}</td>
                        <td className="px-2 py-4 text-center md:px-4">
                          {row.bet}
                        </td>
                        <td className="px-2 py-4 text-center md:px-4">
                          {row.multiplier}
                        </td>
                        <td className="px-2 py-4 text-center md:px-4">
                          {row.profit}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ================= MOBILE TABS ================= */}
          <div className="mt-8 block md:hidden">
            <div className="grid grid-cols-2 gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    borderRadius: '4px',
                    padding: '12px 10px',
                    background: activeTab === tab.id ? '#DFA336' : '#121212',
                    border:
                      activeTab === tab.id ? 'none' : '1px solid #FEA8034D',
                  }}
                >
                  <span className="text-[12px] font-bold text-white uppercase">
                    {t(tab.labelKey)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Statistics;
