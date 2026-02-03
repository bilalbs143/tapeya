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
import { registrationSchema } from '@/validations/template21/registration.validation';
import { fetchAllBanks } from '@/website/websiteAction';

const inputClassName =
  'relative block h-[36px] w-full appearance-none rounded-[8px] border-0 bg-white px-3 py-2 text-gray-900 shadow-none placeholder:text-sm placeholder:text-gray-500 focus:border focus:border-[1px] focus:border-[#86b7fe] focus:ring-0 focus:outline-none';

/* Icon wrapper for singleColumn (mobile) - same as login */
const iconWrapperClass =
  'flex h-[36px] w-full items-stretch overflow-hidden rounded-[8px] border-0 bg-white';
const iconCellClass =
  'flex min-w-[48px] flex-shrink-0 items-center justify-center rounded-l-[8px] bg-[#353a41] text-white';
const inputWithIconClass =
  'min-w-0 flex-1 rounded-r-[8px] rounded-l-none border-0 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border focus:border-[1px] focus:border-[#86b7fe] focus:outline-none focus:ring-0';

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

  const IconPerson = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    </svg>
  );
  const IconLock = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
  const IconPhone = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
  const IconDocument = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
  const IconWallet = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
      <path d="M17 14h.01" />
    </svg>
  );
  const IconBank = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="21" x2="21" y2="21" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="5" y1="6" x2="7" y2="10" />
      <line x1="19" y1="6" x2="17" y2="10" />
      <line x1="9" y1="6" x2="12" y2="10" />
      <line x1="15" y1="6" x2="12" y2="10" />
    </svg>
  );

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className={singleColumn ? 'space-y-2' : 'space-y-6'}>
        <div
          className={`grid gap-4 ${singleColumn ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}
        >
          <div className={singleColumn ? 'space-y-2' : 'space-y-4'}>
            <div>
              {!singleColumn && (
                <Label htmlFor="reg-username" className="mb-2 block text-sm font-semibold text-white">
                  {t('username')} <span className="text-[#ec4d49]">*</span>
                </Label>
              )}
              <Controller
                name="username"
                control={control}
                render={({ field }) =>
                  singleColumn ? (
                    <div className={iconWrapperClass}>
                      <span className={iconCellClass} aria-hidden><IconPerson /></span>
                      <input {...field} id="reg-username" type="text" placeholder={t('enter_username')} className={inputWithIconClass} />
                    </div>
                  ) : (
                    <Input {...field} id="reg-username" type="text" placeholder={t('enter_username')} className={inputClassName} error={errors.username?.message} />
                  )
                }
              />
              {errors.username?.message && <span className="mt-1 block text-sm text-red-500">{errors.username.message}</span>}
            </div>

            <div>
              {!singleColumn && (
                <Label htmlFor="reg-password" className="mb-2 block text-sm font-semibold text-white">
                  {t('password')} <span className="text-[#ec4d49]">*</span>
                </Label>
              )}
              <Controller
                name="password"
                control={control}
                render={({ field }) =>
                  singleColumn ? (
                    <div className={iconWrapperClass}>
                      <span className={iconCellClass} aria-hidden><IconLock /></span>
                      <input {...field} id="reg-password" type="password" placeholder={t('enter_new_password')} className={inputWithIconClass} />
                    </div>
                  ) : (
                    <Input {...field} id="reg-password" type="password" placeholder={t('enter_new_password')} className={inputClassName} error={errors.password?.message} />
                  )
                }
              />
              {errors.password?.message && <span className="mt-1 block text-sm text-red-500">{errors.password.message}</span>}
            </div>

            <div>
              {!singleColumn && (
                <Label htmlFor="reg-phone" className="mb-2 block text-sm font-semibold text-white">
                  {t('phone_no')} <span className="text-[#ec4d49]">*</span>
                </Label>
              )}
              <Controller
                name="phone"
                control={control}
                render={({ field }) =>
                  singleColumn ? (
                    <div className={iconWrapperClass}>
                      <span className={iconCellClass} aria-hidden><IconPhone /></span>
                      <input {...field} id="reg-phone" type="text" inputMode="numeric" placeholder={t('enter_phone_number')} className={inputWithIconClass} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); field.onChange(v); }} />
                    </div>
                  ) : (
                    <Input {...field} id="reg-phone" type="text" inputMode="numeric" placeholder={t('enter_phone_number')} className={inputClassName} error={errors.phone?.message} onChange={handlePhoneChange} />
                  )
                }
              />
              {errors.phone?.message && <span className="mt-1 block text-sm text-red-500">{errors.phone.message}</span>}
            </div>

            <div>
              {!singleColumn && (
                <Label htmlFor="reg-accountHolder" className="mb-2 block text-sm font-semibold text-white">
                  {t('account_holder')} <span className="text-[#ec4d49]">*</span>
                </Label>
              )}
              <Controller
                name="accountHolder"
                control={control}
                render={({ field }) =>
                  singleColumn ? (
                    <div className={iconWrapperClass}>
                      <span className={iconCellClass} aria-hidden><IconPerson /></span>
                      <input {...field} id="reg-accountHolder" type="text" placeholder={t('enter_account_holder')} className={inputWithIconClass} />
                    </div>
                  ) : (
                    <Input {...field} id="reg-accountHolder" type="text" placeholder={t('enter_account_holder')} className={inputClassName} error={errors.accountHolder?.message} />
                  )
                }
              />
              {errors.accountHolder?.message && <span className="mt-1 block text-sm text-red-500">{errors.accountHolder.message}</span>}
            </div>
          </div>

          <div className={singleColumn ? 'space-y-2' : 'space-y-4'}>
            <div>
              {!singleColumn && (
                <Label htmlFor="reg-confirmPassword" className="mb-2 block text-sm font-semibold text-white">
                  {t('confirm_password')} <span className="text-[#ec4d49]">*</span>
                </Label>
              )}
              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) =>
                  singleColumn ? (
                    <div className={iconWrapperClass}>
                      <span className={iconCellClass} aria-hidden><IconLock /></span>
                      <input {...field} id="reg-confirmPassword" type="password" placeholder={t('confirm_password_placeholder')} className={inputWithIconClass} />
                    </div>
                  ) : (
                    <Input {...field} id="reg-confirmPassword" type="password" placeholder={t('confirm_password_placeholder')} className={inputClassName} error={errors.confirmPassword?.message} />
                  )
                }
              />
              {errors.confirmPassword?.message && <span className="mt-1 block text-sm text-red-500">{errors.confirmPassword.message}</span>}
            </div>

            <div>
              {!singleColumn && (
                <Label htmlFor="reg-referralCode" className="mb-2 block text-sm font-semibold text-white">
                  {t('referral_code')} ({t('optional')})
                </Label>
              )}
              <Controller
                name="referralCode"
                control={control}
                render={({ field }) =>
                  singleColumn ? (
                    <div className={iconWrapperClass}>
                      <span className={iconCellClass} aria-hidden><IconDocument /></span>
                      <input {...field} id="reg-referralCode" type="text" placeholder={t('enter_referral_code')} className={inputWithIconClass} />
                    </div>
                  ) : (
                    <Input {...field} id="reg-referralCode" type="text" placeholder={t('enter_referral_code')} className={inputClassName} error={errors.referralCode?.message} />
                  )
                }
              />
              {errors.referralCode?.message && <span className="mt-1 block text-sm text-red-500">{errors.referralCode.message}</span>}
            </div>

            <div>
              {!singleColumn && (
                <Label htmlFor="reg-accountNumber" className="mb-2 block text-sm font-semibold text-white">
                  {t('account_number')} <span className="text-[#ec4d49]">*</span>
                </Label>
              )}
              <Controller
                name="accountNumber"
                control={control}
                render={({ field }) =>
                  singleColumn ? (
                    <div className={iconWrapperClass}>
                      <span className={iconCellClass} aria-hidden><IconWallet /></span>
                      <input {...field} id="reg-accountNumber" type="text" inputMode="numeric" placeholder={t('enter_account_number')} className={inputWithIconClass} onChange={(e) => { const v = e.target.value.replace(/\D/g, ''); field.onChange(v); }} />
                    </div>
                  ) : (
                    <Input {...field} id="reg-accountNumber" type="text" inputMode="numeric" placeholder={t('enter_account_number')} className={inputClassName} error={errors.accountNumber?.message} onChange={handleAccountNumberChange} />
                  )
                }
              />
              {errors.accountNumber?.message && <span className="mt-1 block text-sm text-red-500">{errors.accountNumber.message}</span>}
            </div>

            <div>
              {!singleColumn && (
                <Label htmlFor="reg-bank" className="mb-2 block text-sm font-semibold text-white">
                  {t('select_bank')} <span className="text-[#ec4d49]">*</span>
                </Label>
              )}
              <Controller
                name="bank"
                control={control}
                render={({ field }) =>
                  singleColumn ? (
                    <div className={iconWrapperClass}>
                      <span className={iconCellClass} aria-hidden><IconBank /></span>
                      <UiSelect value={field.value || ''} onValueChange={(val) => field.onChange(val)}>
                        <SelectTrigger className="flex h-[36px] min-w-0 flex-1 items-center rounded-r-[8px] rounded-l-none border-0 bg-white px-3 py-2 text-sm text-gray-900 shadow-none focus:border focus:border-[1px] focus:border-[#86b7fe] focus:ring-0 focus:outline-none [&>span]:text-gray-900">
                          <SelectValue placeholder={t('select_bank')} className={field.value ? 'text-gray-900' : 'text-gray-500'} />
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
                    </div>
                  ) : (
                    <UiSelect value={field.value || ''} onValueChange={(val) => field.onChange(val)}>
                      <SelectTrigger className="relative block h-[36px] w-full items-center justify-between rounded-[8px] border-0 bg-white px-3 py-2 text-gray-900 shadow-none focus:border focus:border-[1px] focus:border-[#86b7fe] focus:ring-0 focus:outline-none">
                        <SelectValue placeholder={t('select_bank')} className={field.value ? 'text-white' : 'text-[#FFFFFF66]'} />
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
                  )
                }
              />
              {errors.bank?.message && (
                <span className="mt-1 block text-sm text-red-500">
                  {errors.bank.message}
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
