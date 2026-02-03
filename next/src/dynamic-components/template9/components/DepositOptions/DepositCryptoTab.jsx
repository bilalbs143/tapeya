'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CryptoPaymentDetails from '@/dynamic-components/template9/components/CryptoPaymentDetails/CryptoPaymentDetails';
import CryptoSelect from '@/dynamic-components/template9/components/CryptoSelect/CryptoSelect';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';
import { createCryptoDepositSchema } from '@/validations/cryptoDeposit.validation';
import {
  createCryptoPayment,
  getMinimumDepositAmount,
} from '@/website/websiteAction';

import DepositHistory from './DepositHistory';

export default function DepositCryptoTab({ isActive }) {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();
  const dispatch = useDispatch();

  // Redux selectors
  const { cryptoLoader, cryptoData, minimumAmountLoader, minimumAmountInfo } =
    useSelector((state) => ({
      cryptoLoader: state.website.cryptoPaymentLoader,
      cryptoData: state.website.cryptoPaymentData,
      minimumAmountLoader: state.website.minimumDepositAmountLoader,
      minimumAmountInfo: state.website.minimumDepositAmountData,
    }));

  // Computed values
  const minimumAmount = useMemo(() => {
    return minimumAmountInfo
      ? Math.ceil(minimumAmountInfo.fiat_equivalent)
      : 30000;
  }, [minimumAmountInfo]);

  // Get currency for validation message
  const validationCurrency = useMemo(() => {
    return minimumAmountInfo?.fiat_currency?.toUpperCase() || getCurrency();
  }, [minimumAmountInfo, getCurrency]);

  // Dynamic validation schema
  const validationSchema = useMemo(() => {
    return createCryptoDepositSchema(minimumAmount, validationCurrency);
  }, [minimumAmount, validationCurrency]);

  // Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
  } = useForm({
    resolver: joiResolver(validationSchema),
    defaultValues: {
      amount: '',
      currency: '',
    },
    mode: 'onChange',
  });

  // Form values
  const amount = watch('amount');
  const currency = watch('currency');

  // Local state
  const [showCryptoPayment, setShowCryptoPayment] = useState(false);
  const [localCryptoPaymentData, setLocalCryptoPaymentData] = useState(null);
  const wasShowingPaymentRef = useRef(false);

  // Effects
  useEffect(() => {
    if (cryptoData?.pay_address) {
      setLocalCryptoPaymentData(cryptoData);
      setShowCryptoPayment(true);
      wasShowingPaymentRef.current = true;
    }
  }, [cryptoData]);

  useEffect(() => {
    if (isActive && wasShowingPaymentRef.current) {
      setShowCryptoPayment(false);
      setLocalCryptoPaymentData(null);
      wasShowingPaymentRef.current = false;
    }
  }, [isActive]);

  // Effect to reset amount when currency changes
  useEffect(() => {
    if (currency) {
      setValue('amount', '', { shouldValidate: false, shouldDirty: false });
      clearErrors('amount');
    }
  }, [currency, setValue, clearErrors]);

  // Handlers
  const fetchMinimumAmount = useCallback(
    async (currency) => {
      if (!currency) return;

      try {
        await dispatch(getMinimumDepositAmount(currency)).unwrap();
      } catch (error) {
        console.error('Failed to fetch minimum amount:', error);
      }
    },
    [dispatch],
  );

  const handleAmountChange = useCallback(
    (value) => {
      setValue('amount', value, { shouldValidate: true, shouldDirty: true });
    },
    [setValue],
  );

  const handleCurrencySelect = useCallback(
    (selectedCurrency) => {
      setValue('currency', selectedCurrency, {
        shouldValidate: true,
        shouldDirty: true,
      });
      fetchMinimumAmount(selectedCurrency);
    },
    [setValue, fetchMinimumAmount],
  );

  const handleClosePayment = useCallback(() => {
    setShowCryptoPayment(false);
    setLocalCryptoPaymentData(null);
  }, []);

  const isButtonDisabled = useMemo(() => {
    return (
      !currency ||
      !amount ||
      minimumAmountLoader ||
      cryptoLoader ||
      (minimumAmountInfo && parseFloat(amount) < minimumAmount)
    );
  }, [
    currency,
    amount,
    minimumAmountLoader,
    cryptoLoader,
    minimumAmountInfo,
    minimumAmount,
  ]);

  // Form submission
  const onSubmit = useCallback(async () => {
    if (!amount || !currency) return;

    const paymentData = {
      amount: amount < minimumAmount ? minimumAmount : parseFloat(amount),
      currency: 'idr',
      currency_type: 'stablecoins',
      selected_currency: currency,
    };

    try {
      const result = await dispatch(createCryptoPayment(paymentData)).unwrap();

      if (result?.data.success) {
        toast.success(t('crypto_payment_initiated_successfully'));
      } else {
        toast.error(
          result?.message ||
            result.response?.data?.message ||
            t('failed_to_create_crypto_payment'),
        );
      }
    } catch (error) {
      console.error('Crypto payment creation failed:', error);
    }
  }, [amount, currency, minimumAmount, dispatch, t]);

  // Render helpers
  const renderAmountInfo = () => {
    if (!amount || !currency || parseFloat(amount) < minimumAmount) {
      return null;
    }

    return (
      <div className="mt-2 rounded-[5px] border border-[#DBB42C4D] bg-[#060D0D] p-3">
        {minimumAmountLoader ? (
          <p className="text-[#9D4EDD]">
            {t('loading_minimum_amount_for')} {currency.toUpperCase()}
            ...
          </p>
        ) : minimumAmountInfo ? (
          <>
            <p className="text-[#9D4EDD]">
              {t('minimum')}: {minimumAmount}{' '}
              {minimumAmountInfo?.fiat_currency?.toUpperCase()}
            </p>
            {amount && parseFloat(amount) >= minimumAmount && (
              <>
                <hr className="my-2 border-gray-600" />
                <p className="text-xs text-white md:text-sm">
                  {t('you_have_to_pay')}
                </p>
                <p className="text-base font-bold text-[#9D4EDD] md:text-lg">
                  {(
                    (parseFloat(amount) / minimumAmount) *
                    (minimumAmountInfo?.min_amount || 0)
                  ).toFixed(8)}{' '}
                  {currency.toUpperCase()}
                </p>
              </>
            )}
          </>
        ) : (
          <p className="text-gray-400">{t('please_select_a_coin')}</p>
        )}
      </div>
    );
  };

  const renderButtonContent = () => {
    if (cryptoLoader) return t('processing');
    return t('submit');
  };

  if (showCryptoPayment) {
    return (
      <CryptoPaymentDetails
        paymentData={localCryptoPaymentData}
        onClose={handleClosePayment}
      />
    );
  }

  return (
    <div className="space-y-6">
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <CryptoSelect
          selectedCurrency={currency}
          onCurrencySelect={handleCurrencySelect}
          showAmount={false}
          showCategories={true}
          showSearch={true}
        />

        <div className="space-y-2">
          <Label
            htmlFor="amount"
            className="block text-[14px] font-bold text-white"
          >
            {t('enter_your_amount')} ({getCurrency()})
            {currency && (
              <span className="text-xs text-[#9D4EDD]">
                {' '}
                (
                {minimumAmountLoader
                  ? t('loading')
                  : `${t('minimum')}: ${minimumAmount ?? 0} ${(minimumAmountInfo?.fiat_currency || getCurrency()).toUpperCase()}`}
                )
              </span>
            )}
          </Label>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Controller
              name="amount"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="amount"
                  type="number"
                  inputMode="decimal"
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder={t('deposit_amount')}
                  className="focus:bg-[] relative block h-[46px] w-[99%] appearance-none rounded-[5px] border border-[#DBB42C4D] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#DBB42C] focus:bg-[#1D0032] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                  error={errors.amount?.message}
                />
              )}
            />
            <button
              type="submit"
              data-hover={renderButtonContent()}
              disabled={isButtonDisabled || cryptoLoader}
              className="template9-filled-button-hover flex h-[54px] min-w-[160px] cursor-pointer items-center justify-center rounded-[4px] bg-[#9D4EDD] px-5 text-[14px] font-semibold text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:mb-1 md:w-auto"
            >
              <div className="angled-button-inner">
                <span className="angled-button-text">
                  {renderButtonContent()}
                </span>
              </div>
            </button>
          </div>
          {renderAmountInfo()}
        </div>
      </form>

      {/* Deposit History - reuse common table to mirror Bank tab */}
      <div className="mt-8">
        <h3 className="mb-4 text-[15px] font-bold text-white md:text-[16px]">
          {t('deposit_history')}
        </h3>
        <div className="p-0">
          <DepositHistory />
        </div>
      </div>
    </div>
  );
}
