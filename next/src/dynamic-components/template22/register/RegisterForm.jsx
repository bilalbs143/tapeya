'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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
import { registrationSchema } from '@/validations/template22/registration.validation';
import { fetchAllBanks } from '@/website/websiteAction';

const inputClassName =
  'relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none placeholder:text-sm placeholder:text-[#FFFFFF66] focus:border-[#ec4d49] focus:ring-0 focus:ring-transparent focus:outline-none';

/**
 * Shared registration form used by RegisterPage and HomePage (mobile section).
 * @param {string} [referralCodeFromQuery] - Prefill referral code from URL query
 * @param {() => void} [onSuccess] - Callback after successful registration (default: redirect to home)
 * @param {boolean} [singleColumn] - Use single column layout (e.g. for mobile)
 * @param {string} [className] - Wrapper class
 */
export default function RegisterForm({
  referralCodeFromQuery = '',
  onSuccess,
  singleColumn = false,
  className = '',
}) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { t, currentLocale } = useTranslations();

  const getBankName = (bank) => {
    if (!bank) return '';
    if (bank.other_names && bank.other_names[currentLocale]) {
      return bank.other_names[currentLocale];
    }
    return bank.bank_name || '';
  };

  const { registerLoader } = useSelector((state) => state.auth);
  const { allBanksData, allBanksLoader } = useSelector((state) => state.website);

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

  useEffect(() => {
    if (referralCodeFromQuery) {
      setValue('referralCode', referralCodeFromQuery);
    }
  }, [referralCodeFromQuery, setValue]);

  const onSubmit = async (data) => {
    try {
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

      if (result.data) {
        reset();
        if (!result.data.auth || !result.data.auth.access_token) {
          toast.success(t('registration_successful_wait_admin'));
        }
        if (typeof onSuccess === 'function') {
          onSuccess();
        } else {
          router.push('/');
        }
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
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div
          className={`grid gap-4 ${singleColumn ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
        >
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="reg-username"
                className="mb-2 block text-sm font-semibold text-white"
              >
                {t('username')} <span className="text-[#ec4d49]">*</span>
              </Label>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="reg-username"
                    type="text"
                    placeholder={t('enter_username')}
                    className={inputClassName}
                    error={errors.username?.message}
                  />
                )}
              />
            </div>

            <div>
              <Label
                htmlFor="reg-password"
                className="mb-2 block text-sm font-semibold text-white"
              >
                {t('password')} <span className="text-[#ec4d49]">*</span>
              </Label>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="reg-password"
                    type="password"
                    placeholder={t('enter_new_password')}
                    className={inputClassName}
                    error={errors.password?.message}
                  />
                )}
              />
            </div>

            <div>
              <Label
                htmlFor="reg-phone"
                className="mb-2 block text-sm font-semibold text-white"
              >
                {t('phone_no')} <span className="text-[#ec4d49]">*</span>
              </Label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="reg-phone"
                    type="text"
                    inputMode="numeric"
                    placeholder={t('enter_phone_number')}
                    className={inputClassName}
                    error={errors.phone?.message}
                    onChange={handlePhoneChange}
                  />
                )}
              />
            </div>

            <div>
              <Label
                htmlFor="reg-accountHolder"
                className="mb-2 block text-sm font-semibold text-white"
              >
                {t('account_holder')} <span className="text-[#ec4d49]">*</span>
              </Label>
              <Controller
                name="accountHolder"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="reg-accountHolder"
                    type="text"
                    placeholder={t('enter_account_holder')}
                    className={inputClassName}
                    error={errors.accountHolder?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="reg-confirmPassword"
                className="mb-2 block text-sm font-semibold text-white"
              >
                {t('confirm_password')}{' '}
                <span className="text-[#ec4d49]">*</span>
              </Label>
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="reg-confirmPassword"
                    type="password"
                    placeholder={t('confirm_password_placeholder')}
                    className={inputClassName}
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
            </div>

            <div>
              <Label
                htmlFor="reg-referralCode"
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
                    id="reg-referralCode"
                    type="text"
                    placeholder={t('enter_referral_code')}
                    className={inputClassName}
                    error={errors.referralCode?.message}
                  />
                )}
              />
            </div>

            <div>
              <Label
                htmlFor="reg-accountNumber"
                className="mb-2 block text-sm font-semibold text-white"
              >
                {t('account_number')} <span className="text-[#ec4d49]">*</span>
              </Label>
              <Controller
                name="accountNumber"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="reg-accountNumber"
                    type="text"
                    inputMode="numeric"
                    placeholder={t('enter_account_number')}
                    className={inputClassName}
                    error={errors.accountNumber?.message}
                    onChange={handleAccountNumberChange}
                  />
                )}
              />
            </div>

            <div>
              <Label
                htmlFor="reg-bank"
                className="mb-2 block text-sm font-semibold text-white"
              >
                {t('select_bank')} <span className="text-[#ec4d49]">*</span>
              </Label>
              <Controller
                name="bank"
                control={control}
                render={({ field }) => (
                  <UiSelect
                    value={field.value || ''}
                    onValueChange={(val) => field.onChange(val)}
                  >
                    <SelectTrigger className="relative block h-[46px] w-full items-center justify-between rounded-[5px] border border-[#FFFFFF33] bg-[#1A1A1A] px-3 py-3 text-white shadow-none focus:border-[#ec4d49] focus:ring-0 focus:ring-transparent focus:outline-none">
                      <SelectValue
                        placeholder={t('select_bank')}
                        className={
                          field.value ? 'text-white' : 'text-[#FFFFFF66]'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent
                      className="z-[9999] max-h-[200px] w-full border-[#ec4d49] bg-[#1A1A1A]"
                      side="bottom"
                      align="start"
                      position="popper"
                    >
                      {allBanksLoader ? (
                        <div className="px-3 py-2 text-sm text-[#ec4d49]">
                          {t('loading_banks')}
                        </div>
                      ) : allBanksData?.length > 0 ? (
                        allBanksData.map((bank) => (
                          <SelectItem
                            key={bank.id}
                            value={String(bank.id)}
                            className="text-white hover:bg-[#ec4d49] hover:text-black"
                          >
                            {getBankName(bank)}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-[#ec4d49]">
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

        <div className="pt-4">
          <button
            type="submit"
            disabled={registerLoader}
            className="flex h-[36px] w-full cursor-pointer items-center justify-center rounded-[8px] px-8 text-sm font-bold text-white transition-all duration-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundImage:
                'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
            }}
          >
            {registerLoader
              ? t('processing') || 'Processing...'
              : t('register') || 'Register'}
          </button>
        </div>
      </form>
    </div>
  );
}
