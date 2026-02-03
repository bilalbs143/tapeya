'use client';

import { useSearchParams } from 'next/navigation';

import { useTranslations } from '@/hooks/useTranslations';

import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const { t } = useTranslations();

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 text-white">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white uppercase sm:text-3xl md:text-4xl">
          {t('create_new_account')}
        </h1>

        <RegisterForm
          referralCodeFromQuery={searchParams?.get('ref') || ''}
          singleColumn={false}
        />
      </div>
    </div>
  );
}
