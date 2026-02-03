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

// Payment type configurations
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

  // Filter and map payment methods by type
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

  // Loading state
  if (bankAccountsLoader || allBanksLoader) {
    return (
      <div className="flex items-center justify-center py-8">
        <CommonLoader size="lg" border="border-[#FC7E09]" />
      </div>
    );
  }

  // No payment methods available
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

      // Store bank account data in Redux for bank transfers
      if (method.type === 'BANK') {
        dispatch(setSelectedBankAccount(method.accountData));
      }
    }
  };

  const handleBackToMain = () => {
    setActiveDetail(null);
    setSelectedMethod(null);
  };

  // Show payment detail if active
  if (activeDetail) {
    return (
      <PaymentDetail
        onBack={handleBackToMain}
        selectedMethod={selectedMethod}
        paymentType={selectedMethod?.type || 'BANK'}
      />
    );
  }

  // Payment method card component
  const PaymentMethodCard = ({ method, methodType }) => (
    <button
      onClick={() => handlePaymentMethodClick(method.name, methodType)}
      className="flex h-[64px] w-full cursor-pointer items-center justify-center rounded-lg border border-[#5343B1] bg-white transition-all duration-300 hover:border-[#FC7E09] hover:shadow-[0_0_10px_0_#FC7E09_inset] sm:h-[75px]"
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

  // Payment section component
  const PaymentSection = ({ title, methods, approvalType, isLast }) => {
    if (!methods || methods.length === 0) return null;

    return (
      <div className="mb-3 space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[15px] font-bold text-white md:text-[16px]">
            {t(title)}
          </h3>
          <span className="text-xs text-[#FC7E09] md:text-sm">
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
            <div className="border-opacity-50 w-full border-b border-[#4B51A3]" />
          </div>
        )}
      </div>
    );
  };

  // Main view
  return (
    <div className="space-y-6 overflow-hidden">
      {paymentMethods.map(({ title, methods }, index) => (
        <PaymentSection
          key={title}
          title={title}
          methods={methods}
          approvalType={t('manual_approved')}
          isLast={index === paymentMethods.length - 1}
        />
      ))}

      {/* Deposit History - shared component */}
      <div className="mt-8">
        <h3 className="mb-4 text-[15px] font-bold text-white md:text-[16px]">
          {t('deposit_history')}
        </h3>
        <DepositHistory />
      </div>
    </div>
  );
}
