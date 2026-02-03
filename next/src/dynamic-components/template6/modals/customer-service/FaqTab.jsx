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

  const [openFaqId, setOpenFaqId] = useState(null);

  // Fetch FAQs when component mounts
  useEffect(() => {
    dispatch(fetchAllFaqs());
  }, [dispatch]);

  if (allFaqsLoader) {
    return (
      <div className="flex items-center justify-center py-8">
        <CommonLoader size="lg" border="border-[#F45E2A]" />
      </div>
    );
  }

  const handleClose = () => {
    router.push('/dashboard/customer-inquiry');
  };

  const faqs = allFaqsData || [];

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-[#9E91E6]">{t('no_record_found')}</span>
          </div>
        ) : (
          faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`overflow-hidden rounded-[5px] border bg-[#101010] text-white transition-colors duration-200 ${
                  isOpen ? 'border-[#FB63214D]' : 'border-[#272727]'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="flex w-full flex-col text-left transition-all duration-200 focus:ring-0 focus:outline-none focus-visible:outline-none"
                >
                  <div className="flex w-full items-center justify-between px-4 py-3">
                    <span className="text-[15px] font-semibold">
                      {faq.title || faq.question || t('untitled_faq')}
                    </span>

                    {/* + / − icon inside circle */}
                    <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#FB63214D] text-white">
                      <span className="text-[16px] leading-none">
                        {isOpen ? '−' : '+'}
                      </span>
                    </span>
                  </div>

                  {/* subtle line only when open */}
                  {isOpen && (
                    <div className="mx-auto mb-1 h-[1px] w-[90%] bg-[#FB63214D] md:w-[97%]" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 py-3 text-[14px] leading-relaxed text-[#B8B8B8]">
                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          faq.content ||
                          faq.answer ||
                          t('no_content_available'),
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
