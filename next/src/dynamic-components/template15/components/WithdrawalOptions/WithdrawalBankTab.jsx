'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import CommonLoader from '@/components/CommonLoader/CommonLoader';
import { translateAmountValidationError } from '@/helpers/translationUtils';
import { useTemplate } from '@/hooks/useTemplate';
import { useTranslations } from '@/hooks/useTranslations';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';
import { createWithdrawalSchema } from '@/validations/withdrawal.validation';
import { createTransactionRequest } from '@/website/websiteAction';

import WithdrawalHistory from './WithdrawalHistory';

export default function WithdrawalBankTab() {
  const dispatch = useDispatch();
  const { t } = useTranslations();
  const { getCurrency } = useTemplate();

  const { user } = useSelector((state) => state.auth);
  const { transactionRequestLoader } = useSelector((state) => state.website);

  // Dynamic validation schema with template currency
  const validationSchema = useMemo(() => {
    return createWithdrawalSchema(30000, getCurrency());
  }, [getCurrency]);

  // Form management using react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: joiResolver(validationSchema),
    defaultValues: {
      withdrawAmount: '',
    },
    mode: 'onChange',
  });

  const withdrawAmount = watch('withdrawAmount');

  // Get user's bank account information
  const userBankAccount = user?.bank_account;

  const onSubmit = async (data) => {
    const amount = parseFloat(data.withdrawAmount);

    try {
      await dispatch(
        createTransactionRequest({
          type: 'withdraw',
          requested_money: amount,
          via: 'bank_transfer',
        }),
      ).unwrap();

      toast.success(t('withdraw_request_submitted_successfully'));
      reset();

      // Notify history component to refresh without resetting pagination
      window.dispatchEvent(
        new CustomEvent('requestInfo:refresh', {
          detail: { type: 'withdraw' },
        }),
      );
    } catch (error) {
      console.log('something went wrong', error);
    }
  };

  const renderAmountLabel = () => {
    const baseLabel = t('withdrawal_amount_label');
    const currency = getCurrency();
    return new RegExp(`\\b${currency}\\b`).test(baseLabel)
      ? baseLabel
      : `${baseLabel} (${currency})`;
  };

  return (
    <div className="space-y-6">
      {/* Amount Input Section */}
      <div className="space-y-4">
        {/* Input Field and Send Button */}
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="mb-0 space-y-4">
              {/* Receiving Bank Information */}
              <div className="space-y-6">
                <h4 className="text-[15px] font-bold text-white md:text-[25px]">
                  {t('receiving_bank')}
                </h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label
                      htmlFor="bank"
                      className="mb-2 block text-[14px] font-normal text-white"
                    >
                      {t('select_bank')}
                    </Label>
                    <input
                      id="bank"
                      value={userBankAccount?.bank_name || ''}
                      disabled
                      type="text"
                      className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#CBBC9180] bg-[#0F50451A] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] focus:border-[#CBBC91] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="accountHolder"
                      className="mb-2 block text-[14px] font-normal text-white"
                    >
                      {t('account_holder')}
                    </Label>
                    <input
                      id="accountHolder"
                      value={userBankAccount?.account_holder || ''}
                      disabled
                      type="text"
                      className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#CBBC9180] bg-[#0F50451A] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] focus:border-[#CBBC91] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="accountNumber"
                      className="mb-2 block text-[14px] font-normal text-white"
                    >
                      {t('account_number')}
                    </Label>
                    <input
                      id="accountNumber"
                      value={userBankAccount?.account_number || ''}
                      disabled
                      type="text"
                      className="h-[46px] w-full cursor-not-allowed rounded-[3px] border border-[#CBBC9180] bg-[#0F50451A] px-3 py-3 text-[12px] text-[#FFFFFF80] shadow-[inset_4px_5px_16px_0_rgba(0,0,0,0.25)] placeholder:text-[#FFFFFF66] focus:border-[#CBBC91] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                    />
                  </div>
                </div>
              </div>

              {/* Withdraw Amount Input + Button */}
              <div className="flex w-full flex-col gap-2">
                <Label
                  htmlFor="withdrawAmount"
                  className="text-[14px] font-bold text-white"
                >
                  {renderAmountLabel()}
                </Label>

                <div className="flex w-full flex-col sm:flex-row sm:items-center sm:gap-3">
                  <Controller
                    name="withdrawAmount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="withdrawAmount"
                        type="number"
                        placeholder={t('withdrawal_amount_placeholder')}
                        className="relative block h-[46px] w-full appearance-none rounded-[3px] border border-[#CBBC9180] bg-[#0F50451A] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#CBBC91] focus:ring-0 focus:ring-transparent focus:outline-none sm:h-[55px] sm:flex-1 sm:text-sm md:w-[99%] md:placeholder:text-sm"
                        step="1000"
                        error={translateAmountValidationError(errors.withdrawAmount?.message, t)}
                      />
                    )}
                  />

                  <button
                    type="submit"
                    disabled={
                      !withdrawAmount ||
                      transactionRequestLoader ||
                      errors.withdrawAmount
                    }
                    className="template9-filled-button-hover flex cursor-pointer items-center justify-center rounded-[4px] bg-[#CBBC91] px-6 pt-2 pb-2 text-[13px] font-normal text-black transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                    data-hover={
                      transactionRequestLoader
                        ? t('processing')
                        : t('send_your_request')
                    }
                  >
                    <span>
                      {transactionRequestLoader ? (
                        <>
                          <CommonLoader
                            size="sm"
                            border="border-[#9d4edd]"
                            className="mr-2"
                          />
                          {t('processing')}
                        </>
                      ) : (
                        t('send_your_request')
                      )}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* Separator Line */}
        <div className="mt-8 h-px w-full bg-[#CBBC9180]" />
      </div>

      {/* Withdraw History Section */}
      <div className="flex h-full flex-col">
        <h3 className="font-cravend mb-4 text-[15px] text-white md:text-[25px]">
          {t('withdraw_history')}
        </h3>
        <WithdrawalHistory />
      </div>
    </div>
  );
}
