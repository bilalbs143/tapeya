'use client';

import { useRouter } from 'next/navigation';
import React from 'react';

import ProfileTab from '@/dynamic-components/template21/modals/customer-service/ProfileTab';
import { useTranslations } from '@/hooks/useTranslations';

export default function ProfilePage({ embedded = false }) {
  const { t } = useTranslations();
  const router = useRouter();

  const handleClose = () => {
    if (embedded) return;
    router.push('/dashboard/home');
  };

  const content = (
    <div className="container mx-auto px-4 py-8 text-white md:px-0">
      <div className="relative flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6">
        <div className="flex min-h-0 flex-1 flex-col space-y-4 md:space-y-6">
          {/* Header with Back Button (hidden in embedded mode) */}
          <div className="flex items-center">
            {!embedded ? (
              <button
                onClick={handleClose}
                aria-label={t('back')}
                className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center gap-2 rounded-md px-2 text-white transition-all duration-300 hover:opacity-90 sm:h-[33px] sm:w-auto sm:px-3"
                style={{
                  backgroundImage:
                    'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="transition-all duration-300 group-hover:-translate-x-1 sm:h-5 sm:w-5"
                >
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="hidden text-sm font-semibold sm:inline-block">
                  {t('back')}
                </span>
              </button>
            ) : (
              <div className="w-0 sm:w-0" />
            )}
            <h1 className="flex-1 text-[20px] font-semibold text-white sm:text-[26px] md:text-[30px]">
              {t('profile')}
            </h1>
          </div>

          {/* Two Column Layout: Profile and Change Password */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProfileTab />
          </div>
        </div>
      </div>
    </div>
  );

  if (embedded) return content;

  return <div className="min-h-screen bg-[#272b30]">{content}</div>;
}
