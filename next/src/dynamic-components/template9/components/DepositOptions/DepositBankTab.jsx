'use client';

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { useTranslations } from '@/hooks/useTranslations';
import { setSelectedBankAccount } from '@/slices/common/commonSlice';
import { fetchAllBanks, fetchBankAccounts } from '@/website/websiteAction';

import DepositHistory from './DepositHistory';
import PaymentDetail from './PaymentDetail';

const PAYMENT_TYPES = {
  BANK: { title: 'confirmation_bank_transfer', enum: 'BANK' },
  DIGITAL_WALLET: { title: 'e_wallet', enum: 'DIGITAL_WALLET' },
  PULSA: { title: 'pulsa', enum: 'PULSA' },
};

export default function DepositBankTab() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { bankAccountsData, bankAccountsLoader, allBanksLoader } = useSelector(
    (state) => state.website,
  );

  const [activeDetail, setActiveDetail] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    dispatch(fetchBankAccounts());
    dispatch(fetchAllBanks());
  }, [dispatch]);

  const getPaymentMethods = (type) => {
    return (bankAccountsData || [])
      .filter((account) => account?.type_enum === type.enum)
      .map((account) => ({
        name: account.id.toString(),
        label: account.bank?.bank_name || t(type.title),
        src:
          account.logo_path ||
          `/images/logos/${t(type.title).toLowerCase().replace(/\s+/g, '-')}.svg`,
        accountData: account,
        type: type.enum,
      }));
  };

  const paymentMethods = Object.values(PAYMENT_TYPES).map((type) => ({
    ...type,
    methods: getPaymentMethods(type),
  }));

  if (bankAccountsLoader || allBanksLoader) {
    return (
      <div className="flex items-center justify-center py-8">
        <CommonLoader size="lg" border="border-[#9d4edd]" />
      </div>
    );
  }

  if (paymentMethods.every((type) => type.methods.length === 0)) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white">{t('no_payment_options_available')}</div>
      </div>
    );
  }

  const handlePaymentMethodClick = (methodName, methodType) => {
    const method = paymentMethods
      .find((type) => t(type.title) === methodType)
      ?.methods.find((m) => m.name === methodName);

    if (method) {
      setSelectedMethod(method);
      setActiveDetail(methodType);

      if (method.type === 'BANK') {
        dispatch(setSelectedBankAccount(method.accountData));
      }
    }
  };

  const handleBackToMain = () => {
    setActiveDetail(null);
    setSelectedMethod(null);
  };

  if (activeDetail) {
    return (
      <PaymentDetail
        onBack={handleBackToMain}
        selectedMethod={selectedMethod}
        paymentType={selectedMethod?.type || 'BANK'}
      />
    );
  }

  const PaymentMethodCard = ({ method, methodType }) => (
    <button
      onClick={() => handlePaymentMethodClick(method.name, methodType)}
      className="flex h-[64px] w-full cursor-pointer items-center justify-center rounded-[5px] border border-[#DBB42C4D] bg-[#060D0D] transition-all duration-300 hover:border hover:border-[#DBB42C] hover:bg-[#060D0D] hover:shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)]"
    >
      <div className="relative h-10 w-24 sm:h-16 sm:w-30">
        <Image
          src={method.src}
          alt={method.label}
          fill
          className="object-contain"
        />
      </div>
    </button>
  );

  // Updated PaymentSection (no individual borders)
  const PaymentSection = ({ title, methods, approvalType, isLast }) => {
    if (!methods || methods.length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-bold text-white md:text-[16px]">
            {t(title)}
          </h3>
          <span className="text-xs text-[#9D4EDD] md:text-sm">
            ({approvalType})
          </span>
        </div>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {methods.map((method) => (
            <PaymentMethodCard
              key={method.name}
              method={method}
              methodType={t(title)}
            />
          ))}
        </div>
        {!isLast && (
          <div className="py-4">
            <div className="border-opacity-50 w-full border-b border-[#252D2D]" />
          </div>
        )}
      </div>
    );
  };

  // Single border wrapping all sections
  return (
    <div className="space-y-6 overflow-hidden">
      <div className="mt-4 rounded-[5px] border border-[#DBB42C4D] bg-[#12001F] p-3 shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] md:p-4 lg:p-6">
        {paymentMethods.map(({ title, methods }, index) => (
          <PaymentSection
            key={title}
            title={title}
            methods={methods}
            approvalType={t('manual_approved')}
            isLast={index === paymentMethods.length - 1}
          />
        ))}
      </div>

      <div className="mt-8">
        <h3 className="font-cravend mb-4 text-[20px] text-white md:text-[22px]">
          {t('deposit_history')}
        </h3>
        <DepositHistory />
      </div>
    </div>
  );
}
