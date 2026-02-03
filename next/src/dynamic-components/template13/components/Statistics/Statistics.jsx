'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import {
  fetchAllAnnouncements,
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
  const [activeTab, setActiveTab] = useState('announcements');

  // Redux selectors
  const {
    realtimeDepositsData,
    realtimeDepositsLoader,
    realtimeWithdrawalsData,
    realtimeWithdrawalsLoader,
    allAnnouncementsData,
    allAnnouncementsLoader,
  } = useSelector((state) => state.website);

  // Fetch data when component mounts
  useEffect(() => {
    dispatch(fetchRealtimeDeposits());
    dispatch(fetchRealtimeWithdrawals());
    dispatch(fetchAllAnnouncements());
  }, [dispatch]);

  // Format data for each tab
  const getTabData = () => {
    // Format announcement data
    const announcementData =
      allAnnouncementsData?.map((announcement, index) => ({
        sr: index + 1,
        playerInfo: announcement.category || t('general'),
        game: announcement.title || 'N/A',
        withdrawal: formatDateCustom(announcement.created_at, t),
        originalData: announcement,
      })) || [];

    // Format deposits data
    const depositsData =
      realtimeDepositsData?.map((deposit, index) => ({
        sr: index + 1,
        playerInfo:
          deposit.user?.username || deposit.user?.name || t('unknown_user'),
        game: deposit.game?.name || t('deposit'),
        withdrawal: formatDateCustom(deposit.created_at, t),
        originalData: deposit,
      })) || [];

    // Format withdrawals data
    const withdrawalsData =
      realtimeWithdrawalsData?.map((withdrawal, index) => ({
        sr: index + 1,
        playerInfo:
          withdrawal.user?.username ||
          withdrawal.user?.name ||
          t('unknown_user'),
        game: withdrawal.game?.name || t('withdrawal'),
        withdrawal: formatDateCustom(withdrawal.created_at, t),
        originalData: withdrawal,
      })) || [];

    switch (activeTab) {
      case 'announcements':
        return {
          title: t('announcements'),
          data: announcementData,
          loading: allAnnouncementsLoader,
        };

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
          title: t('announcements'),
          data: announcementData,
          loading: allAnnouncementsLoader,
        };
    }
  };

  const currentTabData = getTabData();

  const tabs = [
    { id: 'announcements', labelKey: 'announcement' },
    { id: 'realTimeDeposit', labelKey: 'real_time_deposit' },
    { id: 'highestWithdrawal', labelKey: 'highest_withdrawal' },
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
    <motion.div
      className="overflow-hidden pt-6 md:pt-10"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      style={{ willChange: 'opacity, transform' }}
      layout
    >
      <motion.section
        className="relative rounded-[10px] bg-[url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/statistics-bg-mob-5.webp')] bg-cover bg-bottom bg-no-repeat py-12 pb-20 sm:py-16 sm:pb-44 md:bg-[url('https://d3emlo5tm9es2f.cloudfront.net/next/backgrounds/statistics-bg-5.webp')] md:bg-right lg:py-14"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{
          duration: 0.7,
          ease: [0.25, 0.1, 0.25, 1],
          delay: 0.1,
        }}
        style={{ willChange: 'opacity, transform' }}
      >
        {/* Background should be full width */}
        <div className="absolute inset-0 w-full" />

        <div className="relative z-10 container mx-auto max-w-full px-3 pt-0 sm:px-4 md:max-w-full lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8">
            {/* Left Column - Tabs and Table */}
            <div className="w-full md:w-auto lg:col-span-7 xl:col-span-8">
              {/* Tabs - Positioned above the container */}
              <div
                className="mb-3 flex w-full flex-wrap gap-1.5 rounded-[10px] px-2 py-2 sm:mb-6 sm:flex-nowrap sm:gap-2 sm:rounded-[666px] sm:px-3 sm:py-3"
                style={{ backgroundColor: '#0A1818' }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex flex-1 cursor-pointer items-center justify-center gap-1 rounded-[8px] px-2 py-2 whitespace-nowrap transition-all duration-300 sm:gap-2.5 sm:self-stretch sm:rounded-full sm:px-3 sm:py-3 ${
                      activeTab === tab.id ? '' : 'bg-transparent'
                    }`}
                    style={{
                      backgroundColor:
                        activeTab === tab.id ? '#20C5FE' : 'transparent',
                      color: activeTab === tab.id ? 'white' : '#B2B2B2',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    <span className="truncate">{t(tab.labelKey)}</span>
                  </button>
                ))}
              </div>

              {/* Table Container */}
              <div
                className="relative flex h-[250px] w-full flex-col overflow-hidden rounded-[5px] sm:h-[300px]"
                style={{ backgroundColor: '#0F131CB2' }}
              >
                <div className="stats-table-scroll max-h-[250px] overflow-x-auto overflow-y-auto sm:max-h-[300px]">
                  <table className="w-full min-w-[400px]">
                    <thead>
                      <tr
                        className="border-b"
                        style={{
                          backgroundColor: '#0F131C',
                          borderBottomColor: '#000000',
                        }}
                      >
                        <th className="w-[5%] px-1.5 py-1 text-left text-xs font-medium whitespace-nowrap text-white uppercase sm:px-4 sm:py-2 sm:text-sm">
                          {t('sr')}
                        </th>
                        <th className="w-[25%] px-1.5 py-1 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-2 sm:text-sm">
                          {t('player_info')}
                        </th>
                        <th className="w-[40%] px-1.5 py-1 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-2 sm:text-sm">
                          {t('game')}
                        </th>
                        <th className="w-[30%] px-1.5 py-1 text-left text-xs font-medium whitespace-nowrap text-white uppercase sm:px-4 sm:py-2 sm:text-sm">
                          {t('withdrawal')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTabData.loading ? (
                        <tr>
                          <td colSpan={4} className="py-4 text-center">
                            <div className="flex justify-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                            </div>
                          </td>
                        </tr>
                      ) : currentTabData.data.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="py-4 text-center text-sm text-white"
                          >
                            {t('no_data_found')}
                          </td>
                        </tr>
                      ) : (
                        currentTabData.data.map((row, index) => (
                          <tr
                            key={index}
                            className="h-8 border-b sm:h-10"
                            style={{ borderBottomColor: '#000000' }}
                          >
                            <td className="w-[5%] px-1.5 py-1.5 text-xs whitespace-nowrap text-white sm:px-4 sm:py-2 sm:text-sm">
                              {row.sr}
                            </td>
                            <td className="w-[25%] px-1.5 py-1.5 text-xs text-white sm:px-4 sm:py-2 sm:text-sm">
                              <span className="block max-w-full truncate">
                                {row.playerInfo}
                              </span>
                            </td>
                            <td className="w-[40%] px-1.5 py-1.5 text-xs text-white sm:px-4 sm:py-2 sm:text-sm">
                              <span className="block max-w-full truncate">
                                {row.game}
                              </span>
                            </td>
                            <td className="w-[30%] px-1.5 py-1.5 text-xs whitespace-nowrap text-white sm:px-4 sm:py-2 sm:text-sm">
                              {row.withdrawal}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Image (Hidden on Mobile) */}
            <div className="hidden items-center justify-center lg:col-span-3 lg:flex xl:col-span-2" />
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}

export default Statistics;
