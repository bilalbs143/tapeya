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

  const validTabs = tabs.map((tab) => tab.key);

  const initialTab = validTabs.includes(defaultTab) ? defaultTab : 'inquiry';
  const [activeTab, setActiveTab] = useState(initialTab);

  // For mobile dropdown
  const [isOpen, setIsOpen] = useState(false);

  const activeLabel = tabs.find((tab) => tab.key === activeTab)?.label || '';

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
    <div className="customer-service-modal relative mx-auto flex h-[80vh] w-full max-w-[1479px] flex-col overflow-hidden rounded-[12px] border-1 border-[#0F5045] bg-[#18181A] bg-[linear-gradient(90deg,rgba(24,24,26,0)_-16.56%,#18181A_48.8%,rgba(24,24,26,0)_113.29%)] text-white shadow-xl">
      <div className="flex min-h-0 flex-1 flex-col space-y-4 p-4 md:space-y-6 md:p-6 lg:p-8">
        <div className="relative mt-2 mb-[10px] overflow-visible">
          <div className="p-[1px]">
            <div className="relative flex items-center justify-end px-3 py-2 md:justify-between">
              {/* LEFT TABS */}
              <div className="hidden flex-wrap items-center gap-3 md:flex md:gap-5">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`min-w-[200px] rounded-[4px] px-6 py-3.5 text-[14px] font-semibold transition-all duration-200 ${activeTab === tab.key
                        ? 'border border-[#CBBC91] bg-[#0F50451A] text-[#CBBC91]'
                        : 'border border-[#CBBC9180] text-[#CCCCCC] hover:border-[#CBBC91]'
                    } `}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* CLOSE BUTTON */}
              <button
                onClick={handleCloseModal}
                aria-label={t('close')}
                className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-transparent transition-all hover:scale-110"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 43 43"
                  fill="none"
                >
                  <path
                    d="M1.41406 32.2714L12.8426 20.8428L2.55692 10.5571L11.6998 1.41422L21.9855 11.6999L32.2712 1.41422L41.4141 10.5571L31.1283 20.8428L41.4141 31.1285L32.2712 40.2714L21.9855 29.9856L10.5569 41.4142L1.41406 32.2714Z"
                    stroke="#CBBC91"
                    strokeWidth="2"
                  />
                </svg>
              </button>
            </div>
            {/* MOBILE DROPDOWN */}
            <div className="mt-3 w-full rounded-[6px] p-[4px] md:hidden">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative flex w-full items-center justify-between border-0 px-6 py-2 text-[13px] font-normal tracking-wide text-white/70 uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[3px] before:border before:border-[#CBBC91] before:bg-[#0F50451A]"
              >
                <span className="relative z-10">{activeLabel}</span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="9"
                  viewBox="0 0 16 9"
                  fill="none"
                  className={`relative z-10 transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'
                  }`}
                >
                  <path
                    d="M3.87883 5.29289L0.293044 1.70711C-0.336921 1.07714 0.109246 0 1.00015 0H8.17172C9.06263 0 9.50879 1.07714 8.87883 1.70711L5.29304 5.29289C4.90252 5.68342 4.26935 5.68342 3.87883 5.29289Z"
                    fill="#CBBC91"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className="mt-2 flex flex-col gap-2">
                  {tabs
                    .filter((tab) => tab.key !== activeTab)
                    .map((tab) => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.key);
                          setIsOpen(false);
                        }}
                        className="group relative inline-flex items-center justify-center border-0 px-6 py-[10px] text-[13px] font-normal tracking-wide text-white uppercase transition-all duration-300 before:absolute before:inset-0 before:rounded-[3px] before:border before:border-[#CBBC91] before:bg-transparent before:transition-all before:duration-300 hover:before:[box-shadow:inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
                      >
                        <span className="relative z-10">{tab.label}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content Box */}
        <div className="scrollbar-hide mt-3 min-h-0 flex-1 overflow-y-auto rounded-[7px] border border-[#CBBC9180] p-3 md:p-4 lg:p-4">
          {/*  Profile */}
          {activeTab === 'profile' && (
            <h2 className="mb-3 text-[25px] font-semibold text-[#FFFFFF]">
              Profile
            </h2>
          )}

          <div className="space-y-4 md:space-y-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
}
