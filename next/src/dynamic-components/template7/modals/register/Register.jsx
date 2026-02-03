'use client';

import 'flatpickr/dist/flatpickr.min.css';

import { joiResolver } from '@hookform/resolvers/joi';
import Flatpickr from 'flatpickr';
import { useCallback, useEffect, useRef, useState } from 'react';
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
  const { registerLoader } = useSelector((state) => state.auth);
  const { allBanksData } = useSelector((state) => state.website);

  const dateOfBirthRef = useRef(null);
  const datePickerContainerRef = useRef(null);
  const flatpickrInstanceRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const getBankName = (bank) => {
    if (!bank) return '';
    if (bank.other_names && bank.other_names[currentLocale]) {
      return bank.other_names[currentLocale];
    }
    return bank.bank_name || '';
  };

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

  const splitIntoLetters = useCallback((text) => {
    return text.split('').map((char, index) => (
      <span key={index} className="font-bring-race inline-block">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  }, []);

  useEffect(() => {
    dispatch(fetchAllBanks());
  }, [dispatch]);

  useEffect(() => {
    if (props?.referralCode) setValue('referralCode', props.referralCode);
  }, [props?.referralCode, setValue]);

  useEffect(() => {
    const createYearDropdown = () => {
      const instance = flatpickrInstanceRef.current;
      const calendarEl = instance?.calendarContainer;
      if (!instance || !calendarEl) return;

      const nativeYearInput = calendarEl.querySelector('.numInput.cur-year');
      if (!nativeYearInput || calendarEl.querySelector('.custom-year-select'))
        return;

      // Also hide arrow incrementors
      const arrowUp = calendarEl.querySelector('.arrowUp');
      const arrowDown = calendarEl.querySelector('.arrowDown');
      if (arrowUp) arrowUp.style.display = 'none';
      if (arrowDown) arrowDown.style.display = 'none';

      const currentYear = instance.currentYear;
      const maxYear = instance.config.maxDate
        ? instance.config.maxDate.getFullYear()
        : currentYear + 50;
      const minYear = instance.config.minDate
        ? instance.config.minDate.getFullYear()
        : currentYear - 100;

      const select = document.createElement('select');
      select.className = 'custom-year-select';

      for (let y = maxYear; y >= minYear; y -= 1) {
        const option = document.createElement('option');
        option.value = y.toString();
        option.textContent = y.toString();
        if (y === currentYear) option.selected = true;
        select.appendChild(option);
      }

      select.addEventListener('change', (e) => {
        const year = parseInt(e.target.value, 10);
        if (!Number.isNaN(year)) {
          instance.changeYear(year);
        }
      });

      // Completely hide the native year input
      nativeYearInput.style.display = 'none';
      nativeYearInput.style.opacity = '0';
      nativeYearInput.style.width = '0';
      nativeYearInput.style.height = '0';
      nativeYearInput.style.pointerEvents = 'none';
      nativeYearInput.style.position = 'absolute';

      // Insert custom select after native input
      nativeYearInput.parentNode?.insertBefore(
        select,
        nativeYearInput.nextSibling,
      );
      instance.__customYearSelect = select;
    };

    const syncYearDropdown = () => {
      const instance = flatpickrInstanceRef.current;
      const select = instance?.__customYearSelect;
      if (instance && select) {
        select.value = instance.currentYear.toString();
      }
    };

    if (flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current.destroy();
      flatpickrInstanceRef.current = null;
    }
    if (dateOfBirthRef.current) {
      flatpickrInstanceRef.current = Flatpickr(dateOfBirthRef.current, {
        // Render calendar inside the modal to avoid Radix Dialog "outside click" handling
        appendTo: datePickerContainerRef.current || undefined,
        static: true, // keep calendar directly under the input for consistent positioning
        dateFormat: 'Y-m-d',
        maxDate: 'today',
        disableMobile: true,
        clickOpens: true,
        allowInput: false,
        onChange: (selectedDates, dateStr) => setValue('dateOfBirth', dateStr),
        onReady: () => {
          createYearDropdown();
          syncYearDropdown();
        },
        onOpen: () => {
          createYearDropdown();
          syncYearDropdown();
        },
        onYearChange: syncYearDropdown,
        onMonthChange: syncYearDropdown,
      });
      // Prevent outside-click handling from immediately closing the calendar when interacting with it
      const calendarEl = flatpickrInstanceRef.current.calendarContainer;
      const stopPropagation = (event) => {
        event.stopPropagation();
      };
      calendarEl?.addEventListener('mousedown', stopPropagation);
      calendarEl?.addEventListener('touchstart', stopPropagation);
      calendarEl?.addEventListener('pointerdown', stopPropagation);

      flatpickrInstanceRef.current.__cleanup = () => {
        calendarEl?.removeEventListener('mousedown', stopPropagation);
        calendarEl?.removeEventListener('touchstart', stopPropagation);
        calendarEl?.removeEventListener('pointerdown', stopPropagation);
        if (flatpickrInstanceRef.current?.__customYearSelect) {
          const nativeYearInput =
            calendarEl?.querySelector('.numInput.cur-year');
          nativeYearInput && (nativeYearInput.style.display = '');
          flatpickrInstanceRef.current.__customYearSelect.remove();
          flatpickrInstanceRef.current.__customYearSelect = null;
        }
      };
    }
    return () => {
      if (flatpickrInstanceRef.current) {
        flatpickrInstanceRef.current.__cleanup?.();
        flatpickrInstanceRef.current.destroy();
        flatpickrInstanceRef.current = null;
      }
    };
  }, [setValue]);

  const onSubmit = async (data) => {
    try {
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
    setValue('phone', e.target.value.replace(/\D/g, ''));
  };

  const handleAccountNumberChange = (e) => {
    setValue('accountNumber', e.target.value.replace(/\D/g, ''));
  };

  const openDatePicker = () => {
    if (flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current.open();
    }
  };

  return (
    <div
      className={`mx-auto max-h-[90vh] w-full max-w-[1100px] transform overflow-x-hidden overflow-y-auto rounded-[5px] bg-[linear-gradient(90deg,rgba(41,18,135,0.40)_0.48%,rgba(87,61,193,0.40)_49.87%,rgba(41,18,135,0.40)_96.31%)] text-white shadow-xl transition-all duration-300 ease-out md:h-[560px] md:max-h-none md:overflow-visible ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      }`}
    >
      <div className="flex w-full flex-col items-stretch overflow-visible rounded-[5px] border border-[#3E1D88] md:h-[560px] lg:flex-row">
        {/* Left image section */}
        <div className="relative z-20 ml-3 hidden w-full items-center justify-center overflow-visible p-6 lg:flex lg:w-[45%]">
          <div className="relative flex h-full w-full items-center justify-center overflow-visible">
            <img
              src="/icons/Register.png"
              alt="Register Character"
              className="absolute -top-[120px] h-auto w-[120%] object-contain md:h-[700px]"
            />
          </div>
        </div>

        {/* Right form */}
        <div className="w-full p-6 lg:w-[55%] lg:p-8">
          <div className="mt-3 mb-6 flex items-center justify-between">
            <h2 className="font-bring-race text-left text-[16px] tracking-widest text-white uppercase md:text-[20px]">
              {splitIntoLetters(t('create_new_account'))}
            </h2>

            <button
              onClick={handleCloseModal}
              aria-label={t('close')}
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-transparent transition-all hover:scale-110"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 43 43"
                fill="none"
              >
                <path
                  d="M1.41406 32.2714L12.8426 20.8428L2.55692 10.5571L11.6998 1.41422L21.9855 11.6999L32.2712 1.41422L41.4141 10.5571L31.1283 20.8428L41.4141 31.1285L32.2712 40.2714L21.9855 29.9856L10.5569 41.4142L1.41406 32.2714Z"
                  stroke="#7351FF"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>

          {/* Scrollable form */}
          <form
            className="custom-scrollbar space-y-4 pr-4 md:max-h-none md:overflow-y-visible lg:max-h-[430px] lg:overflow-y-auto"
            onSubmit={handleSubmit(onSubmit)}
          >
            {/* Top visible fields */}
            <div className="space-y-2">
              {[
                {
                  name: 'name',
                  label: t('name'),
                  placeholder: t('enter_fullname'),
                },
                {
                  name: 'nickname',
                  label: t('nickname'),
                  placeholder: t('enter_nick_name'),
                },
                {
                  name: 'password',
                  label: t('password'),
                  placeholder: t('enter_new_password'),
                  type: 'password',
                },
                {
                  name: 'confirmPassword',
                  label: t('confirm_password'),
                  placeholder: t('confirm_password_placeholder'),
                  type: 'password',
                },
                {
                  name: 'dateOfBirth',
                  label: t('date_of_birth'),
                  placeholder: 'YYYY/MM/DD',
                  ref: dateOfBirthRef,
                },
              ].map((field, idx) => (
                <div
                  key={idx}
                  className="relative space-y-2"
                  ref={
                    field.name === 'dateOfBirth' ? datePickerContainerRef : null
                  }
                >
                  <Label
                    htmlFor={field.name}
                    className="text-sm font-medium text-white"
                  >
                    {field.label} *
                  </Label>
                  <Controller
                    name={field.name}
                    control={control}
                    render={({ field: ctrlField }) => (
                      <Input
                        {...ctrlField}
                        id={field.name}
                        type={field.type || 'text'}
                        placeholder={field.placeholder}
                        error={errors[field.name]?.message}
                        ref={field.ref || null}
                        readOnly={field.name === 'dateOfBirth'}
                        onClick={
                          field.name === 'dateOfBirth'
                            ? () => openDatePicker()
                            : ctrlField.onClick
                        }
                        onFocus={
                          field.name === 'dateOfBirth'
                            ? () => openDatePicker()
                            : ctrlField.onFocus
                        }
                        className="w-full cursor-pointer rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-4 py-3 text-white placeholder-gray-400 focus:border-[#661BB5] focus:ring-1 focus:ring-[#661BB5]"
                      />
                    )}
                  />
                </div>
              ))}
            </div>

            {/* Hidden fields below (scroll into view on desktop) */}
            <div className="space-y-2">
              {/* Username */}
              <div className="space-y-2">
                <Label
                  htmlFor="username"
                  className="text-sm font-medium text-white"
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
                      placeholder={t('enter_username')}
                      error={errors.username?.message}
                      className="w-full rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-4 py-3 text-white placeholder-gray-400 focus:border-[#661BB5] focus:ring-1 focus:ring-[#661BB5]"
                    />
                  )}
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-white"
                >
                  {t('phone')} *
                </Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="phone"
                      placeholder="09xxxxxxxxx"
                      error={errors.phone?.message}
                      onChange={handlePhoneChange}
                      className="w-full rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-4 py-3 text-white placeholder-gray-400 focus:border-[#661BB5] focus:ring-1 focus:ring-[#661BB5]"
                    />
                  )}
                />
              </div>

              {/* Referral Code */}
              <div className="space-y-2">
                <Label
                  htmlFor="referralCode"
                  className="text-sm font-medium text-white"
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
                      placeholder={t('enter_referral_code')}
                      error={errors.referralCode?.message}
                      className="w-full rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-4 py-3 text-white placeholder-gray-400 focus:border-[#661BB5] focus:ring-1 focus:ring-[#661BB5]"
                    />
                  )}
                />
              </div>

              {/* Bank */}
              <div className="space-y-2">
                <Label
                  htmlFor="bank"
                  className="text-sm font-medium text-white"
                >
                  {t('select_bank')}
                </Label>
                <Controller
                  name="bank"
                  control={control}
                  render={({ field }) => (
                    <UiSelect
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <SelectTrigger className="rounded-[3px] border-[#3E1D88] bg-[#3E1D88] text-white">
                        <SelectValue placeholder={t('select_bank')} />
                      </SelectTrigger>
                      <SelectContent className="border-[#3E1D88] bg-[#2D1266] text-white">
                        {allBanksData?.map((bank) => (
                          <SelectItem key={bank.id} value={bank.id.toString()}>
                            {getBankName(bank)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </UiSelect>
                  )}
                />
              </div>

              {/* Account Holder */}
              <div className="space-y-2">
                <Label
                  htmlFor="accountHolder"
                  className="text-sm font-medium text-white"
                >
                  {t('account_holder')}
                </Label>
                <Controller
                  name="accountHolder"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="accountHolder"
                      placeholder={t('enter_account_holder')}
                      error={errors.accountHolder?.message}
                      className="w-full rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-4 py-3 text-white placeholder-gray-400 focus:border-[#661BB5] focus:ring-1 focus:ring-[#661BB5]"
                    />
                  )}
                />
              </div>

              {/* Account Number */}
              <div className="space-y-2">
                <Label
                  htmlFor="accountNumber"
                  className="text-sm font-medium text-white"
                >
                  {t('account_number')}
                </Label>
                <Controller
                  name="accountNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="accountNumber"
                      placeholder={t('enter_account_number')}
                      error={errors.accountNumber?.message}
                      onChange={handleAccountNumberChange}
                      className="w-full rounded-[3px] border border-[#3E1D88] bg-[#3E1D88] px-4 py-3 text-white placeholder-gray-400 focus:border-[#661BB5] focus:ring-1 focus:ring-[#661BB5]"
                    />
                  )}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={registerLoader}
              className="angled-button angled-button-pinks mt-4 h-[35px] w-full font-bold tracking-wide text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 md:mb-2 md:ml-0.5 md:w-[508px]"
              data-hover={registerLoader ? 'Processing...' : 'REGISTER'}
            >
              <div className="angled-button-inner">
                <span className="angled-button-text">
                  {registerLoader ? 'Processing...' : 'REGISTER'}
                </span>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
