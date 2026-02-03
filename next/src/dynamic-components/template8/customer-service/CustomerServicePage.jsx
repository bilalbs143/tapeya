'use client';

import { useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

import BettingTab from '../modals/customer-service/BettingTab';
import FaqTab from '../modals/customer-service/FaqTab';
import InquiryTab from '../modals/customer-service/InquiryTab';
import NoteTab from '../modals/customer-service/NoteTab';
import ProfileTab from '../modals/customer-service/ProfileTab';
import ReferralsTab from '../modals/customer-service/ReferralsTab';

export default function CustomerServicePage() {
  const { t } = useTranslations();
  const searchParams = useSearchParams();

  const tabs = [
    { key: 'inquiry', label: t('customer_inquiry') },
    { key: 'faq', label: t('frequently_asked_questions') },
    { key: 'note', label: t('note') },
    { key: 'betting', label: t('betting_management') },
    { key: 'referrals', label: t('referrals') },
    { key: 'profile', label: t('profile') },
  ];

  const validTabs = [
    'inquiry',
    'faq',
    'note',
    'betting',
    'referrals',
    'profile',
  ];

  const defaultTabFromQuery = searchParams?.get('tab');
  const initialTab = validTabs.includes(defaultTabFromQuery)
    ? defaultTabFromQuery
    : 'inquiry';
  const [activeTab, setActiveTab] = useState(initialTab);
  const openInquiryId = searchParams?.get('inquiryId');
  const openMessageId = searchParams?.get('messageId');

  useEffect(() => {
    if (defaultTabFromQuery && validTabs.includes(defaultTabFromQuery)) {
      setActiveTab(defaultTabFromQuery);
    }
  }, [defaultTabFromQuery]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inquiry':
        return (
          <InquiryTab activeTab={activeTab} openInquiryId={openInquiryId} />
        );
      case 'faq':
        return <FaqTab />;
      case 'note':
        return <NoteTab openMessageId={openMessageId} />;
      case 'betting':
        return <BettingTab />;
      case 'referrals':
        return <ReferralsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return (
          <InquiryTab activeTab={activeTab} openInquiryId={openInquiryId} />
        );
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 text-white">
      <div className="space-y-6">
        {/* Tabs header */}
        <div className="relative overflow-visible rounded-[10px] bg-[#55BC55] p-[1px]">
          {/* Left Icon */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
            alt=""
            className="absolute -top-2 left-[-25px] h-[55px] w-[40px] sm:-top-3 sm:h-[70px] sm:w-[50px] md:-top-4 md:h-[83px] md:w-[59px]"
          />

          {/* Right Icon */}
          <img
            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/games-header-icon-4.svg"
            alt=""
            className="absolute top-auto right-[-25px] -bottom-3 h-[55px] w-[40px] sm:-top-3 sm:h-[70px] sm:w-[50px] md:top-[-16px] md:h-[83px] md:w-[59px]"
          />
          <div className="rounded-[10px] bg-[#060D0D] p-3 px-[25px] md:bg-[#0A1818] md:p-0 md:px-[66px]">
            <div className="grid grid-cols-2 justify-center gap-2 py-2 md:flex md:flex-wrap md:gap-2 md:py-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 rounded-[2px] border border-[#03c72c4d] px-2 py-3 text-[10px] font-bold whitespace-nowrap transition-all duration-300 md:rounded-[0] md:border-0 md:px-6 md:py-4 md:text-[16px] lg:px-8 lg:text-[16px] ${
                    activeTab === tab.key
                      ? 'bg-[#55BC55] text-white'
                      : 'text-white hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="scrollbar-hide min-h-[500px] overflow-y-auto rounded-[10px] border border-[#FFFFFF66] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
