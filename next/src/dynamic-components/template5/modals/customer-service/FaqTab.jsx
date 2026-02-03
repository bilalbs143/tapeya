'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { useTranslations } from '@/hooks/useTranslations';
import { fetchAllFaqs } from '@/website/websiteAction';

export default function FaqTab() {
  const dispatch = useDispatch();
  const { allFaqsLoader, allFaqsData } = useSelector((state) => state.website);
  const { t } = useTranslations();
  const router = useRouter();

  const [selectedFaq, setSelectedFaq] = useState(null);

  // Fetch FAQs when component mounts
  useEffect(() => {
    dispatch(fetchAllFaqs());
  }, [dispatch]);

  // Set first FAQ as selected when data loads
  useEffect(() => {
    if (allFaqsData && allFaqsData.length > 0 && !selectedFaq) {
      setSelectedFaq(allFaqsData[0].id);
    }
  }, [allFaqsData, selectedFaq]);

  // Show loading state
  if (allFaqsLoader) {
    return (
      <div className="flex items-center justify-center py-8">
        <CommonLoader size="lg" border="border-[#20C5FE]" />
      </div>
    );
  }

  const handleClose = () => {
    router.push('/dashboard/customer-inquiry');
  };

  // Get FAQs data array
  const faqs = allFaqsData || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        {/* Left Column - FAQ List */}
        <div>
          <h3 className="mb-4 text-[15px] font-extrabold text-white md:text-[17px]">
            {t('frequently_asked_questions')}
          </h3>
          <div className="space-y-2">
            {faqs.length === 0 ? (
              <div className="py-8 text-center">
                <span className="text-[#9E91E6]">{t('no_record_found')}</span>
              </div>
            ) : (
              faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-[5px] transition-all duration-300"
                >
                  <button
                    onClick={() => setSelectedFaq(faq.id)}
                    className={`w-full cursor-pointer rounded-[5px] px-3 py-2 text-left transition-all duration-300 md:px-4 md:py-3 ${
                      selectedFaq === faq.id
                        ? 'bg-[#20C5FE]'
                        : 'border border-[#323232] bg-transparent text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[14px] font-extrabold md:text-[16px] ${
                          selectedFaq === faq.id ? 'text-black' : 'text-white'
                        }`}
                      >
                        {faq.title || faq.question || t('untitled_faq')}
                      </span>
                      <svg
                        className="h-4 w-4 md:h-5 md:w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column - FAQ Details */}
        <div>
          <h3 className="mb-4 text-[15px] font-extrabold text-white md:text-[17px]">
            {t('faq_details')}
          </h3>
          <div className="w-full rounded-[5px] bg-[#18202D] px-3 py-4 text-white md:px-5 md:py-6">
            {selectedFaq && faqs.length > 0 ? (
              (() => {
                const currentFaq = faqs.find((faq) => faq.id === selectedFaq);
                return currentFaq ? (
                  <div className="space-y-3">
                    <h4 className="text-[16px] font-extrabold text-white">
                      {currentFaq.title ||
                        currentFaq.question ||
                        t('untitled_faq')}
                    </h4>
                    <div
                      className="text-[14px] leading-relaxed text-[white]"
                      dangerouslySetInnerHTML={{
                        __html:
                          currentFaq.content ||
                          currentFaq.answer ||
                          t('no_content_available'),
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <span className="text-[white]">{t('faq_not_found')}</span>
                  </div>
                );
              })()
            ) : (
              <div className="flex h-full items-center justify-center">
                <span className="text-[white]">{t('select_faq')}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
