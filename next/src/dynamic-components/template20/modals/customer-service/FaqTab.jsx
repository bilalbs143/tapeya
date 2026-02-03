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
        <CommonLoader size="lg" border="border-[#CBBC91]" />
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
      <div className="mt-1 mb-4 flex items-center justify-center sm:justify-between">
        {' '}
        <h2 className="font-cravend text-left text-[20px] sm:text-[35px] md:text-[30px]">
          {' '}
          {t('faqs')}{' '}
        </h2>{' '}
      </div>
      <div className="space-y-3">
        {faqs.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-[#FFB703]">{t('no_record_found')}</span>
          </div>
        ) : (
          faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className={`overflow-hidden rounded-[3px] border text-white transition-colors duration-200 ${
                  isOpen
                    ? 'border-[#D00000] bg-[#D000001A] p-3'
                    : 'border-[#5858584D] py-2'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="flex w-full flex-col text-left transition-all duration-200 focus:ring-0 focus:outline-none focus-visible:outline-none"
                >
                  <div className="flex w-full items-center justify-between px-4 py-3">
                    <span className="text-[16px] font-semibold">
                      {faq.title || faq.question || t('untitled_faq')}
                    </span>

                    {/* + / − icon  */}
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full ${isOpen ? 'text-[#D00000]' : 'text-[#D00000]'} `}
                    >
                      <span className="text-[18px] leading-none">
                        {isOpen ? '−' : '+'}
                      </span>
                    </span>
                  </div>

                  {/* subtle line only when open */}
                  {isOpen && (
                    <div className="mx-auto mb-1 h-[1px] w-[90%] bg-[#D00000] md:w-[97%]" />
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
