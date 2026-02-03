'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CryptoSelect from '@/dynamic-components/template20/components/CryptoSelect/CryptoSelect';
import CryptoWithdrawalDetails from '@/dynamic-components/template20/components/CryptoWithdrawalDetails/CryptoWithdrawalDetails';
import { formatAmount } from '@/helpers/formatting';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';
import { createCryptoWithdrawalSchema } from '@/validations/cryptoWithdrawal.validation';
import {
  createCryptoWithdrawal,
  getEstimatedExchangeRate,
  getMinimumWithdrawalAmount,
  verifyCryptoAddress,
} from '@/website/websiteAction';
import { clearCryptoWithdrawalData } from '@/website/websiteSlice';

import WithdrawalHistory from './WithdrawalHistory';

// Constants
const DEBOUNCE_DELAY = 1000;

export default function WithdrawalCryptoTab() {
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();
  const dispatch = useDispatch();

  // Local state
  const [showCryptoWithdrawalModal, setShowCryptoWithdrawalModal] =
    useState(false);
  const [localCryptoWithdrawalData, setLocalCryptoWithdrawalData] =
    useState(null);
  const [addressVerificationStatus, setAddressVerificationStatus] =
    useState(null);
  const [exchangeRateInfo, setExchangeRateInfo] = useState(null);
  const [modalDismissed, setModalDismissed] = useState(false);
  const [submittedFormData, setSubmittedFormData] = useState(null);

  // Redux selectors
  const {
    cryptoLoader,
    cryptoData,
    addressVerificationLoader,
    addressVerificationData,
    exchangeRateLoader,
    exchangeRateData,
    minimumAmountLoader,
    minimumAmountInfo,
  } = useSelector((state) => ({
    cryptoLoader: state.website.cryptoWithdrawalLoader,
    cryptoData: state.website.cryptoWithdrawalData,
    addressVerificationLoader: state.website.addressVerificationLoader,
    addressVerificationData: state.website.addressVerificationData,
    exchangeRateLoader: state.website.exchangeRateLoader,
    exchangeRateData: state.website.exchangeRateData,
    minimumAmountLoader: state.website.minimumWithdrawalAmountLoader,
    minimumAmountInfo: state.website.minimumWithdrawalAmountData,
  }));

  const user = useSelector((state) => state.auth.user);

  // Computed values
  const availableBalance = user?.wallet?.holding_money || 0;
  const minimumAmount = minimumAmountInfo?.fiat_min_amount || 0;

  // Get currency for validation message
  const validationCurrency = useMemo(() => {
    return minimumAmountInfo?.fiat_currency?.toUpperCase() || getCurrency();
  }, [minimumAmountInfo, getCurrency]);

  // Dynamic validation schema
  const validationSchema = useMemo(() => {
    return createCryptoWithdrawalSchema(minimumAmount, validationCurrency);
  }, [minimumAmount, validationCurrency]);

  // Form setup
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    clearErrors,
  } = useForm({
    resolver: joiResolver(validationSchema),
    defaultValues: {
      address: '',
      currency: '',
      amount: '',
    },
    mode: 'onChange',
  });

  // Form values
  const address = watch('address');
  const currency = watch('currency');
  const amount = watch('amount');

  // Effects
  useEffect(() => {
    if (cryptoData?.withdrawal && !modalDismissed) {
      const withdrawalInfo = cryptoData.withdrawal;

      // Use submitted form data if available, otherwise fall back to current form values
      const currentAddress = submittedFormData?.address || address || '';
      const currentCurrency = submittedFormData?.currency || currency || '';
      const currentAmount = submittedFormData?.amount || amount || '0';

      // Only proceed if we have valid data
      if (currentAddress && currentCurrency && currentAmount) {
        setLocalCryptoWithdrawalData({
          withdrawal_id: withdrawalInfo.withdrawal_id || withdrawalInfo.id,
          batch_withdrawal_id: withdrawalInfo.batch_withdrawal_id,
          order_id: withdrawalInfo.order_id,
          withdrawal_status: withdrawalInfo.withdrawal_status,
          exchange_request_id: withdrawalInfo.exchange_request_id,
          requires_verification: withdrawalInfo.requires_verification,
          automatically_verified: withdrawalInfo.automatically_verified,
          withdraw_address: currentAddress,
          withdraw_amount_from: formatAmount(currentAmount),
          withdraw_amount_to:
            exchangeRateInfo?.estimated_amount ||
            withdrawalInfo.withdraw_amount,
          withdraw_currency_from: getCurrency(),
          withdraw_currency_to: currentCurrency,
        });
        setShowCryptoWithdrawalModal(true);
        reset({ address: '', currency: '', amount: '' });
        setAddressVerificationStatus(null);
        setSubmittedFormData(null); // Clear submitted data after use
      }
    }
  }, [cryptoData, modalDismissed, submittedFormData, exchangeRateInfo, reset]);

  useEffect(() => {
    if (
      addressVerificationData &&
      addressVerificationData.address === address &&
      addressVerificationData.currency === currency
    ) {
      setAddressVerificationStatus(addressVerificationData);
    }
  }, [addressVerificationData, address, currency]);

  useEffect(() => {
    if (exchangeRateData) {
      setExchangeRateInfo(exchangeRateData);
    }
  }, [exchangeRateData]);

  useEffect(() => {
    setAddressVerificationStatus(null);
  }, [address, currency]);

  // Effect to reset amount when currency changes
  useEffect(() => {
    if (currency) {
      setValue('amount', '', { shouldValidate: false, shouldDirty: false });
      clearErrors('amount');
    }
  }, [currency, setValue, clearErrors]);

  // Exchange rate effect with debounce
  useEffect(() => {
    setExchangeRateInfo(null);

    const numericAmount = parseFloat(amount);
    const isValidAmount = amount && !isNaN(numericAmount) && numericAmount > 0;
    const hasValidCurrency = currency && minimumAmount > 0;
    const meetsMinimum = numericAmount >= minimumAmount;

    if (isValidAmount && hasValidCurrency && meetsMinimum) {
      const debounceTimer = setTimeout(() => {
        dispatch(
          getEstimatedExchangeRate({
            amount: numericAmount,
            currency_from: 'idr',
            currency_to: currency,
            is_withdrawal: 1,
          }),
        );
      }, DEBOUNCE_DELAY);

      return () => clearTimeout(debounceTimer);
    }
  }, [amount, currency, minimumAmount, dispatch]);

  // Handlers
  const fetchMinimumWithdrawalAmount = useCallback(
    async (currency) => {
      if (!currency) return;

      try {
        await dispatch(getMinimumWithdrawalAmount(currency)).unwrap();
      } catch (error) {
        console.error('Failed to fetch minimum withdrawal amount:', error);
      }
    },
    [dispatch],
  );

  const handleAmountChange = useCallback(
    (value) => {
      const numValue = parseFloat(value);

      // Only check maximum balance, let validation handle minimum
      if (value && numValue > availableBalance) {
        setValue('amount', availableBalance.toString(), {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }

      setValue('amount', value, { shouldValidate: true, shouldDirty: true });
    },
    [availableBalance, setValue],
  );

  const handleVerifyAddress = useCallback(async () => {
    if (!address || !currency) return;

    try {
      const response = await dispatch(
        verifyCryptoAddress({ address, currency }),
      ).unwrap();

      if (response.data.success && response.data.valid) {
        toast.success(t('address_verified_successfully'));
      } else {
        toast.error(t('address_not_verified'));
      }
    } catch (error) {
      console.error('Address verification failed:', error);
    }
  }, [dispatch, address, currency, t]);

  const handleCurrencySelect = useCallback(
    (selectedCurrency) => {
      setValue('currency', selectedCurrency, {
        shouldValidate: true,
        shouldDirty: true,
      });
      fetchMinimumWithdrawalAmount(selectedCurrency);
    },
    [setValue, fetchMinimumWithdrawalAmount],
  );

  const handleAddressChange = useCallback(
    (e) => {
      setValue('address', e.target.value, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue],
  );

  const handleCloseModal = useCallback(() => {
    setShowCryptoWithdrawalModal(false);
    setLocalCryptoWithdrawalData(null);
    setModalDismissed(true);
    dispatch(clearCryptoWithdrawalData());
  }, [dispatch]);

  // Computed values
  const renderButtonContent = () => {
    if (cryptoLoader) return t('processing');
    return t('submit');
  };

  const isButtonDisabled = useMemo(() => {
    return (
      !currency ||
      !address ||
      !amount ||
      !addressVerificationStatus?.valid ||
      minimumAmountLoader ||
      parseFloat(amount) < minimumAmount ||
      parseFloat(amount) > availableBalance
    );
  }, [
    currency,
    address,
    amount,
    addressVerificationStatus,
    minimumAmountLoader,
    minimumAmount,
    availableBalance,
  ]);

  const verifyButtonClassName = useMemo(() => {
    const baseClasses = 'mt-2 rounded px-4 py-2 text-xs font-medium md:text-sm';

    if (addressVerificationStatus?.valid) {
      return `${baseClasses} bg-green-600 text-white`;
    }
    if (
      addressVerificationStatus?.verified &&
      !addressVerificationStatus?.valid
    ) {
      return `${baseClasses} bg-red-600 text-white`;
    }
    return `${baseClasses} bg-[#55BC55] text-black font-semibold hover:shadow-[0_5px_30px_0_rgba(85,188,85,0.46)_inset]`;
  }, [addressVerificationStatus]);

  // Form submission
  const onSubmit = useCallback(
    (formData) => {
      if (isButtonDisabled) return;

      // Store the submitted form data for use in the effect
      setSubmittedFormData({
        address: formData.address,
        currency: formData.currency,
        amount: formData.amount,
      });

      setModalDismissed(false);
      setLocalCryptoWithdrawalData(null);
      setShowCryptoWithdrawalModal(false);
      dispatch(clearCryptoWithdrawalData());

      const withdrawalData = {
        type: 'crypto_withdraw',
        requested_money: parseFloat(formData.amount),
        currency: formData.currency,
        withdrawal_address: formData.address,
      };

      dispatch(createCryptoWithdrawal(withdrawalData));
      // Notify history component to refresh without resetting pagination
      window.dispatchEvent(
        new CustomEvent('requestInfo:refresh', {
          detail: { type: 'withdraw' },
        }),
      );
    },
    [isButtonDisabled, dispatch],
  );

  // Render helpers
  const renderExchangeRateDisplay = () => {
    if (!amount || !currency || parseFloat(amount) < minimumAmount) {
      return null;
    }

    return (
      <div className="mt-2 rounded-lg bg-[#000000] p-3">
        {exchangeRateLoader ? (
          <p className="text-[#D00000]">{t('calculating_exchange_rate')}</p>
        ) : exchangeRateInfo?.success ? (
          <>
            <p className="text-xs text-white md:text-sm">
              {t('you_will_receive_approximately')}
            </p>
            <p className="text-base font-bold text-[#D00000] md:text-lg">
              {parseFloat(exchangeRateInfo?.estimated_amount).toFixed(8)}{' '}
              {currency.toUpperCase()}
            </p>

            {exchangeRateInfo?.withdrawal_fee && (
              <div className="mt-2 space-y-1 text-xs text-gray-400">
                <p>
                  {t('withdrawal_amount')}:{' '}
                  {parseFloat(
                    exchangeRateInfo.estimated_amount_before_fee,
                  ).toFixed(8)}{' '}
                  {currency.toUpperCase()}
                </p>
                <p className="text-[#D00000]">
                  {t('network_fee')}: -
                  {parseFloat(exchangeRateInfo.withdrawal_fee).toFixed(8)}{' '}
                  {currency.toUpperCase()}
                </p>
                <hr className="border-gray-600" />
              </div>
            )}

            <p className="mt-1 text-xs text-gray-400">
              {t('exchange_rate')}: 1 {getCurrency()} ={' '}
              {parseFloat(exchangeRateInfo.exchange_rate).toFixed(8)}{' '}
              {currency.toUpperCase()}
            </p>
          </>
        ) : (
          <p className="text-gray-400">{t('exchange_rate_not_available')}</p>
        )}
      </div>
    );
  };

  const renderVerifyButton = () => {
    if (!address || !currency) return null;

    return (
      <button
        type="button"
        onClick={handleVerifyAddress}
        disabled={addressVerificationLoader}
        className={verifyButtonClassName}
      >
        {addressVerificationLoader
          ? t('verifying')
          : addressVerificationStatus?.verified
            ? addressVerificationStatus?.valid
              ? `${t('verified')} ✓`
              : `${t('invalid')} ✗`
            : t('verify_address')}
      </button>
    );
  };

  const renderAmountLabel = () => {
    const baseLabel = t('withdrawal_amount_label');
    const currency = getCurrency();
    return new RegExp(`\\b${currency}\\b`).test(baseLabel)
      ? baseLabel
      : `${baseLabel} (${currency})`;
  };

  if (showCryptoWithdrawalModal) {
    return (
      <CryptoWithdrawalDetails
        withdrawalData={localCryptoWithdrawalData}
        onClose={handleCloseModal}
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
            htmlFor="withdrawal-address"
            className="block text-[14px] font-bold text-white"
          >
            {t('withdrawal_wallet_address_label')}
          </Label>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="withdrawal-address"
                onChange={handleAddressChange}
                placeholder={t('withdrawal_wallet_address_placeholder')}
                className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D0000033] bg-[#D000001A] px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#D00000] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                error={errors.address?.message && t(errors.address.message)}
              />
            )}
          />
          {renderVerifyButton()}
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="amount"
            className="block text-[14px] font-bold text-white"
          >
            {renderAmountLabel()}
            {currency && (
              <span className="text-xs text-[#55BC55]">
                {' '}
                (
                {minimumAmountLoader
                  ? t('loading')
                  : `${t('minimum')}: ${minimumAmount ?? 0} ${(minimumAmountInfo?.fiat_currency || getCurrency()).toUpperCase()}`}
                )
              </span>
            )}
          </Label>
          <div className="flex flex-col gap-3">
            {/* Input Field */}
            <div className="flex-1">
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="amount"
                    type="number"
                    onChange={(e) => handleAmountChange(e.target.value)}
                    max={availableBalance || 0}
                    placeholder={t('withdrawal_amount_placeholder')}
                    className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D0000033] bg-[#D000001A] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#D00000] focus:ring-0 sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                    error={errors.amount?.message}
                  />
                )}
              />
            </div>

            {/* Button under input */}
            <button
              type="submit"
              data-hover={renderButtonContent()}
              disabled={isButtonDisabled || cryptoLoader}
              className="filled-button-hover-effect-5 flex w-full cursor-pointer items-center justify-center rounded-[6px] bg-[#D00000] px-12 pt-3 pb-3 text-[14px] font-semibold text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto md:self-end"
            >
              <span>{renderButtonContent()}</span>
            </button>
          </div>
          {renderExchangeRateDisplay()}
        </div>
      </form>

      {/* Withdraw History - reuse common table to mirror Bank tab */}
      <div className="mt-8">
        <h3 className="mb-4 text-[15px] font-bold text-white md:text-[25px]">
          {t('withdraw_history')}
        </h3>
        <div className="rounded-2xl p-0">
          <WithdrawalHistory />
        </div>
      </div>
    </div>
  );
}
