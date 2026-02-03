'use client';

import { useEffect, useState } from 'react';
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

  // Tabs configuration
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

  // Handle defaultTab prop changes
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
    <div className="customer-service-modal relative mx-auto flex h-[80vh] w-full flex-col overflow-hidden rounded-[16px] bg-[#312577] p-4 text-white shadow-xl md:rounded-[24px] md:p-6 lg:p-8">
      <div className="flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCloseModal}
            aria-label={t('close')}
            className="btn-hover-outline group flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border border-[#FC7E09] bg-transparent leading-none font-bold text-[2xl] text-white sm:h-7 sm:w-7"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs header */}
        <div className="mt-10 mb-[10px] flex flex-wrap gap-1 md:mt-6 md:gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 rounded-[4px] border border-[#5343B1] px-3 py-2 text-[12px] font-bold whitespace-nowrap transition-all duration-300 md:px-6 md:py-3 md:text-[14px] lg:px-8 lg:text-[16px] ${
                activeTab === t.key
                  ? 'bg-[#FC7E09] text-white'
                  : 'bg-[#241866] text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content: allow scroll only for Inquiry; others manage their own scroll */}
        <div
          className={`scrollbar-hide min-h-0 flex-1 rounded-[3px] border-2 border-[#452FCD] p-3 md:p-4 lg:p-6 ${
            activeTab === 'inquiry' ? 'overflow-y-auto' : 'overflow-hidden'
          }`}
        >
          {/* Inner container with border */}
          <div className="flex h-full min-h-0 flex-col space-y-4 md:space-y-6">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
