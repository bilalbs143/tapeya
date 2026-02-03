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
            scrollbar-color: #E33A24 transparent;
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
            border: 0.905px solid rgba(227, 58, 36, 0.30);
            background: #E33A24;
            box-shadow: 0 3.621px 19.914px 0 rgba(0, 0, 0, 0.45) inset;
          }
          .statistics-table-scroll::-webkit-scrollbar-thumb:hover {
            background: #C92E1A;
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
              <span className="font-spy-agency text-white">{t('leader')}</span>{' '}
              <span className="font-spy-agency text-white">{t('board')}</span>
            </h2>

            {/* Tabs on Right */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-[5px] border-none px-10 py-2 transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-[#E33A24]'
                      : 'bg-[rgba(36,106,115,0.30)]'
                  }`}
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
          <div className="relative h-auto w-full rounded border-[0.788px] border-[rgba(219,180,44,0.30)] bg-[rgba(36,106,115,0.30)] p-2.5 lg:h-[500px]">
            {/* Table */}
            <div className="statistics-table-scroll relative z-10 overflow-x-auto overflow-y-auto lg:max-h-[480px]">
              <table
                className="w-full min-w-[700px] border-separate"
                style={{ borderSpacing: '0 8px' }}
              >
                <thead className="sticky top-0 z-20">
                  <tr>
                    <th className="relative px-3 py-2 text-center text-xs font-medium text-[#3DCCC7] uppercase sm:px-4 sm:py-3 sm:text-sm">
                      <span className="relative z-10">
                        {t('ranks') || 'Ranks'}
                      </span>
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[#3DCCC7] uppercase sm:px-4 sm:py-3 sm:text-sm">
                      {t('user') || 'User'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[#3DCCC7] uppercase sm:px-4 sm:py-3 sm:text-sm">
                      {t('game') || 'Game'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[#3DCCC7] uppercase sm:px-4 sm:py-3 sm:text-sm">
                      {t('provider') || 'Provider'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[#3DCCC7] uppercase sm:px-4 sm:py-3 sm:text-sm">
                      {t('bet') || 'Bet'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[#3DCCC7] uppercase sm:px-4 sm:py-3 sm:text-sm">
                      {t('multiplier') || 'Multiplier'}
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-[#3DCCC7] uppercase sm:px-4 sm:py-3 sm:text-sm">
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
                        className="rounded-[5px]"
                        style={{
                          border:
                            '1px solid var(--Strokes-2, rgba(247, 146, 86, 0.20))',
                          background:
                            'linear-gradient(90deg, #131515 0%, rgba(36, 106, 115, 0.30) 100%)',
                        }}
                      >
                        <td className="relative rounded-l-[5px] px-3 py-2 text-xs text-white sm:px-4 sm:py-3 sm:text-sm">
                          {/* Background SVG for counter rank */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="127"
                            height="75"
                            viewBox="0 0 127 75"
                            fill="none"
                            className="pointer-events-none absolute bottom-0 left-0 z-0 h-full w-auto"
                            style={{ zIndex: 0 }}
                          >
                            <path
                              d="M0 5C0 2.23858 2.23858 0 5 0H123L108 75H5C2.23858 75 0 72.7614 0 70V5Z"
                              fill="#246A73"
                            />
                            <path
                              d="M123 0L108 75H112L127 0H123Z"
                              fill="#3DCCC7"
                            />
                          </svg>
                          {row.rank === 1 ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="127"
                              height="75"
                              viewBox="0 0 127 75"
                              fill="none"
                              className="pointer-events-none absolute bottom-0 left-0 h-full w-auto"
                              style={{ zIndex: 10 }}
                            >
                              <path
                                d="M0 5C0 2.23858 2.23858 0 5 0H123L108 75H5C2.23858 75 0 72.7614 0 70V5Z"
                                fill={`url(#paint0_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M78.9765 36.9559C78.9765 48.3407 69.7473 57.57 58.3624 57.57C46.9776 57.57 37.7484 48.3407 37.7484 36.9559C37.7484 25.5711 46.9776 16.3419 58.3624 16.3419C69.7473 16.3419 78.9765 25.5711 78.9765 36.9559Z"
                                fill={`url(#paint1_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M78.9765 36.9559C78.9765 48.3407 69.7473 57.57 58.3624 57.57C46.9776 57.57 37.7484 48.3407 37.7484 36.9559C37.7484 25.5711 46.9776 16.3419 58.3624 16.3419C69.7473 16.3419 78.9765 25.5711 78.9765 36.9559Z"
                                fill={`url(#paint2_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M77.3809 36.9561C77.3809 47.4599 68.8659 55.9749 58.3622 55.9749C47.8584 55.9749 39.3434 47.4599 39.3434 36.9561C39.3434 26.4524 47.8584 17.9374 58.3622 17.9374C68.8659 17.9374 77.3809 26.4524 77.3809 36.9561Z"
                                fill={`url(#paint3_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M46.341 33.2486L54.6477 32.0416L58.3625 24.5145L62.0774 32.0416L70.3841 33.2486L64.3733 39.1077L65.7922 47.3808L58.3625 43.4748L50.9328 47.3808L52.3517 39.1077L46.341 33.2486Z"
                                fill="white"
                              />

                              <path
                                d="M80.9291 44.5421C76.8053 44.1343 71.6048 39.9461 68.5422 37.7318C68.1105 37.9788 67.2504 38.8944 67.4927 39.2583C68.4522 40.6991 70.5885 44.6119 74.0741 47.2931C77.2587 49.7428 81.5342 48.9623 82.0982 45.7274C82.1224 45.0668 81.5877 44.6073 80.9291 44.5421Z"
                                fill={`url(#paint4_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M69.8762 38.7104C72.9749 40.9968 77.3561 44.1887 80.9291 44.5421C81.5877 44.6073 82.1224 45.0668 82.0982 45.7274C81.956 46.5429 81.5762 47.2007 81.0393 47.6918C77.2136 47.6874 73.2555 44.8973 69.3752 40.2191C69.5229 39.6806 69.6919 39.1786 69.8762 38.7104Z"
                                fill="white"
                              />

                              <path
                                d="M86.669 38.2432C81.453 39.3038 74.5019 38.9957 69.961 37.4318C69.516 37.8991 68.7107 38.9566 69.1726 39.2587C73.3709 42.005 75.3305 43.6813 80.0431 45.7763C84.7142 47.8529 88.9562 43.4524 88.5211 39.2586C88.3203 38.4366 87.5021 38.0738 86.669 38.2432Z"
                                fill={`url(#paint5_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M88.5298 39.2584C88.9608 43.4126 84.8025 47.7697 80.1838 45.8332C80.097 45.7996 80.0517 45.7761 80.0517 45.7761C80.0958 45.7957 80.1398 45.8147 80.1838 45.8332C80.7041 46.0343 82.7167 46.5967 85.4285 44.6325C88.5929 42.3404 88.5298 39.2584 88.5298 39.2584Z"
                                fill={`url(#paint6_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M69.961 37.4318C74.5019 38.9957 81.453 39.3038 86.669 38.2432C87.5021 38.0738 88.3203 38.4366 88.5211 39.2586C88.6332 40.3398 88.432 41.4338 87.9952 42.4279C83.9278 45.0493 75.5437 42.2914 69.2628 38.3478C69.4622 38.0057 69.7509 37.6524 69.961 37.4318Z"
                                fill="white"
                              />

                              <path
                                d="M87.3044 30.736C82.1763 33.8203 74.9018 35.9012 70.1446 36.4148C69.9228 37.0312 69.6083 38.3106 70.1446 38.4179C74.9065 39.371 80.3732 40.5829 85.7504 40.4137C90.6494 40.2596 91.601 34.1957 90.1595 31.1486C89.5712 29.9048 88.2529 30.1655 87.3044 30.736Z"
                                fill={`url(#paint7_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M87.3112 30.7365C88.2597 30.1661 89.5783 29.9049 90.1666 31.1487C90.4458 31.7387 90.633 32.4421 90.7213 33.1936C86.6191 36.3216 80.3365 38.3464 69.8766 37.5442C69.9228 37.1493 70.0468 36.7077 70.152 36.4153C74.909 35.9016 82.1832 33.8206 87.3112 30.7365Z"
                                fill="white"
                              />

                              <path
                                d="M87.3044 30.736C88.2529 30.1655 89.5712 29.9048 90.1595 31.1486C90.4386 31.7387 90.6259 32.4422 90.7142 33.1936C88.5026 34.8801 85.6567 36.2439 81.8646 37.0188L82.3793 33.1653C84.1261 32.45 85.8074 31.6364 87.3044 30.736Z"
                                fill="white"
                              />

                              <path
                                d="M87.3144 30.7368C88.2629 30.1663 89.5815 29.9051 90.1699 31.1489C90.449 31.7389 90.6362 32.4424 90.7245 33.1938C89.493 34.1329 88.0643 34.971 86.3857 35.6645L86.8808 30.9907C87.0267 30.9065 87.1717 30.8226 87.3144 30.7368Z"
                                fill="white"
                              />

                              <path
                                d="M76.9398 35.6484C74.9425 38.7299 70.4417 40.2457 69.6187 39.5945C68.564 38.7601 70.0164 39.9376 71.1825 37.5335C72.5734 34.6661 72.1174 32.0499 75.932 31.1887C82.1388 29.7873 88.0026 24.5492 89.3854 22.2362C90.9151 19.6775 92.7181 22.543 92.7182 25.2273C92.7182 32.3497 88.4238 33.0255 84.7758 34.1395C80.1945 35.3792 78.0949 35.4166 76.9398 35.6484Z"
                                fill={`url(#paint8_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M89.3854 22.2362C89.9367 21.314 90.5227 21.0979 91.0479 21.3226C90.8818 25.4237 87.0033 32.4424 72.1631 34.9222C72.7524 33.1702 73.3943 31.7522 75.9981 31.1643C82.2047 29.7629 88.0027 24.5491 89.3854 22.2362Z"
                                fill="white"
                              />

                              <path
                                d="M83.1986 34.5434C82.9254 34.6094 82.6628 34.6702 82.4105 34.727L82.6869 31.7006C82.9655 31.5601 83.2356 31.4167 83.4974 31.2719L83.1986 34.5434Z"
                                fill="white"
                              />

                              <path
                                d="M87.7376 33.2104C86.7667 33.5756 85.7485 33.8425 84.7758 34.1395C84.4154 34.237 84.07 34.3253 83.7396 34.4086L84.0511 30.9565C85.838 29.901 87.2089 28.7508 88.2435 27.5874L87.7376 33.2104Z"
                                fill="white"
                              />

                              <path
                                d="M35.0441 44.5421C39.1678 44.1343 44.3683 39.9461 47.4309 37.7318C47.8626 37.9788 48.7227 38.8944 48.4804 39.2583C47.521 40.6991 45.3846 44.6119 41.899 47.2931C38.7144 49.7428 34.439 48.9623 33.8749 45.7274C33.8507 45.0668 34.3854 44.6073 35.0441 44.5421Z"
                                fill={`url(#paint9_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M46.0969 38.7104C42.9982 40.9968 38.617 44.1887 35.0441 44.5421C34.3854 44.6073 33.8507 45.0668 33.8749 45.7274C34.0171 46.5429 34.3969 47.2007 34.9338 47.6918C38.7596 47.6874 42.7176 44.8973 46.5979 40.2191C46.4503 39.6806 46.2812 39.1786 46.0969 38.7104Z"
                                fill="white"
                              />

                              <path
                                d="M29.3041 38.2432C34.5201 39.3038 41.4712 38.9957 46.0122 37.4318C46.4571 37.8991 47.2624 38.9566 46.8005 39.2587C42.6022 42.005 40.6426 43.6813 35.9301 45.7763C31.2589 47.8529 27.0169 43.4524 27.452 39.2586C27.6528 38.4366 28.471 38.0738 29.3041 38.2432Z"
                                fill={`url(#paint10_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M27.4434 39.2584C27.0124 43.4126 31.1706 47.7697 35.7893 45.8332C35.8762 45.7996 35.9214 45.7761 35.9214 45.7761C35.8773 45.7957 35.8333 45.8147 35.7893 45.8332C35.269 46.0343 33.2564 46.5967 30.5446 44.6325C27.3802 42.3404 27.4434 39.2584 27.4434 39.2584Z"
                                fill={`url(#paint11_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M46.0122 37.4318C41.4712 38.9957 34.5201 39.3038 29.3041 38.2432C28.471 38.0738 27.6528 38.4366 27.452 39.2586C27.3399 40.3398 27.5411 41.4338 27.9779 42.4279C32.0453 45.0493 40.4294 42.2914 46.7103 38.3478C46.5109 38.0057 46.2222 37.6524 46.0122 37.4318Z"
                                fill="white"
                              />

                              <path
                                d="M28.6687 30.736C33.7968 33.8203 41.0714 35.9012 45.8285 36.4148C46.0504 37.0312 46.3648 38.3106 45.8285 38.4179C41.0666 39.371 35.5999 40.5829 30.2227 40.4137C25.3238 40.2596 24.3722 34.1957 25.8136 31.1486C26.402 29.9048 27.7202 30.1655 28.6687 30.736Z"
                                fill={`url(#paint12_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M28.6619 30.7365C27.7135 30.1661 26.3948 29.9049 25.8065 31.1487C25.5273 31.7387 25.3401 32.4421 25.2518 33.1936C29.354 36.3216 35.6366 38.3464 46.0965 37.5442C46.0503 37.1493 45.9263 36.7077 45.8211 36.4153C41.0641 35.9016 33.7899 33.8206 28.6619 30.7365Z"
                                fill="white"
                              />

                              <path
                                d="M28.6687 30.736C27.7202 30.1655 26.402 29.9048 25.8136 31.1486C25.5345 31.7386 25.3473 32.442 25.2589 33.1934C27.4705 34.8798 30.3164 36.2436 34.1085 37.0186L33.5939 33.1651C31.847 32.4497 30.1657 31.6364 28.6687 30.736Z"
                                fill="white"
                              />

                              <path
                                d="M28.6587 30.7368C27.7102 30.1663 26.3916 29.9051 25.8033 31.1489C25.5242 31.7389 25.3369 32.4424 25.2486 33.1938C26.4801 34.1329 27.9088 34.971 29.5874 35.6645L29.0923 30.9907C28.9464 30.9064 28.8014 30.8226 28.6587 30.7368Z"
                                fill="white"
                              />

                              <path
                                d="M39.0333 35.6484C41.0306 38.7299 45.5314 40.2457 46.3544 39.5945C47.409 38.7601 45.9567 39.9376 44.7906 37.5335C43.3997 34.6661 43.8557 32.0499 40.0411 31.1887C33.8343 29.7873 27.9705 24.5492 26.5877 22.2362C25.058 19.6775 23.255 22.543 23.2549 25.2273C23.2549 32.3497 27.5493 33.0255 31.1973 34.1395C35.7786 35.3792 37.8782 35.4166 39.0333 35.6484Z"
                                fill={`url(#paint13_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M26.5877 22.2362C26.0364 21.314 25.4504 21.0979 24.9252 21.3225C25.0913 25.4237 28.9698 32.4424 43.81 34.9222C43.2207 33.1702 42.5788 31.7522 39.975 31.1643C33.7684 29.7629 27.9704 24.5491 26.5877 22.2362Z"
                                fill="white"
                              />

                              <path
                                d="M32.7745 34.5434C33.0477 34.6094 33.3103 34.6702 33.5626 34.727L33.2862 31.7006C33.0076 31.5601 32.7375 31.4167 32.4757 31.2719L32.7745 34.5434Z"
                                fill="white"
                              />

                              <path
                                d="M28.2355 33.2104C29.2064 33.5756 30.2246 33.8425 31.1973 34.1395C31.5577 34.237 31.9031 34.3253 32.2335 34.4086L31.922 30.9565C30.1352 29.901 28.7642 28.7508 27.7296 27.5874L28.2355 33.2104Z"
                                fill="white"
                              />

                              <path
                                d="M75.8667 37.1546C75.8667 46.8219 68.0297 54.6589 58.3623 54.6589C48.6949 54.6589 40.858 46.8219 40.858 37.1546C40.858 27.4872 48.6949 19.6502 58.3623 19.6502C68.0297 19.6502 75.8667 27.4872 75.8667 37.1546Z"
                                fill={`url(#paint14_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M75.8667 37.1546C75.8667 46.8219 68.0297 54.6589 58.3623 54.6589C48.6949 54.6589 40.858 46.8219 40.858 37.1546C40.858 27.4872 48.6949 19.6502 58.3623 19.6502C68.0297 19.6502 75.8667 27.4872 75.8667 37.1546Z"
                                fill={`url(#paint15_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M72.8285 37.1547C72.8285 45.1442 66.3517 51.6209 58.3623 51.6209C50.3728 51.6209 43.8961 45.1442 43.8961 37.1547C43.8961 29.1653 50.3728 22.6885 58.3623 22.6885C66.3517 22.6885 72.8285 29.1653 72.8285 37.1547Z"
                                fill={`url(#paint16_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M72.0139 37.1545C72.0139 44.6939 65.902 50.8058 58.3625 50.8058C50.8231 50.8058 44.7112 44.6939 44.7112 37.1545C44.7112 29.6151 50.8231 23.5032 58.3625 23.5032C65.902 23.5032 72.0139 29.6151 72.0139 37.1545Z"
                                fill={`url(#paint17_linear_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M47.928 20.691C48.0652 20.8282 46.9173 22.1985 45.3642 23.7517C43.811 25.3048 42.4407 26.4527 42.3035 26.3155C42.1663 26.1783 43.3141 24.808 44.8673 23.2548C46.4205 21.7016 47.7908 20.5538 47.928 20.691Z"
                                fill={`url(#paint18_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M49.147 27.5344C49.0098 27.6716 47.0937 25.9779 44.8672 23.7515C42.6408 21.5251 40.9472 19.609 41.0844 19.4718C41.2216 19.3346 43.1377 21.0282 45.3641 23.2547C47.5905 25.4811 49.2842 27.3972 49.147 27.5344Z"
                                fill={`url(#paint19_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M46.3186 22.3003C46.9281 22.9098 46.8837 23.9425 46.2193 24.6069C45.555 25.2713 44.5223 25.3157 43.9127 24.7062C43.3032 24.0966 43.3477 23.0639 44.012 22.3996C44.6764 21.7352 45.7091 21.6908 46.3186 22.3003Z"
                                fill={`url(#paint20_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M47.002 21.6171C48.0202 22.6353 48.0012 24.3051 46.9597 25.3467C45.9181 26.3883 44.2483 26.4072 43.2301 25.389C42.2119 24.3708 42.2309 22.701 43.2724 21.6594C44.314 20.6179 45.9838 20.5989 47.002 21.6171Z"
                                fill={`url(#paint21_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M53.625 31.258C53.7028 31.3029 53.3537 32.0532 52.8453 32.9339C52.3368 33.8146 51.8616 34.4921 51.7838 34.4472C51.706 34.4022 52.0551 33.6519 52.5635 32.7712C53.072 31.8906 53.5472 31.2131 53.625 31.258Z"
                                fill={`url(#paint22_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M54.9897 34.1721C54.9447 34.2499 53.8849 33.7222 52.6225 32.9933C51.3601 32.2645 50.3732 31.6106 50.4181 31.5328C50.463 31.455 51.5228 31.9827 52.7852 32.7116C54.0476 33.4404 55.0346 34.0944 54.9897 34.1721Z"
                                fill={`url(#paint23_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M53.0986 32.1705C53.4442 32.37 53.5481 32.8371 53.3306 33.2138C53.1131 33.5905 52.6566 33.7341 52.311 33.5346C51.9654 33.3351 51.8616 32.8679 52.079 32.4912C52.2965 32.1145 52.753 31.9709 53.0986 32.1705Z"
                                fill={`url(#paint24_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M53.3216 31.783C53.8989 32.1164 54.0905 32.8653 53.7496 33.4559C53.4086 34.0465 52.6642 34.255 52.0868 33.9217C51.5095 33.5884 51.3179 32.8394 51.6589 32.2488C51.9998 31.6583 52.7443 31.4497 53.3216 31.783Z"
                                fill={`url(#paint25_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M59.8185 28.2229C59.8485 28.2402 59.714 28.5293 59.5181 28.8686C59.3222 29.2079 59.139 29.469 59.1091 29.4517C59.0791 29.4344 59.2136 29.1452 59.4095 28.8059C59.6054 28.4666 59.7885 28.2055 59.8185 28.2229Z"
                                fill={`url(#paint26_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M60.3446 29.3455C60.3272 29.3755 59.9189 29.1721 59.4325 28.8913C58.9461 28.6105 58.5658 28.3585 58.5831 28.3285C58.6004 28.2986 59.0087 28.5019 59.4952 28.7827C59.9816 29.0636 60.3619 29.3155 60.3446 29.3455Z"
                                fill={`url(#paint27_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M59.6162 28.5741C59.7494 28.651 59.7894 28.831 59.7056 28.9761C59.6218 29.1213 59.4459 29.1766 59.3128 29.0997C59.1796 29.0228 59.1396 28.8429 59.2234 28.6977C59.3072 28.5526 59.4831 28.4972 59.6162 28.5741Z"
                                fill={`url(#paint28_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M59.874 28.1261C60.2577 28.3477 60.3851 28.8454 60.1585 29.2379C59.9319 29.6304 59.4371 29.769 59.0534 29.5475C58.6698 29.3259 58.5424 28.8282 58.769 28.4357C58.9956 28.0432 59.4904 27.9046 59.874 28.1261Z"
                                fill={`url(#paint29_radial_258_1061_rank1_${index})`}
                              />

                              <path
                                d="M72 37.5C72 44.9558 65.9558 51 58.5 51C51.0442 51 45 44.9558 45 37.5C45 30.0442 51.0442 24 58.5 24C65.9558 24 72 30.0442 72 37.5Z"
                                fill="#985841"
                              />

                              <path
                                d="M123 0L108 75H112L127 0H123Z"
                                fill="#F9DB36"
                              />

                              <path
                                d="M55.8492 30.7897H58.3781C59.6236 30.7897 60.1331 31.2993 60.1331 32.3938V43.5848C60.1331 43.8679 59.9822 44 59.6991 44H57.7175C57.4345 44 57.3024 43.8679 57.3024 43.5848V33.7904C57.3024 33.5073 57.1703 33.3941 56.9061 33.3941H55.8492C55.585 33.3941 55.4341 33.2619 55.4341 32.9789V31.2049C55.4341 30.9218 55.585 30.7897 55.8492 30.7897Z"
                                fill="white"
                              />

                              <defs>
                                <linearGradient
                                  id={`paint0_linear_258_1061_rank1_${index}`}
                                  x1="17.0366"
                                  y1="41.5"
                                  x2="117.191"
                                  y2="40.967"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#A96F23" />

                                  <stop offset="1" stopColor="#784431" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint1_linear_258_1061_rank1_${index}`}
                                  x1="27.0815"
                                  y1="9.82581"
                                  x2="70.0319"
                                  y2="87.6835"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFDA79" />

                                  <stop offset="0.473958" stopColor="#FFC759" />

                                  <stop offset="1" stopColor="#FFE39B" />
                                </linearGradient>

                                <radialGradient
                                  id={`paint2_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(46.1897 42.215 -71.4841 27.2774 38.6289 7.22796)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <linearGradient
                                  id={`paint3_linear_258_1061_rank1_${index}`}
                                  x1="31.2873"
                                  y1="6.00774"
                                  x2="60.1706"
                                  y2="83.6103"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFBE3F" />

                                  <stop offset="0.479167" stopColor="#FFE6A6" />

                                  <stop offset="1" stopColor="#FFD9A0" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint4_linear_258_1061_rank1_${index}`}
                                  x1="127.208"
                                  y1="29.3289"
                                  x2="50.1556"
                                  y2="58.0632"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FF8125" />

                                  <stop offset="1" stopColor="#FFDE89" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint5_linear_258_1061_rank1_${index}`}
                                  x1="127.208"
                                  y1="29.3289"
                                  x2="50.1556"
                                  y2="58.0632"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FF8125" />

                                  <stop offset="1" stopColor="#FFDCA7" />
                                </linearGradient>

                                <radialGradient
                                  id={`paint6_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(-45.8122 -7.05696 192.042 -162.353 130.498 48.4217)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <linearGradient
                                  id={`paint7_linear_258_1061_rank1_${index}`}
                                  x1="40.4452"
                                  y1="64.4926"
                                  x2="126.81"
                                  y2="52.1095"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFEAB5" />

                                  <stop offset="1" stopColor="#FFA959" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint8_linear_258_1061_rank1_${index}`}
                                  x1="-4.72628"
                                  y1="72.4573"
                                  x2="84.1266"
                                  y2="-36.9163"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset="0.308652" stopColor="#FFA724" />

                                  <stop offset="1" stopColor="white" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint9_linear_258_1061_rank1_${index}`}
                                  x1="127.208"
                                  y1="29.3289"
                                  x2="50.1556"
                                  y2="58.0632"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FF8125" />

                                  <stop offset="1" stopColor="#FFDE89" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint10_linear_258_1061_rank1_${index}`}
                                  x1="127.208"
                                  y1="29.3289"
                                  x2="50.1556"
                                  y2="58.0632"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FF8125" />

                                  <stop offset="1" stopColor="#FFDCA7" />
                                </linearGradient>

                                <radialGradient
                                  id={`paint11_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(-45.8122 -7.05696 192.042 -162.353 130.498 48.4217)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <linearGradient
                                  id={`paint12_linear_258_1061_rank1_${index}`}
                                  x1="40.4452"
                                  y1="64.4926"
                                  x2="126.81"
                                  y2="52.1095"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFEAB5" />

                                  <stop offset="1" stopColor="#FFA959" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint13_linear_258_1061_rank1_${index}`}
                                  x1="-4.72628"
                                  y1="72.4573"
                                  x2="84.1266"
                                  y2="-36.9163"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset="0.308652" stopColor="#FFA724" />

                                  <stop offset="1" stopColor="white" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint14_linear_258_1061_rank1_${index}`}
                                  x1="58.8553"
                                  y1="1.21179e-06"
                                  x2="77.0763"
                                  y2="68.0001"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFF0B9" />

                                  <stop offset="1" stopColor="#FFCC7E" />
                                </linearGradient>

                                <radialGradient
                                  id={`paint15_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(76.4127 34.0354 -57.6333 45.1256 13.6064 10.7939)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <linearGradient
                                  id={`paint16_linear_258_1061_rank1_${index}`}
                                  x1="31.2873"
                                  y1="6.00774"
                                  x2="60.1706"
                                  y2="83.6103"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#F5C54A" />

                                  <stop offset="0.479167" stopColor="#FFE8AC" />

                                  <stop offset="1" stopColor="#F5C54A" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint17_linear_258_1061_rank1_${index}`}
                                  x1="98.0257"
                                  y1="75"
                                  x2="70.4592"
                                  y2="-7.00106"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset="0.255208" stopColor="#FFF6C5" />

                                  <stop offset="0.802083" stopColor="#A55002" />
                                </linearGradient>

                                <radialGradient
                                  id={`paint18_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint19_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint20_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint21_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint22_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint23_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint24_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint25_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint26_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint27_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint28_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint29_radial_258_1061_rank1_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
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
                              style={{ zIndex: 10 }}
                            >
                              <path
                                d="M0 5C0 2.23858 2.23858 0 5 0H123L108 75H5C2.23858 75 0 72.7614 0 70V5Z"
                                fill={`url(#paint0_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M123 0L108 75H112L127 0H123Z"
                                fill="#61CAF2"
                              />

                              <path
                                d="M83.0532 36.9266C83.0532 49.6667 72.7253 59.9946 59.9852 59.9946C47.2451 59.9946 36.9172 49.6667 36.9172 36.9266C36.9172 24.1865 47.2451 13.8586 59.9852 13.8586C72.7253 13.8586 83.0532 24.1865 83.0532 36.9266Z"
                                fill={`url(#paint1_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M83.0532 36.9266C83.0532 49.6667 72.7253 59.9946 59.9852 59.9946C47.2451 59.9946 36.9172 49.6667 36.9172 36.9266C36.9172 24.1865 47.2451 13.8586 59.9852 13.8586C72.7253 13.8586 83.0532 24.1865 83.0532 36.9266Z"
                                fill={`url(#paint2_radial_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M81.2676 36.9268C81.2676 48.6809 71.739 58.2095 59.9849 58.2095C48.2307 58.2095 38.7021 48.6809 38.7021 36.9268C38.7021 25.1726 48.2307 15.644 59.9849 15.644C71.739 15.644 81.2676 25.1726 81.2676 36.9268Z"
                                fill={`url(#paint3_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M81.2676 36.9268C81.2676 48.6809 71.739 58.2095 59.9849 58.2095C48.2307 58.2095 38.7021 48.6809 38.7021 36.9268C38.7021 25.1726 48.2307 15.644 59.9849 15.644C71.739 15.644 81.2676 25.1726 81.2676 36.9268Z"
                                fill={`url(#paint4_linear_258_1063_rank2_${index})`}
                                fillOpacity="0.2"
                              />

                              <path
                                d="M83.9811 44.7015C79.378 44.2463 73.5729 39.5712 70.1542 37.0995C69.6723 37.3751 68.7122 38.3972 68.9827 38.8034C70.0536 40.4117 72.4384 44.7794 76.3292 47.7724C79.8841 50.5069 84.6566 49.6357 85.2862 46.0247C85.3132 45.2872 84.7164 44.7743 83.9811 44.7015Z"
                                fill={`url(#paint5_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M71.6428 38.1926C75.1017 40.7449 79.9928 44.307 83.9811 44.7015C84.7164 44.7743 85.3132 45.2872 85.2862 46.0247C85.1275 46.9349 84.704 47.6698 84.1047 48.218C79.8341 48.2133 75.4157 45.0984 71.0842 39.8762C71.2489 39.2753 71.4372 38.7151 71.6428 38.1926Z"
                                fill="white"
                              />

                              <path
                                d="M90.3883 37.6702C84.5659 38.8541 76.8066 38.5102 71.7377 36.7644C71.2411 37.2861 70.3421 38.4665 70.8577 38.8038C75.5441 41.8693 77.7316 43.7405 82.992 46.0791C88.2062 48.3972 92.9414 43.485 92.4557 38.8037C92.2316 37.8861 91.3182 37.4811 90.3883 37.6702Z"
                                fill={`url(#paint6_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M92.4654 38.8037C92.9465 43.4408 88.3048 48.3045 83.1491 46.1428C83.0522 46.1053 83.0016 46.0791 83.0016 46.0791C83.0508 46.101 83.1 46.1222 83.1491 46.1428C83.7299 46.3672 85.9765 46.995 89.0036 44.8025C92.5358 42.244 92.4654 38.8037 92.4654 38.8037Z"
                                fill={`url(#paint7_radial_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M71.7377 36.7644C76.8066 38.5102 84.5659 38.8541 90.3883 37.6702C91.3182 37.4811 92.2316 37.8861 92.4557 38.8037C92.581 40.011 92.3558 41.2325 91.8679 42.3426C87.3269 45.2681 77.9676 42.1884 70.9568 37.786C71.1794 37.4041 71.5033 37.0107 71.7377 36.7644Z"
                                fill="white"
                              />

                              <path
                                d="M91.0976 29.2905C85.3733 32.7333 77.253 35.0561 71.9428 35.6295C71.6952 36.3175 71.3442 37.7457 71.9428 37.8655C77.2583 38.9294 83.3606 40.2821 89.363 40.0933C94.8315 39.9213 95.8937 33.1524 94.2847 29.7511C93.6279 28.3627 92.1564 28.6537 91.0976 29.2905Z"
                                fill={`url(#paint8_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M91.1056 29.2905C92.1644 28.6537 93.6363 28.363 94.2931 29.7514C94.6046 30.4099 94.8136 31.195 94.9123 32.0336C90.3328 35.5256 83.3191 37.786 71.6417 36.8901C71.6933 36.4492 71.8338 35.9558 71.9513 35.6293C77.2615 35.0559 85.3815 32.7332 91.1056 29.2905Z"
                                fill="white"
                              />

                              <path
                                d="M91.0976 29.2905C92.1564 28.6537 93.6279 28.3627 94.2847 29.7511C94.5961 30.4095 94.8056 31.1948 94.9042 32.0334C92.4354 33.916 89.2584 35.4388 85.0253 36.3039L85.6005 32.0022C87.5504 31.2037 89.4266 30.2955 91.0976 29.2905Z"
                                fill="white"
                              />

                              <path
                                d="M91.109 29.2902C92.1677 28.6535 93.6397 28.3631 94.2965 29.7512C94.6079 30.4097 94.817 31.1949 94.9157 32.0334C93.5409 33.0817 91.9458 34.017 90.0719 34.7912L90.6246 29.5744C90.7877 29.4803 90.9496 29.3861 91.109 29.2902Z"
                                fill="white"
                              />

                              <path
                                d="M35.9889 44.7015C40.592 44.2463 46.3971 39.5712 49.8158 37.0995C50.2977 37.3751 51.2578 38.3972 50.9873 38.8034C49.9163 40.4117 47.5316 44.7794 43.6408 47.7724C40.0859 50.5069 35.3134 49.6356 34.6838 46.0247C34.6568 45.2872 35.2536 44.7743 35.9889 44.7015Z"
                                fill={`url(#paint9_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M48.3272 38.1926C44.8683 40.7449 39.9772 44.307 35.9889 44.7015C35.2536 44.7743 34.6568 45.2872 34.6838 46.0247C34.8425 46.9349 35.266 47.6698 35.8653 48.218C40.1359 48.2132 44.5543 45.0984 48.8858 39.8762C48.7211 39.2753 48.5328 38.7151 48.3272 38.1926Z"
                                fill="white"
                              />

                              <path
                                d="M29.5817 37.6702C35.4041 38.8541 43.1634 38.5102 48.2323 36.7644C48.7289 37.2861 49.6279 38.4665 49.1123 38.8038C44.4259 41.8693 42.2384 43.7405 36.978 46.0791C31.7638 48.3972 27.0286 43.485 27.5142 38.8037C27.7384 37.8861 28.6518 37.4811 29.5817 37.6702Z"
                                fill={`url(#paint10_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M27.5046 38.8037C27.0235 43.4408 31.6652 48.3045 36.8209 46.1428C36.9178 46.1053 36.9683 46.0791 36.9683 46.0791C36.9191 46.101 36.87 46.1222 36.8209 46.1428C36.2401 46.3672 33.9935 46.995 30.9664 44.8025C27.4342 42.244 27.5046 38.8037 27.5046 38.8037Z"
                                fill={`url(#paint11_radial_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M48.2323 36.7644C43.1634 38.5102 35.4041 38.8541 29.5817 37.6702C28.6518 37.4811 27.7384 37.8861 27.5142 38.8037C27.389 40.011 27.6142 41.2325 28.1021 42.3426C32.6431 45.2681 42.0023 42.1883 49.0132 37.786C48.7906 37.4041 48.4667 37.0107 48.2323 36.7644Z"
                                fill="white"
                              />

                              <path
                                d="M28.8724 29.2904C34.5967 32.7333 42.717 35.0561 48.0272 35.6295C48.2748 36.3175 48.6258 37.7457 48.0272 37.8655C42.7117 38.9294 36.6094 40.2821 30.607 40.0933C25.1385 39.9213 24.0763 33.1524 25.6853 29.751C26.3421 28.3627 27.8136 28.6537 28.8724 29.2904Z"
                                fill={`url(#paint12_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M28.8644 29.2905C27.8056 28.6537 26.3337 28.363 25.6769 29.7514C25.3654 30.4099 25.1564 31.195 25.0577 32.0336C29.6372 35.5256 36.6509 37.786 48.3283 36.8901C48.2767 36.4491 48.1362 35.9558 48.0187 35.6293C42.7085 35.0559 34.5885 32.7332 28.8644 29.2905Z"
                                fill="white"
                              />

                              <path
                                d="M28.8724 29.2904C27.8136 28.6537 26.3421 28.3627 25.6853 29.751C25.3739 30.4095 25.1644 31.1948 25.0658 32.0334C27.5346 33.916 30.7116 35.4388 34.9447 36.3039L34.3695 32.0021C32.4196 31.2037 30.5434 30.2955 28.8724 29.2904Z"
                                fill="white"
                              />

                              <path
                                d="M28.861 29.2902C27.8023 28.6535 26.3303 28.3631 25.6735 29.7512C25.3621 30.4096 25.153 31.1948 25.0543 32.0334C26.4291 33.0817 28.0242 34.017 29.8981 34.7912L29.3454 29.5744C29.1823 29.4803 29.0204 29.3861 28.861 29.2902Z"
                                fill="white"
                              />

                              <path
                                d="M79.5732 36.9267C79.5732 47.7449 70.8033 56.5148 59.985 56.5148C49.1668 56.5148 40.3969 47.7449 40.3969 36.9267C40.3969 26.1085 49.1668 17.3386 59.985 17.3386C70.8033 17.3386 79.5732 26.1085 79.5732 36.9267Z"
                                fill={`url(#paint13_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M76.1734 36.9265C76.1734 45.867 68.9256 53.1148 59.9851 53.1148C51.0445 53.1148 43.7968 45.867 43.7968 36.9265C43.7968 27.9859 51.0445 20.7382 59.9851 20.7382C68.9256 20.7382 76.1734 27.9859 76.1734 36.9265Z"
                                fill={`url(#paint14_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M75.2617 36.9265C75.2617 45.3635 68.4223 52.2029 59.9853 52.2029C51.5484 52.2029 44.7089 45.3635 44.7089 36.9265C44.7089 28.4896 51.5484 21.6501 59.9853 21.6501C68.4223 21.6501 75.2617 28.4896 75.2617 36.9265Z"
                                fill={`url(#paint15_linear_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M49.6698 17.9262C49.8234 18.0797 48.5389 19.6131 46.8008 21.3512C45.0627 23.0893 43.5293 24.3738 43.3758 24.2203C43.2222 24.0667 44.5067 22.5333 46.2448 20.7952C47.9829 19.0571 49.5163 17.7726 49.6698 17.9262Z"
                                fill={`url(#paint16_radial_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M51.0338 25.5843C50.8803 25.7379 48.7361 23.8426 46.2446 21.3512C43.7532 18.8597 41.8579 16.7155 42.0114 16.562C42.165 16.4084 44.3092 18.3037 46.8006 20.7951C49.2921 23.2866 51.1874 25.4308 51.0338 25.5843Z"
                                fill={`url(#paint17_radial_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M47.8689 19.7271C48.551 20.4092 48.5013 21.5648 47.7578 22.3083C47.0144 23.0517 45.8588 23.1015 45.1767 22.4194C44.4946 21.7373 44.5443 20.5816 45.2878 19.8382C46.0312 19.0947 47.1868 19.045 47.8689 19.7271Z"
                                fill={`url(#paint18_radial_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M48.6337 18.9626C49.7731 20.102 49.7519 21.9706 48.5863 23.1362C47.4208 24.3017 45.5522 24.3229 44.4128 23.1835C43.2734 22.0441 43.2946 20.1756 44.4602 19.01C45.6257 17.8444 47.4943 17.8232 48.6337 18.9626Z"
                                fill={`url(#paint19_radial_258_1063_rank2_${index})`}
                              />

                              <path
                                d="M75 37.3357C75 45.62 68.2843 52.3357 60 52.3357C51.7157 52.3357 45 45.62 45 37.3357C45 29.0514 51.7157 22.3357 60 22.3357C68.2843 22.3357 75 29.0514 75 37.3357Z"
                                fill="#2B5478"
                              />

                              <path
                                d="M53.9627 30.7897H63.9458C66.1161 30.7897 67.2862 31.922 67.2862 33.8658V35.1869C67.2862 37.3194 66.0784 38.5461 63.9836 38.5461H56.8689C56.1895 38.5461 55.8876 38.9046 55.8876 39.6217V40.9994C55.8876 41.2636 56.0008 41.3957 56.265 41.3957H66.8521C67.1163 41.3957 67.2673 41.5278 67.2673 41.8109V43.5848C67.2673 43.8679 67.1163 44 66.8521 44H54.793C53.5475 44 53.0568 43.5093 53.0568 42.3959V39.4896C53.0568 37.3383 54.2269 36.1116 56.3405 36.1116H63.4552C64.1346 36.1116 64.4554 35.7719 64.4554 35.0548V34.4509C64.4554 33.7337 64.1157 33.3941 63.4552 33.3941H53.9627C53.6796 33.3941 53.5286 33.2619 53.5286 32.9789V31.2049C53.5286 30.9218 53.6796 30.7897 53.9627 30.7897Z"
                                fill="white"
                              />

                              <defs>
                                <linearGradient
                                  id={`paint0_linear_258_1063_rank2_${index}`}
                                  x1="17.0366"
                                  y1="41.5"
                                  x2="117.191"
                                  y2="40.967"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#2D4DA5" />

                                  <stop offset="1" stopColor="#3A26AE" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint1_linear_258_1063_rank2_${index}`}
                                  x1="98.8171"
                                  y1="70.3968"
                                  x2="70.1509"
                                  y2="-8.88781"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#B9EEFF" />

                                  <stop offset="0.523284" stopColor="#61A2D0" />

                                  <stop offset="1" stopColor="#FEFEFF" />
                                </linearGradient>

                                <radialGradient
                                  id={`paint2_radial_258_1063_rank2_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(4.97073 21.8826 -37.0545 2.93547 65.9238 -9.57362)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <linearGradient
                                  id={`paint3_linear_258_1063_rank2_${index}`}
                                  x1="58.8553"
                                  y1="-2.07881e-08"
                                  x2="60.4766"
                                  y2="75.0653"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#61A2D0" />

                                  <stop offset="1" stopColor="#E8F4FF" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint4_linear_258_1063_rank2_${index}`}
                                  x1="26.6822"
                                  y1="67.0162"
                                  x2="43.1886"
                                  y2="16.7756"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#3F698F" />

                                  <stop
                                    offset="1"
                                    stopColor="#3F518F"
                                    stopOpacity="0"
                                  />
                                </linearGradient>

                                <linearGradient
                                  id={`paint5_linear_258_1063_rank2_${index}`}
                                  x1="106.482"
                                  y1="33.0085"
                                  x2="119.753"
                                  y2="58.5634"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#8DCBDE" />

                                  <stop offset="1" stopColor="#EEFEFF" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint6_linear_258_1063_rank2_${index}`}
                                  x1="127.208"
                                  y1="29.3289"
                                  x2="50.1556"
                                  y2="58.0632"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#8DDED9" />

                                  <stop offset="1" stopColor="#EEFCFF" />
                                </linearGradient>

                                <radialGradient
                                  id={`paint7_radial_258_1063_rank2_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(-45.8122 -7.05696 192.042 -162.353 130.498 48.4217)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <linearGradient
                                  id={`paint8_linear_258_1063_rank2_${index}`}
                                  x1="41.4552"
                                  y1="44.5607"
                                  x2="112.73"
                                  y2="61.9636"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#DEF5FF" />

                                  <stop offset="1" stopColor="#8DCFDD" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint9_linear_258_1063_rank2_${index}`}
                                  x1="106.482"
                                  y1="33.0085"
                                  x2="119.753"
                                  y2="58.5634"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#8DCBDE" />

                                  <stop offset="1" stopColor="#EEFEFF" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint10_linear_258_1063_rank2_${index}`}
                                  x1="127.208"
                                  y1="29.3289"
                                  x2="50.1556"
                                  y2="58.0632"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#8DDED9" />

                                  <stop offset="1" stopColor="#EEFCFF" />
                                </linearGradient>

                                <radialGradient
                                  id={`paint11_radial_258_1063_rank2_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(-45.8122 -7.05696 192.042 -162.353 130.498 48.4217)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <linearGradient
                                  id={`paint12_linear_258_1063_rank2_${index}`}
                                  x1="41.4552"
                                  y1="44.5607"
                                  x2="112.73"
                                  y2="61.9636"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#DEF5FF" />

                                  <stop offset="1" stopColor="#8DCFDD" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint13_linear_258_1063_rank2_${index}`}
                                  x1="58.8553"
                                  y1="-2.07881e-08"
                                  x2="60.4766"
                                  y2="75.0653"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#9DE2FF" />

                                  <stop offset="1" stopColor="#C8E9F8" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint14_linear_258_1063_rank2_${index}`}
                                  x1="58.8553"
                                  y1="-2.07881e-08"
                                  x2="60.4766"
                                  y2="75.0653"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#8BD6E0" />

                                  <stop offset="1" stopColor="#6FB6DD" />
                                </linearGradient>

                                <linearGradient
                                  id={`paint15_linear_258_1063_rank2_${index}`}
                                  x1="17.8529"
                                  y1="5.99728"
                                  x2="54.8122"
                                  y2="90.2308"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset="0.25" stopColor="#306583" />

                                  <stop offset="0.708333" stopColor="#98DAFF" />
                                </linearGradient>

                                <radialGradient
                                  id={`paint16_radial_258_1063_rank2_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint17_radial_258_1063_rank2_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint18_radial_258_1063_rank2_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>

                                <radialGradient
                                  id={`paint19_radial_258_1063_rank2_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientUnits="userSpaceOnUse"
                                  gradientTransform="translate(63.5 37.5) rotate(90) scale(37.5 63.5)"
                                >
                                  <stop stopColor="white" />

                                  <stop
                                    offset="1"
                                    stopColor="white"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
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
                              style={{ zIndex: 10 }}
                            >
                              <path
                                fill={`url(#a_rank3_${index})`}
                                d="M0 5a5 5 0 0 1 5-5h118l-15 75H5a5 5 0 0 1-5-5V5Z"
                              />
                              <path
                                fill="#F25E4C"
                                d="m123 0-15 75h4l15-75h-4Z"
                              />
                              <path
                                fill={`url(#b_rank3_${index})`}
                                d="M80.847 37.256c0 11.522-9.34 20.862-20.862 20.862-11.522 0-20.862-9.34-20.862-20.862 0-11.521 9.34-20.862 20.862-20.862 11.522 0 20.862 9.34 20.862 20.862Z"
                              />
                              <path
                                fill={`url(#c_rank3_${index})`}
                                d="M80.847 37.256c0 11.522-9.34 20.862-20.862 20.862-11.522 0-20.862-9.34-20.862-20.862 0-11.521 9.34-20.862 20.862-20.862 11.522 0 20.862 9.34 20.862 20.862Z"
                              />
                              <path
                                fill={`url(#d_rank3_${index})`}
                                d="M79.232 37.256c0 10.63-8.617 19.248-19.247 19.248-10.63 0-19.248-8.618-19.248-19.248S49.354 18.01 59.985 18.01c10.63 0 19.247 8.617 19.247 19.247Z"
                              />
                              <path
                                fill={`url(#e_rank3_${index})`}
                                d="M71.598 20.687c.276.276.255.743-.045 1.044-.301.301-.769.321-1.044.045-.276-.276-.256-.743.045-1.044.3-.3.768-.32 1.044-.045Z"
                              />
                              <path
                                fill={`url(#f_rank3_${index})`}
                                d="M71.907 20.378c.461.46.453 1.216-.019 1.688-.472.471-1.227.48-1.688.019-.461-.46-.453-1.217.019-1.688.471-.472 1.227-.48 1.688-.02Z"
                              />
                              <path
                                fill={`url(#g_rank3_${index})`}
                                d="M84.275 33.089c-2.273 1.35-6.53 1.163-8.94 1.184-.13.29-.225 1.085.037 1.18 1.038.378 3.615 1.582 6.42 1.642 2.564.055 4.466-1.963 3.532-3.839-.237-.349-.685-.383-1.049-.167Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M76.39 34.272c2.457.003 5.915-.014 7.885-1.183.364-.215.812-.181 1.05.167.235.473.288.955.198 1.41-1.968 1.445-5.057 1.508-8.82.57a9.446 9.446 0 0 1-.314-.964Z"
                              />
                              <path
                                fill={`url(#h_rank3_${index})`}
                                d="M84.844 27.682c-2.28 2.517-5.969 4.987-8.894 5.9-.052.409-.066 1.257.286 1.237 3.196-.176 4.837-.055 8.05-.76 3.187-.7 3.703-4.565 1.894-6.555-.414-.347-.972-.224-1.336.178Z"
                              />
                              <path
                                fill={`url(#i_rank3_${index})`}
                                d="M86.184 27.5c1.792 1.972 1.303 5.784-1.803 6.535.343-.093 1.59-.565 2.241-2.6.76-2.375-.438-3.935-.438-3.935Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M75.95 33.582c2.925-.913 6.614-3.383 8.894-5.9.364-.402.922-.525 1.336-.178.466.513.777 1.151.928 1.827-1.1 2.885-6.451 4.638-11.17 4.986a3.437 3.437 0 0 1 .012-.735Z"
                              />
                              <path
                                fill={`url(#j_rank3_${index})`}
                                d="M82.332 23.583c-1.47 3.524-4.421 7.344-6.672 9.407.119.4.441 1.177.757 1.03 2.808-1.311 6.076-2.755 8.775-4.876 2.46-1.931.656-5.407-1.237-6.428-.772-.417-1.351.215-1.623.867Z"
                              />
                              <path
                                fill="#FF969C"
                                d="M83.87 22.752c1.893 1.02 3.697 4.497 1.237 6.428-1 .785-2.077 1.478-3.18 2.105l-.056.032.055-.032c.414-.239 3.032-1.84 3.743-4.373.774-2.754-1.799-4.16-1.799-4.16Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M82.336 23.581c.271-.651.85-1.285 1.623-.868a4.24 4.24 0 0 1 1.058.841c-.926 3.16-3.388 6.576-9.068 10.118a3.521 3.521 0 0 1-.285-.684c2.25-2.063 5.202-5.883 6.672-9.407Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M82.332 23.583c.272-.652.85-1.284 1.623-.867a4.24 4.24 0 0 1 1.058.84c-.499 1.703-1.445 3.48-3.101 5.313l-1.193-2.177a23.224 23.224 0 0 0 1.613-3.109Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M82.338 23.579c.271-.652.851-1.284 1.624-.867a4.24 4.24 0 0 1 1.058.84 12.235 12.235 0 0 1-1.298 2.91L82.21 23.87c.042-.098.088-.194.129-.291Z"
                              />
                              <path
                                fill={`url(#k_rank3_${index})`}
                                d="M79.233 30.217c.139 2.339-1.601 4.82-2.27 4.796-.858-.03.334.026.024-1.65-.37-2-1.593-3.172.042-5.057 2.66-3.067 3.693-7.977 3.53-9.688-.182-1.894 1.828-1.103 2.843.277 2.693 3.66.742 5.631-.712 7.583-1.886 2.37-2.95 3.183-3.457 3.739Z"
                              />
                              <path
                                fill={`url(#l_rank3_${index})`}
                                d="M78.862 30.027c.139 2.34-1.601 4.82-2.27 4.797-.858-.03.334.026.024-1.651-.37-2-1.593-3.172.042-5.057 2.66-3.067 3.693-7.976 3.53-9.688-.182-1.893 1.828-1.102 2.843.278 2.693 3.66.742 5.631-.712 7.583-1.886 2.37-2.95 3.182-3.457 3.738Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M80.188 18.428c-.066-.682.154-1.014.508-1.097 1.466 2.17 2.124 7.242-4.564 14.127-.36-1.122-.564-2.093.55-3.379 2.66-3.067 3.67-7.939 3.505-9.65Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M81.66 27.093c-.114.137-.228.265-.336.39l-1.003-1.66c.09-.178.175-.354.255-.527l1.085 1.797ZM83.489 24.69c-.361.555-.782 1.079-1.17 1.599-.148.186-.294.36-.433.528l-1.145-1.892c.52-1.218.79-2.328.881-3.317l1.867 3.082Z"
                              />
                              <path
                                fill={`url(#m_rank3_${index})`}
                                d="M84.538 45.72c-3.487-.346-7.885-3.887-10.474-5.76-.365.21-1.093.983-.888 1.291.811 1.219 2.618 4.527 5.566 6.795 2.693 2.071 6.308 1.411 6.785-1.324.02-.559-.432-.947-.989-1.003Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M75.19 40.789c2.621 1.933 6.326 4.631 9.347 4.93.557.056 1.01.444.99 1.003a2.88 2.88 0 0 1-.894 1.661c-3.236-.002-6.583-2.362-9.865-6.319.125-.455.267-.88.423-1.275Z"
                              />
                              <path
                                fill={`url(#n_rank3_${index})`}
                                d="M89.392 40.393c-4.41.897-10.289.636-14.129-.686-.376.395-1.057 1.29-.666 1.545 3.55 2.322 5.207 3.74 9.192 5.511 3.95 1.756 7.537-1.965 7.17-5.511-.17-.696-.862-1.002-1.567-.86Z"
                              />
                              <path
                                fill={`url(#o_rank3_${index})`}
                                d="M90.966 41.252c.364 3.512-3.152 7.197-7.058 5.56.44.17 2.142.645 4.435-1.016 2.676-1.938 2.623-4.544 2.623-4.544Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M75.263 39.707c3.84 1.322 9.718 1.583 14.13.686.704-.143 1.395.163 1.565.858a5.322 5.322 0 0 1-.444 2.681c-3.44 2.217-10.53-.115-15.84-3.45.168-.29.411-.589.59-.775Z"
                              />
                              <path
                                fill={`url(#p_rank3_${index})`}
                                d="M89.93 34.044c-4.337 2.609-10.489 4.368-14.511 4.803-.188.52-.454 1.603 0 1.694 4.026.806 8.65 1.83 13.196 1.687 4.143-.13 4.948-5.258 3.729-7.835-.498-1.051-1.612-.83-2.414-.349Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M89.936 34.044c.801-.482 1.916-.702 2.413.35.236.499.395 1.093.47 1.729-3.469 2.645-8.782 4.358-17.628 3.68a4.66 4.66 0 0 1 .234-.956c4.023-.434 10.174-2.194 14.51-4.803Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M89.93 34.044c.802-.482 1.916-.702 2.414.35.236.498.394 1.093.469 1.73-1.87 1.425-4.277 2.578-7.484 3.233l.436-3.261c1.477-.605 2.899-1.29 4.165-2.051Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M89.94 34.044c.801-.482 1.916-.702 2.413.35.236.498.395 1.093.47 1.728a16.214 16.214 0 0 1-3.671 2.09l.42-3.953c.123-.072.246-.142.367-.215Z"
                              />
                              <path
                                fill={`url(#q_rank3_${index})`}
                                d="M81.412 38.693c-1.69 2.605-5.495 3.887-6.191 3.337-.892-.706.336.29 1.322-1.743 1.176-2.425.79-4.637 4.017-5.366 5.248-1.185 10.207-5.614 11.376-7.57 1.294-2.164 2.818.26 2.818 2.53 0 6.022-3.631 6.594-6.716 7.536-3.874 1.048-5.65 1.08-6.626 1.276Z"
                              />
                              <path
                                fill={`url(#r_rank3_${index})`}
                                d="M81.165 38.199c-1.69 2.606-5.495 3.887-6.191 3.337-.892-.706.336.29 1.322-1.743 1.176-2.425.79-4.637 4.016-5.365 5.249-1.185 10.208-5.615 11.377-7.57 1.294-2.165 2.818.258 2.818 2.528 0 6.023-3.631 6.595-6.716 7.537-3.874 1.048-5.65 1.08-6.626 1.276Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M91.689 26.857c.466-.78.962-.963 1.406-.773-.14 3.469-3.42 9.404-15.97 11.5.499-1.48 1.042-2.68 3.244-3.177 5.248-1.185 10.15-5.594 11.32-7.55Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M86.457 37.264c-.231.056-.453.108-.665.156l.233-2.563c.235-.118.463-.239.684-.361l-.252 2.768ZM90.294 36.138c-.82.308-1.681.534-2.503.785-.305.082-.597.158-.876.228l.262-2.922c1.512-.893 2.671-1.865 3.546-2.85l-.429 4.759Z"
                              />
                              <path
                                fill="#FF96AF"
                                d="M92.254 34.393c1.231 2.641.321 7.851-3.989 7.923-1.752.03-3.513-.104-5.247-.329l-.087-.011.087.011c.653.08 4.862.493 7.752-1.652 3.142-2.331 1.484-5.942 1.484-5.942Z"
                              />
                              <path
                                fill={`url(#s_rank3_${index})`}
                                d="M35.694 33.089c2.274 1.35 6.53 1.163 8.942 1.184.128.29.224 1.085-.038 1.18-1.038.378-3.615 1.582-6.42 1.642-2.564.055-4.466-1.963-3.532-3.839.237-.349.685-.383 1.048-.167Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M43.58 34.272c-2.457.003-5.916-.014-7.886-1.183-.363-.215-.81-.18-1.048.169a2.17 2.17 0 0 0-.199 1.409c1.968 1.444 5.057 1.507 8.82.57.128-.333.231-.655.313-.965Z"
                              />
                              <path
                                fill={`url(#t_rank3_${index})`}
                                d="M35.126 27.682c2.28 2.517 5.969 4.987 8.894 5.9.052.409.066 1.257-.286 1.237-3.196-.176-4.837-.055-8.05-.76-3.187-.7-3.703-4.565-1.894-6.555.414-.347.972-.224 1.336.178Z"
                              />
                              <path
                                fill={`url(#u_rank3_${index})`}
                                d="M33.786 27.5c-1.793 1.972-1.303 5.784 1.803 6.535a4.16 4.16 0 0 1 0 0c-.343-.093-1.59-.565-2.241-2.6-.76-2.375.438-3.935.438-3.935Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M44.02 33.582c-2.925-.913-6.614-3.383-8.894-5.9-.364-.402-.922-.525-1.336-.178a4.017 4.017 0 0 0-.928 1.827c1.1 2.885 6.451 4.638 11.17 4.986a3.437 3.437 0 0 0-.012-.735Z"
                              />
                              <path
                                fill={`url(#v_rank3_${index})`}
                                d="M37.638 23.583c1.47 3.524 4.421 7.344 6.672 9.407-.119.4-.441 1.177-.757 1.03-2.808-1.311-6.076-2.755-8.775-4.876-2.46-1.931-.656-5.407 1.237-6.428.772-.417 1.351.215 1.623.867Z"
                              />
                              <path
                                fill="#FF969C"
                                d="M36.1 22.752c-1.893 1.02-3.697 4.497-1.237 6.428a25.718 25.718 0 0 0 3.236 2.137l-.055-.032c-.413-.239-3.032-1.84-3.743-4.373-.774-2.754 1.799-4.16 1.799-4.16Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M37.635 23.58c-.272-.651-.852-1.284-1.624-.867a4.24 4.24 0 0 0-1.058.841c.926 3.16 3.389 6.575 9.068 10.118.126-.22.229-.494.285-.684-2.25-2.063-5.202-5.883-6.671-9.407Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M37.638 23.583c-.272-.652-.85-1.284-1.623-.867a4.238 4.238 0 0 0-1.058.84c.499 1.703 1.445 3.48 3.101 5.313l1.193-2.177a23.224 23.224 0 0 1-1.613-3.109Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M37.632 23.58c-.272-.652-.85-1.286-1.623-.869a4.242 4.242 0 0 0-1.058.841c.278.949.696 1.92 1.297 2.911l1.513-2.593c-.043-.097-.088-.194-.129-.29Z"
                              />
                              <path
                                fill={`url(#w_rank3_${index})`}
                                d="M40.737 30.217c-.139 2.339 1.601 4.82 2.27 4.796.858-.03-.334.026-.024-1.65.37-2 1.593-3.172-.042-5.057-2.66-3.067-3.693-7.977-3.53-9.688.182-1.894-1.828-1.103-2.843.277-2.693 3.66-.742 5.631.712 7.583 1.886 2.37 2.95 3.183 3.457 3.739Z"
                              />
                              <path
                                fill={`url(#x_rank3_${index})`}
                                d="M41.108 30.027c-.139 2.34 1.601 4.82 2.27 4.797.858-.03-.334.026-.024-1.651.37-2 1.593-3.172-.042-5.057-2.66-3.067-3.693-7.976-3.53-9.688.182-1.893-1.828-1.102-2.843.278-2.693 3.66-.742 5.631.712 7.583 1.886 2.37 2.95 3.182 3.457 3.738Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M39.782 18.428c.066-.682-.154-1.014-.508-1.097-1.466 2.17-2.124 7.242 4.564 14.127.36-1.122.564-2.093-.55-3.379-2.66-3.067-3.67-7.939-3.505-9.65Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M38.31 27.093c.114.137.228.265.336.39l1.003-1.66c-.09-.178-.175-.354-.255-.527l-1.085 1.797ZM36.481 24.69c.361.555.782 1.079 1.17 1.599.148.186.294.36.433.528l1.145-1.892c-.52-1.218-.79-2.328-.881-3.317L36.48 24.69Z"
                              />
                              <path
                                fill={`url(#y_rank3_${index})`}
                                d="M35.432 45.72c3.487-.346 7.884-3.887 10.474-5.76.365.21 1.093.983.888 1.291-.811 1.219-2.618 4.527-5.566 6.795-2.693 2.071-6.308 1.411-6.785-1.324-.02-.559.432-.947.989-1.003Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M44.78 40.789c-2.621 1.933-6.326 4.631-9.347 4.93-.557.056-1.01.444-.99 1.003.12.689.44 1.246.894 1.661 3.236-.002 6.583-2.362 9.865-6.319-.125-.455-.267-.88-.423-1.275Z"
                              />
                              <path
                                fill={`url(#z_rank3_${index})`}
                                d="M30.578 40.393c4.41.897 10.289.636 14.129-.686.376.395 1.057 1.29.666 1.545-3.55 2.322-5.207 3.74-9.192 5.511-3.95 1.756-7.537-1.965-7.17-5.511.17-.696.862-1.002 1.567-.86Z"
                              />
                              <path
                                fill={`url(#A_rank3_${index})`}
                                d="M29.004 41.252c-.364 3.512 3.152 7.197 7.058 5.56-.44.17-2.142.645-4.435-1.016-2.676-1.938-2.623-4.544-2.623-4.544Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M44.707 39.707c-3.84 1.322-9.718 1.583-14.13.686-.704-.143-1.396.163-1.565.858-.095.915.074 1.84.444 2.681 3.44 2.217 10.53-.115 15.84-3.45a4.555 4.555 0 0 0-.59-.775Z"
                              />
                              <path
                                fill={`url(#B_rank3_${index})`}
                                d="M30.04 34.044c4.337 2.609 10.489 4.368 14.511 4.803.188.52.454 1.603 0 1.694-4.026.806-8.65 1.83-13.196 1.687-4.143-.13-4.948-5.258-3.729-7.835.498-1.051 1.612-.83 2.415-.349Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M30.035 34.044c-.803-.482-1.917-.702-2.415.35a5.619 5.619 0 0 0-.47 1.729c3.47 2.645 8.783 4.358 17.629 3.68a4.654 4.654 0 0 0-.234-.956c-4.023-.434-10.174-2.194-14.51-4.803Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M30.04 34.044c-.802-.482-1.916-.702-2.414.35-.236.498-.394 1.093-.469 1.73 1.87 1.425 4.277 2.578 7.484 3.233l-.436-3.261c-1.477-.605-2.899-1.29-4.164-2.051Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M30.03 34.044c-.801-.482-1.916-.702-2.413.35a5.618 5.618 0 0 0-.47 1.728 16.214 16.214 0 0 0 3.671 2.09l-.42-3.953c-.123-.072-.246-.142-.367-.215Z"
                              />
                              <path
                                fill={`url(#C_rank3_${index})`}
                                d="M38.558 38.693c1.69 2.605 5.495 3.887 6.191 3.337.892-.706-.336.29-1.322-1.743-1.176-2.425-.79-4.637-4.017-5.366-5.248-1.185-10.207-5.614-11.376-7.57-1.294-2.164-2.819.26-2.819 2.53 0 6.022 3.632 6.594 6.717 7.536 3.874 1.048 5.65 1.08 6.626 1.276Z"
                              />
                              <path
                                fill={`url(#D_rank3_${index})`}
                                d="M38.805 38.199c1.69 2.606 5.495 3.887 6.191 3.337.892-.706-.336.29-1.322-1.743-1.176-2.425-.79-4.637-4.016-5.365-5.249-1.185-10.208-5.615-11.377-7.57-1.294-2.165-2.818.258-2.818 2.528 0 6.023 3.631 6.595 6.716 7.537 3.874 1.048 5.65 1.08 6.626 1.276Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M28.281 26.857c-.466-.78-.962-.963-1.406-.773.14 3.469 3.42 9.404 15.97 11.5-.499-1.48-1.042-2.68-3.244-3.177-5.248-1.185-10.15-5.594-11.32-7.55Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M33.513 37.264c.231.056.453.108.666.156l-.234-2.563c-.235-.118-.464-.239-.684-.361l.252 2.768ZM29.676 36.138c.82.308 1.681.534 2.503.785.305.082.597.158.876.228l-.262-2.922c-1.512-.893-2.671-1.865-3.546-2.85l.429 4.759Z"
                              />
                              <path
                                fill="#FF96AF"
                                d="M27.716 34.393c-1.231 2.641-.321 7.851 3.989 7.923 1.752.03 3.513-.104 5.247-.329l.087-.011-.087.011c-.653.08-4.862.493-7.752-1.652-3.142-2.331-1.484-5.942-1.484-5.942Z"
                              />
                              <path
                                fill={`url(#E_rank3_${index})`}
                                d="M77.7 37.458c0 9.783-7.931 17.715-17.715 17.715-9.784 0-17.715-7.932-17.715-17.715 0-9.784 7.931-17.715 17.715-17.715 9.784 0 17.715 7.93 17.715 17.715Z"
                              />
                              <path
                                fill={`url(#F_rank3_${index})`}
                                d="M77.7 37.458c0 9.783-7.931 17.715-17.715 17.715-9.784 0-17.715-7.932-17.715-17.715 0-9.784 7.931-17.715 17.715-17.715 9.784 0 17.715 7.93 17.715 17.715Z"
                              />
                              <path
                                fill={`url(#G_rank3_${index})`}
                                d="M74.625 37.458c0 8.085-6.555 14.64-14.64 14.64-8.086 0-14.64-6.555-14.64-14.64 0-8.086 6.554-14.64 14.64-14.64 8.085 0 14.64 6.554 14.64 14.64Z"
                              />
                              <path
                                fill={`url(#H_rank3_${index})`}
                                d="M73.8 37.457c0 7.63-6.185 13.816-13.815 13.816S46.17 45.087 46.17 37.457c0-7.63 6.185-13.815 13.815-13.815s13.816 6.185 13.816 13.815Z"
                              />
                              <path
                                fill="#F98B9A"
                                d="M75 37.697c0 8.284-6.716 15-15 15-8.284 0-15-6.716-15-15 0-8.284 6.716-15 15-15 8.284 0 15 6.716 15 15Z"
                              />
                              <path
                                fill={`url(#I_rank3_${index})`}
                                d="M64.029 55.92c2.032-.673 2.658-3.414 1.902-5.278-1.053.513-3.953 2.805-1.902 5.278Z"
                              />
                              <path
                                fill={`url(#J_rank3_${index})`}
                                d="M64.029 55.92c-2.05-2.473.85-4.765 1.902-5.278 0 0-.27 1.325-.846 3.05-.577 1.724-1.056 2.228-1.056 2.228Z"
                              />
                              <path
                                fill={`url(#K_rank3_${index})`}
                                d="M67.502 53.492c.972-1.124.97-2.895.287-4.082-.637.568-2.217 2.753-.287 4.082Z"
                              />
                              <path
                                fill={`url(#L_rank3_${index})`}
                                d="M67.502 53.492c-1.93-1.329-.35-3.514.287-4.082 0 0-.225.96-.287 2.286-.062 1.325 0 1.796 0 1.796Z"
                              />
                              <path
                                fill={`url(#M_rank3_${index})`}
                                d="M68.995 51.993c1.023-.667 1.175-3.027.77-3.69-.589.445-2.15 2.253-.77 3.69Z"
                              />
                              <path
                                fill={`url(#N_rank3_${index})`}
                                d="M68.995 51.993c-1.38-1.437.181-3.245.77-3.69 0 0-.308.85-.533 2.051-.225 1.201-.237 1.639-.237 1.639Z"
                              />
                              <path
                                fill={`url(#O_rank3_${index})`}
                                d="M67.103 54.188c-.277-3.009 4.48-4.966 5.376-4.843 0 2.297-.83 5.61-5.376 4.843Z"
                              />
                              <path
                                fill={`url(#P_rank3_${index})`}
                                d="M67.103 54.188c4.547.767 5.376-2.49 5.376-4.843 0 0-1.799 2.062-2.584 2.79-.785.727-2.791 2.053-2.791 2.053Z"
                              />
                              <path
                                fill={`url(#Q_rank3_${index})`}
                                d="M64.962 55.091c1.294-3.008 4.912-1.923 7.108-1.354-.44 2.016-3.618 4.367-7.108 1.354Z"
                              />
                              <path
                                fill={`url(#R_rank3_${index})`}
                                d="M64.962 55.091c3.49 3.014 6.669.662 7.108-1.354 0 0-2.607.83-3.655 1.046-1.049.215-3.453.308-3.453.308Z"
                              />
                              <path
                                fill={`url(#S_rank3_${index})`}
                                d="M66.611 55.338c-2.541-1.35-4.933 1.092-5.55 1.578 2.79 4.16 7.238 1.06 7.238-.953-.375-.054-.884-.127-1.688-.625Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M66.61 55.337c-2.531-1.343-4.915 1.074-5.543 1.573 2.997.75 5.995-.27 7.228-.949-.375-.053-.884-.127-1.685-.624Z"
                              />
                              <path
                                fill={`url(#T_rank3_${index})`}
                                d="M64.704 53.1c-.225.227-.209.609.037.854.246.246.628.263.853.037.226-.225.21-.608-.036-.853-.246-.246-.628-.263-.854-.037Z"
                              />
                              <path
                                fill={`url(#U_rank3_${index})`}
                                d="M67.44 49.7c-.16.16-.149.43.026.605.174.175.446.187.606.027.16-.16.148-.432-.026-.607-.175-.174-.446-.186-.607-.026Z"
                              />
                              <path
                                fill={`url(#V_rank3_${index})`}
                                d="M69.328 48.685c-.083.21-.022.432.138.495s.356-.056.439-.267c.083-.21.022-.433-.138-.496-.159-.063-.355.057-.439.268Z"
                              />
                              <path
                                fill={`url(#W_rank3_${index})`}
                                d="M66.164 56.658c.044.505.527.875 1.078.827.55-.049.96-.498.916-1.003-.045-.505-.527-.876-1.078-.827-.55.049-.96.498-.916 1.003Z"
                              />
                              <path
                                fill={`url(#X_rank3_${index})`}
                                d="M55.953 55.92c-2.033-.673-2.659-3.414-1.902-5.278 1.052.513 3.952 2.805 1.902 5.278Z"
                              />
                              <path
                                fill={`url(#Y_rank3_${index})`}
                                d="M55.953 55.92c2.05-2.473-.85-4.765-1.902-5.278 0 0 .27 1.325.846 3.05.577 1.724 1.056 2.228 1.056 2.228Z"
                              />
                              <path
                                fill={`url(#Z_rank3_${index})`}
                                d="M52.48 53.492c-.972-1.124-.97-2.895-.288-4.082.638.569 2.218 2.753.287 4.082Z"
                              />
                              <path
                                fill={`url(#aa_rank3_${index})`}
                                d="M52.48 53.492c1.93-1.329.35-3.514-.288-4.082 0 0 .225.96.287 2.286.062 1.325 0 1.796 0 1.796Z"
                              />
                              <path
                                fill={`url(#ab_rank3_${index})`}
                                d="M50.987 51.993c-1.023-.667-1.175-3.027-.77-3.69.588.445 2.149 2.253.77 3.69Z"
                              />
                              <path
                                fill={`url(#ac_rank3_${index})`}
                                d="M50.987 51.993c1.379-1.437-.182-3.245-.77-3.69 0 0 .308.85.533 2.051.224 1.201.237 1.639.237 1.639Z"
                              />
                              <path
                                fill={`url(#ad_rank3_${index})`}
                                d="M52.878 54.188c.278-3.009-4.478-4.966-5.376-4.843 0 2.297.83 5.61 5.376 4.843Z"
                              />
                              <path
                                fill={`url(#ae_rank3_${index})`}
                                d="M52.878 54.188c-4.546.767-5.376-2.49-5.376-4.843 0 0 1.8 2.062 2.584 2.79.786.727 2.792 2.053 2.792 2.053Z"
                              />
                              <path
                                fill={`url(#af_rank3_${index})`}
                                d="M55.02 55.091c-1.294-3.008-4.912-1.923-7.108-1.354.439 2.016 3.618 4.367 7.107 1.354Z"
                              />
                              <path
                                fill={`url(#ag_rank3_${index})`}
                                d="M55.02 55.091c-3.49 3.014-6.67.662-7.108-1.354 0 0 2.606.83 3.655 1.046 1.049.215 3.452.308 3.452.308Z"
                              />
                              <path
                                fill={`url(#ah_rank3_${index})`}
                                d="M53.37 55.338c2.542-1.35 4.934 1.092 5.55 1.578-2.79 4.16-7.237 1.06-7.238-.953.375-.054.884-.127 1.688-.625Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M53.371 55.337c2.532-1.343 4.915 1.074 5.543 1.573-2.997.75-5.995-.27-7.227-.948.375-.054.883-.128 1.684-.625Z"
                              />
                              <path
                                fill={`url(#ai_rank3_${index})`}
                                d="M55.277 53.101c.226.226.21.608-.036.853-.246.246-.628.263-.854.037-.225-.225-.209-.608.037-.853.246-.246.628-.263.853-.037Z"
                              />
                              <path
                                fill={`url(#aj_rank3_${index})`}
                                d="M52.542 49.7c.16.16.149.43-.026.605s-.446.187-.606.027c-.16-.16-.149-.432.026-.607.175-.174.446-.186.606-.026Z"
                              />
                              <path
                                fill={`url(#ak_rank3_${index})`}
                                d="M50.653 48.685c.084.21.022.432-.137.495-.16.063-.356-.056-.44-.267-.083-.21-.021-.432.138-.495.16-.063.356.056.44.267Z"
                              />
                              <path
                                fill={`url(#al_rank3_${index})`}
                                d="M53.818 56.658c-.045.505-.527.875-1.078.827-.55-.049-.96-.498-.916-1.003.044-.505.527-.876 1.078-.827.55.049.96.498.916 1.003Z"
                              />
                              <path
                                fill={`url(#am_rank3_${index})`}
                                d="M63.07 55.239a3.075 3.075 0 1 1-6.15 0 3.075 3.075 0 0 1 6.15 0Z"
                              />
                              <path
                                fill={`url(#an_rank3_${index})`}
                                d="M62.347 55.239a2.352 2.352 0 1 1-4.704 0 2.352 2.352 0 0 1 4.704 0Z"
                              />
                              <path
                                fill={`url(#ao_rank3_${index})`}
                                d="M52.249 25.948c-.139.14-2.078-1.575-4.331-3.828-2.254-2.253-3.968-4.193-3.829-4.331.14-.14 2.078 1.575 4.331 3.828 2.254 2.253 3.968 4.192 3.829 4.331Z"
                              />
                              <path
                                fill={`url(#ap_rank3_${index})`}
                                d="M50.078 19.96c1.03 1.03 1.011 2.72-.043 3.774-1.054 1.054-2.744 1.073-3.774.043-1.03-1.03-1.011-2.72.043-3.774 1.054-1.055 2.744-1.074 3.774-.043Z"
                              />
                              <path
                                fill={`url(#aq_rank3_${index})`}
                                d="M54.78 41.447c2.933 2.933 2.878 7.744-.123 10.744-3 3.001-7.81 3.056-10.744.122-2.933-2.933-2.879-7.744.122-10.744 3-3 7.811-3.055 10.744-.122Z"
                              />
                              <path
                                fill="#6B0006"
                                d="M54.359 30.79h9.775c2.548 0 3.586.962 3.586 3.114v.905c0 1.057-.377 1.85-1.113 2.397.811.51 1.207 1.321 1.207 2.435v1.094c0 2.133-.981 3.265-3.34 3.265H54.36c-.283 0-.415-.132-.415-.415V41.83c0-.283.132-.434.415-.434h9.266c.962 0 1.34-.359 1.34-1.17v-.604c0-.793-.359-1.076-1.586-1.076h-8.907c-.283 0-.415-.15-.415-.415v-1.604c0-.264.132-.415.415-.415h8.907c1.227 0 1.567-.265 1.567-1v-.567c0-.792-.378-1.15-1.359-1.15H54.36c-.283 0-.415-.152-.415-.435v-1.755c0-.283.132-.415.415-.415Z"
                              />
                              <defs>
                                <linearGradient
                                  id={`a_rank3_${index}`}
                                  x1="17.037"
                                  x2="117.191"
                                  y1="41.5"
                                  y2="40.967"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#934431" />
                                  <stop offset="1" stopColor="#71312B" />
                                </linearGradient>
                                <linearGradient
                                  id={`b_rank3_${index}`}
                                  x1="27.081"
                                  x2="70.032"
                                  y1="9.826"
                                  y2="87.683"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#DBA1B3" />
                                  <stop offset=".474" stopColor="#FFC9D6" />
                                  <stop offset="1" stopColor="#DC95A6" />
                                </linearGradient>
                                <linearGradient
                                  id={`d_rank3_${index}`}
                                  x1="31.287"
                                  x2="60.171"
                                  y1="6.008"
                                  y2="83.61"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#DB646B" />
                                  <stop offset=".479" stopColor="#F1A8B9" />
                                  <stop offset="1" stopColor="#FFD7E0" />
                                </linearGradient>
                                <linearGradient
                                  id={`g_rank3_${index}`}
                                  x1="127.208"
                                  x2="50.156"
                                  y1="29.329"
                                  y2="58.063"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#F9768E" />
                                  <stop offset="1" stopColor="#FFD3D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`h_rank3_${index}`}
                                  x1="127.208"
                                  x2="50.156"
                                  y1="29.329"
                                  y2="58.063"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFD0D9" />
                                  <stop offset="1" stopColor="#E88E99" />
                                </linearGradient>
                                <linearGradient
                                  id={`j_rank3_${index}`}
                                  x1="40.445"
                                  x2="126.81"
                                  y1="64.493"
                                  y2="52.109"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#C95A67" />
                                  <stop offset="1" stopColor="#FFCED4" />
                                </linearGradient>
                                <linearGradient
                                  id={`k_rank3_${index}`}
                                  x1="-4.726"
                                  x2="84.127"
                                  y1="72.457"
                                  y2="-36.916"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".309" stopColor="#BA012D" />
                                  <stop offset="1" stopColor="#FF9EB6" />
                                </linearGradient>
                                <linearGradient
                                  id={`l_rank3_${index}`}
                                  x1="-4.726"
                                  x2="84.127"
                                  y1="72.457"
                                  y2="-36.916"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".309" stopColor="#FF6A85" />
                                  <stop offset="1" stopColor="#fff" />
                                </linearGradient>
                                <linearGradient
                                  id={`m_rank3_${index}`}
                                  x1="127.208"
                                  x2="50.156"
                                  y1="29.329"
                                  y2="58.063"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#F9768E" />
                                  <stop offset="1" stopColor="#FFD3D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`n_rank3_${index}`}
                                  x1="127.208"
                                  x2="50.156"
                                  y1="29.329"
                                  y2="58.063"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFD0D9" />
                                  <stop offset="1" stopColor="#E88E99" />
                                </linearGradient>
                                <linearGradient
                                  id={`p_rank3_${index}`}
                                  x1="40.445"
                                  x2="126.81"
                                  y1="64.493"
                                  y2="52.109"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#E16178" />
                                  <stop offset="1" stopColor="#FFC8D2" />
                                </linearGradient>
                                <linearGradient
                                  id={`q_rank3_${index}`}
                                  x1="-4.726"
                                  x2="84.127"
                                  y1="72.457"
                                  y2="-36.916"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".309" stopColor="#BA012D" />
                                  <stop offset="1" stopColor="#FF9EB6" />
                                </linearGradient>
                                <linearGradient
                                  id={`r_rank3_${index}`}
                                  x1="-4.726"
                                  x2="84.127"
                                  y1="72.457"
                                  y2="-36.916"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".309" stopColor="#FF6A85" />
                                  <stop offset="1" stopColor="#fff" />
                                </linearGradient>
                                <linearGradient
                                  id={`s_rank3_${index}`}
                                  x1="127.208"
                                  x2="50.156"
                                  y1="29.329"
                                  y2="58.063"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#F9768E" />
                                  <stop offset="1" stopColor="#FFD3D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`t_rank3_${index}`}
                                  x1="127.208"
                                  x2="50.156"
                                  y1="29.329"
                                  y2="58.063"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFD0D9" />
                                  <stop offset="1" stopColor="#E88E99" />
                                </linearGradient>
                                <linearGradient
                                  id={`v_rank3_${index}`}
                                  x1="40.445"
                                  x2="126.81"
                                  y1="64.493"
                                  y2="52.109"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#C95A67" />
                                  <stop offset="1" stopColor="#FFCED4" />
                                </linearGradient>
                                <linearGradient
                                  id={`w_rank3_${index}`}
                                  x1="-4.726"
                                  x2="84.127"
                                  y1="72.457"
                                  y2="-36.916"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".309" stopColor="#BA012D" />
                                  <stop offset="1" stopColor="#FF9EB6" />
                                </linearGradient>
                                <linearGradient
                                  id={`x_rank3_${index}`}
                                  x1="-4.726"
                                  x2="84.127"
                                  y1="72.457"
                                  y2="-36.916"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".309" stopColor="#FF6A85" />
                                  <stop offset="1" stopColor="#fff" />
                                </linearGradient>
                                <linearGradient
                                  id={`y_rank3_${index}`}
                                  x1="127.208"
                                  x2="50.156"
                                  y1="29.329"
                                  y2="58.063"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#F9768E" />
                                  <stop offset="1" stopColor="#FFD3D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`z_rank3_${index}`}
                                  x1="127.208"
                                  x2="50.156"
                                  y1="29.329"
                                  y2="58.063"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFD0D9" />
                                  <stop offset="1" stopColor="#E88E99" />
                                </linearGradient>
                                <linearGradient
                                  id={`B_rank3_${index}`}
                                  x1="40.445"
                                  x2="126.81"
                                  y1="64.493"
                                  y2="52.109"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#E16178" />
                                  <stop offset="1" stopColor="#FFC8D2" />
                                </linearGradient>
                                <linearGradient
                                  id={`C_rank3_${index}`}
                                  x1="-4.726"
                                  x2="84.127"
                                  y1="72.457"
                                  y2="-36.916"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".309" stopColor="#BA012D" />
                                  <stop offset="1" stopColor="#FF9EB6" />
                                </linearGradient>
                                <linearGradient
                                  id={`D_rank3_${index}`}
                                  x1="-4.726"
                                  x2="84.127"
                                  y1="72.457"
                                  y2="-36.916"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".309" stopColor="#FF6A85" />
                                  <stop offset="1" stopColor="#fff" />
                                </linearGradient>
                                <linearGradient
                                  id={`E_rank3_${index}`}
                                  x1="58.855"
                                  x2="77.076"
                                  y1="0"
                                  y2="68"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".292" stopColor="#FFE8F0" />
                                  <stop offset="1" stopColor="#E4949D" />
                                </linearGradient>
                                <linearGradient
                                  id={`G_rank3_${index}`}
                                  x1="17.022"
                                  x2="55.867"
                                  y1="11.149"
                                  y2="90.3"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#E7BDC7" />
                                  <stop offset=".479" stopColor="#FFE0E9" />
                                  <stop offset="1" stopColor="#D09098" />
                                </linearGradient>
                                <linearGradient
                                  id={`H_rank3_${index}`}
                                  x1="19.258"
                                  x2="72.172"
                                  y1="12.318"
                                  y2="112.358"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".234" stopColor="#751B21" />
                                  <stop offset=".802" stopColor="#FFD8DA" />
                                </linearGradient>
                                <linearGradient
                                  id={`I_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`J_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`K_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`L_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`M_rank3_${index}`}
                                  x1="126.077"
                                  x2="80.053"
                                  y1="52.666"
                                  y2="-19.925"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`N_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`O_rank3_${index}`}
                                  x1="139.178"
                                  x2="33.549"
                                  y1="17.491"
                                  y2="69.004"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`P_rank3_${index}`}
                                  x1="139.178"
                                  x2="33.549"
                                  y1="17.491"
                                  y2="69.004"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".943" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`Q_rank3_${index}`}
                                  x1="160.562"
                                  x2="65.876"
                                  y1="77.581"
                                  y2="-29.246"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`R_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`S_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`X_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`Y_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`Z_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`aa_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`ab_rank3_${index}`}
                                  x1="126.077"
                                  x2="80.053"
                                  y1="52.666"
                                  y2="-19.925"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`ac_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`ad_rank3_${index}`}
                                  x1="139.178"
                                  x2="33.549"
                                  y1="17.491"
                                  y2="69.004"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`ae_rank3_${index}`}
                                  x1="139.178"
                                  x2="33.549"
                                  y1="17.491"
                                  y2="69.004"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".943" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`af_rank3_${index}`}
                                  x1="160.562"
                                  x2="65.876"
                                  y1="77.581"
                                  y2="-29.246"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`ag_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`ah_rank3_${index}`}
                                  x1="126.077"
                                  x2="-3.765"
                                  y1="52.666"
                                  y2="9.205"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#960012" />
                                  <stop offset=".802" stopColor="#FFD9D9" />
                                </linearGradient>
                                <linearGradient
                                  id={`am_rank3_${index}`}
                                  x1="48.025"
                                  x2="60.852"
                                  y1="-3.782"
                                  y2="78.491"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#FFC6C9" />
                                  <stop offset=".313" stopColor="#fff" />
                                  <stop offset=".5" stopColor="#FFC6C9" />
                                  <stop offset=".781" stopColor="#fff" />
                                  <stop offset="1" stopColor="#FFC6C9" />
                                </linearGradient>
                                <radialGradient
                                  id={`c_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(46.1897 42.215 -71.4841 27.2774 38.629 7.228)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`e_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`f_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`i_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(-45.8122 -7.05696 192.042 -162.353 130.498 48.422)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`o_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(-45.8122 -7.05696 192.042 -162.353 130.498 48.422)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`u_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(-45.8122 -7.05696 192.042 -162.353 130.498 48.422)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`A_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(-45.8122 -7.05696 192.042 -162.353 130.498 48.422)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`F_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(76.4127 34.0354 -57.6333 45.1256 13.606 10.794)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`T_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`U_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`V_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`W_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`ai_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`aj_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`ak_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`al_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`an_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(4.7037 28.2407 -47.821 2.77777 68.988 27.315)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop offset=".135" stopColor="#fff" />
                                  <stop offset="1" stopColor="#E80E0E" />
                                </radialGradient>
                                <radialGradient
                                  id={`ao_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`ap_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
                                <radialGradient
                                  id={`aq_rank3_${index}`}
                                  cx="0"
                                  cy="0"
                                  r="1"
                                  gradientTransform="matrix(0 37.5 -63.5 0 63.5 37.5)"
                                  gradientUnits="userSpaceOnUse"
                                >
                                  <stop stopColor="#fff" />
                                  <stop
                                    offset="1"
                                    stopColor="#fff"
                                    stopOpacity="0"
                                  />
                                </radialGradient>
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
                              style={{ zIndex: 10 }}
                            >
                              <path
                                d="M0 5C0 2.23858 2.23858 0 5 0H123L108 75H5C2.23858 75 0 72.7614 0 70V5Z"
                                fill="#246A73"
                              />
                              <path
                                d="M123 0L108 75H112L127 0H123Z"
                                fill="#3DCCC7"
                              />
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
                        <td className="rounded-r-[5px] px-3 py-2 text-xs text-white sm:px-4 sm:py-6 sm:text-sm">
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
