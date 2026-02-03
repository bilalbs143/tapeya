'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function FaqPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const validTabs = useMemo(
    () => ['general', 'deposit', 'gaming', 'technical', 'banking'],
    [],
  );

  const initialTab = useMemo(() => {
    const fromQuery = (searchParams?.get('tab') || '').toLowerCase();
    return validTabs.includes(fromQuery) ? fromQuery : 'general';
  }, [searchParams, validTabs]);

  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const tabs = [
    { key: 'general', label: t('faq_general') },
    { key: 'deposit', label: t('faq_deposit_withdrawal') },
    { key: 'gaming', label: t('faq_gaming') },
    { key: 'technical', label: t('faq_technical') },
    { key: 'banking', label: t('faq_banking') },
  ];

  const handleTabChange = (key) => {
    setActiveTab(key);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', key);
    router.push(`/faq?${params.toString()}`);
  };

  const Section = ({ items }) => (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-lg border"
          style={{ borderColor: '#03c72c4d' }}
        >
          <div className="mobile-faq-question bg-[#55BC55] bg-clip-text px-4 py-3 font-semibold text-transparent">
            {item.q}
          </div>
          <div className="mobile-faq-answer px-4 pb-4 text-gray-300">
            {item.a}
          </div>
        </div>
      ))}
    </div>
  );

  const tabContent = {
    general: [
      {
        q: t('faq_content.general.about_q'),
        a: t('faq_content.general.about_a'),
      },
      { q: t('faq_content.general.why_q'), a: t('faq_content.general.why_a') },
      {
        q: t('faq_content.general.affiliate_q'),
        a: t('faq_content.general.affiliate_a'),
      },
      {
        q: t('faq_content.general.how_join_q'),
        a: t('faq_content.general.how_join_a'),
      },
      {
        q: t('faq_content.general.supported_currencies_q'),
        a: t('faq_content.general.supported_currencies_a'),
      },
      {
        q: t('faq_content.general.personal_info_secure_q'),
        a: t('faq_content.general.personal_info_secure_a'),
      },
    ],
    deposit: [
      {
        q: t('faq_content.deposit.how_deposit_q'),
        a: t('faq_content.deposit.how_deposit_a'),
      },
      {
        q: t('faq_content.deposit.how_withdraw_q'),
        a: t('faq_content.deposit.how_withdraw_a'),
      },
      {
        q: t('faq_content.deposit.deposit_time_q'),
        a: t('faq_content.deposit.deposit_time_a'),
      },
      {
        q: t('faq_content.deposit.withdraw_time_q'),
        a: t('faq_content.deposit.withdraw_time_a'),
      },
      {
        q: t('faq_content.deposit.account_min_deposit_q'),
        a: t('faq_content.deposit.account_min_deposit_a'),
      },
      {
        q: t('faq_content.deposit.need_slip_q'),
        a: t('faq_content.deposit.need_slip_a'),
      },
    ],
    gaming: [
      {
        q: t('faq_content.gaming.age_restriction_q'),
        a: t('faq_content.gaming.age_restriction_a'),
      },
      {
        q: t('faq_content.gaming.fair_games_q'),
        a: t('faq_content.gaming.fair_games_a'),
      },
      {
        q: t('faq_content.gaming.bet_limits_q'),
        a: t('faq_content.gaming.bet_limits_a'),
      },
      {
        q: t('faq_content.gaming.settlement_time_q'),
        a: t('faq_content.gaming.settlement_time_a'),
      },
    ],
    technical: [
      {
        q: t('faq_content.technical.loading_issue_q'),
        a: t('faq_content.technical.loading_issue_a'),
      },
    ],
    banking: [],
  };

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto py-8">
        <h1 className="mobile-title mb-2 mb-8 bg-[#55BC55] bg-clip-text text-[20px] font-semibold text-transparent md:text-[30px]">
          {t('frequently_asked_questions')}
        </h1>

        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`mobile-tab-button rounded-lg px-3 py-2 text-sm transition-colors sm:px-4 sm:py-3 sm:text-base ${
                  activeTab === tab.key
                    ? 'bg-[#55BC55] font-semibold text-black'
                    : 'border border-[#55BC55] text-[#55BC55] hover:bg-[#55BC55] hover:font-semibold hover:text-black'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-lg border p-6"
          style={{ borderColor: '#03c72c4d' }}
        >
          {(() => {
            const items = tabContent[activeTab] || [];
            if (!items.length) {
              return (
                <div className="text-sm text-gray-300">
                  {t('no_data_found')}
                </div>
              );
            }
            return <Section items={items} />;
          })()}
        </div>
      </div>
    </div>
  );
}

export default FaqPage;
