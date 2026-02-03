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
  const [activeTab, setActiveTab] = useState('BANK');

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
        <CommonLoader size="lg" border="border-[#D3AF37]" />
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
      className="flex h-[64px] w-full cursor-pointer items-center justify-center rounded-lg border border-[#D3AF3780] bg-white transition-all duration-300 hover:border-[#D3AF37] hover:shadow-[0_0_10px_0_#D3AF37_inset] sm:h-[75px]"
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

  // Get active tab's payment methods
  const activePaymentType = PAYMENT_TYPES[activeTab];
  const activePaymentMethods = activePaymentType
    ? getPaymentMethods(activePaymentType)
    : [];

  // Tab configuration
  const depositTabs = [
    { key: 'BANK', label: t('confirmation_bank_transfer') || 'Transfer Bank' },
    { key: 'DIGITAL_WALLET', label: t('e_wallet') || 'E-Wallet' },
    { key: 'PULSA', label: t('pulsa') || 'Pulse' },
  ];

  // Main view
  return (
    <div className="space-y-6 overflow-hidden">
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-6 md:mb-10 md:gap-10">
        {depositTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`relative pb-1 text-lg font-extrabold transition-colors duration-200 md:text-xl ${
                isActive
                  ? 'text-[#E8D25E]'
                  : 'text-[#6A6A6A] hover:text-[#E8D25E]'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute inset-x-0 -bottom-1 h-[2px] rounded-full bg-[#E8D25E]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Payment methods grid for active tab */}
      {activePaymentMethods.length > 0 ? (
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {activePaymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.name}
              method={method}
              methodType={t(activePaymentType.title)}
            />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-8">
          <div className="text-white">
            {t('no_payment_options_available') ||
              'No payment options available'}
          </div>
        </div>
      )}

      {/* Deposit History - shared component */}
      {/* <div className="mt-8">
        <h3 className="mb-4 text-[15px] font-bold text-white md:text-[16px]">
          {t('deposit_history')}
        </h3>
        <DepositHistory />
      </div> */}
    </div>
  );
}
