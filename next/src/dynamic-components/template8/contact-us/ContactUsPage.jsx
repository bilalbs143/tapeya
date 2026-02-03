'use client';

import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function ContactUsPage() {
  const { t } = useTranslations();

  return (
    <div className="text-white">
      <div className="container mx-auto px-3 py-7">
        <div className="">
          {/* Border Container */}
          <div
            className="overflow-hidden rounded-[3px] border-1"
            style={{ borderColor: '#2DFA1A4D' }}
          >
            <div className="bg-transparent p-6 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <h1 className="mobile-title mb-4 bg-[#FFFFFF] bg-clip-text text-[20px] font-semibold text-white md:text-[30px]">
                  {t('contact_us')}
                </h1>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <p className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  {t('live_support')} <br />
                  {t('24_7_customer_support')} <br /> <br />
                  {t('contact')} <br />
                  {t('contact_message')} <br /> <br />
                  {t('telegram')} <br />
                  {t('whatsapp')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUsPage;
