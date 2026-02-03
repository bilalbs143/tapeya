'use client';
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
    switch (activeTab) {
      case 'announcements':
        return {
          title: t('announcements'),
          data:
            allAnnouncementsData?.map((announcement) => ({
              category: announcement.category || t('general'),
              title: announcement.title || 'N/A',
              date: formatDateCustom(announcement.created_at, t),
              originalData: announcement,
            })) || [],
          loading: allAnnouncementsLoader,
        };

      case 'realTimeDeposit':
        return {
          title: t('real_time_deposit'),
          data:
            realtimeDepositsData?.map((deposit) => ({
              name: deposit.user?.username
                ? `${deposit.user.username}***`
                : 'N/A',
              amount: deposit.amount || 'N/A',
              date: formatDateCustom(deposit.created_at, t),
              originalData: deposit,
            })) || [],
          loading: realtimeDepositsLoader,
        };

      case 'highestWithdrawal':
        return {
          title: t('highest_withdrawal_week'),
          data:
            realtimeWithdrawalsData?.map((withdrawal) => ({
              name: withdrawal.user?.username
                ? `${withdrawal.user.username}***`
                : 'N/A',
              amount: withdrawal.amount || 'N/A',
              date: formatDateCustom(withdrawal.created_at, t),
              originalData: withdrawal,
            })) || [],
          loading: realtimeWithdrawalsLoader,
        };

      default:
        return {
          title: t('announcements'),
          data: [],
          loading: false,
        };
    }
  };

  const currentTabData = getTabData();

  const tabs = [
    { id: 'announcements', label: t('announcements') },
    { id: 'realTimeDeposit', label: t('real_time_deposit') },
    { id: 'highestWithdrawal', label: t('highest_withdrawal_week') },
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
    <section className="statistics-section relative py-12 pb-20 sm:py-16 sm:pb-44 lg:py-20 lg:pb-20">
      {/* Background Image */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/images/backgrounds/curved-pattern.svg)',
        }}
      />

      {/* Background Pattern */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex hidden items-center justify-center overflow-hidden md:block">
        <div className="bg-opacity-30 absolute top-3/4 left-1/2 h-[700px] w-full origin-center -translate-x-1/2 -translate-y-1/2 -rotate-[4.327deg] transform rounded-full bg-[#7010BB] blur-[50px]" />
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4">
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Column - Tabs and Table */}
          <div className="lg:col-span-6">
            {/* Tabs - Positioned above the container */}
            <div className="mb-4 flex w-full gap-2 overflow-x-auto rounded-[666px] bg-[#232E7C] px-3 py-3 sm:mb-6 sm:gap-3 sm:px-6 sm:py-4.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-1 cursor-pointer items-center justify-center gap-2 self-stretch rounded-full px-3 py-2 text-xs font-medium whitespace-nowrap transition-all duration-300 sm:gap-2.5 sm:rounded-[60px] sm:px-6 sm:py-4 sm:text-sm ${
                    activeTab === tab.id
                      ? 'bg-[#F25307] text-white'
                      : 'bg-[#13204E] text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table Container */}
            <div className="bg-opacity-80 relative flex h-[400px] flex-col overflow-hidden rounded-[20px] bg-[#13204E] shadow-[0_4px_49px_0_rgba(0,7,72,0.12)] backdrop-blur-[5px]">
              <div className="max-h-[400px] overflow-x-auto overflow-y-auto">
                <table className="w-full">
                  <thead>
                    <tr className="rounded-t-2xl bg-[#13204E]">
                      {activeTab === 'announcements' ? (
                        <>
                          <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                            {t('category')}
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                            {t('title')}
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                            {t('date')}
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                            {t('view')}
                          </th>
                        </>
                      ) : (
                        <>
                          <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                            {t('name')}
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                            {t('amount')}
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-white uppercase sm:px-4 sm:py-4 sm:text-sm">
                            {t('date')}
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {currentTabData.loading ? (
                      <tr>
                        <td
                          colSpan={activeTab === 'announcements' ? 4 : 3}
                          className="py-8 text-center"
                        >
                          <div className="flex justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white" />
                          </div>
                        </td>
                      </tr>
                    ) : currentTabData.data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={activeTab === 'announcements' ? 4 : 3}
                          className="py-8 text-center text-sm text-white"
                        >
                          {t('no_data_found')}
                        </td>
                      </tr>
                    ) : (
                      currentTabData.data.map((row, index) => (
                        <tr
                          key={index}
                          className={`h-11 sm:h-14 ${index % 2 === 0 ? 'bg-[#1C2568]' : 'bg-opacity-80 bg-[#1C266A]'}`}
                        >
                          {activeTab === 'announcements' ? (
                            <>
                              <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                                {row.category}
                              </td>
                              <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                                {row.title}
                              </td>
                              <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                                {row.date}
                              </td>
                              <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                                <button
                                  className="cursor-pointer text-sm font-medium text-[#fd7e09] transition-all duration-200 hover:underline"
                                  onClick={() =>
                                    handleViewDetail(row.originalData)
                                  }
                                >
                                  {t('view_detail')}
                                </button>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="flex h-6 w-6 items-center justify-center overflow-hidden rounded-full sm:h-8 sm:w-8">
                                    <Image
                                      src="/images/icons/stats-table-user.png"
                                      alt={t('user_avatar')}
                                      width={32}
                                      height={32}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  {row.name}
                                </div>
                              </td>
                              <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                                {row.amount}
                              </td>
                              <td className="px-5 py-3 text-xs text-white sm:px-4 sm:py-4 sm:text-sm">
                                {row.date}
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Image (Hidden on Mobile) */}
          <div className="hidden items-center justify-center lg:col-span-6 lg:flex">
            <div className="relative">
              <Image
                src="/images/icons/wizard-icon.svg"
                alt={t('wizard_icon')}
                width={700}
                height={700}
                className="relative z-10 h-auto max-h-[700px] w-full max-w-[700px] object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Statistics;
