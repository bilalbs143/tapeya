'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { useTranslations } from '@/hooks/useTranslations';
import { registerUser } from '@/slices/auth/authAction';
import { Input } from '@/ui/Input';
import { Label } from '@/ui/Labels';
import {
  Select as UiSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/Select';
import { registrationSchema } from '@/validations/template17/registration.validation';
import { fetchAllBanks } from '@/website/websiteAction';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, currentLocale } = useTranslations();

  // Helper function to get localized bank name
  const getBankName = (bank) => {
    if (!bank) return '';

    // If bank has other_names and current locale exists, use it
    if (bank.other_names && bank.other_names[currentLocale]) {
      return bank.other_names[currentLocale];
    }

    // Fallback to bank_name
    return bank.bank_name || '';
  };

  const { registerLoader } = useSelector((state) => state.auth);
  const { allBanksData, allBanksLoader } = useSelector(
    (state) => state.website,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: joiResolver(registrationSchema),
    defaultValues: {
      username: '',
      password: '',
      confirmPassword: '',
      phone: '',
      referralCode: '',
      bank: '',
      accountHolder: '',
      accountNumber: '',
    },
    mode: 'onChange',
  });

  useEffect(() => {
    dispatch(fetchAllBanks());
  }, [dispatch]);

  // Prefill referral code from query params
  useEffect(() => {
    const ref = searchParams?.get('ref');
    if (ref) {
      setValue('referralCode', ref);
    }
  }, [searchParams, setValue]);

  const onSubmit = async (data) => {
    try {
      // Transform data to match API expectations
      const payload = {
        username: data.username,
        name: data.username,
        nickname: data.username,
        password: data.password,
        password_confirmation: data.confirmPassword,
        phone: data.phone,
        referal_code: data.referralCode,
        bank_id: data.bank,
        account_holder: data.accountHolder,
        account_number: data.accountNumber,
      };

      const result = await dispatch(registerUser(payload)).unwrap();

      // Registration successful
      if (result.data) {
        reset();

        // If token exists (user was auto-approved), don't show wait admin message
        // The auth action will handle the login automatically
        if (!result.data.auth || !result.data.auth.access_token) {
          toast.success(t('registration_successful_wait_admin'));
        }

        // Redirect to home after successful registration
        router.push('/');
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handlePhoneChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setValue('phone', onlyDigits);
  };

  const handleAccountNumberChange = (e) => {
    const onlyDigits = e.target.value.replace(/\D/g, '');
    setValue('accountNumber', onlyDigits);
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 text-white">
      <div className="space-y-6">
        {/* Page Title */}
        <h1 className="text-2xl font-bold text-white uppercase sm:text-3xl md:text-4xl">
          {t('create_new_account')}
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Form Fields - Two Column Layout */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="username"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  {t('username')} <span className="text-[#E8D25E]">*</span>
                </Label>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="username"
                      type="text"
                      placeholder={t('enter_username')}
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none"
                      error={errors.username?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  {t('password')} <span className="text-[#E8D25E]">*</span>
                </Label>
                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      placeholder={t('enter_new_password')}
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none"
                      error={errors.password?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  {t('phone_no')} <span className="text-[#E8D25E]">*</span>
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="phone"
                      type="text"
                      inputMode="numeric"
                      placeholder={t('enter_phone_number')}
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none"
                      error={errors.phone?.message}
                      onChange={handlePhoneChange}
                    />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor="accountHolder"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  {t('account_holder')}{' '}
                  <span className="text-[#E8D25E]">*</span>
                </Label>
                <Controller
                  name="accountHolder"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="accountHolder"
                      type="text"
                      placeholder={t('enter_account_holder')}
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none"
                      error={errors.accountHolder?.message}
                    />
                  )}
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  {t('confirm_password')}{' '}
                  <span className="text-[#E8D25E]">*</span>
                </Label>
                <Controller
                  name="confirmPassword"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      placeholder={t('confirm_password_placeholder')}
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none"
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor="referralCode"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  {t('referral_code')} ({t('optional')})
                </Label>
                <Controller
                  name="referralCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="referralCode"
                      type="text"
                      placeholder={t('enter_referral_code')}
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none"
                      error={errors.referralCode?.message}
                    />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor="accountNumber"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  {t('account_number')}{' '}
                  <span className="text-[#E8D25E]">*</span>
                </Label>
                <Controller
                  name="accountNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="accountNumber"
                      type="text"
                      inputMode="numeric"
                      placeholder={t('enter_account_number')}
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none"
                      error={errors.accountNumber?.message}
                      onChange={handleAccountNumberChange}
                    />
                  )}
                />
              </div>

              <div>
                <Label
                  htmlFor="bank"
                  className="mb-2 block text-sm font-semibold text-white"
                >
                  {t('select_bank')} <span className="text-[#E8D25E]">*</span>
                </Label>
                <Controller
                  name="bank"
                  control={control}
                  render={({ field }) => (
                    <UiSelect
                      value={field.value || ''}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger className="relative block h-[46px] w-full items-center justify-between rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none">
                        <SelectValue
                          placeholder={t('select_bank')}
                          className={
                            field.value ? 'text-white' : 'text-[#FFFFFF66]'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent
                        className="z-[9999] max-h-[200px] w-full border-[#E8D25E] bg-[#1A1A1A]"
                        side="bottom"
                        align="start"
                        position="popper"
                      >
                        {allBanksLoader ? (
                          <div className="px-3 py-2 text-sm text-[#E8D25E]">
                            {t('loading_banks')}
                          </div>
                        ) : allBanksData?.length > 0 ? (
                          allBanksData.map((bank) => (
                            <SelectItem
                              key={bank.id}
                              value={String(bank.id)}
                              className="text-white hover:bg-[#E8D25E] hover:text-black"
                            >
                              {getBankName(bank)}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-[#E8D25E]">
                            {t('no_banks_available')}
                          </div>
                        )}
                      </SelectContent>
                    </UiSelect>
                  )}
                />
                {errors.bank && (
                  <span className="mt-1 block text-sm text-red-500">
                    {t(errors.bank.message)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Register Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={registerLoader}
              className="flex w-full cursor-pointer items-center justify-center rounded-[5px] bg-[#E8D25E] px-8 py-4 text-base font-bold text-black transition-all duration-200 hover:bg-[#D4C04F] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {registerLoader
                ? t('processing') || 'Processing...'
                : t('register') || 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
