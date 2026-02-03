'use client';

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import { useTranslations } from '@/hooks/useTranslations';
import { closeModal } from '@/slices/common/commonSlice';

import BettingTab from './BettingTab';
import FaqTab from './FaqTab';
import InquiryTab from './InquiryTab';
import NoteTab from './NoteTab';
import ProfileTab from './ProfileTab';
import ReferralsTab from './ReferralsTab';

export default function CustomerService({
  defaultTab,
  openMessageId,
  openInquiryId,
}) {
  const dispatch = useDispatch();
  const { t } = useTranslations();

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
  const initialTab = validTabs.includes(defaultTab) ? defaultTab : 'inquiry';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (defaultTab && validTabs.includes(defaultTab)) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleCloseModal = () => {
    dispatch(closeModal());
  };

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
    <div className="customer-service-modal relative mx-auto flex h-[80vh] w-full flex-col overflow-hidden rounded-[5px] border-2 border-[#03C72C4D] bg-[#060D0D] text-white shadow-xl">
      <div className="flex min-h-0 flex-1 flex-col space-y-4 p-4 md:space-y-6 md:p-6 lg:p-8">
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCloseModal}
            aria-label={t('close')}
            className="group flex h-[30px] w-[30px] items-center justify-center rounded-md bg-[#55BC55] text-black transition-all duration-300 sm:h-[33px] sm:w-[33px]"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="#0B0B0B"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs header */}
        <div className="relative mt-10 mb-[10px] overflow-visible rounded-[10px] bg-[#55BC55] p-[1px] md:mt-10">
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
        <div className="scrollbar-hide mt-3 min-h-0 flex-1 overflow-y-auto rounded-[10px] border border-[#FFFFFF66] p-3 md:p-4 lg:p-6">
          <div className="space-y-4 md:space-y-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
