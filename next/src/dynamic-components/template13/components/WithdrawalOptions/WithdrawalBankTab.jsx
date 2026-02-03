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
                    className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#FFFFFF33] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
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
                    className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#FFFFFF33] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
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
                    className="h-[46px] w-full cursor-not-allowed rounded-[5px] border border-[#FFFFFF33] bg-transparent px-3 py-3 text-[12px] text-[#FFFFFF80] placeholder:text-[#FFFFFF66] sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                  />
                </div>
              </div>
            </div>

            {/* Withdraw Amount */}
            <div className="w-full">
              <Label
                htmlFor="withdrawAmount"
                className="mb-2 block text-[14px] font-bold whitespace-nowrap text-white"
              >
                {renderAmountLabel()}
              </Label>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                {/* Input Field */}
                <div className="flex-1">
                  <Controller
                    name="withdrawAmount"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="withdrawAmount"
                        type="number"
                        placeholder={t('withdrawal_amount_placeholder')}
                        className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#00374A] bg-transparent px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#20C5FE] focus:ring-0 sm:text-sm md:placeholder:text-sm lg:h-[50px]"
                        step="1000"
                        error={translateAmountValidationError(errors.withdrawAmount?.message, t)}
                      />
                    )}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    !withdrawAmount ||
                    transactionRequestLoader ||
                    errors.withdrawAmount
                  }
                  className="filled-button-hover-effect-5 flex w-full cursor-pointer items-center justify-center rounded-[10px] bg-[#20C5FE] px-6 py-3.5 text-[16px] font-extrabold text-black transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
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
                        border="border-[#20C5FE]"
                        className="mr-2"
                      />
                      {t('processing')}
                    </>
                  ) : (
                    t('send_your_request')
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Separator Line */}
        <div className="mt-8 h-px w-full bg-[#FFFFFF40]" />
      </div>

      {/* Withdraw History */}
      <div className="flex h-full flex-col">
        <h3 className="mb-4 text-[15px] font-bold text-white md:text-[16px]">
          {t('withdraw_history')}
        </h3>
        <WithdrawalHistory />
      </div>
    </div>
  );
}
