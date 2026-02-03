'use client';

import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function DisclaimerPage() {
  const { t, loading } = useTranslations();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060E1D] p-5 text-white">
        Loading translations...
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="container mx-auto px-3 py-8">
        <div className="">
          <div
            className="overflow-hidden rounded-[3px] border-1 md:ml-3"
            style={{ borderColor: '#11234D' }}
          >
            <div className="bg-transparent p-6 md:p-12">
              <div className="mb-8">
                <h1 className="mobile-title mb-4 bg-[#FFFFFF] bg-clip-text text-[20px] font-semibold text-white md:text-[30px]">
                  {t('disclaimer_title')}
                </h1>
              </div>
              <div className="space-y-6">
                <div className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  <p>{t('disclaimer_content')}</p>
                </div>

                <div className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  <h3 className="mobile-subsection-heading mt-6 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                    {t('general_information')}
                  </h3>
                  <p className="mt-2">{t('general_information_content')}</p>
                </div>

                <div className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  <h3 className="mobile-subsection-heading mt-6 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                    {t('external_links')}
                  </h3>
                  <p className="mt-2">{t('external_links_content')}</p>
                </div>

                <div className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  <h3 className="mobile-subsection-heading mt-6 bg-[#FFFFFF] bg-clip-text font-bold text-white">
                    {t('limitations_of_liability')}
                  </h3>
                  <p className="mt-2">{t('limitation_of_liability_content')}</p>
                </div>

                <div className="mobile-content text-[10px] text-[#CCCCCC] md:text-[16px]">
                  <p className="mt-6">{t('disclaimer_contact_note')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerPage;
