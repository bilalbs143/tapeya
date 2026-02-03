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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="mb-0 space-y-4">
            {/* Receiving Bank Information */}
            <div className="space-y-6">
              <h4 className="text-[15px] font-bold text-white md:text-[16px]">
                {t('receiving_bank')}
              </h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label
                    htmlFor="bank"
                    className="mb-2 block text-[14px] font-bold text-white"
                  >
                    {t('select_bank')}
                  </Label>
                  <input
                    id="bank"
                    value={userBankAccount?.bank_name || ''}
                    disabled
                    type="text"
                    className="h-[46px] w-full cursor-not-allowed rounded-[12px] border border-transparent bg-[#372A84] px-3 text-[12px] text-[#9E91E6] md:px-4 md:text-[14px]"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="accountHolder"
                    className="mb-2 block text-[14px] font-bold text-white"
                  >
                    {t('account_holder')}
                  </Label>
                  <input
                    id="accountHolder"
                    value={userBankAccount?.account_holder || ''}
                    disabled
                    type="text"
                    className="h-[46px] w-full cursor-not-allowed rounded-[12px] border border-transparent bg-[#372A84] px-3 text-[12px] text-[#9E91E6] md:px-4 md:text-[14px]"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="accountNumber"
                    className="mb-2 block text-[14px] font-bold text-white"
                  >
                    {t('account_number')}
                  </Label>
                  <input
                    id="accountNumber"
                    value={userBankAccount?.account_number || ''}
                    disabled
                    type="text"
                    className="h-[46px] w-full cursor-not-allowed rounded-[12px] border border-transparent bg-[#372A84] px-3 text-[12px] text-[#9E91E6] md:px-4 md:text-[14px]"
                  />
                </div>
              </div>
            </div>

            {/* Separator Line */}
            <div className="my-8 h-px w-full bg-[#4B51A3]" />

            <div className="">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <Label
                  htmlFor="withdrawAmount"
                  className="text-[14px] font-bold whitespace-nowrap text-white"
                >
                  {renderAmountLabel()}
                </Label>
                <Controller
                  name="withdrawAmount"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="withdrawAmount"
                      type="number"
                      placeholder={t('withdrawal_amount_placeholder')}
                      className="relative block h-[46px] w-full appearance-none rounded-[12px] border border-[#5343B1] bg-[#312577] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#B3A6FF] focus:z-10 focus:border-[#FC7E09] focus:ring-1 focus:ring-[#FC7E09] focus:outline-none sm:text-sm md:placeholder:text-sm"
                      step="1000"
                      error={translateAmountValidationError(errors.withdrawAmount?.message, t)}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={
                !withdrawAmount ||
                transactionRequestLoader ||
                errors.withdrawAmount
              }
              className="btn-hover-fill inline-flex items-center justify-center rounded-[8px] px-6 py-3 text-[14px] text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              data-hover={
                transactionRequestLoader
                  ? t('processing')
                  : t('send_your_request')
              }
            >
              {transactionRequestLoader ? (
                <>
                  <CommonLoader
                    size="sm"
                    border="border-[#FC7E09]"
                    className="mr-2"
                  />
                  {t('processing')}
                </>
              ) : (
                t('send_your_request')
              )}
            </button>
          </div>
        </form>

        {/* Separator Line */}
        <div className="mt-8 h-px w-full bg-[#4B51A3]" />
      </div>

      {/* Withdraw History - shared component */}
      <div className="flex h-full flex-col">
        <h3 className="mb-4 text-[15px] font-bold text-white md:text-[16px]">
          {t('withdraw_history')}
        </h3>
        <WithdrawalHistory />
      </div>
    </div>
  );
}
