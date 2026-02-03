'use client';

import 'flatpickr/dist/flatpickr.min.css';

import { joiResolver } from '@hookform/resolvers/joi';
import Flatpickr from 'flatpickr';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
      <span key={index} className="font-cravend inline-block">
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
    if (flatpickrInstanceRef.current) {
      flatpickrInstanceRef.current.destroy();
      flatpickrInstanceRef.current = null;
    }
    if (dateOfBirthRef.current) {
      flatpickrInstanceRef.current = Flatpickr(dateOfBirthRef.current, {
        dateFormat: 'Y-m-d',
        maxDate: 'today',
        disableMobile: true,
        allowInput: false,
        onChange: (selectedDates, dateStr) => setValue('dateOfBirth', dateStr),
      });
    }
    return () => {
      if (flatpickrInstanceRef.current) {
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

  return (
    <div
      className={`mx-auto w-full max-w-[900px] transform overflow-visible rounded-[4px] bg-[#1D0032] text-white shadow-xl transition-all duration-300 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
      }`}
    >
      <div className="flex w-full flex-col items-stretch rounded-[5px] border border-[#DBB42C4D]">
        <div className="flex w-full flex-col items-center p-6 lg:p-8">
          <div className="w-full max-w-[790px]">
            {/* Header */}
            <div className="mt-2 mb-8 flex items-center justify-between">
              <h2 className="font-cravend text-[18px] tracking-widest uppercase md:text-[20px]">
                {splitIntoLetters(t('create_new_account'))}
              </h2>
              <button
                onClick={handleCloseModal}
                aria-label={t('close')}
                className="group flex h-[30px] w-[30px] flex-shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-[#DBB42C4D] text-black transition-all duration-300 sm:h-[35px] sm:w-[35px]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="transition-all duration-300 group-hover:rotate-180 sm:h-6 sm:w-6"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="#DBB42C"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* FORM */}
            <form className="space-y-2" onSubmit={handleSubmit(onSubmit)}>
              {/* ---- 2 COLUMN TOP FIELDS (Name / Nickname) ---- */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Name */}
                <div>
                  <Label htmlFor="name">{t('name')} *</Label>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="name"
                        placeholder={t('enter_fullname')}
                        error={errors.name?.message}
                        className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none"
                      />
                    )}
                  />
                </div>

                {/* Nickname */}
                <div>
                  <Label htmlFor="nickname">{t('nickname')} *</Label>
                  <Controller
                    name="nickname"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="nickname"
                        placeholder={t('enter_nick_name')}
                        error={errors.nickname?.message}
                        className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none"
                      />
                    )}
                  />
                </div>
              </div>

              {/* ---- Password / Confirm password ---- */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="password">{t('password')} *</Label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        id="password"
                        placeholder={t('enter_new_password')}
                        error={errors.password?.message}
                        className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">
                    {t('confirm_password')} *
                  </Label>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="password"
                        id="confirmPassword"
                        placeholder={t('confirm_password_placeholder')}
                        error={errors.confirmPassword?.message}
                        className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none"
                      />
                    )}
                  />
                </div>
              </div>

              {/* ---- DOB / Phone ---- */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="dateOfBirth">{t('date_of_birth')} *</Label>
                  <Controller
                    name="dateOfBirth"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="dateOfBirth"
                        readOnly
                        ref={dateOfBirthRef}
                        placeholder="YYYY-MM-DD"
                        error={errors.dateOfBirth?.message}
                        className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">{t('phone')} *</Label>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="phone"
                        placeholder="09xxxxxxxxx"
                        onChange={handlePhoneChange}
                        error={errors.phone?.message}
                        className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none"
                      />
                    )}
                  />
                </div>
              </div>

              {/* ---- Referral / Bank ---- */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="referralCode">{t('referral_code')}</Label>
                  <Controller
                    name="referralCode"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="referralCode"
                        placeholder={t('enter_referral_code')}
                        className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="bank">{t('select_bank')}</Label>
                  <Controller
                    name="bank"
                    control={control}
                    render={({ field }) => (
                      <UiSelect
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none">
                          <SelectValue placeholder={t('select_bank')} />
                        </SelectTrigger>
                        <SelectContent className="border-[#DBB42C4D] bg-[#12001F] text-white">
                          {allBanksData?.map((bank) => (
                            <SelectItem
                              key={bank.id}
                              value={bank.id.toString()}
                            >
                              {getBankName(bank)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </UiSelect>
                    )}
                  />
                </div>
              </div>

              {/* ---- Account Holder / Account Number ---- */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="accountHolder">{t('account_holder')}</Label>
                  <Controller
                    name="accountHolder"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="accountHolder"
                        placeholder={t('enter_account_holder')}
                        error={errors.accountHolder?.message}
                        className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none"
                      />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber">{t('account_number')}</Label>
                  <Controller
                    name="accountNumber"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="accountNumber"
                        placeholder={t('enter_account_number')}
                        onChange={handleAccountNumberChange}
                        error={errors.accountNumber?.message}
                        className="w-full rounded-[6px] border border-[#DBB42C4D] bg-[#12001F] focus:border-[#DBB42C4D] focus:bg-[#12001F] focus:ring-0 focus:outline-none"
                      />
                    )}
                  />
                </div>
              </div>

              {/* ---- Submit ---- */}
              <button
                type="submit"
                disabled={registerLoader}
                className="template9-filled-button-hover mt-5 w-full rounded-[5px] bg-[#9D4EDD] py-2 font-semibold text-white transition active:scale-95 disabled:opacity-50"
              >
                {registerLoader ? 'Processing...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
