'use client';

import React from 'react';

import { useTranslations } from '@/hooks/useTranslations';

function DisclaimerPage() {
  const { t, loading } = useTranslations();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-5 text-white">
        Loading translations...
      </div>
    );
  }

  return (
    <div className="text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="">
          <div className="overflow-hidden rounded-[6px] border-1 border-[#ffffff80]">
            <div className="p-8 md:p-12">
              <div className="mb-8">
                <h1 className="mobile-title mb-4 text-[25px] font-bold text-white">
                  {t('disclaimer_title')}
                </h1>
              </div>
              <div className="space-y-6">
                <div className="mobile-content text-gray-300">
                  <p>{t('disclaimer_content')}</p>
                </div>

                <div className="mobile-content text-gray-300">
                  <h3 className="mobile-subsection-heading mt-6 font-bold text-white">
                    {t('general_information')}
                  </h3>
                  <p className="mt-2">{t('general_information_content')}</p>
                </div>

                <div className="mobile-content text-gray-300">
                  <h3 className="mobile-subsection-heading mt-6 font-bold text-white">
                    {t('external_links')}
                  </h3>
                  <p className="mt-2">{t('external_links_content')}</p>
                </div>

                <div className="mobile-content text-gray-300">
                  <h3 className="mobile-subsection-heading mt-6 font-bold text-white">
                    {t('limitations_of_liability')}
                  </h3>
                  <p className="mt-2">{t('limitation_of_liability_content')}</p>
                </div>

                <div className="mobile-content text-gray-300">
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
