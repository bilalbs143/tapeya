'use client';

import 'flatpickr/dist/flatpickr.min.css';

import { joiResolver } from '@hookform/resolvers/joi';
import Flatpickr from 'flatpickr';
import { useEffect, useRef, useState } from 'react';
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
import { registrationSchema } from '@/validations/registration.validation';
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

  const dateOfBirthRef = useRef(null);
  const flatpickrInstanceRef = useRef(null);
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
      name: '',
      nickname: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
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

  useEffect(() => {
    if (flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current.destroy();
      flatpickrInstanceRef.current = null;
    }

    if (dateOfBirthRef.current) {
      // Helper to replace the default year spinner with a dropdown
      const setupYearDropdown = (fp) => {
        try {
          const currentMonthContainer = fp.calendarContainer?.querySelector(
            '.flatpickr-current-month',
          );
          if (!currentMonthContainer) return;

          const existingSelect = currentMonthContainer.querySelector(
            'select.flatpickr-year-select',
          );
          // Determine year range
          const today = new Date();
          const maxYear = (
            fp.config.maxDate instanceof Date ? fp.config.maxDate : today
          ).getFullYear();
          const minYear = Math.max(1900, maxYear - 100);

          if (existingSelect) {
            // Refresh options and selected value if needed
            existingSelect.innerHTML = '';
            for (let y = maxYear; y >= minYear; y -= 1) {
              const opt = document.createElement('option');
              opt.value = String(y);
              opt.textContent = String(y);
              if (y === fp.currentYear) opt.selected = true;
              existingSelect.appendChild(opt);
            }
            return;
          }

          const yearInputWrapper =
            currentMonthContainer.querySelector('.numInputWrapper');
          const yearInput =
            currentMonthContainer.querySelector('input.cur-year');
          if (!yearInputWrapper || !yearInput) return;

          const select = document.createElement('select');
          select.className = 'flatpickr-year-select';
          for (let y = maxYear; y >= minYear; y -= 1) {
            const opt = document.createElement('option');
            opt.value = String(y);
            opt.textContent = String(y);
            if (y === fp.currentYear) opt.selected = true;
            select.appendChild(opt);
          }
          select.addEventListener('change', (e) => {
            const yr = parseInt(e.target.value, 10);
            if (!Number.isNaN(yr)) {
              fp.changeYear(yr);
              fp.redraw();
            }
          });

          // Hide the spinner input and insert the dropdown
          yearInputWrapper.style.display = 'none';
          yearInputWrapper.insertAdjacentElement('afterend', select);
        } catch (error) {
          console.log('Error:', error);
        }
      };

      flatpickrInstanceRef.current = Flatpickr(dateOfBirthRef.current, {
        dateFormat: 'Y-m-d',
        maxDate: 'today',
        disableMobile: true,
        allowInput: false,
        clickOpens: true,
        static: true,
        position: 'below',
        // Enable month dropdown
        monthSelectorType: 'dropdown',
        onReady: function () {
          setupYearDropdown(this);
        },
        onOpen: function () {
          setupYearDropdown(this);
        },
        onChange: (selectedDates, dateStr) => {
          setValue('dateOfBirth', dateStr);
        },
      });
    }

    return () => {
      if (flatpickrInstanceRef.current) {
        flatpickrInstanceRef.current.destroy();
        flatpickrInstanceRef.current = null;
      }
    };
  }, [setValue]); // Add setValue to dependency array

  const onSubmit = async (data) => {
    try {
      // Transform data to match API expectations
      const payload = {
        username: data.username,
        name: data.name,
        nickname: data.nickname,
        password: data.password,
        password_confirmation: data.confirmPassword,
        dob: data.dateOfBirth,
        phone: data.phone,
        referal_code: data.referralCode,
        bank_id: data.bank,
        account_holder: data.accountHolder,
        account_number: data.accountNumber,
      };

      const result = await dispatch(registerUser(payload)).unwrap();

      // Registration successful - user needs admin approval
      if (result.data) {
        reset();
        setIsVisible(false);
        setTimeout(() => dispatch(closeModal('register')), 250);
        toast.success(t('registration_successful_wait_admin'));
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
      className={`register-modal scrollbar-hide mx-auto max-h-[80vh] w-full max-w-[400px] transform overflow-x-visible overflow-y-auto rounded-[10px] border border-[#FFFFFF66] bg-[#03071E] p-4 text-white shadow-xl transition-all duration-300 ease-out sm:max-w-[600px] sm:p-6 lg:max-w-[800px] lg:p-8 xl:max-w-[890px] ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}`}
    >
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#D9D9D9] sm:text-xl">
            {t('create_new_account')}
          </h2>
          <button
            onClick={handleCloseModal}
            aria-label={t('close')}
            className="group flex h-6 w-6 flex-shrink-0 cursor-pointer items-center justify-center rounded-sm border border-white bg-transparent leading-none font-bold text-[2xl] text-white transition-all duration-300 hover:bg-white sm:h-7 sm:w-7"
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
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="transition-all duration-300 group-hover:stroke-black"
              />
            </svg>
          </button>
        </div>

        <form
          className="relative space-y-3 overflow-visible rounded-[10px] border border-[#FFFFFF66] p-4 sm:space-y-4 sm:p-6"
          onSubmit={handleSubmit(onSubmit)}
        >
          {/* Row 1: ID, Name, Nick Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label
                htmlFor="username"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('id')} *
              </Label>
              <Controller
                name="username"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="username"
                    type="text"
                    placeholder={t('enter_id')}
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
                    error={errors.username?.message}
                  />
                )}
              />
            </div>
            <div>
              <Label
                htmlFor="name"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('name')} *
              </Label>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="name"
                    type="text"
                    placeholder={t('enter_fullname')}
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
                    error={errors.name?.message}
                  />
                )}
              />
            </div>
            <div>
              <Label
                htmlFor="nickname"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('nickname')} *
              </Label>
              <Controller
                name="nickname"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="nickname"
                    type="text"
                    placeholder={t('enter_nick_name')}
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
                    error={errors.nickname?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Row 2: Password, Confirm Password */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
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
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
                    error={errors.confirmPassword?.message}
                  />
                )}
              />
            </div>
          </div>

          {/* Divider under Password fields */}
          <hr className="border-0 border-t-[0.5px] border-[#4B51A3]" />

          {/* Row 3: Date of Birth, Phone */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="dateOfBirth"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('date_of_birth')} *
              </Label>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="dateOfBirth"
                    type="text"
                    placeholder="YYYY/MM/DD"
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
                    error={errors.dateOfBirth?.message}
                    ref={dateOfBirthRef}
                    readOnly
                  />
                )}
              />
            </div>
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
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
                    error={errors.phone?.message}
                    onChange={handlePhoneChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Referral Code */}
          <div className="grid grid-cols-1 md:grid-cols-1">
            <div>
              <Label
                htmlFor="referralCode"
                className="mb-2 block text-[14px] font-bold text-white"
              >
                {t('referral_code')} *
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
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
                    error={errors.referralCode?.message}
                  />
                )}
              />
            </div>
            <div className="hidden md:block" />
          </div>

          {/* Divider */}
          <hr className="border-0 border-t-[0.5px] border-[#4B51A3]" />

          {/* Row 4: Bank, Account Holder, Account Number */}
          <div className="mb-0 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
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
                    <SelectTrigger className="relative block w-full items-center justify-between rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none">
                      <SelectValue
                        placeholder={t('select_bank')}
                        className={
                          field.value ? 'text-white' : 'text-[#FFFFFF66]'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="z-[60] max-h-[150px] w-full border-[#5343B1] bg-[#03071E]">
                      {allBanksLoader ? (
                        <div className="px-3 py-2 text-sm text-[#B3A6FF]">
                          {t('loading_banks')}
                        </div>
                      ) : allBanksData?.length > 0 ? (
                        allBanksData.map((bank) => (
                          <SelectItem
                            key={bank.id}
                            value={String(bank.id)}
                            className="text-white hover:bg-[#51A2FF]"
                          >
                            {getBankName(bank)}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-[#B3A6FF]">
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
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
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
                    className="relative block w-full appearance-none rounded-[6px] border border-[#51a2ff8a] bg-[#03071E] px-3 py-3 text-white placeholder:text-xs placeholder:text-[#FFFFFF66] focus:z-10 focus:border-[#51A2FF] focus:ring-1 focus:ring-[#51A2FF] focus:outline-none sm:text-sm md:placeholder:text-sm"
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
              className="btn-style901 w-full cursor-pointer rounded-[10px] bg-[#51A2FF] px-4 py-3 text-sm font-normal text-white transition-all duration-150 hover:bg-[#4a96e6] active:scale-95 active:shadow-inner disabled:opacity-50"
              data-hover={registerLoader ? 'Processing...' : 'Register'}
            >
              {registerLoader ? 'Processing...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
