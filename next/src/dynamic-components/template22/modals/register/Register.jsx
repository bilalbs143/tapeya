'use client';

import { joiResolver } from '@hookform/resolvers/joi';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { useTranslations } from '@/hooks/useTranslations';
import { registerUser } from '@/slices/auth/authAction';
import { closeModal } from '@/slices/common/commonSlice';
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

export default function Register(props) {
  const dispatch = useDispatch();
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

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

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

  // Prefill referral code from modal props
  useEffect(() => {
    if (props?.referralCode) {
      setValue('referralCode', props.referralCode);
    }
  }, [props?.referralCode, setValue]);

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
        setIsVisible(false);
        setTimeout(() => dispatch(closeModal('register')), 250);

        // If token exists (user was auto-approved), don't show wait admin message
        // The auth action will handle the login automatically
        if (!result.data.auth || !result.data.auth.access_token) {
          toast.success(t('registration_successful_wait_admin'));
        }
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleCloseModal = () => {
    setIsVisible(false);
    setTimeout(() => dispatch(closeModal('register')), 250);
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
    <div
      className={`register-modal scrollbar-hide mx-auto w-full max-w-[400px] transform overflow-visible rounded-[12px] border border-[#E8D25E] text-white shadow-xl transition-all duration-300 ease-out sm:max-w-[600px] lg:max-w-[800px] xl:max-w-[890px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
    >
      <div className="rounded-[12px] bg-black p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#D9D9D9] sm:text-xl">
              {t('create_new_account')}
            </h2>
            <button
              onClick={handleCloseModal}
              aria-label={t('close')}
              className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-md text-white transition-all duration-300 sm:h-[33px] sm:w-[33px]"
              style={{
                backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="transition-all duration-300 group-hover:rotate-180 sm:h-5 sm:w-5"
              >
                <path
                  d="M6 6L18 18M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          <form
            className="relative space-y-3 overflow-visible rounded-[6px] border border-[#FFFFFF66] p-4 sm:space-y-4 sm:p-6"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Row 1: Username, Nick Name */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label
                  htmlFor="username"
                  className="mb-2 block text-[14px] font-bold text-white"
                >
                  {t('username')} *
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
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.username?.message}
                    />
                  )}
                />
              </div>
              <div>
                <Label
                  htmlFor="password"
                  className="mb-2 block text-[14px] font-bold text-white"
                >
                  {t('password')} *
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
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.password?.message}
                    />
                  )}
                />
              </div>
              <div>
                <Label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-[14px] font-bold text-white"
                >
                  {t('confirm_password')} *
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
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.confirmPassword?.message}
                    />
                  )}
                />
              </div>
            </div>

            {/* Divider under Password fields */}
            <hr className="border-0 border-t-[0.5px] border-[#FFFFFF66]" />

            {/* Row 3: Phone and Referral Code */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label
                  htmlFor="phone"
                  className="mb-2 block text-[14px] font-bold text-white"
                >
                  {t('phone_no')} *
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
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.phone?.message}
                      onChange={handlePhoneChange}
                    />
                  )}
                />
              </div>
              <div>
                <Label
                  htmlFor="referralCode"
                  className="mb-2 block text-[14px] font-bold text-white"
                >
                  {t('referral_code')}
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
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.referralCode?.message}
                    />
                  )}
                />
              </div>
            </div>

            {/* Divider */}
            <hr className="border-0 border-t-[0.5px] border-[#FFFFFF66]" />

            {/* Row 4: Bank, Account Holder, Account Number */}
            <div className="mb-0 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="relative">
                <Label
                  htmlFor="bank"
                  className="mb-2 block text-[14px] font-bold text-white"
                >
                  {t('select_bank')} *
                </Label>
                <Controller
                  name="bank"
                  control={control}
                  render={({ field }) => (
                    <UiSelect
                      value={field.value || ''}
                      onValueChange={(val) => field.onChange(val)}
                    >
                      <SelectTrigger className="relative block h-[46px] w-full items-center justify-between rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none lg:h-[55px]">
                        <SelectValue
                          placeholder={t('select_bank')}
                          className={
                            field.value ? 'text-white' : 'text-[#FFFFFF66]'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent
                        className="z-[9999] max-h-[200px] w-full border-[#D3AF37] bg-black"
                        side="bottom"
                        align="start"
                        position="popper"
                      >
                        {allBanksLoader ? (
                          <div className="px-3 py-2 text-sm text-[#D3AF37]">
                            {t('loading_banks')}
                          </div>
                        ) : allBanksData?.length > 0 ? (
                          allBanksData.map((bank) => (
                            <SelectItem
                              key={bank.id}
                              value={String(bank.id)}
                              className="text-white"
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundImage = 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)'; e.currentTarget.style.opacity = '0.9'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundImage = 'transparent'; e.currentTarget.style.opacity = '1'; }}
                            >
                              {getBankName(bank)}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-[#D3AF37]">
                            {t('no_banks_available')}
                          </div>
                        )}
                      </SelectContent>
                    </UiSelect>
                  )}
                />
                {errors.bank && (
                  <span className="mt-1 block text-sm text-red-500">
                    {errors.bank.message}
                  </span>
                )}
              </div>
              <div>
                <Label
                  htmlFor="accountHolder"
                  className="mb-2 block text-[14px] font-bold text-white"
                >
                  {t('account_holder')} *
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
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.accountHolder?.message}
                    />
                  )}
                />
              </div>
              <div>
                <Label
                  htmlFor="accountNumber"
                  className="mb-2 block text-[14px] font-bold text-white"
                >
                  {t('account_number')} *
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
                      className="relative block h-[46px] w-full appearance-none rounded-[5px] border border-[#D3AF3780] bg-transparent px-3 py-3 text-white shadow-none placeholder:text-xs placeholder:text-[#FFFFFF66] focus:border-[#E8D25E] focus:ring-0 focus:ring-transparent focus:outline-none sm:text-sm md:placeholder:text-sm lg:h-[55px]"
                      error={errors.accountNumber?.message}
                      onChange={handleAccountNumberChange}
                    />
                  )}
                />
              </div>
            </div>

            <div className="mt-6">
              <button
                type="submit"
                disabled={registerLoader}
                className="flex w-full cursor-pointer items-center justify-center rounded-[10px] px-4 pt-3 pb-4 text-base font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-50"
                style={{
                  backgroundImage: 'linear-gradient(#74cae3, #5bc0de 60%, #4ab9db)',
                }}
                data-hover={registerLoader ? 'Processing...' : 'Register'}
              >
                {registerLoader ? 'Processing...' : 'Register'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
