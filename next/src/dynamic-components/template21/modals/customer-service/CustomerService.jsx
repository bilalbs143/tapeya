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
    <div className="customer-service-modal relative mx-auto flex h-[80vh] w-full flex-col overflow-hidden rounded-[12px] p-[1px] text-white shadow-xl" style={{ backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)' }}>
      <div className="flex min-h-0 flex-1 flex-col space-y-4 rounded-[12px] bg-black p-4 md:space-y-6 md:p-6 lg:p-8">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleCloseModal}
            aria-label={t('close')}
            className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md text-white transition-all duration-300 sm:h-[33px] sm:w-[33px]"
            style={{
              backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Tabs header */}
        <div className="mt-10 mb-[10px] rounded-[10px] p-[1px] md:mt-10" style={{ backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)' }}>
          <div className="rounded-[10px] bg-black p-3">
            <div className="flex flex-wrap gap-1 md:gap-2">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setActiveTab(t.key)}
                  className={`flex-1 rounded-[5px] border border-[#FFFFFF66] px-3 py-2 text-[12px] font-bold whitespace-nowrap transition-all duration-300 md:border-0 md:px-6 md:py-3 md:text-[14px] lg:px-8 lg:text-[16px] ${
                    activeTab === t.key
                      ? 'text-white'
                      : 'text-white'
                  }`}
                  style={activeTab === t.key ? { backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)' } : {}}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable content area to keep modal height consistent */}
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto rounded-[10px] border border-[#FFFFFF66] p-3 md:p-4 lg:p-6">
          {/* Inner container with border */}
          <div className="space-y-4 md:space-y-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
