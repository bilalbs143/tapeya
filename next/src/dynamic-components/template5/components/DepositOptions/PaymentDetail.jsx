'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import Image from 'next/image';
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { formatCurrency } from '@/helpers/formatting';
import { translateAmountValidationError } from '@/helpers/translationUtils';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import {
  clearSelectedBankAccount,
  setSelectedBankAccount,
} from '@/slices/common/commonSlice';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';
import { createPaymentBankSchema } from '@/validations/payment.validation';
import {
  createTransactionRequest,
  fetchRequestInfo,
} from '@/website/websiteAction';

const getPaymentConfigs = (t) => ({
  BANK: {
    accountName: t('bank_account_name'),
    accountNumber: t('bank_account_no'),
    sendingLabel: t('sending_bank'),
    receivingLabel: t('receiving_bank'),
    typeLabel: t('confirmation_bank_transfer'),
    showReceivingField: true,
  },
  DIGITAL_WALLET: {
    accountName: t('wallet_name'),
    accountNumber: t('wallet_number'),
    sendingLabel: t('sending_wallet'),
    receivingLabel: t('receiving_wallet'),
    typeLabel: t('e_wallet'),
    showReceivingField: true,
  },
  PULSA: {
    accountName: t('account_holder_name'),
    accountNumber: t('account_number'),
    sendingLabel: t('sending_provider'),
    receivingLabel: t('receiving_provider'),
    typeLabel: t('pulsa'),
    showReceivingField: true,
  },
});

// Utility function to get account details for selected receiving bank
const getAccountDetailsForBank = (bankName, bankAccountsData, paymentType) => {
  const selectedBank = bankAccountsData
    .filter((bank) => bank.type_enum === paymentType)
    .find((bank) => bank.bank.bank_name === bankName);

  if (!selectedBank) {
    return null;
  }

  return {
    name: selectedBank.account_holder_name || 'N/A',
    number: selectedBank.account_number || 'N/A',
    minDeposit: formatCurrency(
      parseInt(selectedBank.min_deposit_amount || 25000),
    ),
    maxDeposit: formatCurrency(
      parseInt(selectedBank.max_deposit_amount || 50000000),
    ),
    commission: formatCurrency(
      parseInt(selectedBank.bank_transaction_fee || 0),
    ),
    subsidi: formatCurrency(
      parseInt(selectedBank.bank_transaction_subsidi || 0),
    ),
  };
};

const AccountDetailField = memo(({ label, value, canCopy = false, onCopy }) => (
  <div className="mb-6 flex flex-col md:flex-row md:items-center md:gap-4">
    <span className="mb-2 block text-[14px] font-bold text-white md:mb-0 md:w-1/3">
      {label}
    </span>
    <div className="relative md:w-2/3">
      <input
        type="text"
        value={value}
        readOnly
        className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#FFFFFF66] bg-transparent px-3 py-3 pr-12 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
      />
      {canCopy && (
        <button
          onClick={() => onCopy(value)}
          aria-label={`Copy ${label.toLowerCase()}`}
          className="filled-hover-effect absolute top-1/2 right-2 shrink-0 -translate-y-1/2 transition-opacity hover:opacity-80"
        >
          <span>
            <Image
              src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/copy-icon.svg"
              alt="copy"
              width={22}
              height={22}
            />
          </span>
        </button>
      )}
    </div>
  </div>
));

AccountDetailField.displayName = 'AccountDetailField';

const DropdownOption = memo(({ option, onSelect, field }) => (
  <div
    key={option}
    className="cursor-pointer px-3 py-2 text-xs text-white transition-colors duration-150 hover:bg-[#20C5FE] md:text-sm"
    onClick={() => {
      onSelect(field, option);
    }}
  >
    {option}
  </div>
));

DropdownOption.displayName = 'DropdownOption';

// Main component
export default function ConfirmPaymentDetail({
  onBack,
  selectedMethod,
  paymentType = 'BANK',
}) {
  const dispatch = useDispatch();
  const { selectedBankAccount } = useSelector((state) => state.common);
  const { user } = useSelector((state) => state.auth);
  const { bankAccountsData } = useSelector((state) => state.website);
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  // File upload ref
  const fileInputRef = useRef(null);
  const [isFileDialogOpening, setIsFileDialogOpening] = useState(false);

  // Get user's default bank account
  const userDefaultBank = user?.bank_account || null;

  // Configuration
  const config = getPaymentConfigs(t)[paymentType] || getPaymentConfigs(t).BANK;

  // Sending bank options - show user's default bank if available
  const sendingBankOptions = userDefaultBank
    ? [userDefaultBank.bank_name]
    : null;

  // Receiving bank options - show bank accounts from the reducer, filtered by payment type
  const receivingBankOptions =
    bankAccountsData.length > 0
      ? bankAccountsData
        .filter((bank) => bank.type_enum === paymentType)
        .map((bank) => bank.bank.bank_name)
      : null;

  // State for selected receiving bank
  const [selectedReceivingBank, setSelectedReceivingBank] = useState(null);

  // Get account details for the selected receiving bank
  const accountDetails = useMemo(() => {
    // Use selectedMethod data if available
    if (selectedMethod?.accountData) {
      return {
        name: selectedMethod.accountData.account_holder_name || 'N/A',
        number: selectedMethod.accountData.account_number || 'N/A',
        minDeposit: formatCurrency(
          parseInt(selectedMethod.accountData.min_deposit_amount || 25000),
        ),
        maxDeposit: formatCurrency(
          parseInt(selectedMethod.accountData.max_deposit_amount || 50000000),
        ),
        commission: formatCurrency(
          parseInt(selectedMethod.accountData.bank_transaction_fee || 0),
        ),
        subsidi: formatCurrency(
          parseInt(selectedMethod.accountData.bank_transaction_subsidi || 0),
        ),
      };
    }

    // Use selected receiving bank data
    if (selectedReceivingBank) {
      return getAccountDetailsForBank(
        selectedReceivingBank,
        bankAccountsData,
        paymentType,
      );
    }

    // Fallback to first available option
    if (receivingBankOptions?.length > 0) {
      return getAccountDetailsForBank(
        receivingBankOptions[0],
        bankAccountsData,
        paymentType,
      );
    }

    return null;
  }, [
    selectedMethod,
    selectedReceivingBank,
    receivingBankOptions,
    bankAccountsData,
    paymentType,
  ]);

  // Dynamic validation schema based on account details
  const validationSchema = useMemo(() => {
    if (!accountDetails) {
      return createPaymentBankSchema(25000, 50000000, getCurrency()); // Use default values
    }

    const minAmount = parseInt(
      accountDetails.minDeposit?.replace(/[^\d]/g, '') || '25000',
    );
    const maxAmount = parseInt(
      accountDetails.maxDeposit?.replace(/[^\d]/g, '') || '50000000',
    );

    return createPaymentBankSchema(minAmount, maxAmount, getCurrency());
  }, [accountDetails, getCurrency]);

  // Form handling with react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm({
    resolver: joiResolver(validationSchema),
    defaultValues: {
      sendingOption: '',
      receivingOption: '',
      amount: '',
      transactionNumber: '',
      receiptFile: null,
      termsAccepted: true,
    },
    mode: 'onChange',
  });

  // Watch form values
  const watchedValues = watch();
  const sendingDropdownRef = useRef(null);
  const receivingDropdownRef = useRef(null);
  const [isSendingOpen, setIsSendingOpen] = useState(false);
  const [isReceivingOpen, setIsReceivingOpen] = useState(false);

  // Set initial values for both sending and receiving options
  useEffect(() => {
    // Set user's default bank as sending option
    if (userDefaultBank && !watchedValues.sendingOption) {
      setValue('sendingOption', userDefaultBank.bank_name);
    }

    // Set receiving bank from selectedMethod or first available option
    if (selectedMethod?.accountData) {
      const selectedBankName = selectedMethod.accountData.bank?.bank_name;
      if (selectedBankName && !watchedValues.receivingOption) {
        setValue('receivingOption', selectedBankName);
        setSelectedReceivingBank(selectedBankName);
        dispatch(setSelectedBankAccount(selectedMethod.accountData));
      }
    } else if (
      receivingBankOptions?.length > 0 &&
      !watchedValues.receivingOption
    ) {
      const firstReceivingOption = receivingBankOptions[0];
      setValue('receivingOption', firstReceivingOption);
      setSelectedReceivingBank(firstReceivingOption);

      const selectedBank = bankAccountsData
        .filter((bank) => bank.type_enum === paymentType)
        .find((bank) => bank.bank.bank_name === firstReceivingOption);

      if (selectedBank) {
        dispatch(setSelectedBankAccount(selectedBank));
      }
    }
  }, [
    userDefaultBank,
    selectedMethod,
    receivingBankOptions,
    watchedValues.sendingOption,
    watchedValues.receivingOption,
    bankAccountsData,
    paymentType,
    dispatch,
    setValue,
  ]);

  // Close custom selects on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        sendingDropdownRef.current &&
        !sendingDropdownRef.current.contains(e.target)
      ) {
        setIsSendingOpen(false);
      }
      if (
        receivingDropdownRef.current &&
        !receivingDropdownRef.current.contains(e.target)
      ) {
        setIsReceivingOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopy = useCallback(
    async (text) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success(t('copied_to_clipboard'));
      } catch (_error) {
        toast.error(t('failed_to_copy'));
      }
    },
    [t],
  );

  // File handling is now done by react-hook-form register

  const handleTermsToggle = useCallback(() => {
    setValue('termsAccepted', !watchedValues.termsAccepted);
  }, [setValue, watchedValues.termsAccepted]);

  const handleBack = useCallback(() => {
    if (selectedBankAccount) {
      dispatch(clearSelectedBankAccount());
    }
    onBack();
  }, [selectedBankAccount, dispatch, onBack]);

  const handleOptionSelect = useCallback(
    (field, value) => {
      setValue(field, value);

      // If receiving bank changes, update the selected bank and account details
      if (field === 'receivingOption' && value) {
        setSelectedReceivingBank(value);

        // Find the selected bank data from bankAccountsData, filtered by payment type
        const selectedBank = bankAccountsData
          .filter((bank) => bank.type_enum === paymentType)
          .find((bank) => bank.bank.bank_name === value);

        if (selectedBank) {
          dispatch(setSelectedBankAccount(selectedBank));
        }
      }
    },
    [setValue, bankAccountsData, paymentType, dispatch],
  );

  const onSubmit = useCallback(
    async (data) => {
      try {
        // Check if bank accounts are loaded
        if (!bankAccountsData || bankAccountsData.length === 0) {
          toast.error(t('bank_accounts_not_loaded'));
          return;
        }

        // Get bank IDs for API submission
        const bankId = userDefaultBank?.bank_id;
        const receiverBank = bankAccountsData
          .filter((bank) => bank.type_enum === paymentType)
          .find((bank) => bank.bank?.bank_name === data.receivingOption);
        const bankAccountId = receiverBank?.id;

        if (!bankId || !bankAccountId) {
          toast.error(t('bank_information_not_found'));
          return;
        }

        // Add receipt file - required by API
        if (!data.receiptFile) {
          toast.error(t('receipt_file_required'));
          return;
        }

        // Create FormData for file upload
        const formData = new FormData();
        formData.append('type', 'deposit');
        formData.append('requested_money', data.amount.toString());
        formData.append('via', 'bank_transfer');
        formData.append('bank_account_id', bankAccountId.toString());
        formData.append('transaction_number', data.transactionNumber);
        formData.append('receipt_path', data.receiptFile);

        const result = await dispatch(
          createTransactionRequest(formData),
        ).unwrap();

        if (result) {
          toast.success(t('transaction_request_submitted'));
          reset();

          // Fetch updated deposit history
          dispatch(
            fetchRequestInfo({
              type: 'deposit',
              perPage: 10,
              page: 1,
            }),
          );

          onBack();
        }
      } catch (error) {
        console.log('something went wrong', error);
      }
    },
    [
      paymentType,
      userDefaultBank,
      bankAccountsData,
      dispatch,
      reset,
      onBack,
      t,
    ],
  );

  useEffect(() => {
    if (!isFileDialogOpening) return;

    const handleFocusBack = () => {
      // When the file dialog closes (either select or cancel), focus returns
      // Delay slightly to avoid race with onChange when a file is selected
      setTimeout(() => setIsFileDialogOpening(false), 50);
    };

    window.addEventListener('focus', handleFocusBack);
    return () => window.removeEventListener('focus', handleFocusBack);
  }, [isFileDialogOpening]);

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-4">
        <button
          onClick={handleBack}
          className="filled-button-hover-effect-5 flex items-center justify-center rounded-[4px] bg-[#20C5FE] px-6 py-1.5 font-extrabold text-white transition-all duration-300"
        >
          <span>Back</span>
        </button>
        <div className="flex items-center gap-2 rounded-[4px] bg-[#00111A] px-3 py-2 text-xs sm:text-sm">
          <Image
            src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/green-check.svg"
            alt="check"
            width={13}
            height={13}
          />
          <span className="text-white">
            {selectedReceivingBank ||
              selectedMethod?.accountData?.bank?.bank_name ||
              receivingBankOptions[0] ||
              config.typeLabel}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-[4px] bg-[#00111A] px-3 py-2 text-xs sm:text-sm">
          <span className="font-medium text-white">{config.typeLabel}</span>
        </div>
        <span className="text-xs text-[#666666] sm:text-sm">
          ({t('manual_approved')}) {t('deposit_amount')} {getCurrency()}
        </span>
      </div>

      {/* Two-column layout: left form, right account details */}
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left column: fields (single form to unify spacing) */}
        <div className="order-2 md:order-1">
          <form
            id="deposit-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <div className="mb-4 sm:mb-6">
              <Label
                htmlFor="sending-option"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {config.sendingLabel} *
              </Label>
              <Controller
                name="sendingOption"
                control={control}
                render={({ field }) => (
                  <div className="flex w-full flex-col gap-1">
                    <div className="relative w-full" ref={sendingDropdownRef}>
                      <div
                        className={`relative flex h-[46px] w-full cursor-pointer appearance-none items-center justify-between rounded-[5px] border px-3 py-3 text-white shadow-none focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm lg:h-[55px] ${
                          errors.sendingOption
                            ? 'border-red-500 focus:border-red-500'
                            : 'border-[#00374A] bg-transparent focus:border-[#20C5FE]'
                        }`}
                        onClick={() => setIsSendingOpen(!isSendingOpen)}
                      >
                        <span
                          className={`text-xs md:text-sm ${
                            field.value ? 'text-white' : 'text-[#FFFFFF66]'
                          }`}
                        >
                          {field.value || t('select_bank')}
                        </span>
                        <svg
                          className={`h-5 w-5 text-white transition-transform duration-200 ${isSendingOpen ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                      {isSendingOpen && (
                        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-[5px] border border-[#20C5FE] bg-[#20C5FE] shadow-xl">
                          {sendingBankOptions.map((option) => (
                            <DropdownOption
                              key={option}
                              option={option}
                              field="sendingOption"
                              onSelect={(field, value) => {
                                handleOptionSelect(field, value);
                                setIsSendingOpen(false);
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Error message container */}
                    <div
                      className={
                        errors.sendingOption ? 'flex h-5 items-center' : 'h-0'
                      }
                    >
                      {errors.sendingOption && (
                        <p className="text-xs text-red-500" role="alert">
                          {errors.sendingOption.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>

            {config.showReceivingField && (
              <div className="mb-4 sm:mb-6">
                <Label
                  htmlFor="receiving-option"
                  className="mb-2 block text-[14px] font-bold text-white"
                >
                  {config.receivingLabel} *
                </Label>
                <Controller
                  name="receivingOption"
                  control={control}
                  render={({ field }) => (
                    <div className="flex w-full flex-col gap-1">
                      <div
                        className="relative w-full"
                        ref={receivingDropdownRef}
                      >
                        <div
                          className={`relative flex h-[46px] w-full cursor-pointer appearance-none items-center justify-between rounded-[5px] border px-3 py-3 text-white shadow-none focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm lg:h-[55px] ${
                            errors.receivingOption
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-[#00374A] bg-transparent focus:border-[#20C5FE]'
                          }`}
                          onClick={() => setIsReceivingOpen(!isReceivingOpen)}
                        >
                          <span
                            className={`text-xs md:text-sm ${
                              field.value ? 'text-white' : 'text-[#FFFFFF66]'
                            }`}
                          >
                            {field.value || t('select_bank')}
                          </span>
                          <svg
                            className={`h-5 w-5 text-white transition-transform duration-200 ${isReceivingOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        </div>
                        {isReceivingOpen && (
                          <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-[5px] border border-[#20C5FE] bg-[#20C5FE] shadow-xl">
                            {receivingBankOptions.map((option) => (
                              <DropdownOption
                                key={option}
                                option={option}
                                field="receivingOption"
                                onSelect={(field, value) => {
                                  handleOptionSelect(field, value);
                                  setIsReceivingOpen(false);
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      {/* Error message container */}
                      <div
                        className={
                          errors.receivingOption
                            ? 'flex h-5 items-center'
                            : 'h-0'
                        }
                      >
                        {errors.receivingOption && (
                          <p className="text-xs text-red-500" role="alert">
                            {errors.receivingOption.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>
            )}

            {/* Amount Input */}
            <div className="mb-4 sm:mb-6">
              <Label
                htmlFor="deposit-amount"
                className="mb-2 block text-[14px] font-bold text-white capitalize"
              >
                {t('enter_your_amount')} ({getCurrency()}) *
              </Label>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="deposit-amount"
                    type="text"
                    autoComplete="off"
                    placeholder={t('deposit_amount_placeholder')}
                    value={field.value || ''}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(/[^\d]/g, '');
                      field.onChange(
                        numericValue ? parseInt(numericValue) : '',
                      );
                    }}
                    className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#00374A] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] placeholder:capitalize focus:border-[#20C5FE] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                    error={translateAmountValidationError(errors.amount?.message, t)}
                  />
                )}
              />
            </div>
            {/* Transaction Number */}
            <div className="mb-4 sm:mb-6">
              <Label
                htmlFor="transaction-number"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('payment_ref_no')}
              </Label>
              <Controller
                name="transactionNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="transaction-number"
                    type="text"
                    autoComplete="off"
                    placeholder={t('payment_ref_no')}
                    className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#00374A] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#20C5FE] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                    error={errors.transactionNumber?.message}
                  />
                )}
              />
            </div>
            {/* Transfer Receipt */}
            <div className="mb-4 sm:mb-6">
              <Label
                htmlFor="receipt-upload"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('transfer_receipt')}
              </Label>
              <Controller
                name="receiptFile"
                control={control}
                render={({ field: { onChange } }) => (
                  <div className="flex w-full flex-col gap-1">
                    <div
                      className={`flex w-full flex-wrap items-center gap-3 rounded-[5px] border px-3 py-2 shadow-none transition-colors focus-within:ring-0 focus-within:ring-transparent focus-within:outline-none ${
                        errors.receiptFile
                          ? 'border-red-500 focus-within:border-red-500'
                          : 'border-[#00374A] bg-transparent focus-within:border-[#20C5FE] hover:border-[#20C5FE]'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDragEnter={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const files = e.dataTransfer.files;
                        if (files && files.length > 0) {
                          const file = files[0];
                          if (
                            file.type.startsWith('image/') ||
                            file.type === 'application/pdf'
                          ) {
                            onChange(file);
                          } else {
                            toast.error(t('select_image_pdf'));
                          }
                        }
                      }}
                    >
                      <div
                        className={`filled-button-hover-effect-5 rounded-md bg-[#20C5FE] px-4 py-2 text-xs font-semibold text-black transition-opacity focus-within:ring-2 focus-within:ring-[#20C5FE] focus-within:outline-none active:scale-95 ${
                          isFileDialogOpening
                            ? 'pointer-events-none cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                        }`}
                        data-hover={
                          isFileDialogOpening
                            ? t('processing')
                            : t('choose_file')
                        }
                        aria-disabled={isFileDialogOpening}
                        onClick={() => {
                          if (isFileDialogOpening) return;
                          setIsFileDialogOpening(true);
                          fileInputRef.current?.click();
                        }}
                      >
                        <span>
                          {isFileDialogOpening
                            ? t('processing')
                            : t('choose_file')}
                        </span>
                      </div>
                      <input
                        id="receipt-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          // Regardless of selection or cancel, ensure loading resets
                          setIsFileDialogOpening(false);
                          if (file) {
                            onChange(file);
                          }
                        }}
                        ref={fileInputRef}
                      />
                      <span className="text-xs break-words text-[#FFFFFF66] sm:text-sm">
                        {watchedValues.receiptFile
                          ? `${watchedValues.receiptFile.name} (${(watchedValues.receiptFile.size / 1024).toFixed(1)} KB)`
                          : t('drag_drop_file')}
                      </span>
                    </div>
                    {/* Error message container */}
                    <div
                      className={
                        errors.receiptFile ? 'flex h-5 items-center' : 'h-0'
                      }
                    >
                      {errors.receiptFile && (
                        <p className="text-xs text-red-500" role="alert">
                          {errors.receiptFile.message}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              />
            </div>
            {/* Terms and Submit inside left column */}
            <div className="mt-6 space-y-3">
              <div className="flex items-start gap-3">
                <Controller
                  name="termsAccepted"
                  control={control}
                  render={({ field }) => (
                    <label
                      htmlFor="terms"
                      className="inline-flex cursor-pointer items-center gap-3 select-none"
                    >
                      <input
                        id="terms"
                        type="checkbox"
                        className="sr-only"
                        checked={field.value}
                        onChange={handleTermsToggle}
                      />
                      <span
                        aria-hidden="true"
                        className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-[3px] border-2 transition-all duration-200 ${
                          field.value
                            ? 'border-[#00374A] bg-[#20C5FE]'
                            : 'border-[#00374A] bg-transparent hover:border-[#20C5FE]'
                        }`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-3 w-3 transition-opacity ${field.value ? 'opacity-100' : 'opacity-0'}`}
                        >
                          <path
                            d="M20 6L9 17L4 12"
                            stroke="#ffffff"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      <span className="text-xs leading-snug break-words text-white md:text-sm">
                        {t('terms_agreement')}
                      </span>
                    </label>
                  )}
                />
              </div>
              {/* Error message container */}
              <div
                className={
                  errors.termsAccepted ? 'flex h-5 items-center' : 'h-0'
                }
              >
                {errors.termsAccepted && (
                  <p className="text-xs text-red-500" role="alert">
                    {errors.termsAccepted.message}
                  </p>
                )}
              </div>

              <div className="mt-8 flex w-full flex-row justify-center">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="filled-button-hover-effect-5 flex h-[52px] w-[554px] items-center justify-center rounded-[6px] bg-[#20C5FE] text-[16px] font-semibold text-black transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{isSubmitting ? t('processing') : t('send')}</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Right column: account details */}
        <div className="order-1 h-max rounded-[5px] bg-[#00111A] p-5 md:sticky md:top-4 md:order-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[15px] font-bold md:text-[16px]">
              {t('deposit_account_details')}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm">
                {t('status')}:{' '}
                <span className="text-[#20C5FE]">{t('status_online')}</span>
              </span>
              <Image
                src="https://d3emlo5tm9es2f.cloudfront.net/next/icons/green-check.svg"
                alt="online"
                width={15}
                height={15}
              />
            </div>
          </div>

          <div className="grid grid-cols-1">
            <div className="space-y-4">
              <AccountDetailField
                label={config.accountName}
                value={accountDetails?.name || 'N/A'}
                canCopy
                onCopy={handleCopy}
              />
              <AccountDetailField
                label={config.accountNumber}
                value={accountDetails?.number || 'N/A'}
                canCopy
                onCopy={handleCopy}
              />
              <AccountDetailField
                label={t('min_deposit')}
                value={accountDetails?.minDeposit || 'N/A'}
              />
              <AccountDetailField
                label={t('max_deposit')}
                value={accountDetails?.maxDeposit || 'N/A'}
              />
            </div>
            <div className="space-y-4">
              <AccountDetailField
                label={t('commission')}
                value={accountDetails?.commission || 'N/A'}
              />
              <AccountDetailField
                label={t('subsidi')}
                value={accountDetails?.subsidi || 'N/A'}
              />
            </div>
          </div>

          <div className="mt-4 text-[12px]">
            <span className="font-semibold text-[#20C5FE]">{t('note')}:</span>
            <span className="text-[#FFFFFF80] italic">
              {' '}
              {t('note_commission_subsidi')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
